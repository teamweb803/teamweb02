import httpRequester from '../libs/httpRequester';

function normalizeProductId(productId) {
  const normalizedProductId = Number(productId);

  if (!Number.isFinite(normalizedProductId)) {
    throw new Error('A valid productId is required.');
  }

  return Math.trunc(normalizedProductId);
}

function normalizeQuantity(quantity) {
  const normalizedQuantity = Number(quantity);

  if (!Number.isFinite(normalizedQuantity)) {
    return 0;
  }

  return Math.max(0, Math.trunc(normalizedQuantity));
}

export function getProductStock(productId) {
  return httpRequester.get(`/product_stocks/${normalizeProductId(productId)}`);
}

export function getAdminProductStock(productId) {
  return httpRequester.get(`/admin/product_stocks/${normalizeProductId(productId)}`);
}

export function updateAdminProductStock(productId, payload = {}) {
  return httpRequester.put(`/admin/product_stocks/${normalizeProductId(productId)}`, {
    quantity: normalizeQuantity(payload.quantity),
  });
}
