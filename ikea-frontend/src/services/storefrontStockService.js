import { getAdminInventoryItems } from './adminInventoryService';

const SOLD_OUT_FLAG_KEYS = ['isSoldOut', 'soldOut'];
const STOCK_VALUE_KEYS = [
  'stock',
  'stockQuantity',
  'availableStock',
  'inventoryQuantity',
  'quantityAvailable',
];

function normalizeProductId(source = {}) {
  return String(source.productId ?? source.id ?? '').trim();
}

function normalizeInteger(value) {
  const nextValue = Number(value);

  if (!Number.isFinite(nextValue)) {
    return null;
  }

  return Math.trunc(nextValue);
}

function resolveExplicitSoldOut(source = {}) {
  for (const key of SOLD_OUT_FLAG_KEYS) {
    if (typeof source?.[key] === 'boolean') {
      return source[key];
    }
  }

  return null;
}

function resolveExplicitStock(source = {}) {
  for (const key of STOCK_VALUE_KEYS) {
    const nextValue = normalizeInteger(source?.[key]);

    if (nextValue !== null) {
      return nextValue;
    }
  }

  return null;
}

export function getStorefrontInventoryMap() {
  try {
    return new Map(
      getAdminInventoryItems().map((item) => [String(item.productId ?? '').trim(), item]),
    );
  } catch {
    return new Map();
  }
}

export function resolveStorefrontAvailability(source = {}, inventoryMap = getStorefrontInventoryMap()) {
  const productId = normalizeProductId(source);
  const explicitSoldOut = resolveExplicitSoldOut(source);
  const explicitStock = resolveExplicitStock(source);
  const fallbackInventory = productId ? inventoryMap.get(productId) ?? null : null;
  const fallbackStock = normalizeInteger(fallbackInventory?.stock);
  const availableStock = explicitStock ?? fallbackStock;
  const isSoldOut = explicitSoldOut ?? (availableStock !== null ? availableStock <= 0 : false);
  const isTracked = explicitSoldOut !== null || availableStock !== null;

  return {
    availableStock,
    isSoldOut,
    isTracked,
    stockNotice: isSoldOut ? '품절' : '',
    stockMessage: isSoldOut ? '현재 재고가 모두 소진되어 구매할 수 없습니다.' : '',
  };
}

export function decorateStorefrontItem(source = {}, inventoryMap = getStorefrontInventoryMap()) {
  return {
    ...source,
    ...resolveStorefrontAvailability(source, inventoryMap),
  };
}

export function decorateStorefrontItems(items = [], inventoryMap = getStorefrontInventoryMap()) {
  return Array.isArray(items)
    ? items.map((item) => decorateStorefrontItem(item, inventoryMap))
    : [];
}
