import { defineStore } from 'pinia';
import {
  getAdminMembers,
  getAdminOrderCount,
  getAdminOrders,
  getAdminProductCount,
  getAdminQnas,
  getAdminReviews,
  getFallbackAdminCategories,
  getProductCatalog,
} from '../services/adminService';
import {
  buildAdminDashboard,
} from '../mappers/adminDashboardMapper';

function normalizeArrayPayload(payload, fallback = []) {
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
  return normalizeArrayPayload(payload).map((item) => ({
    ...item,
    password: undefined,
  }));
}

function createEmptyDashboard() {
  return buildAdminDashboard({
    categories: getFallbackAdminCategories(),
    products: [],
    orders: [],
    members: [],
    reviews: [],
    qnas: [],
    productCount: 0,
    orderCount: 0,
  });
}

export const useAdminDashboardStore = defineStore('adminDashboard', {
  state: () => ({
    dashboard: createEmptyDashboard(),
    isDashboardLoading: false,
    loadErrorMessage: '',
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
      this.loadErrorMessage = '';

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
          ? normalizeArrayPayload(productsResult.value)
          : [];
        const orders = ordersResult.status === 'fulfilled'
          ? normalizeArrayPayload(ordersResult.value)
          : [];
        const members = membersResult.status === 'fulfilled'
          ? normalizeMembers(membersResult.value)
          : [];
        const reviews = reviewsResult.status === 'fulfilled'
          ? normalizeArrayPayload(reviewsResult.value)
          : [];
        const qnas = qnasResult.status === 'fulfilled'
          ? normalizeArrayPayload(qnasResult.value)
          : [];
        const productCount = productCountResult.status === 'fulfilled'
          ? Number(productCountResult.value)
          : 0;
        const orderCount = orderCountResult.status === 'fulfilled'
          ? Number(orderCountResult.value)
          : 0;

        const hasRejectedRequest = [
          productCountResult,
          orderCountResult,
          productsResult,
          ordersResult,
          membersResult,
          reviewsResult,
          qnasResult,
        ].some((result) => result.status === 'rejected');

        if (hasRejectedRequest) {
          this.loadErrorMessage = '일부 관리자 통계를 불러오지 못했습니다. 서버 상태를 확인해 주세요.';
        }

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
        this.dashboard = createEmptyDashboard();
        this.loadErrorMessage = '관리자 대시보드를 불러오지 못했습니다. 서버 상태를 확인해 주세요.';
      } finally {
        this.isDashboardLoading = false;
        this.loaded = true;
      }
    },
  },
});
