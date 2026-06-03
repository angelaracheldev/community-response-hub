-- ROLES TABLE
-- =====================================================

CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_level INTEGER NOT NULL
);

INSERT INTO roles (role_name, role_level)
VALUES
('resident', 1),
('responder', 2),
('admin', 3);


-- 

-- SEQUENCES
-- =====================================================

CREATE SEQUENCE resident_seq START 1;
CREATE SEQUENCE responder_seq START 1;
CREATE SEQUENCE staff_seq START 1;

CREATE OR REPLACE FUNCTION generate_user_code()
RETURNS TRIGGER
AS $$
DECLARE
    role_name_value VARCHAR(50);
BEGIN

    SELECT role_name
    INTO role_name_value
    FROM roles
    WHERE role_id = NEW.role_id;

    IF role_name_value = 'resident' THEN

        NEW.user_code := CONCAT(
            'RES-',
            EXTRACT(YEAR FROM CURRENT_DATE),
            '-',
            LPAD(nextval('resident_seq')::TEXT, 3, '0')
        );

    ELSIF role_name_value = 'responder' THEN

        NEW.user_code := CONCAT(
            'RESP-',
            EXTRACT(YEAR FROM CURRENT_DATE),
            '-',
            LPAD(nextval('responder_seq')::TEXT, 3, '0')
        );

    ELSIF role_name_value = 'admin' THEN

        NEW.user_code := CONCAT(
            'STAFF-',
            EXTRACT(YEAR FROM CURRENT_DATE),
            '-',
            LPAD(nextval('staff_seq')::TEXT, 3, '0')
        );

    ELSE
        RAISE EXCEPTION 'Invalid role_id: %', NEW.role_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;




-- =====================================================
-- USERS TABLE
-- =====================================================

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    role_id INTEGER NOT NULL
        REFERENCES roles(role_id),

    user_code VARCHAR(30) UNIQUE NOT NULL,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    phone_number VARCHAR(20),

    profile_image_url TEXT,

    is_verified BOOLEAN DEFAULT FALSE,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_generate_user_code
BEFORE INSERT
ON users
FOR EACH ROW
EXECUTE FUNCTION generate_user_code();



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
        CHECK (
            status IN (
                'pending',
                'approved',
                'rejected'
            )
        ),

    reviewed_by UUID
        REFERENCES users(user_id),

    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    reviewed_at TIMESTAMP
);


---

-- # 4. Complaint Categories Table

-- ## Purpose

-- Stores complaint categories.

-- Allows admins to add new categories without modifying code.

---

-- SQL

--sql
CREATE TABLE complaint_categories (
    category_id SERIAL PRIMARY KEY,

    category_name VARCHAR(100)
        UNIQUE NOT NULL,

    description TEXT
);
---

---

-- Sample Categories

