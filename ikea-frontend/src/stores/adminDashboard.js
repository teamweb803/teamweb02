import { defineStore } from 'pinia';
import {
  getAdminMembers,
  getAdminOrderCount,
  getAdminOrders,
  getAdminProductCount,
  getAdminQnas,
  getAdminReviews,
  getFallbackAdminCategories,
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

const fallbackMembers = [
  {
    memberId: 1,
    loginId: 'roomtone',
    name: '김지은',
    email: 'roomtone@example.com',
    createdAt: '2026-03-18T09:10:00',
    memberRole: 'USER',
  },
  {
    memberId: 2,
    loginId: 'oakmemo',
    name: '박선영',
    email: 'oakmemo@example.com',
    createdAt: '2026-03-17T14:20:00',
    memberRole: 'USER',
  },
  {
    memberId: 3,
    loginId: 'admin01',
    name: '운영관리자',
    email: 'admin01@example.com',
    createdAt: '2026-03-01T08:00:00',
    memberRole: 'ADMIN',
  },
  {
    memberId: 4,
    loginId: 'linenhome',
    name: '정하린',
    email: 'linenhome@example.com',
    createdAt: '2026-03-16T16:40:00',
    memberRole: 'USER',
  },
];

const fallbackOrders = [
  {
    orderId: 2403201089,
    orderStatus: 'COMPLETED',
    totalPrice: 2240000,
    payment: 'CARD',
    address: '서울 양천구 목동동로 120',
    createdAt: '2026-03-22T10:10:00',
    orderItems: [{ productName: '아일랜드 모듈 소파', quantity: 1 }],
  },
  {
    orderId: 2403201077,
    orderStatus: 'ORDERED',
    totalPrice: 689000,
    payment: 'CARD',
    address: '경기 성남시 분당구 성남대로 400',
    createdAt: '2026-03-23T14:20:00',
    orderItems: [{ productName: '사이드 모션 데스크', quantity: 1 }],
  },
  {
    orderId: 2403190941,
    orderStatus: 'DELIVERING',
    totalPrice: 1480000,
    payment: 'CARD',
    address: '서울 송파구 올림픽로 315',
    createdAt: '2026-03-25T09:40:00',
    orderItems: [{ productName: '라운드글로우 호텔 침대', quantity: 1 }],
  },
  {
    orderId: 2403180812,
    orderStatus: 'CANCELLED',
    totalPrice: 239000,
    payment: 'BANK',
    address: '경기 고양시 일산서구 중앙로 1400',
    createdAt: '2026-03-27T16:05:00',
    orderItems: [{ productName: '데일리 서브리 패키지', quantity: 1 }],
  },
];

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
  return normalizeArrayPayload(payload, fallbackMembers).map((item) => ({
    ...item,
    password: undefined,
  }));
}

function createFallbackDashboard() {
  return buildAdminDashboard({
    categories: getFallbackAdminCategories(),
    products: getFallbackAdminProducts(),
    orders: fallbackOrders,
    members: fallbackMembers,
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
          ? normalizeArrayPayload(ordersResult.value, fallbackOrders)
          : fallbackOrders;
        const members = membersResult.status === 'fulfilled'
          ? normalizeMembers(membersResult.value)
          : fallbackMembers;
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
