const WISHLIST_STORAGE_PREFIX = 'homio-wishlist:';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeSessionKey(sessionKey = '') {
  return String(sessionKey ?? '').trim();
}

function normalizeProductId(productId = '') {
  return String(productId ?? '').trim();
}

function buildWishlistStorageKey(sessionKey = '') {
  const normalizedSessionKey = normalizeSessionKey(sessionKey);
  return normalizedSessionKey ? `${WISHLIST_STORAGE_PREFIX}${normalizedSessionKey}` : '';
}

export function resolveWishlistSessionKey(accountStore = {}) {
  return normalizeSessionKey(accountStore?.memberId ?? accountStore?.loginId ?? '');
}

export function readWishlistProductIds(sessionKey = '') {
  const storageKey = buildWishlistStorageKey(sessionKey);

  if (!canUseStorage() || !storageKey) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return [...new Set(parsed.map((productId) => normalizeProductId(productId)).filter(Boolean))];
  } catch {
    return [];
  }
}

export function writeWishlistProductIds(sessionKey = '', productIds = []) {
  const storageKey = buildWishlistStorageKey(sessionKey);

  if (!canUseStorage() || !storageKey) {
    return;
  }

  const normalizedProductIds = [...new Set(
    productIds.map((productId) => normalizeProductId(productId)).filter(Boolean),
  )];

  if (!normalizedProductIds.length) {
    window.localStorage.removeItem(storageKey);
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(normalizedProductIds));
}
