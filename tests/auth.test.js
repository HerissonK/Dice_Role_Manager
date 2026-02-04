const request = require('supertest');
const app = require('../src/app');

describe('Authentication', () => {
  test('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123!'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});