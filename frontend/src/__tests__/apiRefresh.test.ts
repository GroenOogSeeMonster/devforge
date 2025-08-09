import axios from 'axios';
import { api } from '@/services/api';

describe('api 401 refresh handling', () => {
  it('attempts refresh and retries the original request', async () => {
    const postSpy = vi.spyOn(axios, 'post');

    // First call returns 401
    const request = vi.spyOn(api, 'request');
    const error: any = new Error('Unauthorized');
    error.response = { status: 401 };
    error.config = { _retry: false, headers: {} };
    request.mockRejectedValueOnce(error);

    // Mock refresh token response
    postSpy.mockResolvedValueOnce({ data: { data: { token: 'new-token' } } });

    // After refresh, retry succeeds
    request.mockResolvedValueOnce({ data: { ok: true } } as any);

    // put a refreshToken in storage
    vi.spyOn(window.localStorage.__proto__ as any, 'getItem').mockImplementation(() => 'refresh-token');

    const res = await api.get('/protected');
    expect(res.data.ok).toBe(true);
  });
});


