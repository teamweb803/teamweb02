import {
  backendCategories,
  catalogProducts,
  CATEGORY_ROUTE_MAP,
  DEFAULT_CATEGORY,
  getProductDetailSeed,
} from '../data/catalog';
import { getProductDetailContent } from '../data/productDetailContent';
import { buildProductQuickFacts } from '../constants/productAttributeConfig';
import { mergeCatalogProductsWithAdminDrafts } from './adminProductDraftService';

export function getFallbackCatalogCategories() {
  return backendCategories;
}

export function getFallbackCatalogProducts() {
  return mergeCatalogProductsWithAdminDrafts(catalogProducts);
}

export function getFallbackCategoryRouteMap() {
  return CATEGORY_ROUTE_MAP;
}

export function getDefaultFallbackCategory() {
  return DEFAULT_CATEGORY;
}

export function getFallbackCatalogProductDetailSeed(productId) {
  return getProductDetailSeed(productId);
}

export function getFallbackCatalogProductDetailContent(product) {
  if (product?.detailDraft) {
    return {
      galleryImages: product.detailDraft.galleryImages ?? [product.image, product.altImage].filter(Boolean),
      dimensionImage: product.detailDraft.dimensionImage ?? '',
      useDimensionImage: Boolean(product.detailDraft.dimensionImage),
      heroHook: product.detailDraft.heroHook ?? product.description ?? '',
      description: product.detailDraft.description ?? [],
      highlights: product.detailDraft.highlights ?? [],
      quickFacts: buildProductQuickFacts(product),
      measurements: product.detailDraft.measurements ?? [],
      dimensionCaption: product.detailDraft.dimensionImage
        ? '등록된 치수 이미지를 기준으로 상품 크기를 확인할 수 있습니다.'
        : '등록된 치수 정보를 기준으로 상품 크기를 확인할 수 있습니다.',
      reviewHighlights: [
        {
          title: '관리자 등록 상품',
          body: '상품 등록 화면에서 입력한 상세 정보를 기준으로 미리보기 콘텐츠를 구성했습니다.',
          rating: product.rating ?? null,
          meta: '관리자 초안',
        },
      ],
    };
  }

  return getProductDetailContent(product);
}
