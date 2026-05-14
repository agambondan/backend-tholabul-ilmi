jest.mock('../api/client', () => ({
  postJson: jest.fn(),
  requestJson: jest.fn(),
}));

const { postJson, requestJson } = require('../api/client');
const {
  login,
  register,
  forgotPassword,
  refreshSession,
  logout,
  getMe,
} = require('../api/auth');

describe('auth api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('login calls postJson and normalizes session', async () => {
    postJson.mockResolvedValueOnce({
      token: 'abc',
      refresh_token: 'def',
      user: { id: 1, name: 'Test' },
    });
    const result = await login({ email: 'a@b.com', password: 'secret' });
    expect(postJson).toHaveBeenCalledWith('/api/v1/auth/login', {
      email: 'a@b.com',
      password: 'secret',
    });
    expect(result).toEqual({
      token: 'abc',
      refreshToken: 'def',
      user: { id: 1, name: 'Test' },
    });
  });

  test('login handles missing token/user', async () => {
    postJson.mockResolvedValueOnce({});
    const result = await login({ email: 'a@b.com', password: 'x' });
    expect(result.token).toBeUndefined();
    expect(result.user).toBeNull();
  });

  test('register calls postJson', async () => {
    postJson.mockResolvedValueOnce({});
    await register({ name: 'A', email: 'a@b.com', password: 'secret' });
    expect(postJson).toHaveBeenCalledWith('/api/v1/auth/register', {
      email: 'a@b.com',
      name: 'A',
      password: 'secret',
    });
  });

  test('forgotPassword calls postJson and returns message', async () => {
    postJson.mockResolvedValueOnce({ message: 'Email sent' });
    const result = await forgotPassword('a@b.com');
    expect(postJson).toHaveBeenCalledWith('/api/v1/auth/forgot-password', {
      email: 'a@b.com',
    });
    expect(result).toBe('Email sent');
  });

  test('forgotPassword returns fallback message', async () => {
    postJson.mockResolvedValueOnce({});
    const result = await forgotPassword('a@b.com');
    expect(result).toBe(
      'If your email is registered, a reset link has been sent.',
    );
  });

  test('refreshSession calls postJson and normalizes', async () => {
    postJson.mockResolvedValueOnce({
      token: 'new-token',
      refresh_token: 'new-refresh',
      user: { id: 1 },
    });
    const result = await refreshSession('old-refresh');
    expect(postJson).toHaveBeenCalledWith('/api/v1/auth/refresh', {
      refresh_token: 'old-refresh',
    });
    expect(result.token).toBe('new-token');
    expect(result.refreshToken).toBe('new-refresh');
  });

  test('logout calls postJson', async () => {
    await logout('some-token');
    expect(postJson).toHaveBeenCalledWith('/api/v1/auth/logout', {
      refresh_token: 'some-token',
    });
  });

  test('getMe calls requestJson with auth', async () => {
    requestJson.mockResolvedValueOnce({ id: 1, name: 'Me' });
    const result = await getMe();
    expect(requestJson).toHaveBeenCalledWith('/api/v1/auth/me', {
      auth: true,
    });
    expect(result).toEqual({ id: 1, name: 'Me' });
  });
});
