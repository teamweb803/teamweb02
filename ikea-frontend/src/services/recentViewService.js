const RECENT_VIEW_STORAGE_PREFIX = 'homio-recent-view:';
const RECENT_VIEW_LIMIT = 12;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeSessionKey(sessionKey = '') {
  return String(sessionKey ?? '').trim();
}

function normalizeProductId(productId = '') {
  return String(productId ?? '').trim();
}

function normalizeRecentViewEntry(entry = null) {
  if (typeof entry === 'string') {
    const productId = normalizeProductId(entry);
    return productId ? { productId } : null;
  }

  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const productId = normalizeProductId(entry.productId ?? entry.id ?? '');

  if (!productId) {
    return null;
  }

  return {
    productId,
    brand: String(entry.brand ?? '').trim(),
    title: String(entry.title ?? entry.name ?? '').trim(),
    subtitle: String(entry.subtitle ?? '').trim(),
    price: String(entry.price ?? '').trim(),
    image: String(entry.image ?? '').trim(),
  };
}

function buildRecentViewStorageKey(sessionKey = '') {
  const normalizedSessionKey = normalizeSessionKey(sessionKey);
  return normalizedSessionKey ? `${RECENT_VIEW_STORAGE_PREFIX}${normalizedSessionKey}` : '';
}

export function resolveRecentViewSessionKey(accountStore = {}) {
  if (!accountStore?.accessToken) {
    return '';
  }

  const preferredSessionKey = normalizeSessionKey(accountStore.loginId ?? accountStore.memberId ?? '');
  const legacySessionKey = normalizeSessionKey(accountStore.memberId ?? '');

  if (
    canUseStorage()
    && preferredSessionKey
    && legacySessionKey
    && preferredSessionKey !== legacySessionKey
  ) {
    const preferredProductIds = readRecentViewEntries(preferredSessionKey);

    if (!preferredProductIds.length) {
      const legacyProductIds = readRecentViewEntries(legacySessionKey);

      if (legacyProductIds.length) {
        writeRecentViewEntries(preferredSessionKey, legacyProductIds);
      }
    }
  }

  return preferredSessionKey;
}

export function readRecentViewEntries(sessionKey = '') {
  const storageKey = buildRecentViewStorageKey(sessionKey);

  if (!canUseStorage() || !storageKey) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    const uniqueEntries = [];
    const usedProductIds = new Set();

    parsed.forEach((entry) => {
      const normalizedEntry = normalizeRecentViewEntry(entry);

      if (!normalizedEntry || usedProductIds.has(normalizedEntry.productId)) {
        return;
      }

      usedProductIds.add(normalizedEntry.productId);
      uniqueEntries.push(normalizedEntry);
    });

    return uniqueEntries;
  } catch {
    return [];
  }
}

export function readRecentViewProductIds(sessionKey = '') {
  return readRecentViewEntries(sessionKey).map((entry) => entry.productId);
}

export function writeRecentViewEntries(sessionKey = '', entries = []) {
  const storageKey = buildRecentViewStorageKey(sessionKey);

  if (!canUseStorage() || !storageKey) {
    return;
  }

  const normalizedEntries = [];
  const usedProductIds = new Set();

  entries.forEach((entry) => {
    const normalizedEntry = normalizeRecentViewEntry(entry);

    if (!normalizedEntry || usedProductIds.has(normalizedEntry.productId)) {
      return;
    }

    usedProductIds.add(normalizedEntry.productId);
    normalizedEntries.push(normalizedEntry);
  });

  const limitedEntries = normalizedEntries.slice(0, RECENT_VIEW_LIMIT);

  if (!limitedEntries.length) {
    window.localStorage.removeItem(storageKey);
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(limitedEntries));
}

export function writeRecentViewProductIds(sessionKey = '', productIds = []) {
  writeRecentViewEntries(
    sessionKey,
    productIds.map((productId) => ({ productId })),
  );
}

export function recordRecentViewProduct(product = '', sessionKey = '') {
  const normalizedEntry = normalizeRecentViewEntry(product);
  const normalizedSessionKey = normalizeSessionKey(sessionKey);

  if (!normalizedEntry || !normalizedSessionKey) {
    return;
  }

  const nextEntries = [
    normalizedEntry,
    ...readRecentViewEntries(normalizedSessionKey)
      .filter((entry) => entry.productId !== normalizedEntry.productId),
  ].slice(0, RECENT_VIEW_LIMIT);

  writeRecentViewEntries(normalizedSessionKey, nextEntries);
}
