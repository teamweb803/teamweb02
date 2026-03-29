export const FILTER_TITLES = {
  sale: '할인목록',
  material: '소재',
  color: '색상',
  size: '사이즈',
  firmness: '강도',
  type: '종류',
  function: '기능',
  warmth: '보온',
  seatCount: '인원',
  shape: '형태',
  installation: '설치방식',
  configuration: '구성',
  use: '용도',
};

export const FILTER_FIELD_IDS = Object.keys(FILTER_TITLES);

const DEFAULT_FILTER_FIELDS = ['sale', 'material', 'color'];

const CATEGORY_FILTER_FIELDS = {
  sofa: {
    all: ['sale', 'type', 'material', 'color'],
    'two-seat': ['sale', 'material', 'color'],
    'three-seat': ['sale', 'material', 'color'],
    recliner: ['sale', 'function', 'color'],
    couch: ['sale', 'material', 'color'],
    corner: ['sale', 'material', 'color'],
    modular: ['sale', 'material', 'color'],
  },
  'bed-mattress': {
    all: ['sale', 'type', 'size', 'material'],
    bed: ['sale', 'size', 'material', 'color'],
    mattress: ['sale', 'size', 'firmness', 'material'],
    bedding: ['sale', 'size', 'warmth', 'color'],
    nightstand: ['sale', 'size', 'material', 'color'],
  },
  dining: {
    all: ['sale', 'type', 'material', 'color'],
    'dining-furniture': ['sale', 'seatCount', 'size', 'color'],
    table: ['sale', 'size', 'material', 'shape'],
    chair: ['sale', 'material', 'color', 'function'],
    'living-side-table': ['sale', 'size', 'color', 'function'],
  },
  desk: {
    all: ['sale', 'type', 'size', 'color'],
    'computer-desk': ['sale', 'size', 'color', 'function'],
    'meeting-table': ['sale', 'size', 'shape', 'function'],
    'gaming-desk': ['sale', 'size', 'color', 'function'],
    'office-desk': ['sale', 'size', 'configuration', 'color'],
  },
  'kitchen-furniture': {
    all: ['sale', 'type', 'material', 'color'],
    'kitchen-appliance': ['sale', 'type', 'installation', 'size'],
    'kitchen-storage': ['sale', 'type', 'material', 'color'],
    'kitchen-rack-cart': ['sale', 'type', 'material', 'size'],
  },
  kitchenware: {
    all: ['sale', 'type', 'material', 'size'],
    'kitchen-tools': ['sale', 'type', 'material', 'color'],
    'pot-pan': ['sale', 'type', 'material', 'size'],
    'knife-board': ['sale', 'type', 'material', 'size'],
    'glass-cup': ['sale', 'type', 'material', 'size'],
    cutlery: ['sale', 'configuration', 'material', 'color'],
  },
  plant: {
    all: ['sale', 'type', 'color', 'use'],
    plant: ['sale', 'type', 'color', 'use'],
    flowerpot: ['sale', 'size', 'material', 'color'],
    'plant-stand': ['sale', 'size', 'material', 'color'],
    gardening: ['sale', 'type', 'material', 'use'],
    'watering-can': ['sale', 'size', 'material', 'color'],
  },
};

const TYPE_VALUE_OVERRIDES = {
  mattress: {
    firmness: '단단함',
    material: '포켓스프링',
  },
  bedding: {
    warmth: '사계절용',
  },
  'dining-furniture': {
    seatCount: '4인~6인',
  },
  table: {
    shape: '직사각형',
  },
  chair: {
    function: '접이식',
  },
  'living-side-table': {
    function: '노트북/보조',
  },
  'computer-desk': {
    function: '컴퓨터 작업',
  },
  'meeting-table': {
    function: '회의/미팅',
    shape: '직사각형',
  },
  'gaming-desk': {
    function: '게이밍',
  },
  'office-desk': {
    configuration: '테이블+의자 세트',
  },
  'kitchen-appliance': {
    type: '식기세척기',
    installation: '빌트인',
  },
  'kitchen-storage': {
    type: '정리대',
  },
  'kitchen-rack-cart': {
    type: '카트',
  },
  'kitchen-tools': {
    type: '조리도구',
  },
  'pot-pan': {
    type: '냄비/팬',
  },
  'knife-board': {
    type: '칼/도마',
  },
  'glass-cup': {
    type: '유리컵',
  },
  cutlery: {
    configuration: '세트',
  },
  plant: {
    type: '인조식물',
    use: '실내외겸용',
  },
  flowerpot: {
    type: '화분',
  },
  'plant-stand': {
    type: '화분스탠드',
  },
  gardening: {
    type: '원예용품',
    use: '실내용',
  },
  'watering-can': {
    type: '물뿌리개',
  },
};

