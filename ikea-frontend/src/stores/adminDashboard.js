import { defineStore } from 'pinia';
import {
  getAdminMembers,
  getAdminOrderCount,
  getAdminOrders,
  getAdminProductCount,
  getAdminQnas,
  getAdminReviews,
  getFallbackAdminCategories,
  getFallbackAdminMembers,
  getFallbackAdminOrders,
  getFallbackAdminProducts,
  getFallbackAdminQnaThreads,
  getFallbackAdminReviewItems,
  getProductCatalog,
} from '../services/adminService';
import {
  buildAdminDashboard,
  createFallbackQnas,
  createFallbackReviews,
} from '../mappers/adminDashboardMapper';

function normalizeArrayPayload(payload, fallback) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return fallback;
}

function normalizeMembers(payload) {
  return normalizeArrayPayload(payload, getFallbackAdminMembers()).map((item) => ({
    ...item,
    password: undefined,
  }));
}

function createFallbackDashboard() {
  return buildAdminDashboard({
    categories: getFallbackAdminCategories(),
    products: getFallbackAdminProducts(),
    orders: getFallbackAdminOrders(),
    members: getFallbackAdminMembers(),
    reviews: createFallbackReviews(getFallbackAdminReviewItems()),
    qnas: createFallbackQnas(getFallbackAdminQnaThreads()),
  });
}

export const useAdminDashboardStore = defineStore('adminDashboard', {
  state: () => ({
    dashboard: createFallbackDashboard(),
    isDashboardLoading: false,
    loaded: false,
  }),
  actions: {
    refreshSummaryCounts() {
      this.dashboard.summaryCards = this.dashboard.summaryCards.map((card) => {
        if (card.id === 'products') {
          return { ...card, value: `${this.dashboard.productRows.length}개` };
        }

        if (card.id === 'orders') {
          return { ...card, value: `${this.dashboard.orderRows.length}건` };
        }

        if (card.id === 'members') {
          return { ...card, value: `${this.dashboard.memberRows.length}명` };
        }

        if (card.id === 'reviews') {
          return { ...card, value: `${this.dashboard.reviewRows.length}건` };
        }

        return card;
      });
    },
    removeMember(memberId) {
      this.dashboard.memberRows = this.dashboard.memberRows.filter((member) => member.id !== memberId);
      this.refreshSummaryCounts();
    },
    async loadDashboard() {
      this.isDashboardLoading = true;

      try {
        const [
          productCountResult,
          orderCountResult,
          productsResult,
          ordersResult,
          membersResult,
          reviewsResult,
          qnasResult,
        ] = await Promise.allSettled([
          getAdminProductCount(),
          getAdminOrderCount(),
          getProductCatalog(),
          getAdminOrders(),
          getAdminMembers(),
          getAdminReviews(),
          getAdminQnas(),
        ]);

        const products = productsResult.status === 'fulfilled'
          ? normalizeArrayPayload(productsResult.value, getFallbackAdminProducts())
          : getFallbackAdminProducts();
        const orders = ordersResult.status === 'fulfilled'
          ? normalizeArrayPayload(ordersResult.value, getFallbackAdminOrders())
          : getFallbackAdminOrders();
        const members = membersResult.status === 'fulfilled'
          ? normalizeMembers(membersResult.value)
          : getFallbackAdminMembers();
        const reviews = reviewsResult.status === 'fulfilled'
          ? normalizeArrayPayload(reviewsResult.value, createFallbackReviews(getFallbackAdminReviewItems()))
          : createFallbackReviews(getFallbackAdminReviewItems());
        const qnas = qnasResult.status === 'fulfilled'
          ? normalizeArrayPayload(qnasResult.value, createFallbackQnas(getFallbackAdminQnaThreads()))
          : createFallbackQnas(getFallbackAdminQnaThreads());
        const productCount = productCountResult.status === 'fulfilled'
          ? Number(productCountResult.value)
          : products.length;
        const orderCount = orderCountResult.status === 'fulfilled'
          ? Number(orderCountResult.value)
          : orders.length;

        this.dashboard = buildAdminDashboard({
          categories: getFallbackAdminCategories(),
          products,
          orders,
          members,
          reviews,
          qnas,
          productCount,
          orderCount,
        });
      } catch {
        this.dashboard = createFallbackDashboard();
      } finally {
        this.isDashboardLoading = false;
        this.loaded = true;
      }
    },
  },
});
