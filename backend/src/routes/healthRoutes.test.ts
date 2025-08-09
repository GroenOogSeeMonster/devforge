import request from 'supertest';
import { app } from '../index';

describe('Health Routes', () => {
  it('GET /health should return healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});


