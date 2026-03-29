import { getProductDetailSeed } from './catalog';

function createMeasurementMap(measurements = []) {
  const aliasMap = {
    폭: 'width',
    길이: 'length',
    깊이: 'depth',
    높이: 'height',
    '등받이 높이': 'backHeight',
    등받이H: 'backHeight',
    '시트 폭': 'seatWidth',
    '시트 깊이': 'seatDepth',
    '시트 높이': 'seatHeight',
    '팔걸이 높이': 'armHeight',
    '팔걸이 너비': 'armWidth',
    '가구 밑 여유공간': 'clearance',
    '층별 하중': 'shelfLoad',
    '최대 하중': 'maxLoad',
  };

  return measurements.reduce((result, item) => {
    const mappedKey = aliasMap[item.label];
    if (mappedKey) {
      result[mappedKey] = item.value;
    }
    return result;
  }, {});
}

function createFallbackDetail(product) {
  const productLabel = product.label ?? product.categoryLabel ?? '대표 상품';
  const productColor = product.color ?? '기본 옵션';
  const productMaterial = product.material ?? '기본 소재';
  const galleryImages = Array.from(new Set([
    product.image,
    product.altImage,
  ].filter(Boolean)));

  return {
    galleryImages,
    dimensionImage: null,
    useDimensionImage: false,
    heroHook: `${productLabel} 기준으로 빠르게 확인할 수 있는 최소 상세 정보입니다.`,
    description: [
      `${product.name} 제품의 핵심 정보만 먼저 확인할 수 있도록 정리한 상세 페이지입니다.`,
      `${productMaterial} 중심의 구성과 ${productColor} 옵션을 기준으로 연결되어 있으며, 실데이터 연동 시 추가 설명이 보강될 예정입니다.`,
    ],
    highlights: [
      `${productLabel} 기준 대표 상품`,
      `현재 선택 컬러: ${productColor}`,
      'API 연결을 위한 최소 상세 데이터 구성',
    ],
    quickFacts: [
      { label: '대표 분류', value: productLabel },
      { label: '소재', value: productMaterial },
      { label: '컬러', value: productColor },
    ],
    measurements: [],
    dimensions: {},
    dimensionCaption: '세부 치수 데이터는 후속 API 또는 추가 수집 단계에서 연결 예정입니다.',
    reviewIntro: '리뷰 데이터는 현재 상품별 요약 구조만 먼저 준비되어 있습니다.',
    reviewHighlights: [
      {
        title: '기본 상세 구조 준비 완료',
        body: '이 상품도 동일한 상세 페이지 구조를 사용하며, 설명과 리뷰는 추후 실데이터로 확장될 수 있습니다.',
        rating: product.rating ?? null,
        meta: '시스템 안내',
      },
    ],
  };
}

export function getProductDetailContent(product) {
  const fallback = createFallbackDetail(product);
  const override = getProductDetailSeed(product?.id);

  if (!override) {
    return fallback;
  }

  const measurements = override.measurements ?? fallback.measurements;

  return {
    ...fallback,
    ...override,
    galleryImages: override.galleryImages ?? fallback.galleryImages,
    dimensionImage: override.dimensionImage ?? fallback.dimensionImage,
    useDimensionImage: override.useDimensionImage ?? false,
    description: override.description ?? fallback.description,
    highlights: override.highlights ?? fallback.highlights,
    quickFacts: override.quickFacts ?? fallback.quickFacts,
    measurements,
    dimensions: createMeasurementMap(measurements),
    reviewHighlights: override.reviewHighlights ?? fallback.reviewHighlights,
  };
}
