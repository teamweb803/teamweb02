import httpRequester from '../libs/httpRequester';
import { orderReviewItems, qnaThreads } from '../data/adminDashboardSeed';
import {
  getFallbackCatalogCategories,
  getFallbackCatalogProducts,
} from './catalogFallbackService';

export function getAdminProductCount() {
  return httpRequester.get('/admin/product/count');
}

export function getAdminOrderCount() {
  return httpRequester.get('/admin/order/count');
}

export function getAdminOrders(query) {
  return httpRequester.get('/admin/order', { params: query });
}

export function getAdminOrdersByStatus(status) {
  return httpRequester.get('/admin/order/status', { params: { status } });
}

export function getAdminMembers(query) {
  if (query?.keyword) {
    return httpRequester.get('/admin/member/search', { params: query });
  }

  return httpRequester.get('/admin/member');
}

export function getAdminReviews() {
  return httpRequester.get('/admin/review');
}

export function getAdminQnas() {
  return httpRequester.get('/admin/qna');
}

export function getProductCatalog(query) {
  if (query?.keyword) {
    return httpRequester.get('/product/search', {
      params: { keyword: query.keyword },
    });
  }

  return httpRequester.get('/product');
}

export function updateAdminOrderStatus(orderId, status) {
  return httpRequester.patch(`/admin/order/${orderId}/status`, null, {
    params: { status },
  });
}

export function removeAdminReview(reviewId) {
  return httpRequester.delete(`/admin/review/${reviewId}`);
}

export function getFallbackAdminCategories() {
  return getFallbackCatalogCategories();
}

export function getFallbackAdminProducts() {
  return getFallbackCatalogProducts().map((product) => ({
    productId: String(product.id),
    name: product.name,
    price: product.price,
    imgPath: product.image,
    categoryName: product.categoryLabel,
    categorySlug: product.categorySlug,
    reviews: product.reviews,
    rating: product.rating,
    brand: product.brand,
    createdAt: null,
  }));
}

export function getFallbackAdminReviewItems() {
  return orderReviewItems;
}

export function getFallbackAdminQnaThreads() {
  return qnaThreads;
}
