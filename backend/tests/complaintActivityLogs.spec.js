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

describe('Complaint activity logs endpoint', () => {
  beforeEach(() => mockQuery.mockReset());

  test('GET /api/v1/activity-logs/complaint/:id returns logs', async () => {
    const sampleLogs = [
      {
        activity_log_id: 'a1',
        complaint_id: 'cmp-1',
        action_type: 'complaint_created',
        description: 'Created',
        first_name: 'Admin',
        last_name: 'User',
      },
    ];

    mockQuery
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ complaint_id: 'cmp-1', reported_by: 'user-1', assigned_to: null }],
      })
      .mockResolvedValueOnce({ rowCount: 1, rows: sampleLogs });

    const res = await request(app)
      .get('/api/v1/activity-logs/complaint/cmp-1')
      .set('Authorization', 'Bearer faketoken');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('logs');
    expect(res.body.logs).toHaveLength(1);
    expect(res.body.logs[0]).toHaveProperty('action_type', 'complaint_created');
  });
});
