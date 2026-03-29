const ADMIN_PRODUCT_DRAFT_STORAGE_KEY = 'homio-admin-product-drafts';
const ADMIN_PRODUCT_DELETED_IDS_STORAGE_KEY = 'homio-admin-product-deleted-ids';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStoredDrafts() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(ADMIN_PRODUCT_DRAFT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredDrafts(items) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ADMIN_PRODUCT_DRAFT_STORAGE_KEY, JSON.stringify(items));
}

function readStoredDeletedIds() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(ADMIN_PRODUCT_DELETED_IDS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((value) => String(value ?? '').trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeStoredDeletedIds(items) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ADMIN_PRODUCT_DELETED_IDS_STORAGE_KEY, JSON.stringify(items));
}

export function calculateDiscountRate(price, originalPrice) {
  const resolvedPrice = Number(price ?? 0);
  const resolvedOriginalPrice = Number(originalPrice ?? 0);

  if (!resolvedPrice || !resolvedOriginalPrice || resolvedOriginalPrice <= resolvedPrice) {
    return 0;
  }

  return Math.round(((resolvedOriginalPrice - resolvedPrice) / resolvedOriginalPrice) * 100);
}

export function getAdminProductDrafts() {
  return readStoredDrafts();
}

export function upsertAdminProductDraft(product) {
  const productId = String(product?.id ?? product?.productId ?? '').trim();

  if (!productId) {
    return readStoredDrafts();
  }

  const nextProduct = {
    ...product,
    id: productId,
    productId,
    discountRate: calculateDiscountRate(product.price, product.originalPrice),
  };

  const currentItems = readStoredDrafts();
  const nextItems = [
    nextProduct,
    ...currentItems.filter((item) => String(item?.id ?? item?.productId ?? '') !== productId),
  ];

  writeStoredDrafts(nextItems);
  writeStoredDeletedIds(
    readStoredDeletedIds().filter((item) => item !== productId),
  );
  return nextItems;
}

export function removeAdminProductDraft(productId, { markDeleted = false } = {}) {
  const resolvedId = String(productId ?? '').trim();
  const nextItems = readStoredDrafts().filter(
    (item) => String(item?.id ?? item?.productId ?? '') !== resolvedId,
  );

  writeStoredDrafts(nextItems);
  if (markDeleted && resolvedId) {
    writeStoredDeletedIds(
      Array.from(new Set([...readStoredDeletedIds(), resolvedId])),
    );
  }
  return nextItems;
}

export function mergeCatalogProductsWithAdminDrafts(baseProducts = []) {
  const drafts = readStoredDrafts();
  const deletedIds = new Set(readStoredDeletedIds());

  if (!drafts.length) {
    return baseProducts.filter(
      (product) => !deletedIds.has(String(product?.id ?? product?.productId ?? '')),
    );
  }

  const draftMap = new Map(
    drafts.map((item) => [String(item?.id ?? item?.productId ?? ''), item]),
  );

  const mergedBase = baseProducts
    .filter((product) => !deletedIds.has(String(product?.id ?? product?.productId ?? '')))
    .map((product) => {
    const productId = String(product?.id ?? product?.productId ?? '');
    const draft = draftMap.get(productId);

    return draft ? { ...product, ...draft } : product;
  });

  const existingIds = new Set(
    baseProducts.map((item) => String(item?.id ?? item?.productId ?? '')),
  );

  const appendedDrafts = drafts.filter(
    (item) => !deletedIds.has(String(item?.id ?? item?.productId ?? ''))
      && !existingIds.has(String(item?.id ?? item?.productId ?? '')),
  );

  return [...appendedDrafts, ...mergedBase];
}