--sql
INSERT INTO complaint_categories
(category_name)
VALUES
('Noise Complaint'),
('Illegal Parking'),
('Garbage Disposal'),
('Animal Concern'),
('Infrastructure Issue');
-- ```

---

--# 5. Complaints Table

--## Purpose

--Core table of the system.

--Stores complaint information and current complaint status.

---

-- SQL

--sql
-- =====================================================
-- COMPLAINTS TABLE
-- Stores current/latest complaint status only
-- =====================================================

CREATE TABLE complaints (
    complaint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    reported_by UUID
        REFERENCES users(user_id)
        ON DELETE SET NULL,

    category_id INTEGER
        REFERENCES complaint_categories(category_id),

    title VARCHAR(255) NOT NULL,

    description TEXT NOT NULL,

    location_text TEXT,

    latitude DECIMAL(10,8)
    CHECK (latitude BETWEEN -90 AND 90),

    longitude DECIMAL(11,8)
    CHECK (longitude BETWEEN -180 AND 180),

    status VARCHAR(30)
        DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'under_review',
                'assigned',
                'in_progress',
                'resolved',
                'cancelled',
                'rejected'
            )
        ),

    priority_level VARCHAR(20)
        DEFAULT 'normal'
        CHECK (
            priority_level IN (
                'low',
                'normal',
                'high',
                'urgent'
            )
        ),

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
--

-- --# Complaint Workflow

-- --```text
-- --Pending
--    ↓
-- --Under Review
--    ↓
-- Assigned
--    ↓
-- In Progress
--    ↓
-- Resolved
-- ```

-- Optional:

-- ```text
-- Cancelled
-- Rejected
-- ```

---

-- # 6. Complaint Assignments Table

-- ## Purpose

-- Tracks assignment history.

-- Never overwrite assignments.

-- Preserves accountability.

-- ---

-- ## SQL

-- ```sql
CREATE TABLE complaint_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    complaint_id UUID NOT NULL
        REFERENCES complaints(complaint_id)
        ON DELETE CASCADE,

    assigned_to UUID NOT NULL
        REFERENCES users(user_id),

    assigned_by UUID NOT NULL
        REFERENCES users(user_id),

    is_active BOOLEAN DEFAULT TRUE,

    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ```

-- ---

-- ## Example

-- ```text
-- Complaint A
--      ↓
-- Tanod 1

-- (reassigned)

