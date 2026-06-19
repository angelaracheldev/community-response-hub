# Postman — Community Response Hub API

Collection aligned with `docs/swagger.yml` and the current backend routes.

## Import

1. Open Postman → **Import**
2. Select both files in this folder:
   - `Community-Response-Hub.postman_collection.json`
   - `CRH-Local.postman_environment.json`
3. Choose environment **CRH Local** (top-right dropdown)

### Postman workspace (optional)

If you use Postman's Git workspace integration, open the `docs/` folder as the workspace root. Config lives in `docs/.postman/resources.yaml`.

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
3. **Admin → Get Dashboard** — stats, trends, recent complaints
4. **Users (admin) → List Responders** — saves `assignedToUserId`
5. **Complaints → List Complaints** — saves `complaintId` and `referenceId`
6. **Admin → Get Complaint Details** — aggregated complaint view
7. **Complaint Media → Upload Complaint Media** — select an image in Body → form-data → `files`
8. **Complaints → Assign Complaint** / **Update Complaint Status**
9. **Activity Logs → Get Logs by Complaint**

For notifications: **Auth → Login (Admin)**, then **Notifications → Get Notifications**. Test **Get Unread Count**, **Open Notification**, and **Mark All As Read**.

For resident flows: **Auth → Register (Resident)** (or login), **Users (resident) → Submit Verification (me)** (multipart `file`), then **Complaints → Create Complaint**, **Complaint Media → Upload**, **My Complaints**, **Cancel Complaint**, or **Delete Pending Complaint**.

For admin complaint actions: **Reject Complaint**, **Update Complaint Priority**, **Create User**.

## Collection folders

| Folder | Endpoints |
|--------|-----------|
| Setup | Health, DB, categories (no auth) |
| Auth | Register, login, me, logout, refresh |
| Categories | CRUD (admin for writes) |
| Users (admin) | List, create, responders, CRUD, verification review |
| Users (resident) | Profile, submit verification |
| Admin | Dashboard, complaint details aggregate |
| Complaints | List, create, status, assign, priority, reject, cancel, delete |
| Complaint Media | Upload, list, delete |
| Activity Logs | Logs by complaint |
| Notifications | List, unread filter, count, open, mark all read |

## Complaint media (Cloudinary)

| Request | Method | Notes |
|---------|--------|--------|
| Upload Complaint Media | `POST /complaints/:id/media` | form-data field **`files`** (file type). Up to 5 files. |
| List Complaint Media | `GET /complaints/:id/media` | |
| Delete Complaint Media | `DELETE /complaints/:id/media/:mediaId` | DB row only in v1 |

| Cancel Complaint | `PATCH /complaints/:id/cancel` | Resident only. Body: `cancellationReason` (min 10 chars). Status must be `pending` or `assigned`. |
| Delete Pending Complaint | `DELETE /complaints/:id` | Resident only. Own `pending` complaints only. |
| Reject Complaint | `PATCH /complaints/:id/reject` | Admin only. Body: `reason` (min 10 chars). |
| Update Priority | `PATCH /complaints/:id/priority` | Admin only. Body: `priorityLevel` (`low` \| `normal` \| `high` \| `urgent`). |

**Path `:id`** accepts either **`complaintId`** (UUID) or **`referenceId`** (e.g. `CMP-2026-00001`). Both are saved by List/Create/**My Complaints** tests.

View uploads in [Cloudinary Media Library](https://console.cloudinary.com) under folder `community-response-hub/complaints`.

## Variables

| Variable | Set by |
|----------|--------|
| `accessToken` | Login / Register tests |
| `refreshToken` | Login / Register tests |
| `userId` | List Users, Create User |
| `assignedToUserId` | List Users, List Responders |
| `complaintId` | List, Create, or My Complaints (UUID) |
| `referenceId` | List, Create, or My Complaints (CMP-YEAR-#####) |
| `mediaId` | Upload or List Complaint Media |
| `notificationId` | Get Notifications |
| `categoryId` | Default `1` (seed categories) |

Seed admin: `admin@example.com` / `Admin123!`
