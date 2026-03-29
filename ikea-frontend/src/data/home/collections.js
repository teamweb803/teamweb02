import {
  categoryMap,
  categoryMeta,
  categorySlugOrder,
  findPrimaryProduct,
  getCategoryLabel,
  getNaturalProducts,
  getTopProducts,
  toPickCard,
  toProductCard,
} from './catalogShared';

export const weeklyDeals = [
  findPrimaryProduct('sofa'),
  findPrimaryProduct('bed-mattress'),
  findPrimaryProduct('dining'),
  findPrimaryProduct('kitchenware'),
]
  .filter(Boolean)
  .map((product) =>
    toProductCard(product, {
      badge: getCategoryLabel(product.categorySlug),
    }),
  );

export const curatedSpotlight = {
  title: '공간별 추천 셀렉션',
  featured: {
    label: 'DINING EDIT',
    title: '식탁과 의자를 함께 보고 식사 공간 구성을 정리해 보세요.',
    description:
      '다이닝 가구와 식탁, 의자를 같은 흐름으로 이어 보며 공간 구성에 필요한 조합을 빠르게 확인할 수 있습니다.',
    image: '/content-images/dining-table.jpg',
    categorySlug: 'dining',
  },
  items: [
    toProductCard(findPrimaryProduct('desk'), {
      id: 'spotlight-desk',
      badge: 'WORK SETUP',
      tags: ['작업 공간', '집중 환경'],
    }),
    toProductCard(findPrimaryProduct('plant'), {
      id: 'spotlight-plant',
      badge: 'GREEN TOUCH',
      tags: ['공간 포인트', '실내 연출'],
    }),
  ].filter(Boolean),
};

export const categoryDealCollections = Object.fromEntries(
  categorySlugOrder.map((categorySlug) => [
    categorySlug,
    {
      banner: {
        title: categoryMeta[categorySlug]?.bannerTitle ?? `${getCategoryLabel(categorySlug)} 인기 상품`,
        subtitle:
          categoryMeta[categorySlug]?.bannerSubtitle ??
          `${getCategoryLabel(categorySlug)} 카테고리에서 자주 찾는 상품을 먼저 모아봤습니다.`,
        image: categoryMeta[categorySlug]?.bannerImage ?? categoryMap.get(categorySlug)?.image ?? '',
        imagePosition: categoryMeta[categorySlug]?.bannerImagePosition ?? 'center center',
        categorySlug,
      },
      items: getTopProducts(categorySlug, 4)
        .map((product) =>
          toProductCard(product, {
            badge: product.label ?? getCategoryLabel(categorySlug),
          }),
        )
        .filter(Boolean),
    },
  ]),
);

export const newItemCollections = Object.fromEntries(
  categorySlugOrder.map((categorySlug) => [
    categorySlug,
    getNaturalProducts(categorySlug, 4)
      .map((product) =>
        toProductCard(product, {
          badge: product.label ?? getCategoryLabel(categorySlug),
        }),
      )
      .filter(Boolean),
  ]),
);

export const pickSection = {
  title: 'HOMiO pick',
  items: [
    toPickCard(findPrimaryProduct('sofa'), {
      id: 'pick-sofa',
      accent: 'yellow',
    }),
    toPickCard(findPrimaryProduct('bed-mattress'), {
      id: 'pick-bed',
      accent: 'blue',
    }),
    toPickCard(findPrimaryProduct('desk'), {
      id: 'pick-desk',
      accent: 'yellow',
      image: 'https://www.ikea.com/kr/ko/images/products/linnmon-adils-table-white__1369093_pe958026_s5.jpg',
    }),
    toPickCard(findPrimaryProduct('plant'), {
      id: 'pick-plant',
      accent: 'blue',
    }),
  ].filter(Boolean),
};

export const categoryDealFilters = categorySlugOrder.map((categorySlug) => ({
  id: categorySlug,
  label: getCategoryLabel(categorySlug),
}));

export const newItemFilters = categorySlugOrder.map((categorySlug) => ({
  id: categorySlug,
  label: getCategoryLabel(categorySlug),
}));
