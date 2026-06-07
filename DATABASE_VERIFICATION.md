# Database Schema Verification & Relationships

## Current resident_verifications Table Schema (After Fix)

```sql
CREATE TABLE resident_verifications (
    verification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID UNIQUE NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    
    verification_type VARCHAR(50) NOT NULL,
    
    document_url TEXT NOT NULL,
    
    address TEXT,
    
    status VARCHAR(20)
        DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    
    remarks TEXT,  ✅ NEW COLUMN
    
    reviewed_by UUID
        REFERENCES users(user_id),
    
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    reviewed_at TIMESTAMP
);
```

## PK/FK Relationships Verified

### Primary Key
- `verification_id UUID PRIMARY KEY` ✅ Unique identifier for each verification record

### Foreign Keys

1. **user_id FK**
   - Points to: `users(user_id)`
   - Behavior: `ON DELETE CASCADE` - When user deleted, verification deleted
   - Type: `UUID UNIQUE NOT NULL` - Each user has one active verification
   - ✅ CORRECT

2. **reviewed_by FK**
   - Points to: `users(user_id)`
   - Behavior: Default (no action specified - will restrict delete if FK exists)
   - Type: `UUID` (nullable) - Only populated when verification is reviewed
   - ✅ CORRECT - Allows tracking which admin reviewed the verification

## Data Flow & Integrity

### Submission Workflow
```
Resident submits verification
  ↓
INSERT INTO resident_verifications:
  - verification_id: auto-generated UUID
  - user_id: resident's UUID from users table
  - verification_type: "ID" (from form)
  - document_url: Cloudinary URL
  - address: resident's address
  - status: 'pending' (default)
  - remarks: NULL
  - reviewed_by: NULL
  - submitted_at: CURRENT_TIMESTAMP
  - reviewed_at: NULL
  ✅ INTEGRITY: All required fields populated
```

### Review Workflow - Approval
```
Admin approves verification
  ↓
UPDATE resident_verifications SET:
  - status: 'approved'
  - reviewed_by: admin's UUID (from users table)
  - reviewed_at: CURRENT_TIMESTAMP
  - remarks: NULL (not needed for approval)
  ✅ INTEGRITY: Audit trail complete
  ✅ UPDATE users SET is_verified=TRUE WHERE user_id=...
```

### Review Workflow - Rejection
```
Admin rejects verification with reason
  ↓
UPDATE resident_verifications SET:
  - status: 'rejected'
  - reviewed_by: admin's UUID (from users table)
  - reviewed_at: CURRENT_TIMESTAMP
  - remarks: 'Address is not the same as the ID...' ✅ NOW STORED
  ✅ INTEGRITY: Full audit trail with reason
```

### Resubmission After Rejection
```
Resident resubmits verification
  ↓
UPDATE resident_verifications SET:
  - verification_type: "ID" (updated)
  - document_url: new Cloudinary URL
  - address: possibly new address
  - status: 'pending' (reset to pending)
  - remarks: NULL (cleared)
  - reviewed_by: NULL (cleared)
  - reviewed_at: NULL (cleared)
  - submitted_at: CURRENT_TIMESTAMP (updated)
  ✅ INTEGRITY: Previous review cleared, fresh submission
```

## Constraint Validation

### UNIQUE Constraint on user_id
- `user_id UUID UNIQUE NOT NULL` ensures one verification per resident
- Why: Each resident can only have ONE active verification record
- Benefit: Prevents duplicate entries, ensures data integrity

### CHECK Constraint on status
- `CHECK (status IN ('pending', 'approved', 'rejected'))`
- Ensures only valid status values
- Prevents invalid states

### CASCADE Delete
- `ON DELETE CASCADE` on user_id FK
- When resident deleted: verification automatically deleted
- Prevents orphaned records
- Data stays consistent

## Sample Data After Fixes

```sql
-- A resident's verification journey:

-- 1. Initial submission
INSERT INTO resident_verifications (
  verification_id, user_id, verification_type, document_url, address, 
  status, remarks, reviewed_by, submitted_at, reviewed_at
) VALUES (
  'ver-123...', 'user-456...', 'ID', 'https://cdn.../id.jpg', 
  'Blk 2 Lot 4, Redwood St', 'pending', NULL, NULL, '2026-06-06 10:00:00', NULL
);

-- 2. Admin rejects with reason
UPDATE resident_verifications SET
  status = 'rejected',
  reviewed_by = 'admin-789...',
  reviewed_at = '2026-06-06 11:00:00',
  remarks = 'Address is not the same as the ID. Please resubmit verification with the correct address.'
WHERE verification_id = 'ver-123...';

-- 3. Resident resubmits
UPDATE resident_verifications SET
  document_url = 'https://cdn.../id-new.jpg',
  address = 'Blk 2 Lot 4, Redwood St, Marikina',
  status = 'pending',
  remarks = NULL,
  reviewed_by = NULL,
  reviewed_at = NULL,
  submitted_at = '2026-06-06 12:00:00'
WHERE verification_id = 'ver-123...';

-- 4. Admin approves
UPDATE resident_verifications SET
  status = 'approved',
  reviewed_by = 'admin-789...',
  reviewed_at = '2026-06-06 13:00:00'
WHERE verification_id = 'ver-123...';

-- Also update user table to mark verified
UPDATE users SET is_verified = TRUE WHERE user_id = 'user-456...';
```

## Query Verification

### Get all pending verifications (for admin)
```sql
SELECT 
  rv.verification_id,
  rv.user_id,
  u.first_name, u.last_name,
  rv.verification_type,
  rv.address,
  rv.status,
  rv.submitted_at
FROM resident_verifications rv
JOIN users u ON rv.user_id = u.user_id
WHERE rv.status = 'pending'
ORDER BY rv.submitted_at DESC;
✅ Works: All FK relationships valid
```

### Get resident's verification details
```sql
SELECT 
  rv.verification_id,
  rv.verification_type,
  rv.status,
  rv.remarks,
  a.first_name AS reviewed_by_name,
  rv.reviewed_at
FROM resident_verifications rv
LEFT JOIN users a ON rv.reviewed_by = a.user_id
WHERE rv.user_id = 'specific-resident-id';
✅ Works: LEFT JOIN for optional reviewed_by
```

### Verify no orphaned records
```sql
SELECT COUNT(*) FROM resident_verifications rv
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = rv.user_id);
✅ Result should be 0 (no orphans due to CASCADE)
```

## Audit Trail Completeness

For each verification status change, all of these fields are populated:

| Field | pending | approved | rejected |
|-------|---------|----------|----------|
| verification_id | ✅ auto | ✅ same | ✅ same |
| user_id | ✅ set | ✅ same | ✅ same |
| verification_type | ✅ set | ✅ same | ✅ same |
| document_url | ✅ set | ✅ same | ✅ same |
| address | ✅ set | ✅ same | ✅ same |
| status | ✅ pending | ✅ approved | ✅ rejected |
| remarks | ✅ NULL | ✅ NULL | ✅ reason |
| reviewed_by | ✅ NULL | ✅ admin_id | ✅ admin_id |
| submitted_at | ✅ now | ✅ same | ✅ same |
| reviewed_at | ✅ NULL | ✅ now | ✅ now |

✅ **All PK/FK relationships are correct and maintained**
