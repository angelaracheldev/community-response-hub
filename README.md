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
├── backend/              # Node.js API — routes, services, init-db.sql, migrations
├── frontend/             # Expo app (resident, admin, auth)
├── docs/                 # Documentation and API tooling
│   ├── swagger.yml       # OpenAPI 3 spec
│   ├── postman/          # Postman collection + environment
│   ├── DATABASE_SETUP.md
│   └── PROJECT_STRUCTURE.md
└── docker-compose.yml    # Local PostgreSQL (+ optional backend container)
```

See [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) for a full walkthrough of each folder.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker Desktop (for PostgreSQL)
- Cloudinary account (for complaint/verification media uploads)

### 1. Clone and start the database

```bash
git clone https://github.com/angelaracheldev/community-response-hub.git
cd community-response-hub
cp .env.example .env   # optional; keeps docker-compose DB credentials in sync
docker-compose up -d postgres
```

### 2. Configure and run the backend

```bash
cp backend/.env.example backend/.env.local
# Edit backend/.env.local — set DB_* and Cloudinary credentials
cd backend && npm install && npm run dev
```

Database connection details: [docs/DATABASE_SETUP.md](./docs/DATABASE_SETUP.md)

### 3. Run the frontend

```bash
cd frontend && npm install && npm start
```

**API base URL (local):** `http://localhost:5000/api/v1`

---

## Documentation

| Resource | Description |
|----------|-------------|
| [docs/swagger.yml](./docs/swagger.yml) | OpenAPI 3 API specification |
| [docs/postman/](./docs/postman/README.md) | Postman collection, environment, and test flows |
| [docs/DATABASE_SETUP.md](./docs/DATABASE_SETUP.md) | PostgreSQL setup with Docker Compose |
| [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) | Repository layout guide |

**Quick API test:** Import `docs/postman/Community-Response-Hub.postman_collection.json` and `CRH-Local.postman_environment.json` into Postman, then run **Auth → Login (Admin)**. Seed admin: `admin@example.com` / `Admin123!`

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
