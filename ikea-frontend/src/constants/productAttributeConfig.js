import {
  FILTER_FIELD_IDS,
  FILTER_TITLES,
  getFilterFieldIds,
  getProductFilterValue,
} from './categoryFilters';

const EXCLUDED_ATTRIBUTE_FIELDS = new Set(['sale', 'type']);

const ATTRIBUTE_FIELD_META = {
  material: {
    placeholder: '예: 패브릭, 메탈',
  },
  color: {
    placeholder: '예: 그레이',
  },
  size: {
    placeholder: '예: Q / K / KK',
  },
  firmness: {
    placeholder: '예: 미디엄',
  },
  function: {
    placeholder: '예: 높이 조절',
  },
  warmth: {
    placeholder: '예: 겨울용',
  },
  seatCount: {
    placeholder: '예: 4인용',
  },
  shape: {
    placeholder: '예: 직사각형',
  },
  installation: {
    placeholder: '예: 빌트인',
  },
  configuration: {
    placeholder: '예: 2단 세트',
  },
  use: {
    placeholder: '예: 실내용',
  },
};

const QUICK_FACT_PRIORITY = {
  size: 1,
  material: 2,
  firmness: 3,
  function: 4,
  warmth: 5,
  seatCount: 6,
  shape: 7,
  installation: 8,
  configuration: 9,
  use: 10,
  color: 11,
};

export const ADMIN_PRODUCT_BADGE_OPTIONS = [
  { value: '', label: '사용 안 함' },
  { value: 'NEW', label: 'NEW' },
  { value: '추천', label: '추천' },
  { value: '할인', label: '할인' },
  { value: 'BEST', label: 'BEST' },
];

export const ADMIN_PRODUCT_ATTRIBUTE_FIELD_IDS = FILTER_FIELD_IDS.filter(
  (fieldId) => !EXCLUDED_ATTRIBUTE_FIELDS.has(fieldId),
);

function readValue(value) {
  if (Array.isArray(value)) {
    return readValue(value[0]);
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

export function createEmptyProductAttributes() {
  return Object.fromEntries(
    ADMIN_PRODUCT_ATTRIBUTE_FIELD_IDS.map((fieldId) => [fieldId, '']),
  );
}

export function getCategorySubtypeOptions(category) {
  return (category?.cards ?? [])
    .map((card) => ({
      slug: String(card.slug ?? '').trim(),
      label: readValue(card.label),
      sourceLabel: readValue(card.sourceLabel) || readValue(card.label),
      categoryUrl: readValue(card.sourceUrl),
    }))
    .filter((option) => option.slug && option.label);
}

export function getProductAttributeFieldDefinitions(categorySlug, typeSlug = 'all') {
  const fieldIds = getFilterFieldIds(categorySlug, typeSlug).filter(
    (fieldId) => !EXCLUDED_ATTRIBUTE_FIELDS.has(fieldId),
  );

  return fieldIds.map((fieldId) => ({
    id: fieldId,
    label: FILTER_TITLES[fieldId] ?? fieldId,
    quickFactLabel: FILTER_TITLES[fieldId] ?? fieldId,
    placeholder: ATTRIBUTE_FIELD_META[fieldId]?.placeholder ?? '',
  }));
}

export function readProductAttributeValue(product, fieldId) {
  const explicitAttribute = readValue(product?.attributes?.[fieldId]);

  if (explicitAttribute) {
    return explicitAttribute;
  }

  const directValue = readValue(product?.[fieldId]);

  if (directValue) {
    return directValue;
  }

  const inferredValue = getProductFilterValue(product, fieldId);

  if (Array.isArray(inferredValue)) {
    return readValue(inferredValue[0]);
  }

  return readValue(inferredValue);
}

export function pickProductAttributes(product, categorySlug, typeSlug = 'all') {
  return Object.fromEntries(
    getProductAttributeFieldDefinitions(categorySlug, typeSlug)
      .map((field) => [field.id, readProductAttributeValue(product, field.id)])
      .filter(([, value]) => value),
  );
}

export function formatProductNumber(productId) {
  const digits = String(productId ?? '').replace(/\D/g, '');

  if (digits.length === 8) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  if (digits.length === 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return String(productId ?? '-');
}

export function buildProductQuickFacts(product, { includeProductNumber = true } = {}) {
  const facts = [];
  const resolvedProductId = readValue(product?.id ?? product?.productId);
  const resolvedSubtypeLabel = readValue(product?.label) || readValue(product?.categoryLabel);
  const attributeFields = getProductAttributeFieldDefinitions(
    readValue(product?.categorySlug),
    readValue(product?.typeSlug) || 'all',
  ).sort((left, right) => {
    const leftPriority = QUICK_FACT_PRIORITY[left.id] ?? 99;
    const rightPriority = QUICK_FACT_PRIORITY[right.id] ?? 99;
    return leftPriority - rightPriority;
  });

  if (includeProductNumber && resolvedProductId) {
    facts.push({
      label: '제품 번호',
      value: formatProductNumber(resolvedProductId),
    });
  }

  if (resolvedSubtypeLabel) {
    facts.push({
      label: '대표 분류',
      value: resolvedSubtypeLabel,
    });
  }

  attributeFields.forEach((field) => {
    const value = readProductAttributeValue(product, field.id);

    if (!value) {
      return;
    }

    facts.push({
      label: field.quickFactLabel,
      value,
    });
  });

  return facts.filter(
    (fact, index, items) => items.findIndex((item) => item.label === fact.label) === index,
  );
}

export function buildProductOptionSummary(product) {
  const preferredFieldOrder = [
    'color',
    'material',
    'size',
    'firmness',
    'configuration',
    'seatCount',
    'shape',
    'function',
    'installation',
    'warmth',
    'use',
  ];
  const values = [readValue(product?.label)];

  preferredFieldOrder.forEach((fieldId) => {
    const value = readProductAttributeValue(product, fieldId);

    if (value) {
      values.push(value);
    }
  });

  return Array.from(new Set(values.filter(Boolean))).slice(0, 3).join(' / ');
}

export function buildProductDeliveryMessage(product) {
  const optionSummary = buildProductOptionSummary(product);

  if (!optionSummary) {
    return '주문 시점에 배송 일정을 확인할 수 있습니다.';
  }

  return `${optionSummary} / 주문 시점에 배송 일정을 확인할 수 있습니다.`;
}
