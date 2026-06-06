# Postman — Community Response Hub API

## Import

1. Open Postman → **Import**
2. Select both files in this folder:
   - `Community-Response-Hub.postman_collection.json`
   - `CRH-Local.postman_environment.json`
3. Choose environment **CRH Local** (top-right dropdown)

## Run locally

```bash
docker-compose up -d
cp backend/.env.example backend/.env.local
# Edit .env.local: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cd backend && npm run dev
```

API base: `http://localhost:5000/api/v1`

## Quick test flow

1. **Setup → DB Health** — confirm `"database": true`
2. **Auth → Login (Admin)** — saves `accessToken` automatically
3. **Users (admin) → List Users** — saves `userId` and `assignedToUserId`
4. **Complaints → List Complaints** — saves `complaintId`
5. **Complaint Media → Upload Complaint Media** — select an image in Body → form-data → `files`
6. **Complaint Media → List Complaint Media** — confirm `media_url` (Cloudinary)
7. **Complaints → Update Complaint Status** / **Assign Complaint**
8. **Activity Logs → Get Logs by Complaint**

For resident flows: run **Auth → Register (Resident)** (or login), then **Complaints → Create Complaint**, **Complaint Media → Upload**, and **My Complaints**.

## Complaint media (Cloudinary)

| Request | Method | Notes |
|---------|--------|--------|
| Upload Complaint Media | `POST /complaints/:id/media` | form-data field **`files`** (file type). Up to 5 files. |
| List Complaint Media | `GET /complaints/:id/media` | |
| Delete Complaint Media | `DELETE /complaints/:id/media/:mediaId` | DB row only in v1 |

**`complaintId` must be a UUID only** (e.g. from List/Create tests). Do not paste extra fields into the variable.

**`referenceId`** is the human-readable complaint code (e.g. `CMP-2026-00001`) returned in API responses for display. It is saved automatically by List/Create tests but is **not** used in URL paths.

View uploads in [Cloudinary Media Library](https://console.cloudinary.com) under folder `community-response-hub/complaints`.

## Variables

| Variable | Set by |
|----------|--------|
| `accessToken` | Login / Register tests |
| `refreshToken` | Login / Register tests |
| `userId` | List Users |
| `assignedToUserId` | List Users (first responder) |
| `complaintId` | List or Create Complaint (UUID for API paths) |
| `referenceId` | List or Create Complaint (human-readable CMP-YEAR-#####) |
| `mediaId` | Upload or List Complaint Media |
| `categoryId` | Default `1` (seed categories) |

Seed admin: `admin@example.com` / `Admin123!`
