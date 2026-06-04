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
cd backend && npm run dev
```

API base: `http://localhost:5000/api/v1`

## Quick test flow

1. **Setup → DB Health** — confirm `"database": true`
2. **Auth → Login (Admin)** — saves `accessToken` automatically
3. **Users (admin) → List Users** — saves `userId` and `assignedToUserId`
4. **Complaints → List Complaints** — saves `complaintId`
5. **Complaints → Update Complaint Status** / **Assign Complaint**
6. **Activity Logs → Get Logs by Complaint**

For resident flows: run **Auth → Register (Resident)** (or login), then **Complaints → Create Complaint** and **My Complaints**.

## Variables

| Variable | Set by |
|----------|--------|
| `accessToken` | Login / Register tests |
| `refreshToken` | Login / Register tests |
| `userId` | List Users |
| `assignedToUserId` | List Users (first responder) |
| `complaintId` | List or Create Complaint |
| `categoryId` | Default `1` (seed categories) |

Seed admin: `admin@example.com` / `Admin123!`
