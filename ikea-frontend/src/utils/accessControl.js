function normalizeRole(role = '') {
  return String(role ?? '').trim().toUpperCase();
}

export function hasAuthenticatedSession(accountStore) {
  return Boolean(accountStore?.accessToken);
}

export function hasAdminAccess(accountStore) {
  const normalizedRole = normalizeRole(accountStore?.role);

  if (!normalizedRole) {
    return false;
  }

  return normalizedRole === 'ADMIN';
}
