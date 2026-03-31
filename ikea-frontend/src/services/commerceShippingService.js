import { findCatalogProductById } from '../data/catalog';

export const GENERAL_DELIVERY_THRESHOLD = 50000;
export const GENERAL_DELIVERY_FEE = 3000;

const SPECIAL_BED_TYPE_SLUGS = new Set(['bed', 'mattress']);

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveCatalogProduct(item = {}) {
  return findCatalogProductById(item.productId ?? item.id ?? '');
}

function isSpecialDeliveryProduct(product) {
  if (!product) {
    return false;
  }

  if (product.categorySlug === 'sofa') {
    return true;
  }

  return (
    product.categorySlug === 'bed-mattress'
    && SPECIAL_BED_TYPE_SLUGS.has(String(product.typeSlug ?? '').trim())
  );
}

function createSpecialDeliveryGuide() {
  return {
    shippingText: '무료배송',
    shippingSubText: '[HOMiO]\n지역별/옵션별 배송비 추가',
    modalTitle: '배송/설치 안내',
    modalBody: '소파와 침대/매트리스 상품은 배송지와 설치 환경에 따라 추가 배송비가 발생할 수 있습니다.',
  };
}

function createGeneralDeliveryGuide(generalSubtotal) {
  const isFreeShipping = generalSubtotal >= GENERAL_DELIVERY_THRESHOLD;

  return {
    shippingText: isFreeShipping ? '무료배송' : '3,000원',
    shippingSubText: isFreeShipping
      ? '[HOMiO]\n지역별/옵션별 배송비 추가'
      : `[HOMiO]\n${GENERAL_DELIVERY_THRESHOLD.toLocaleString('ko-KR')}원 이상 구매 시 무료배송\n지역별/옵션별 배송비 추가`,
    modalTitle: '일반 배송 안내',
    modalBody: isFreeShipping
      ? '일반 배송 상품 합계가 50,000원 이상이라 무료배송이 적용됩니다. 일부 지역과 옵션에 따라 추가 배송비가 발생할 수 있습니다.'
      : '일반 배송 상품 합계가 50,000원 미만이라 배송비 3,000원이 적용됩니다. 일부 지역과 옵션에 따라 추가 배송비가 발생할 수 있습니다.',
  };
}

function resolveGeneralShippingMergeStartIndex(items = []) {
  let runningGeneralSubtotal = 0;

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];

    if (item?.isSoldOut) {
      continue;
    }

    runningGeneralSubtotal += normalizeNumber(item?.price) * normalizeNumber(item?.quantity, 1);

    if (runningGeneralSubtotal >= GENERAL_DELIVERY_THRESHOLD) {
      return Math.max(0, index - 1);
    }
  }

  return Math.max(0, items.length - 1);
}

function createDeliveryGroup(groupKey, items, generalSubtotal) {
  const isSpecialGroup = groupKey === 'special';
  const shippingGuide = isSpecialGroup
    ? createSpecialDeliveryGuide()
    : createGeneralDeliveryGuide(generalSubtotal);
  const shouldMergeShippingInfo = !isSpecialGroup && generalSubtotal >= GENERAL_DELIVERY_THRESHOLD;
  const mergedShippingStartIndex = shouldMergeShippingInfo
    ? resolveGeneralShippingMergeStartIndex(items)
    : -1;
  const mergedShippingRowSpan = shouldMergeShippingInfo
    ? Math.max(1, items.length - mergedShippingStartIndex)
    : 1;

  return {
    key: groupKey,
    title: isSpecialGroup ? 'HOMiO 배송' : '택배 및 판매자 배송',
    subtitle: isSpecialGroup
      ? '배송/설치일 직접 지정 가능'
      : '일반택배 배송 및 판매자 직접배송',
    itemCount: items.length,
    shippingGuide,
    items: items.map((item, index) => ({
      key: `${groupKey}-${String(item.id ?? index)}`,
      item,
      deliveryGuide: shippingGuide,
      showShippingInfo: !shouldMergeShippingInfo,
      showMergedShippingInfo: shouldMergeShippingInfo && index === mergedShippingStartIndex,
      mergedShippingRowSpan,
      skipShippingCell: shouldMergeShippingInfo && index > mergedShippingStartIndex,
    })),
  };
}

export function isSpecialDeliveryItem(item = {}) {
  return isSpecialDeliveryProduct(resolveCatalogProduct(item));
}

export function hasSpecialDeliveryItems(items = []) {
  return items.some((item) => isSpecialDeliveryItem(item));
}

export function getGeneralDeliverySubtotal(items = []) {
  return items
    .filter((item) => !item.isSoldOut && !isSpecialDeliveryItem(item))
    .reduce(
      (sum, item) => sum + (normalizeNumber(item.price) * normalizeNumber(item.quantity, 1)),
      0,
    );
}

export function calculateShippingTotal(items = []) {
  const generalSubtotal = getGeneralDeliverySubtotal(items);

  if (generalSubtotal === 0 || generalSubtotal >= GENERAL_DELIVERY_THRESHOLD) {
    return 0;
  }

  return GENERAL_DELIVERY_FEE;
}

export function buildDeliveryGroups(items = []) {
  const specialItems = [];
  const generalItems = [];

  items.forEach((item) => {
    if (isSpecialDeliveryItem(item)) {
      specialItems.push(item);
      return;
    }

    generalItems.push(item);
  });

  const generalSubtotal = getGeneralDeliverySubtotal(items);
  const groups = [];

  if (specialItems.length) {
    groups.push(createDeliveryGroup('special', specialItems, generalSubtotal));
  }

  if (generalItems.length) {
    groups.push(createDeliveryGroup('general', generalItems, generalSubtotal));
  }

  return groups;
}
