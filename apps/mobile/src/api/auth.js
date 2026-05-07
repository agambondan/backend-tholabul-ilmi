import { postJson, requestJson } from './client';

const normalizeSession = (payload) => ({
  token: payload?.token,
  refreshToken: payload?.refresh_token,
  user: payload?.user ?? null,
});

export const login = async ({ email, password }) => {
  const payload = await postJson('/api/v1/auth/login', { email, password });
  return normalizeSession(payload);
};

export const register = async ({ name, email, password }) => {
  await postJson('/api/v1/auth/register', { email, name, password });
};

export const forgotPassword = async (email) => {
  const payload = await postJson('/api/v1/auth/forgot-password', { email });
  return payload?.data ?? payload?.message ?? 'If your email is registered, a reset link has been sent.';
};

export const refreshSession = async (refreshToken) => {
  const payload = await postJson('/api/v1/auth/refresh', { refresh_token: refreshToken });
  return normalizeSession(payload);
};

export const logout = async (refreshToken) => {
  await postJson('/api/v1/auth/logout', { refresh_token: refreshToken });
};

export const getMe = async () => requestJson('/api/v1/auth/me', { auth: true });
