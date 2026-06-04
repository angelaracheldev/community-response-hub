jest.mock('../db', () => ({
  query: jest.fn(async (text, params) => {
    if (/FROM complaints c/i.test(text)) {
      return {
        rowCount: 1,
        rows: [
          {
            complaint_id: '1111-2222-3333',
            reported_by: 'user-1',
            category_id: 1,
            category_name: 'Noise Complaint',
            category_description: 'Loud noise',
            title: 'Loud Karaoke',
            description: 'Neighbor plays karaoke loudly',
            location_text: 'Purok 1',
            latitude: null,
            longitude: null,
            status: 'pending',
            priority_level: 'normal',
            remarks: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      };
    }
    if (/FROM complaint_assignments/i.test(text)) {
      return { rowCount: 1, rows: [] };
    }
    if (/FROM complaint_media/i.test(text)) {
      return { rowCount: 1, rows: [] };
    }
    if (/FROM activity_logs/i.test(text)) {
      return { rowCount: 1, rows: [] };
    }
    return { rowCount: 0, rows: [] };
  }),
}));

jest.mock('../middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { user_id: 'admin-1', role_name: 'admin' };
    return next();
  },
  requireRole: () => (req, res, next) => next(),
  requireAnyRole: () => (req, res, next) => next(),
}));

const request = require('supertest');
const app = require('../server');

describe('Admin complaints details endpoint', () => {
  test('returns aggregated complaint details', async () => {
    const res = await request(app).get('/api/admin/complaints/1111-2222-3333/details').set('Authorization', 'Bearer faketoken');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('complaint');
    expect(res.body.complaint).toHaveProperty('complaint_id', '1111-2222-3333');
    expect(res.body).toHaveProperty('assignments');
    expect(res.body).toHaveProperty('media');
    expect(res.body).toHaveProperty('activityLogs');
  });
});
