# Resident Verification Workflow - Testing Guide

## Pre-Test Setup

1. **Database**: Ensure `remarks` column is added to `resident_verifications`
   ```bash
   # Fresh database: init-db.sql already includes it
   # Existing database: Run migration
   psql -U postgres -d your_db -f backend/migration-add-remarks.sql
   ```

2. **Backend**: Restart backend server
   ```bash
   npm run start  # or appropriate start command
   ```

3. **Frontend**: Rebuild and refresh
   ```bash
   npm run dev  # or appropriate dev command
   ```

---

## Test Case 1: Submit Verification Document ✅

### Objective
Verify that residents can upload a document and submit verification with correct type.

### Steps
1. Log in as a resident (use test resident from seed data: juan@example.com)
2. Navigate to home screen
3. Enter address: "Blk 2 Lot 4, Redwood St"
4. Click "Upload Valid Government ID"
5. Select an ID image file (JPG, PNG) or PDF
6. Click "Submit Registration"

### Expected Result
- ✅ File uploads successfully (no "Network connectivity error")
- ✅ Toast shows: "Verification document submitted successfully!"
- ✅ Home screen shows "Verification Pending"
- ✅ Document Type shows: "ID" (NOT "Utility Bill")

### Database Check
```sql
SELECT verification_type, status, document_url, remarks 
FROM resident_verifications 
WHERE user_id = (SELECT user_id FROM users WHERE email='juan@example.com');
-- Expected:
-- verification_type: ID
-- status: pending
-- document_url: https://cloudinary.../...
-- remarks: NULL
```

---

## Test Case 2: Admin Reviews - Approval ✅

### Objective
Verify admin can approve verification and resident sees approved status.

### Steps
1. Log in as admin (ana@example.com)
2. Navigate to Admin Dashboard → Manage Users
3. Find resident in "Residents Pending Verification" table
4. Click "View" button
5. In modal, click "Approve Application"
6. Confirm the approval

### Expected Result
- ✅ Modal closes
- ✅ User moves from "Pending" to "Verified" table
- ✅ Status message shows: "Verification approved"

### Database Check
```sql
SELECT status, reviewed_by, reviewed_at, is_verified
FROM resident_verifications rv
JOIN users u ON rv.user_id = u.user_id
WHERE u.email='juan@example.com';
-- Expected:
-- status: approved
-- reviewed_by: admin-id (NOT NULL)
-- reviewed_at: current timestamp
```

```sql
SELECT is_verified
FROM users
WHERE email='juan@example.com';
-- Expected: true
```

### Resident Check
1. Log out admin, log in as resident
2. Check home screen

### Expected Result
- ✅ Shows "Account Verified Securely" card
- ✅ Displays address: "Blk 2 Lot 4, Redwood St"
- ✅ Shows "Verified with: ID"

---

## Test Case 3: Admin Reviews - Rejection with Reason ✅

### Objective
Verify admin can reject verification with reason and resident sees the reason.

### Prerequisites
Submit a new verification (different resident or resubmit after clearing)

### Steps
1. Log in as admin
2. Navigate to Admin Dashboard → Manage Users
3. Find resident in "Residents Pending Verification"
4. Click "View" button
5. Click "Reject Application"
6. In rejection modal, select reason: "Address is not the same as the ID. Please resubmit verification with the correct address."
7. Click "Reject" button

### Expected Result
- ✅ Modal closes
- ✅ Status message shows: "Verification rejected"
- ✅ Resident moves from "Pending" to back to being rejected

### Database Check
```sql
SELECT status, remarks, reviewed_by, reviewed_at
FROM resident_verifications
WHERE user_id = (SELECT user_id FROM users WHERE email='maria@example.com');
-- Expected:
-- status: rejected
-- remarks: "Address is not the same as the ID..."
-- reviewed_by: admin-id (NOT NULL)
-- reviewed_at: current timestamp
```

### Resident Check
1. Log out admin, log in as resident (maria@example.com)
2. Check home screen

### Expected Result
- ✅ Shows "Verification Rejected" card
- ✅ Shows "Reason for Rejection:" section
- ✅ Displays: "Address is not the same as the ID. Please resubmit verification with the correct address."
- ✅ Form available to resubmit with updated info

---

## Test Case 4: Resubmit After Rejection ✅

### Objective
Verify resident can correct and resubmit verification after rejection.

### Prerequisites
Must have rejected verification (from Test Case 3)

### Steps
1. Logged in as resident with rejected verification
2. Update address to: "Blk 2 Lot 4, Redwood St, Marikina, Philippines"
3. Upload a different ID image
4. Click "Submit Registration"

### Expected Result
- ✅ Toast shows: "Verification document submitted successfully!"
- ✅ Status changes to "Verification Pending"
- ✅ Rejection reason disappears
- ✅ Document Type shows: "ID"

