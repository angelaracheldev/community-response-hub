const request = require('supertest');

// Mock db and auth middleware
const mockQuery = jest.fn();

jest.mock('../db', () => ({
  query: (...args) => mockQuery(...args),
}));

jest.mock('../middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    // attach an admin user for routes that need it
    req.user = { user_id: 'admin-1', role_name: 'admin' };
    return next();
  },
  requireRole: () => (req, res, next) => next(),
  requireAnyRole: () => (req, res, next) => next(),
}));

const app = require('../server');

describe('Activity logs and user activity logs endpoint', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  test('POST /api/v1/complaints inserts activity_logs entry', async () => {
    // Mock sequence: category check, insert complaint
    mockQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ category_id: 1 }] }) // category exists
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ complaint_id: 'cmp-1' }] }) // complaint insert returns id
      .mockResolvedValueOnce({ rowCount: 1, rows: [] }); // activity log insert

    const payload = { categoryId: 1, title: 'Test', description: 'desc' };
    const res = await request(app).post('/api/v1/complaints').send(payload).set('Authorization', 'Bearer faketoken');
    expect(res.statusCode).toBe(201);

    // Find the activity log insert call - last call should be the activity log insert
    const lastCall = mockQuery.mock.calls.find((call) => /INSERT INTO activity_logs/i.test(call[0]));
    expect(lastCall).toBeDefined();
    // verify that the complaint_id was passed as first param
    const params = lastCall[1];
    expect(params[0]).toBe('cmp-1');
    expect(params[2]).toBe('complaint_created');
  });

  test('GET /api/v1/users/:id/activity-logs returns logs', async () => {
    const sampleLogs = [
      { user_activity_log_id: 'log-1', user_id: 'user-1', performed_by: 'admin-1', action_type: 'verification_approved', description: 'Approved' },
    ];
    mockQuery.mockResolvedValueOnce({ rowCount: sampleLogs.length, rows: sampleLogs });

    const res = await request(app).get('/api/v1/users/user-1/activity-logs').set('Authorization', 'Bearer faketoken');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('logs');
    expect(res.body.logs).toHaveLength(1);
    expect(res.body.logs[0]).toHaveProperty('action_type', 'verification_approved');
  });
});
