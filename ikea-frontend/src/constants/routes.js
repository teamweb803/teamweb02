import {
  getDefaultFallbackCategory,
  getFallbackCategoryRouteMap,
} from '../services/catalogFallbackService';

const CATEGORY_ROUTE_MAP = getFallbackCategoryRouteMap();
const DEFAULT_CATEGORY = getDefaultFallbackCategory();

export const DEFAULT_CATEGORY_ID = DEFAULT_CATEGORY.backendCategoryId;
export const DEFAULT_CATEGORY_SLUG = DEFAULT_CATEGORY.slug;
export const DEFAULT_PRODUCT_ID = '10489009';
export const DEFAULT_NOTICE_ID = '6245';

export { CATEGORY_ROUTE_MAP };

export const ROUTE_PATHS = {
  home: '/',
  adminBase: '/admin',
  adminDashboard: '/admin/dashboard',
  adminProducts: '/admin/products',
  adminInventory: '/admin/inventory',
  adminMembers: '/admin/members',
  adminOrders: '/admin/orders',
  adminQna: '/admin/qna',
  adminReviews: '/admin/reviews',
  adminNotices: '/admin/notices',
  cart: '/cart',
  memberLogin: '/member/login',
  memberMyPage: '/member/mypage',
  memberJoin: '/member/join',
  memberJoinForm: '/member/join/form',
  memberJoinComplete: '/member/join/complete',
  orderCheckout: '/order/checkout',
  orderComplete: '/order/complete',
  guestOrderLookup: '/order/guest-lookup',
  policyTerms: '/policy/terms',
  policyPrivacy: '/policy/privacy',
  customerServiceNotice: '/customer-service/notice',
  customerServiceFaq: '/customer-service/faq',
  customerServiceQna: '/customer-service/qna',
  customerServiceQnaWrite: '/customer-service/qna/write',
  productCategoryBase: '/product/category',
  productCategoryLegacyBase: '/category',
  productBase: '/product',
  search: '/search',
};

export function resolveCategoryRoute(categoryValue = DEFAULT_CATEGORY_SLUG) {
  const normalizedValue = String(categoryValue ?? '').trim().toLowerCase();

  if (CATEGORY_ROUTE_MAP[normalizedValue]) {
    return CATEGORY_ROUTE_MAP[normalizedValue];
  }

  return (
    Object.values(CATEGORY_ROUTE_MAP).find(
      (category) => String(category.backendCategoryId) === String(categoryValue ?? '').trim(),
    ) ?? CATEGORY_ROUTE_MAP[DEFAULT_CATEGORY_SLUG]
  );
}

export function buildProductCategoryPath(categoryValue = DEFAULT_CATEGORY_SLUG) {
  const category = resolveCategoryRoute(categoryValue);
  return `${ROUTE_PATHS.productCategoryBase}/${category.slug}`;
}

export function getBackendCategoryId(categoryValue = DEFAULT_CATEGORY_SLUG) {
  return resolveCategoryRoute(categoryValue).backendCategoryId;
}

export function buildProductDetailPath(productId = DEFAULT_PRODUCT_ID) {
  return `${ROUTE_PATHS.productBase}/${productId}`;
}

export function buildCustomerServiceNoticeDetailPath(noticeId = DEFAULT_NOTICE_ID) {
  return `${ROUTE_PATHS.customerServiceNotice}/${noticeId}`;
}

export function buildSearchPath(keyword = '') {
  const normalizedKeyword = String(keyword ?? '').trim();

  if (!normalizedKeyword) {
    return ROUTE_PATHS.search;
  }

  return `${ROUTE_PATHS.search}?q=${encodeURIComponent(normalizedKeyword)}`;
}