-- Complaint A
--      ↓
-- Tanod 2
-- ```

-- Old assignment remains in database.

-- ---

-- # 7. Complaint Media Table

-- ## Purpose

-- Stores uploaded evidence.

-- Examples:

-- * Photos
-- * Videos
-- * Resolution evidence

-- ---

-- ## SQL

-- ```sql
CREATE TABLE complaint_media (
    media_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    complaint_id UUID NOT NULL
        REFERENCES complaints(complaint_id)
        ON DELETE CASCADE,

    uploaded_by UUID
        REFERENCES users(user_id),

    media_url TEXT NOT NULL,

    media_type VARCHAR(20)
        CHECK (
            media_type IN (
                'image',
                'video'
            )
        ),

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ```

-- ---

-- ## Storage Recommendation

-- Store only:

-- ```text
-- Cloudinary URLs
-- AWS S3 URLs
-- Google Cloud Storage URLs
-- ```

-- Do NOT store files directly in PostgreSQL.

-- ---

-- # 8. Activity Logs Table

-- ## Purpose

-- Stores complete complaint timeline.

-- Provides audit trail and accountability.

-- ---

-- ## SQL

-- ```sql
CREATE TABLE activity_logs (
    activity_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    complaint_id UUID NOT NULL
        REFERENCES complaints(complaint_id)
        ON DELETE CASCADE,

    performed_by UUID
    REFERENCES users(user_id)
    ON DELETE SET NULL,

    action_type VARCHAR(100) NOT NULL,

    old_value TEXT,

    new_value TEXT,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ```

-- ---

-- ## Recommended Action Types

-- ```text
-- complaint_created
-- status_updated
-- assigned
-- reassigned
-- resolved
-- cancelled
-- rejected
-- media_uploaded
-- comment_added
-- verification_completed
-- ```

-- ---

-- ## Example Activity Timeline

-- | Time    | Action            |
-- | ------- | ----------------- |
-- | 8:00 PM | complaint_created |
-- | 8:05 PM | assigned          |
-- | 8:06 PM | status_updated    |
-- | 8:12 PM | reassigned        |
-- | 8:25 PM | cancelled         |

-- ---

-- # 9. Emergency Hotlines Table

-- ## Purpose

-- Stores emergency contact information accessible to residents.

-- ---

-- ## SQL

-- ```sql
CREATE TABLE emergency_hotlines (
    hotline_id SERIAL PRIMARY KEY,

    agency_name VARCHAR(255) NOT NULL,

    contact_number VARCHAR(50) NOT NULL,

    description TEXT
);
-- ```

---


CREATE INDEX idx_complaints_status
ON complaints(status);

CREATE INDEX idx_complaints_category
ON complaints(category_id);

CREATE INDEX idx_activity_logs_complaint
ON activity_logs(complaint_id);
-- ===================================


-- Demo/Test Data

-- =====================================================
-- USERS
-- =====================================================

INSERT INTO users (
    role_id,
    first_name,
    last_name,
    email,
    password_hash,
    phone_number,
    is_verified
)
VALUES
(
    1,
    'Juan',
    'Dela Cruz',
    'juan@example.com',
    'hashed_password',
    '09171234567',
    TRUE
),
(
    1,
    'Maria',
    'Santos',
    'maria@example.com',
    'hashed_password',
    '09181234567',
    TRUE
),
(
    2,
    'Pedro',
    'Tanod',
    'pedro@example.com',
    'hashed_password',
    '09221234567',
    TRUE
),
(
    2,
    'Ramon',
    'Tanod',
    'ramon@example.com',
    'hashed_password',
    '09231234567',
    TRUE
),
(
    3,
    'Ana',
    'Administrator',
    'admin@example.com',
    'hashed_password',
    '09991234567',
    TRUE
);

-- Residents Verifications

INSERT INTO resident_verifications (
    user_id,
    verification_type,
    document_url,
    address,
    status
)
SELECT
    user_id,
    'National ID',
    'https://sample.com/id.jpg',
    'Barangay San Isidro',
    'approved'
FROM users
WHERE role_id = 1;

-- Complaints
INSERT INTO complaints (
    reported_by,
    category_id,
    title,
    description,
    location_text,
    latitude,
    longitude,
    status,
    priority_level
)
VALUES
(
    (SELECT user_id FROM users WHERE email='juan@example.com'),
    1,
    'Loud Karaoke Until Midnight',
    'Neighbor continues karaoke until late night.',
    'Purok 1',
    14.59950000,
    120.98420000,
    'resolved',
    'normal'
),
(
    (SELECT user_id FROM users WHERE email='maria@example.com'),
    3,
    'Garbage Dumping Near Creek',
    'Residents dumping trash near creek.',
    'Creekside Area',
    14.60120000,
    120.98600000,
    'in_progress',
    'high'
);

-- Complaint Assignments
INSERT INTO complaint_assignments (
    complaint_id,
    assigned_to,
    assigned_by,
    is_active
)
VALUES
(
    (SELECT complaint_id
     FROM complaints
     WHERE title='Loud Karaoke Until Midnight'),

    (SELECT user_id
     FROM users
     WHERE email='pedro@example.com'),

    (SELECT user_id
     FROM users
     WHERE email='admin@example.com'),

    FALSE
),
(
    (SELECT complaint_id
     FROM complaints
     WHERE title='Loud Karaoke Until Midnight'),

    (SELECT user_id
     FROM users
     WHERE email='ramon@example.com'),

    (SELECT user_id
     FROM users
     WHERE email='admin@example.com'),

    TRUE
);

-- Complaint Media

INSERT INTO complaint_media (
    complaint_id,
    uploaded_by,
    media_url,
    media_type
)
VALUES
(
    (SELECT complaint_id
     FROM complaints
     WHERE title='Loud Karaoke Until Midnight'),

    (SELECT user_id
     FROM users
     WHERE email='juan@example.com'),

    'https://sample.com/noise.jpg',
    'image'
);



-- Activity Logs

INSERT INTO activity_logs (
    complaint_id,
    performed_by,
    action_type,
    description
)
VALUES
(
    (SELECT complaint_id
     FROM complaints
     WHERE title='Loud Karaoke Until Midnight'),

    (SELECT user_id
     FROM users
     WHERE email='juan@example.com'),

    'complaint_created',
    'Resident submitted complaint'
),
(
    (SELECT complaint_id
     FROM complaints
     WHERE title='Loud Karaoke Until Midnight'),

    (SELECT user_id
     FROM users
     WHERE email='admin@example.com'),

    'assigned',
    'Complaint assigned to responder'
);
