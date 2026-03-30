import { findCatalogProductById, getProductDetailSeed } from './catalog';

const DEFAULT_CART_PRODUCT_IDS = ['10489009', '90592738'];
const DEFAULT_RECOMMENDATION_PRODUCT_IDS = ['60470050', 's29416857', '40568019', '80586356'];

function resolveProduct(productId) {
  const product = findCatalogProductById(productId);

  if (!product) {
    throw new Error(`Unknown commerce seed product: ${productId}`);
  }

  return product;
}

function getPrimaryImage(product) {
  const detailSeed = getProductDetailSeed(product.id);

  return detailSeed?.galleryImages?.[0] ?? product.image;
}

function getOptionSummary(product) {
  const parts = [];

  if (product.color) {
    parts.push(product.color);
  }

  if (product.material) {
    parts.push(product.material);
  }

  if (!parts.length && Array.isArray(product.features)) {
    parts.push(...product.features.slice(0, 2));
  }

  return parts.length ? parts.join(' / ') : product.label;
}

function getDeliveryLabel(product) {
  return `${product.categoryLabel} 배송`;
}

function getShippingText(product) {
  if (['sofa', 'bed-mattress', 'kitchen-furniture'].includes(product.categorySlug)) {
    return '배송비/설치비 확인';
  }

  return '일반배송';
}

function getShippingSubText(product) {
  if (['sofa', 'bed-mattress', 'kitchen-furniture'].includes(product.categorySlug)) {
    return '지역 및 설치 환경에 따라 결제 단계에서 안내됩니다.';
  }

  return `${product.categoryLabel} 상품 기준으로 결제 단계에서 배송 조건을 확인합니다.`;
}

function getOriginalPrice(product) {
  return product.originalPrice ?? product.price;
}

export function createCommerceCartItem(productId, overrides = {}) {
  const product = resolveProduct(productId);

  return {
    id: `cart-${product.id}`,
    productId: String(product.id),
    selected: true,
    brand: product.brand,
    seller: 'HOMiO',
    deliveryLabel: getDeliveryLabel(product),
    deliverySubLabel: '배송 일정과 배송비는 결제 단계에서 다시 안내됩니다.',
    name: product.name,
    option: `옵션: ${getOptionSummary(product)}`,
    image: getPrimaryImage(product),
    quantity: 1,
    price: product.price,
    originalPrice: getOriginalPrice(product),
    shippingText: getShippingText(product),
    shippingSubText: getShippingSubText(product),
    shippingNote: getShippingSubText(product),
    shippingLink: '지역별 배송 조건 안내',
    detailPath: `/product/${product.id}`,
    categoryLabel: product.categoryLabel,
    label: product.label,
    color: product.color ?? '',
    material: product.material ?? '',
    ...overrides,
  };
}

function buildRecommendation(productId) {
  const product = resolveProduct(productId);

  return {
    id: `recommend-${product.id}`,
    productId: String(product.id),
    title: product.name,
    image: getPrimaryImage(product),
    originalPrice: getOriginalPrice(product),
    price: product.price,
    badge: product.label,
    detailPath: `/product/${product.id}`,
    brand: product.brand,
  };
}

export function createCommerceCartSeed() {
  return [
    createCommerceCartItem(DEFAULT_CART_PRODUCT_IDS[0]),
    createCommerceCartItem(DEFAULT_CART_PRODUCT_IDS[1], { quantity: 2 }),
  ];
}

export function createCommerceRecommendations(excludeIds = []) {
  const blocked = new Set(excludeIds.map((value) => String(value)));

  return DEFAULT_RECOMMENDATION_PRODUCT_IDS
    .filter((productId) => !blocked.has(String(productId)))
    .map((productId) => buildRecommendation(productId));
}

