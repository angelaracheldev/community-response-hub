# Community Response Hub - Database Setup Guide

## Overview
This project uses PostgreSQL as the primary database. For team development, we've configured Docker Compose to manage a shared local PostgreSQL instance.

## Prerequisites
- **Docker Desktop** installed and running ([Download](https://www.docker.com/products/docker-desktop))
- **Git** (already installed - you cloned the repo)
- **5432 port** available (PostgreSQL default port)

## Quick Start (All Team Members)

### 1. Clone the Repository
```bash
git clone https://github.com/angelaracheldev/community-response-hub.git
cd community-response-hub
```

### 2. Start the Database
```bash
docker-compose up -d
```

This will:
- Download the PostgreSQL 15 Alpine image
- Create and start the database container
- Initialize all tables with the schema
- Insert sample data (categories; hotlines when seeded)

### 3. Verify the Database is Running
```bash
docker-compose ps
```

You should see the `community-response-hub-db` container with status `Up`.

### 4. Connect to the Database
**Using psql (if installed):**
```bash
psql -h localhost -U crh_user -d community_response_hub
# Password: crh_password_dev
```

**Using DBeaver or another GUI tool:**
- Host: `localhost`
- Port: `5432`
- Username: `crh_user`
- Password: `crh_password_dev`
- Database: `community_response_hub`

**Using VS Code PostgreSQL Extension:**
- Install: "PostgreSQL" by Chris Kolkman
- Click "Create Connection"
- Host: `localhost`
- Port: `5432`
- User: `crh_user`
- Password: `crh_password_dev`
- Database: `community_response_hub`

## Configuration

### Environment Variables
Copy `.env.example` to `.env.local` and customize:
```bash
cp backend/.env.example backend/.env.local
```

**Default values** (for local development):
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=crh_user
DB_PASSWORD=crh_password_dev
DB_NAME=community_response_hub
```

⚠️ **IMPORTANT**: Change `DB_PASSWORD` before deploying to production!

## Database Schema

### Tables
1. **users** - User accounts (residents, officers, admins)
2. **complaint_categories** - Types of complaints
3. **complaints** - Main complaint/incident records
4. **complaint_media** - Photos, videos, documents attached to complaints
5. **activity_logs** - Audit trail of changes
6. **emergency_hotlines** - Emergency contact numbers

### Key Features
- ✅ UUID primary keys (auto-generated)
- ✅ Timestamps (created_at, updated_at)
- ✅ Foreign key constraints
- ✅ Indexes for performance
- ✅ Sample data pre-loaded

## Common Commands

### Stop the Database
```bash
docker-compose down
```

### Stop and Remove All Data
```bash
docker-compose down -v
```

### View Database Logs
```bash
docker-compose logs postgres
```

### Backup the Database
```bash
docker-compose exec postgres pg_dump -U crh_user community_response_hub > backup.sql
```

### Restore from Backup
```bash
docker-compose exec -T postgres psql -U crh_user community_response_hub < backup.sql
```

### Access Database Shell
```bash
docker-compose exec postgres psql -U crh_user -d community_response_hub
```

## Team Development Workflow

### Each team member should:
1. Clone the repository
2. Run `docker-compose up -d`
3. Verify connection with `docker-compose ps`
4. Connect using their preferred tool (psql, DBeaver, VS Code)

### For schema changes:
1. Modify `backend/init-db.sql`
2. Run `docker-compose down -v` (remove old database)
3. Run `docker-compose up -d` (creates new database with changes)
4. Commit updated `init-db.sql` to Git

### For production deployment:
See `PRODUCTION_DATABASE_SETUP.md` (coming soon)

## Troubleshooting

### Port 5432 already in use
```bash
# Find what's using port 5432
netstat -tuln | grep 5432

# Either stop that service or change the port in docker-compose.yml
```

### Container won't start
```bash
docker-compose logs postgres
```

### Database won't initialize
```bash
docker-compose down -v  # Remove everything
docker-compose up -d    # Start fresh
```

### Connection refused
- Ensure Docker is running
- Wait 10-15 seconds for PostgreSQL to fully initialize
- Check `docker-compose ps` shows container is `Up`

## Next Steps

1. **Backend Setup**: Create your Node.js/Python API server
2. **Connect to DB**: Use connection string in your backend code
3. **Run Migrations**: For production changes, use migration tools (Knex, Alembic, etc.)
4. **Monitor**: Use logs and monitoring tools to track database health

## Resources
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [DBeaver Download](https://dbeaver.io/)
