import { catalogProducts, getProductDetailSeed, productDetailContentMap } from './catalog';
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

function createFallbackDetail(product) {
  const productLabel = product.label ?? product.categoryLabel ?? '대표 상품';
  const optionSummary = buildProductOptionSummary(product) || '기본 옵션';
  const galleryImages = Array.from(
    new Set([product.image, product.altImage].filter(Boolean)),
  );

  return {
    galleryImages,
    dimensionImage: null,
    useDimensionImage: false,
    heroHook: `${productLabel}의 구성과 특징을 확인해 보세요.`,
    description: [
      `${product.name}의 디자인과 분위기를 살펴보세요.`,
      `${optionSummary} 구성을 기준으로 상품 정보를 확인할 수 있습니다.`,
    ],
    highlights: [
      `${productLabel} 기준 구성`,
      `선택 옵션: ${optionSummary}`,
      '구매 전 확인하면 좋은 포인트',
    ],
    quickFacts: buildProductQuickFacts(product),
    measurements: [],
    dimensions: {},
    dimensionCaption: '주요 치수를 함께 확인해 보세요.',
    reviewIntro: '고객 리뷰를 확인해 보세요.',
    reviewHighlights: [
      {
        title: '착석감이 편안해요',
        body: `${product.name}의 사용감과 분위기를 확인할 수 있는 후기입니다.`,
        rating: product.rating ?? null,
        meta: '대표 후기',
      },
      {
        title: '공간에 잘 어울려요',
        body: `${optionSummary} 구성을 기준으로 공간 활용에 대한 후기를 확인할 수 있습니다.`,
        rating: product.rating ?? null,
        meta: '배치 후기',
      },
      {
        title: '마감이 깔끔해요',
        body: '색감과 소재, 전체적인 완성도에 대한 후기를 살펴볼 수 있습니다.',
        rating: product.rating ?? null,
        meta: '상품 후기',
      },
    ],
  };
}

function findRepresentativeDetailSeed(product = {}) {
  const currentId = String(product?.id ?? '').trim();
  const currentCategorySlug = String(product?.categorySlug ?? '').trim();
  const currentTypeSlug = String(product?.typeSlug ?? '').trim();

  const candidate = catalogProducts.find((item) => {
    const candidateId = String(item?.id ?? '').trim();

    if (!candidateId || candidateId === currentId || !productDetailContentMap[candidateId]) {
      return false;
    }

    if (currentCategorySlug && String(item?.categorySlug ?? '').trim() !== currentCategorySlug) {
      return false;
    }

    if (currentTypeSlug && String(item?.typeSlug ?? '').trim() === currentTypeSlug) {
      return true;
    }

    return Boolean(currentCategorySlug);
  });

  if (candidate) {
    return productDetailContentMap[String(candidate.id)] ?? null;
  }

  return Object.values(productDetailContentMap)[0] ?? null;
}

export function getProductDetailContent(product) {
  const fallback = createFallbackDetail(product);
  const override = getProductDetailSeed(product?.id);
  const representativeSeed = !override ? findRepresentativeDetailSeed(product) : null;

  if (!override && !representativeSeed) {
    return fallback;
  }

  const seed = override ?? representativeSeed;
  const measurements = seed?.measurements ?? fallback.measurements;

  return {
    ...fallback,
    ...seed,
    galleryImages: override?.galleryImages ?? fallback.galleryImages,
    dimensionImage: override?.dimensionImage ?? fallback.dimensionImage,
    useDimensionImage: override?.useDimensionImage ?? false,
    description: seed?.description ?? fallback.description,
    highlights: seed?.highlights ?? fallback.highlights,
    quickFacts: mergeQuickFacts(seed?.quickFacts ?? [], fallback.quickFacts),
    measurements,
    dimensions: createMeasurementMap(measurements),
    reviewHighlights: seed?.reviewHighlights ?? fallback.reviewHighlights,
  };
}
