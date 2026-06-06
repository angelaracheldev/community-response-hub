# Resident Verification Workflow - Investigation Report

## Issues Identified

### 1. **Missing `remarks` Column in Database Schema**
**Severity**: HIGH  
**Location**: `backend/init-db.sql` (line 119-148)

**Problem**: The `resident_verifications` table is missing the `remarks` column, but the backend code attempts to update and query this field:
- `users.repository.js:6` - queries `rv.remarks`
- `users.repository.js:19` - queries `rv.remarks`
- `verifications.repository.js:24` - updates `remarks` field

**Impact**: Rejection remarks from admins are not being stored, causing data loss and inability to display rejection reasons to residents.

---

### 2. **Hardcoded Verification Type "Utility Bill"**
**Severity**: HIGH  
**Location**: `frontend/app/(resident)/home.tsx` (line 38)

**Problem**: 
```typescript
const [verificationType, setVerificationType] = useState('Utility Bill');
```

The verification type is hardcoded instead of:
1. Being loaded from the database (`resident_verifications.verification_type`)
2. Being displayed dynamically on the home screen
3. Using the correct default value from the database

**Impact**: 
- All verifications submitted show "Utility Bill" regardless of actual verification type in database
- When rejecting and resubmitting, residents see incorrect information
- Line 484 in dashboard.tsx tries to display this but gets wrong data

---

### 3. **Frontend File Upload Issue with Headers**
**Severity**: MEDIUM  
**Location**: `frontend/app/(resident)/home.tsx` (lines 163-170)

**Problem**: Headers configuration:
```typescript
headers: {
  Authorization: `Bearer ${token}`,
  Accept: 'application/json',
}
```

When using FormData with file uploads, should NOT set Content-Type header explicitly - the browser will set it automatically with the correct boundary.

**Impact**: File upload may fail or be rejected by some browsers/networks.

---

### 4. **Verification Type Not Displayed from Database**
**Severity**: HIGH  
**Location**: `frontend/app/(resident)/home.tsx` (lines 38, 258)

**Problem**: The component loads verification data but doesn't update the `verificationType` state from the API response. The response includes `verification_type` from the backend, but it's never used.

**Impact**: UI always shows "Utility Bill" instead of actual verification type (e.g., "ID", "Passport", etc.)

---

### 5. **Admin Rejection Remarks Not Persisted**
**Severity**: HIGH  
**Location**: Multiple files

**Chain of Issues**:
1. Database schema missing `remarks` column
2. Backend queries `rv.remarks` (doesn't exist)
3. Frontend sends remarks in dashboard.tsx:241 but they're never stored
4. When resident checks home screen, rejection reason shows empty (line 80)

**Impact**: Admins can select rejection reasons, but they're never saved or displayed to residents.

---

### 6. **Missing `reviewed_by` and `reviewed_at` Timestamps**
**Severity**: MEDIUM  
**Location**: `backend/src/repositories/verifications.repository.js` (line 21-29)

**Problem**: While these fields exist in the schema, the update logic correctly sets them. However, without the remarks field working, the audit trail is incomplete.

---

## Database Schema Issues

The `resident_verifications` table (init-db.sql:119-148) is missing:
- `remarks TEXT` - for storing rejection reasons

Current structure is missing this crucial field for the complete workflow.

---

## Expected vs Actual Behavior

### Verification Submission
- **Expected**: Resident uploads ID → saved with type "ID" → admin sees "ID" → home screen shows "ID"
- **Actual**: Resident uploads ID → saved with type "ID" → admin sees "Utility Bill" → home screen shows "Utility Bill"

### Rejection Workflow
- **Expected**: Admin rejects → selects reason → reason stored in remarks → resident sees reason on home screen
- **Actual**: Admin rejects → selects reason → reason NOT stored (field missing) → resident sees empty remarks

---

## Files Requiring Changes

1. `backend/init-db.sql` - Add `remarks` column
2. `frontend/app/(resident)/home.tsx` - Remove hardcoded type, load from API
3. `backend/src/repositories/verifications.repository.js` - Already correct (just needs DB column)
4. `backend/src/repositories/users.repository.js` - Already querying remarks (just needs DB column)

---

## Test Cases to Verify

After fixes:
1. Submit verification with ID → Verify type shows "ID" (not "Utility Bill")
2. Admin rejects with reason → Resident sees reason on home screen
3. Resident resubmits after rejection → New verification created with correct type
4. Verify all FK relationships work correctly with user_id
5. Verify audit trail records reviewed_by and reviewed_at timestamps
