# Community Incident Reporting & Response Platform

A mobile-first platform for barangays and subdivisions to receive, track, and resolve community complaints—with evidence upload, resident verification, privacy controls, and activity logs.

---

## Problem

- No single channel to report issues or get updates
- Incomplete, invalid, or prank complaints waste staff time
- No centralized complaint tracking
- Privacy concerns discourage residents from reporting

## Solution

- Mobile/web complaint reporting with photo and video evidence
- Resident verification before submission
- Complainant identity hidden from responders (admin-only access)
- Real-time status updates, officer assignment, and activity logs
- Resolution statements and proof for accountability

### MVP

| Resident | Barangay / Subdivision |
|----------|------------------------|
| Register, login, verify | Complaint dashboard |
| Submit complaints + media | View evidence, assign officers |
| Track status & activity logs | Update status, resolution proof |
| FAQs & emergency hotlines | Activity logs |

**Categories:** Noise, illegal parking, garbage disposal, animal concerns, infrastructure.

---

## Why This Project

Communities still rely on informal channels (SMS, social media, walk-ins) with no audit trail. This system addresses a real local need—faster response, transparency, and privacy—while covering full-stack skills: auth, roles, file uploads, real-time updates, and relational data.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Expo / React Native) |
| Backend | Node.js + Express |
| Database | PostgreSQL 15 |
| Media | Cloudinary |
| Auth | JWT |
| Real-time | Socket.IO |
| API docs | Swagger (OpenAPI 3) |
| Local dev | Docker Compose |

### Why These Choices

- **React (Expo)** — One codebase for mobile and web; fits evidence upload and future GPS features.
- **Node.js + Express** — Same language as the frontend; lightweight REST API with JWT and Socket.IO.
- **PostgreSQL** — Relational model for users, complaints, assignments, and audit logs; strong data integrity.
- **Cloudinary** — Managed photo/video storage; database keeps URLs only.
- **JWT + Socket.IO + Swagger** — Stateless auth, live status updates, and a shared API contract for the team.

---

## Project Structure

```
community-response-hub/
├── backend/          # init-db.sql, .env.example
├── frontend/         # Expo app (resident, admin, auth)
├── docs/swagger.yml  # API specification
└── docker-compose.yml
```

---

## Getting Started

```bash
# Clone and start database
git clone https://github.com/angelaracheldev/community-response-hub.git
cd community-response-hub
docker-compose up -d

# Frontend
cd frontend && npm install && npm start
```

Copy `backend/.env.example` to `backend/.env.local` and see [DATABASE_SETUP.md](./DATABASE_SETUP.md) for DB connection details.

**API base URL (local):** `http://localhost:5000/api/v1`

---

## Roles

| Role | Access |
|------|--------|
| Resident | Submit and track own complaints |
| Responder | Manage assigned complaints (no complainant PII) |
| Admin | Verification, assignments, full dashboard, complainant details |

---

## Future Enhancements

GPS verification · AI categorization · Spam detection · Analytics heatmaps · SMS · Live responder tracking · Messaging