const MATERIAL_KEYWORDS = ['패브릭', '메탈', '플라스틱', '유리', '대나무', '스테인리스', '자작나무', '천연가죽'];
const COLOR_KEYWORDS = ['오프화이트', '다크그레이', '화이트', '블랙', '그레이', '베이지', '그린', '브라운', '레드', '골드'];
const FIRMNESS_KEYWORDS = ['매우 단단함', '단단함', '중간', '부드러움'];

export function getFilterFieldIds(categorySlug, typeSlug = 'all') {
  const categoryConfig = CATEGORY_FILTER_FIELDS[categorySlug];

  if (!categoryConfig) {
    return DEFAULT_FILTER_FIELDS;
  }

  return categoryConfig[typeSlug] ?? categoryConfig.all ?? DEFAULT_FILTER_FIELDS;
}

export function createEmptyFilterState() {
  return Object.fromEntries(FILTER_FIELD_IDS.map((fieldId) => [fieldId, []]));
}

export function createDefaultOpenGroups() {
  return {
    price: true,
    ...Object.fromEntries(FILTER_FIELD_IDS.map((fieldId) => [fieldId, false])),
  };
}

export function getProductFilterValue(product, fieldId) {
  const typeOverrides = TYPE_VALUE_OVERRIDES[product?.typeSlug] ?? {};

  if (typeOverrides[fieldId]) {
    return typeOverrides[fieldId];
  }

  switch (fieldId) {
    case 'sale':
      return Number(product?.discountRate ?? 0) > 0 ? ['할인중'] : [];
    case 'type':
      return product?.label ?? null;
    case 'material':
      return inferProductMaterial(product);
    case 'color':
      return inferProductColor(product);
    case 'size':
      return inferProductSize(product?.name);
    case 'firmness':
      return inferProductFirmness(product?.name);
    default:
      return null;
  }
}

export function getFilterOptions(products, fieldId) {
  if (fieldId === 'sale') {
    return ['할인중'];
  }

  return Array.from(new Set(
    products.flatMap((product) => {
      const value = getProductFilterValue(product, fieldId);

      if (Array.isArray(value)) {
        return value;
      }

      return value ? [value] : [];
    }),
  ));
}

export function inferProductSize(name = '') {
  const text = String(name);
  const patterns = [
    /\d+\s*x\s*\d+(?:\s*x\s*\d+)?\s*cm/i,
    /\d+(?:\.\d+)?\s*(?:cm|mm|l|cl)\b/i,
  ];

  for (const pattern of patterns) {
    const matched = text.match(pattern);
    if (matched) {
      return matched[0].replace(/\s+/g, '');
    }
  }

  return null;
}

function inferProductMaterial(product = {}) {
  if (product.material) {
    return product.material;
  }

  const text = `${product.name ?? ''} ${(product.features ?? []).join(' ')}`;
  return MATERIAL_KEYWORDS.find((keyword) => text.includes(keyword)) ?? null;
}

function inferProductColor(product = {}) {
  if (product.color) {
    return product.color;
  }

  const text = `${product.name ?? ''} ${(product.features ?? []).join(' ')}`;
  return COLOR_KEYWORDS.find((keyword) => text.includes(keyword)) ?? null;
}

function inferProductFirmness(name = '') {
  const text = String(name);
  return FIRMNESS_KEYWORDS.find((keyword) => text.includes(keyword)) ?? null;
}
