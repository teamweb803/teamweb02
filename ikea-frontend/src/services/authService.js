import httpRequester from '../libs/httpRequester';

export function loginAuth(memberLoginRequest) {
  return httpRequester.post('/auth/login', memberLoginRequest);
}

export function refreshAuthToken(refreshToken) {
  return httpRequester.post('/auth/refresh', { refreshToken });
}

export function logoutAuth(refreshToken) {
  return httpRequester.post('/auth/logout', { refreshToken });
}
