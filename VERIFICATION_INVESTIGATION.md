# Registration Verification Issue Investigation Report

## Investigation Date
2026-06-06

## Issue Summary
Investigating resident registration workflow to ensure:
- Users are created with `is_verified = false`
- Verification records are created with status `'pending'`
- Only admins can approve verification
- Admin approval sets `is_verified = true` and `reviewed_by` / `reviewed_at` fields

## Architecture Overview

### Frontend (React Native Expo)
- **Registration Flow Location**: `frontend/app/(auth)/register.tsx`
- **Process**:
  1. Step 1: Collect name, email, password
  2. Step 2: Collect phone and address
  3. Step 3: Upload ID document
  4. Submit registration to `/auth/register`
  5. **Automatically submit verification document** to `/users/me/verification`
  6. Redirect to resident home

### Backend (Express.js)
- **Core Architecture**: 
  - Controllers → Services → Repositories → Database
  - Clean separation of concerns with middleware for auth

- **Key Endpoints**:
  - `POST /auth/register` - Create user account
  - `POST /users/me/verification` - Submit verification document
  - `PATCH /users/:id/verification/review` - Admin approval/rejection

## Findings

### ✅ Backend Implementation - CORRECT

#### User Registration (`auth.service.js`)
- **User Creation**: Creates user with `is_verified = FALSE`
- **Database Query** (line 13-14):
  ```sql
  INSERT INTO users (..., is_verified, is_active)
  VALUES ($1, $2, ..., FALSE, TRUE)
  ```
- **Result**: Users are created unverified

#### Verification Submission (`users.service.js:submitVerification`)
- **Behavior**: 
  - Creates new verification record if not exists
  - Updates existing record with status 'pending'
  - Does NOT set `is_verified = true`
  - Status: 'pending'
- **Audit**: Automatically clears remarks, reviewed_by, reviewed_at

#### Verification Review (`users.service.js:reviewVerification`)
- **Authorization**: `requireRole('admin')` middleware enforces admin-only access
- **On Approval**:
  - Sets `resident_verifications.status = 'approved'`
  - Sets `resident_verifications.reviewed_by = {admin_user_id}`
  - Sets `resident_verifications.reviewed_at = CURRENT_TIMESTAMP`
  - Sets `users.is_verified = TRUE` (line 119-120)
- **On Rejection**:
  - Sets `resident_verifications.status = 'rejected'`
  - Sets `resident_verifications.reviewed_by = {admin_user_id}`
  - Sets `resident_verifications.reviewed_at = CURRENT_TIMESTAMP`
  - Does NOT set `users.is_verified = true`

#### Database Schema (init-db.sql)
- **users table** (line 102): `is_verified BOOLEAN DEFAULT FALSE`
- **resident_verifications table** (line 133): `status VARCHAR(20) DEFAULT 'pending'`
- **Constraints**: Status enum checks: 'pending', 'approved', 'rejected'

### ✅ Frontend Implementation - CORRECT

#### Registration Flow (`register.tsx:handleRegister`)
- **Step 1-2**: Collect user data
- **Step 3**: User uploads ID document
- **On Submit**:
  1. Calls `/auth/register` with user data
  2. Receives access token
  3. Calls `/users/me/verification` with document (automatic)
  4. Redirects to home
- **Result**: Verification is submitted with status 'pending' (server-side)
- **No automatic verification** happening on frontend

### ⚠️ Deprecated Code Found

**File**: `/backend/routes/users.js` (NOT IN USE)
- This is an old implementation that's been replaced by `/backend/src/routes/users.routes.js`
- The app uses `/backend/src` directory structure
- Old file can be safely deleted as it's not referenced by the application

### Authorization - CORRECT

#### Auth Middleware (`src/middleware/auth.js`)
- Properly validates JWT tokens
- Loads user role from database
- Includes `is_verified` and `is_active` in user context

#### Role-Based Access Control
- `POST /users/me/verification`: Authenticated users only
- `PATCH /users/:id/verification/review`: **Admin-only** (line 22-24 in routes/users.routes.js)
- `GET /users`: Admin-only
- Middleware correctly enforces role checks

## Current Behavior Verification

### Registration Flow
1. ✅ User registers with email/password/address
2. ✅ Backend creates user with `is_verified = FALSE`
3. ✅ Backend creates user role as 'resident'
4. ✅ Frontend automatically submits ID document
5. ✅ Backend creates verification with status = 'pending'
6. ✅ User can log in immediately (is_verified doesn't block login)

### Verification Approval Flow
1. ✅ Admin views unverified residents
2. ✅ Admin reviews submitted verification document
3. ✅ Admin approves → `is_verified = TRUE`, status = 'approved'
4. ✅ Admin rejects → status = 'rejected', `is_verified` remains FALSE

## Potential Issues & Recommendations

### 1. ⚠️ Multiple Route Implementations
- **Issue**: `/backend/routes/users.js` exists but isn't used
- **Impact**: Confusion during maintenance
- **Recommendation**: Delete the unused file

### 2. ⚠️ Missing Remarks Field in Review
- **Current**: Verification review doesn't capture admin remarks
- **Frontend Payload**: Does not send `remarks` field
- **Recommendation**: Check if remarks should be collected from admin UI

### 3. ⚠️ No Login Block for Unverified Residents
- **Current**: Unverified residents can log in and submit complaints
- **Decision Required**: Should unverified residents be blocked from features?
- **Current Code**: No checks for `is_verified` on feature access

### 4. ⚠️ Activity Logging
- **Current**: Verification approval/rejection logs to `user_activity_logs`
- **Issue**: Frontend doesn't display audit trail
- **Recommendation**: Admin UI should show verification history

### 5. ⚠️ Verification Status Tracking
- **In Frontend**: No verification status component found
- **Missing**: Resident dashboard showing verification status

## Database Health

### Indices
- `idx_complaints_status` - exists
- `idx_complaints_category` - exists
- `idx_activity_logs_complaint` - exists
- ⚠️ Missing: Index on `resident_verifications.status` (for filtering pending verifications)

**Recommendation**: Add index for verification status filtering:
```sql
CREATE INDEX idx_resident_verifications_status ON resident_verifications(status);
```

## Conclusion

### ✅ CORE WORKFLOW IS CORRECT
The registration and verification workflow is correctly implemented:
- Users are created unverified
- Verifications start in 'pending' status
- Only admins can approve verification
- Admin approval correctly sets `is_verified = TRUE`

### Action Items
1. Delete `/backend/routes/users.js` (unused)
2. Add verification status index
3. Add remarks field handling to verification review
4. Implement verification status display in frontend
5. Define policy on unverified resident access restrictions
6. Add activity logs display in admin UI

### No Critical Issues Found
The current implementation correctly prevents automatic verification. The registration flow is working as intended:
- Registration creates unverified user
- Verification document is submitted as 'pending'
- Only admin approval sets verified status