### Database Check
```sql
SELECT status, remarks, submitted_at, reviewed_by, reviewed_at
FROM resident_verifications
WHERE user_id = (SELECT user_id FROM users WHERE email='maria@example.com');
-- Expected:
-- status: pending (RESET)
-- remarks: NULL (CLEARED)
-- submitted_at: NEW timestamp (UPDATED)
-- reviewed_by: NULL (CLEARED)
-- reviewed_at: NULL (CLEARED)
```

---

## Test Case 5: File Upload with Various File Types ✅

### Objective
Verify file upload works with different file types and sizes.

### Steps
Test each file type:
1. JPG image (under 5MB)
2. PNG image (under 5MB)
3. PDF (under 10MB)
4. JPG image (over 5MB) - should fail
5. PDF (over 10MB) - should fail

### Expected Results
- ✅ JPG: Uploads successfully, preview shows image
- ✅ PNG: Uploads successfully, preview shows image
- ✅ PDF: Uploads successfully, shows file info (name, size)
- ✅ Large JPG: Shows error "Image must be 5 MB or smaller."
- ✅ Large PDF: Shows error "PDF must be 10 MB or smaller."

---

## Test Case 6: Data Persistence Across Navigation ✅

### Objective
Verify verification data persists when navigating between screens.

### Steps
1. Resident submits verification
2. Note the verification type displayed (should be "ID")
3. Navigate to "Track Status"
4. Navigate back to home
5. Refresh browser

### Expected Result
- ✅ Verification type still shows "ID" (not reset to "Utility Bill")
- ✅ Address is preserved
- ✅ Status is correct
- ✅ All data loads from API consistently

---

## Test Case 7: Cross-Browser Compatibility ✅

### Objective
Verify file upload works across different browsers.

### Test on:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browser

### For each browser:
1. Submit verification with image file
2. Should upload successfully
3. No console errors related to FormData

### Expected Result
- ✅ All browsers successfully upload files
- ✅ FormData properly formatted with multipart boundary
- ✅ No "Verification submission failed" errors

---

## Test Case 8: Admin Dashboard Data Accuracy ✅

### Objective
Verify admin dashboard shows correct verification information.

### Steps
1. Submit verification from resident with verification_type = "ID"
2. Log in as admin
3. View admin dashboard

### Expected Result
- ✅ Pending resident appears in "Residents Pending Verification" table
- ✅ Clicking "View" shows modal with:
  - User details (name, email, phone)
  - Verification Type: "ID" (NOT hardcoded type)
  - Document preview (if image) or file info
  - Status: pending
- ✅ Can approve or reject
- ✅ Rejection reason appears in dropdown

---

## Test Case 9: API Response Validation ✅

### Objective
Verify API returns correct data.

### Using cURL or Postman:

1. **Get current user** (resident logged in)
   ```bash
   curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/users/me
   ```
   - ✅ Response includes `verification_type`
   - ✅ Response includes `verification_remarks`
   - ✅ Response includes `verification_address`

2. **Submit verification**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer <token>" \
     -F "verificationType=ID" \
     -F "address=Blk 2 Lot 4" \
     -F "file=@id.jpg" \
     http://localhost:3000/users/me/verification
   ```
   - ✅ Response status: 200
   - ✅ Message: "Verification submitted successfully"

3. **Review verification** (admin)
   ```bash
   curl -X PATCH \
     -H "Authorization: Bearer <admin-token>" \
     -H "Content-Type: application/json" \
     -d '{"verificationStatus":"rejected", "remarks":"Address mismatch"}' \
     http://localhost:3000/users/<user-id>/verification/review
   ```
   - ✅ Response status: 200
   - ✅ Message: "Verification reviewed successfully"

---

## Regression Testing ✅

Verify existing features still work:

- [ ] Resident login works
- [ ] Admin login works
- [ ] Can file complaint (if verification approved)
- [ ] Can track complaint
- [ ] Can activate/deactivate resident (admin)
- [ ] Emergency hotlines display correctly
- [ ] FAQs display correctly
- [ ] Logout works from both sides

---

## Database Integrity Checks

Run these queries to verify data consistency:

```sql
-- Check for orphaned verification records (should be 0)
SELECT COUNT(*) FROM resident_verifications rv
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = rv.user_id);

-- Check for duplicate verifications per resident (should be 0)
SELECT user_id, COUNT(*) 
FROM resident_verifications 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Check for invalid statuses (should be 0)
SELECT COUNT(*) FROM resident_verifications
WHERE status NOT IN ('pending', 'approved', 'rejected');

-- Check for reviewed records without reviewer (should be 0)
SELECT COUNT(*) FROM resident_verifications
WHERE status IN ('approved', 'rejected') AND reviewed_by IS NULL;

-- Check for rejection without remarks (acceptable, shows count)
SELECT COUNT(*) FROM resident_verifications
WHERE status = 'rejected' AND remarks IS NULL;
```

---

## Success Criteria

All tests pass if:
- ✅ File uploads work without errors
- ✅ Verification type shows "ID" (not "Utility Bill")
- ✅ Rejection reasons are stored and displayed
- ✅ Residents can resubmit after rejection
- ✅ All data persists in database
- ✅ No orphaned database records
- ✅ Works across browsers
- ✅ API responses include all required fields
