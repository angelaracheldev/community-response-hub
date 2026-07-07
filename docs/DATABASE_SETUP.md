# Database Setup Guide

This project uses **PostgreSQL 15** as the primary database. For local development, Docker Compose runs a shared PostgreSQL instance.

## Prerequisites

- **Docker Desktop** installed and running ([Download](https://www.docker.com/products/docker-desktop))
- **Git**
- Port **5432** available (PostgreSQL default)

## Quick start

### 1. Clone the repository

```bash
git clone https://github.com/angelaracheldev/community-response-hub.git
cd community-response-hub
```

### 2. Start the database

```bash
cp .env.example .env   # optional; docker-compose reads DB_* from repo root
docker-compose up -d postgres
```

This will:

- Pull the PostgreSQL 15 Alpine image
- Create and start the database container
- Initialize tables from `backend/init-db.sql`
- Load seed data (roles, categories, sample users, etc.)

### 3. Verify the database is running

```bash
docker-compose ps
```

You should see `community-response-hub-db` with status `Up`.

### 4. Connect to the database

**Using psql:**

```bash
psql -h localhost -U postgres -d community_response_hub
# Password: 123456
```

**Using a GUI (DBeaver, TablePlus, etc.):**

| Field | Value |
|-------|-------|
| Host | `localhost` |
| Port | `5432` |
| Username | `postgres` |
| Password | `123456` |
| Database | `community_response_hub` |

## Configuration

Copy the example env file and customize as needed:

```bash
cp backend/.env.example backend/.env.local
```

**Default local values:**

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123456
DB_NAME=community_response_hub
```

Change `DB_PASSWORD` before any production deployment.

## Schema overview

Main tables (see `backend/init-db.sql` for the full schema):

| Table | Purpose |
|-------|---------|
| `roles` | User role definitions |
| `users` | Accounts (residents, responders, admins) |
| `resident_verifications` | ID/document verification workflow |
| `complaint_categories` | Complaint types |
| `complaints` | Incident records (`reference_id` as CMP-YEAR-#####) |
| `complaint_assignments` | Officer assignments |
| `complaint_media` | Photos, videos, documents |
| `activity_logs` | Complaint audit trail |
| `user_activity_logs` | User-level audit trail |
| `notifications` | In-app notifications |
| `emergency_hotlines` | Emergency contact numbers |

## Common commands

### Apply migrations (existing database)

Fresh installs use `init-db.sql` directly. If your database predates a schema change, run the relevant file from `backend/migrations/`:

```bash
# Example: add complaint reference_id
psql -h localhost -U postgres -d community_response_hub \
  -f backend/migrations/001_add_complaint_reference_id.sql

# Example: create notifications table
docker-compose exec -T postgres psql -U postgres -d community_response_hub \
  < backend/migrations/002_create_notifications_table.sql

# Example: add must_change_password (first-login / change-password flows)
docker-compose exec -T postgres psql -U postgres -d community_response_hub \
  < backend/migrations/003_add_must_change_password.sql
```

See `backend/migrations/` for the full list of migration scripts.

### Stop the database

```bash
docker-compose down
```

### Stop and remove all data

```bash
docker-compose down -v
```

### View database logs

```bash
docker-compose logs postgres
```

### Backup and restore

```bash
# Backup
docker-compose exec postgres pg_dump -U postgres community_response_hub > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres community_response_hub < backup.sql
```

### Database shell

```bash
docker-compose exec postgres psql -U postgres -d community_response_hub
```

## Team workflow

### Each developer

1. Clone the repository
2. Run `docker-compose up -d`
3. Copy `backend/.env.example` to `backend/.env.local`
4. Verify with `docker-compose ps`

### Schema changes

1. Update `backend/init-db.sql` for new environments
2. Add a migration in `backend/migrations/` for existing databases
3. Test locally: `docker-compose down -v && docker-compose up -d`
4. Commit both files

## Troubleshooting

**Port 5432 already in use**

```bash
lsof -i :5432   # macOS / Linux
```

Stop the conflicting service or change the port mapping in `docker-compose.yml`.

**Container won't start**

```bash
docker-compose logs postgres
```

**Database won't initialize**

```bash
docker-compose down -v
docker-compose up -d
```

**Connection refused**

- Ensure Docker Desktop is running
- Wait 10–15 seconds after `up` for PostgreSQL to finish starting
- Confirm `docker-compose ps` shows the container as `Up`

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
