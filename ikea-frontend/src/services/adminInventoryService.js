import { getFallbackAdminProducts } from './adminService';

const ADMIN_INVENTORY_STORAGE_KEY = 'homio-admin-inventory';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function buildSeedInventoryItems() {
  return getFallbackAdminProducts().map((product, index) => {
    const safeStock = 4 + (index % 3);
    const stock = safeStock + 3 + (index % 7);
    const reserved = index % 2;

    return {
      productId: String(product.productId),
      name: product.name,
      categoryName: product.categoryName || product.categoryLabel || '-',
      image: product.imgPath || product.image || '',
      sku: `HM-${String(product.productId).slice(-5)}`,
      stock,
      reserved,
      safeStock,
      updatedAt: '2026-03-29 18:30',
    };
  });
}

function readStoredInventoryItems() {
  if (!canUseStorage()) {
    return buildSeedInventoryItems();
  }

  try {
    const raw = window.localStorage.getItem(ADMIN_INVENTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : buildSeedInventoryItems();
  } catch {
    return buildSeedInventoryItems();
  }
}

function writeStoredInventoryItems(items) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ADMIN_INVENTORY_STORAGE_KEY, JSON.stringify(items));
}

export function getAdminInventoryItems() {
  return readStoredInventoryItems();
}

export function adjustAdminInventoryItem(productId, { type, quantity, note }) {
  const timestamp = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());

  const nextItems = readStoredInventoryItems().map((item) => {
    if (String(item.productId) !== String(productId)) {
      return item;
    }

    const delta = Number(quantity ?? 0);
    const nextStock = type === 'decrease'
      ? Math.max(0, Number(item.stock ?? 0) - delta)
      : Number(item.stock ?? 0) + delta;

    return {
      ...item,
      stock: nextStock,
      lastNote: note?.trim() || '',
      updatedAt: timestamp,
    };
  });

  writeStoredInventoryItems(nextItems);
  return nextItems;
}
