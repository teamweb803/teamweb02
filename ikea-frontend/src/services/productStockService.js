import httpRequester from '../libs/httpRequester';

function createProductStockError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function normalizeProductId(productId) {
  const normalizedProductId = Number(productId);

  if (!Number.isFinite(normalizedProductId)) {
    return null;
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
  const normalizedProductId = normalizeProductId(productId);

  if (normalizedProductId === null) {
    return Promise.reject(createProductStockError('상품 정보를 다시 확인해 주세요.'));
  }

  return httpRequester.get(`/product_stocks/${normalizedProductId}`);
}

export function getAdminProductStock(productId) {
  const normalizedProductId = normalizeProductId(productId);

  if (normalizedProductId === null) {
    return Promise.reject(createProductStockError('상품 정보를 다시 확인해 주세요.'));
  }

  return httpRequester.get(`/admin/product_stocks/${normalizedProductId}`);
}

export function updateAdminProductStock(productId, payload = {}) {
  const normalizedProductId = normalizeProductId(productId);

  if (normalizedProductId === null) {
    return Promise.reject(createProductStockError('상품 정보를 다시 확인해 주세요.'));
  }

  return httpRequester.put(`/admin/product_stocks/${normalizedProductId}`, {
    quantity: normalizeQuantity(payload.quantity),
  });
}
