const request = require('supertest');

const mockQuery = jest.fn();

jest.mock('../src/config/database', () => ({
  query: (...args) => mockQuery(...args),
}));

jest.mock('../src/middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { user_id: 'admin-1', role_name: 'admin' };
    return next();
  },
  requireRole: () => (req, res, next) => next(),
  requireAnyRole: () => (req, res, next) => next(),
  requireVerified: (req, res, next) => next(),
}));

const app = require('../src/app');

describe('Admin user creation endpoint', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  test('POST /api/v1/users creates a resident user', async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ role_id: 1, role_name: 'resident' }] })
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            user_id: 'user-1',
            user_code: 'RES-2026-001',
            first_name: 'Juan',
            last_name: 'Dela Cruz',
            email: 'juan@example.com',
            phone_number: null,
            address: null,
            role_id: 1,
            is_verified: true,
            is_active: true,
          },
        ],
      });

    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', 'Bearer faketoken')
      .send({
        first_name: 'Juan',
        last_name: 'Dela Cruz',
        email: 'juan@example.com',
        phone_number: null,
        role_id: 1,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', 'juan@example.com');
    expect(res.body.user).not.toHaveProperty('password_hash');
    expect(mockQuery.mock.calls[2][0]).toMatch(/INSERT INTO users/i);
  });

  test('POST /api/v1/users rejects duplicate emails', async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ role_id: 1, role_name: 'resident' }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ user_id: 'existing-user' }] });

    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', 'Bearer faketoken')
      .send({
        first_name: 'Juan',
        last_name: 'Dela Cruz',
        email: 'juan@example.com',
        role_id: 1,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Email address is already registered.');
  });
});
