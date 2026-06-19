# Project Structure

Overview of the **Community Response Hub** repository layout. This is a monorepo for a community incident reporting platform (residents submit complaints; admins manage and resolve them).

---

## Root folders

### `.github`
GitHub-specific configuration. Holds `workflows/` for GitHub Actions CI/CD (automated tests, builds, deploys).

### `.vscode`
Editor settings for VS Code/Cursor (TypeScript SDK path, line endings, whitespace). Listed in `.gitignore`, so these are typically local-only.

### `backend`
The **API server** — Node.js + Express, PostgreSQL, JWT auth, Socket.IO, Cloudinary for media.

| Path | Purpose |
|------|---------|
| `src/` | Routes, controllers, services, repositories |
| `init-db.sql` | Initial database schema and seed data |
| `migrations/` | Incremental schema changes for existing databases |
| `tests/` | Backend test suites |
| `Dockerfile` | Container image for the API |

### `docs`
Project documentation — API spec, Postman guides, setup notes.

| Path | Purpose |
|------|---------|
| `swagger.yml` | OpenAPI specification for the REST API |
| `postman/` | Postman collection (JSON), environment, and test guide |
| `.postman/` | Postman workspace config linking collection, env, and Swagger |
| `DATABASE_SETUP.md` | Local PostgreSQL setup via Docker |
| `PROJECT_STRUCTURE.md` | This file |

### `frontend`
The **client app** — Expo / React Native (web + mobile).

| Path | Purpose |
|------|---------|
| `app/` | Screens (resident, admin, auth routes) |
| `components/` | Reusable UI components |
| `hooks/` | Custom React hooks |
| `utils/` | API clients and helpers |
| `styles/` | Style definitions |
| `dist/` | Built web output (generated) |

### `node_modules`
Root-level npm dependencies from the root `package.json`. Backend and frontend each have their own `node_modules` as well.

---

## Root files

| File | Purpose |
|------|---------|
| `README.md` | Main project overview, tech stack, getting started |
| `package.json` | Root npm manifest (minimal shared deps) |
| `package-lock.json` | Lockfile for root dependencies |
| `docker-compose.yml` | Local dev: PostgreSQL + optional backend container |
| `.gitignore` | Files and folders excluded from version control |

---

## How the pieces connect

```
frontend/  ──HTTP / WebSocket──►  backend/  ──►  PostgreSQL (docker-compose)
                                      │
docs/swagger.yml  ◄── documents ──────┘
```

- **Run locally:** `docker-compose up -d` starts the database; `cd frontend && npm start` runs the app; `cd backend && npm run dev` runs the API.
- **API contract:** `docs/swagger.yml` and Postman collections in `docs/postman/`.
- **Database:** Schema in `backend/init-db.sql`; see [DATABASE_SETUP.md](./DATABASE_SETUP.md) for connection details.
