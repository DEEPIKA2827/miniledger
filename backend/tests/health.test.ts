import { describe, it, expect, afterAll } from 'vitest';
import { buildApp } from '../src/app';

describe('Health Check Route (GET /health)', () => {
  const app = buildApp();

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 OK with service status and timestamp', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);

    const payload = JSON.parse(response.body);
    expect(payload.status).toBe('ok');
    expect(payload.service).toBe('miniledger-api');
    expect(payload.timestamp).toBeDefined();
  });
});
