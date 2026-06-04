const request = require('supertest');

const mockQuery = jest.fn();

jest.mock('../db', () => ({
  query: (...args) => mockQuery(...args),
}));

jest.mock('../middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { user_id: 'admin-1', role_name: 'admin' };
    return next();
  },
  requireRole: () => (req, res, next) => next(),
  requireAnyRole: () => (req, res, next) => next(),
}));

const app = require('../server');

describe('Complaint activity logs endpoint', () => {
  beforeEach(() => mockQuery.mockReset());

  test('GET /api/v1/complaints/:id/activity-logs returns paginated logs', async () => {
    const sampleLogs = [
      { activity_log_id: 'a1', complaint_id: 'cmp-1', action_type: 'complaint_created', description: 'Created' },
    ];

    // count call
    mockQuery.mockResolvedValueOnce({ rows: [{ total: 1 }], rowCount: 1 });
    // select call
    mockQuery.mockResolvedValueOnce({ rows: sampleLogs, rowCount: 1 });

    const res = await request(app).get('/api/v1/complaints/cmp-1/activity-logs').set('Authorization', 'Bearer faketoken');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('logs');
    expect(res.body.logs).toHaveLength(1);
    expect(res.body).toHaveProperty('total', 1);
  });
});
