import { getProductDetailSeed } from './catalog';
import {
  buildProductOptionSummary,
  buildProductQuickFacts,
} from '../constants/productAttributeConfig';

function createMeasurementMap(measurements = []) {
  const aliasMap = {
    너비: 'width',
    길이: 'length',
    깊이: 'depth',
    높이: 'height',
    '등받이 높이': 'backHeight',
    등받이높이: 'backHeight',
    '시트 폭': 'seatWidth',
    '시트 깊이': 'seatDepth',
    '시트 높이': 'seatHeight',
    '팔걸이 높이': 'armHeight',
    '팔걸이 너비': 'armWidth',
    '가구 밑 자유공간': 'clearance',
    '가구 밑 여유공간': 'clearance',
    '책상 하중': 'shelfLoad',
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

function mergeQuickFacts(primaryFacts = [], secondaryFacts = []) {
  const merged = [];
  const seen = new Set();
  const aliasMap = {
    컬러: 'color',
    색상: 'color',
  };

  [...primaryFacts, ...secondaryFacts].forEach((fact) => {
    const label = fact?.label?.trim?.();
    const value = fact?.value?.trim?.();
    const normalizedLabel = aliasMap[label] ?? label;

    if (!label || !value || seen.has(normalizedLabel)) {
      return;
    }

    seen.add(normalizedLabel);
    merged.push({
      label,
      value,
    });
  });

  return merged;
}

function createFallbackDetail(product = {}) {
  const productLabel = product.label ?? product.categoryLabel ?? '대표 상품';
  const optionSummary = buildProductOptionSummary(product) || '기본 옵션';
  const galleryImages = Array.from(
    new Set([product.image, product.altImage].filter(Boolean)),
  );

  return {
    galleryImages,
    dimensionImage: null,
    useDimensionImage: false,
    heroHook: `${productLabel} 기준으로 빠르게 확인할 수 있는 최소 상세 정보입니다.`,
    description: [
      `${product.name} 상품의 핵심 정보만 먼저 확인할 수 있도록 정리한 상세 페이지입니다.`,
      `${optionSummary} 구성을 기준으로 연결되어 있으며, 실데이터 연동 시 추가 설명이 보강될 예정입니다.`,
    ],
    highlights: [
      `${productLabel} 기준 대표 상품`,
      `현재 선택 옵션: ${optionSummary}`,
      'API 연결을 위한 최소 상세 데이터 구성',
    ],
    quickFacts: buildProductQuickFacts(product),
    measurements: [],
    dimensions: {},
    dimensionCaption: '세부 치수 데이터는 후속 API 또는 추가 수집 단계에서 연결 예정입니다.',
    reviewIntro: null,
    reviewHighlights: [],
  };
}

export function getProductDetailContent(product) {
  const fallback = createFallbackDetail(product);
  const override = product?.detailDraft ?? getProductDetailSeed(product?.id);

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
    quickFacts: mergeQuickFacts(override.quickFacts ?? [], fallback.quickFacts),
    measurements,
    dimensions: createMeasurementMap(measurements),
    reviewIntro: null,
    reviewHighlights: [],
  };
}
