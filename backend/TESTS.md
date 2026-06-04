Running backend tests

1. Install dev dependencies in `backend/`:

```bash
cd backend
npm install
```

2. Run tests:

```bash
npm test
```

Notes:
- Tests use Jest and Supertest. They mock the database and auth middleware for isolated route testing.
- To run integration tests against a real database, remove or adapt the mocks in `backend/tests/`.
