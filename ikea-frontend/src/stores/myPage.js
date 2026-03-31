import { defineStore } from 'pinia';
import { normalizeMemberProfile } from '../mappers/myPageMapper';
import { getCurrentMember } from '../services/memberService';
import { getMyPageStaticContent, getFallbackMyPageProfile } from '../services/myPageService';
import { getMyOrders } from '../services/orderService';
import { getMyReviews } from '../services/reviewService';
import { useAccountStore } from './account';
import { useCatalogStore } from './catalog';

function unwrapArrayPayload(payload) {
  const source = payload?.data ?? payload;

  if (Array.isArray(source)) {
    return source;
  }

  if (Array.isArray(source?.content)) {
    return source.content;
  }

  if (Array.isArray(source?.items)) {
    return source.items;
  }

  if (Array.isArray(source?.orderItems)) {
    return source.orderItems;
  }

  return [];
}

function unwrapObjectPayload(payload) {
  return payload?.data ?? payload ?? {};
}

function normalizeIdentifier(value) {
  return String(value ?? '').trim();
}

function formatPriceLabel(value) {
  return `${Number(value ?? 0).toLocaleString('ko-KR')}원`;
}

function formatDateLabel(value) {
  const normalizedValue = String(value ?? '').trim();

  if (!normalizedValue) {
    return '-';
  }

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    if (/^\d{4}\.\d{2}\.\d{2}$/.test(normalizedValue)) {
      return normalizedValue;
    }

    if (/^\d{4}-\d{2}-\d{2}/.test(normalizedValue)) {
      return normalizedValue.slice(0, 10).replace(/-/g, '.');
    }

    return normalizedValue;
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('.');
}

function normalizeOrderStatusLabel(value) {
  const normalizedValue = normalizeIdentifier(value).toUpperCase();

  switch (normalizedValue) {
    case 'PENDING':
    case 'ORDERED':
      return '주문 접수';
    case 'PAID':
      return '결제완료';
    case 'READY':
    case 'PREPARING':
      return '배송준비';
    case 'SHIPPING':
    case 'DELIVERING':
      return '배송중';
    case 'DELIVERED':
    case 'COMPLETED':
      return '구매확정';
    case 'CANCELLED':
      return '주문취소';
    default:
      return normalizeIdentifier(value) || '-';
  }
}

function buildSummaryCards(orders = [], reviews = []) {
  const inProgressStatuses = new Set(['PENDING', 'ORDERED', 'PAID', 'READY', 'PREPARING', 'SHIPPING', 'DELIVERING']);
  const inProgressCount = orders.filter((order) => (
    inProgressStatuses.has(normalizeIdentifier(order.orderStatus ?? order.status).toUpperCase())
  )).length;

  return [
    { id: 'orders', label: '진행중 주문', value: `${inProgressCount}건` },
    { id: 'coupon', label: '사용 가능 쿠폰', value: '-' },
    { id: 'point', label: '보유 포인트', value: '-' },
    { id: 'review', label: '내 리뷰', value: `${reviews.length}건` },
  ];
}

function buildOrderSteps(orders = []) {
  const counts = {
    paid: 0,
    ready: 0,
    shipping: 0,
    done: 0,
  };

  orders.forEach((order) => {
    switch (normalizeIdentifier(order.orderStatus ?? order.status).toUpperCase()) {
      case 'PAID':
        counts.paid += 1;
        break;
      case 'READY':
      case 'PREPARING':
        counts.ready += 1;
        break;
      case 'SHIPPING':
      case 'DELIVERING':
        counts.shipping += 1;
        break;
      case 'DELIVERED':
      case 'COMPLETED':
        counts.done += 1;
        break;
      default:
        break;
    }
  });

  return [
    { id: 'paid', label: '결제완료', count: counts.paid },
    { id: 'ready', label: '배송준비', count: counts.ready },
    { id: 'shipping', label: '배송중', count: counts.shipping },
    { id: 'done', label: '구매확정', count: counts.done },
  ];
}

function buildOrderOption(product, orderItem = {}, order = {}) {
  const optionParts = [
    product?.color,
    product?.material,
    normalizeIdentifier(orderItem.option),
    normalizeIdentifier(order.option),
  ].filter(Boolean);

  return optionParts.length ? optionParts.join(' / ') : '-';
}

function buildRecentOrders(orders = [], findProductById) {
  return orders.flatMap((order, orderIndex) => {
    const orderId = normalizeIdentifier(order.orderId ?? order.id);
    const orderNumber = normalizeIdentifier(order.orderNo ?? order.orderNumber);
    const orderStatusCode = normalizeIdentifier(order.orderStatus ?? order.status).toUpperCase();
    const orderDate = formatDateLabel(order.createdAt ?? order.orderedAt ?? order.orderDate);
    const orderItems = unwrapArrayPayload(order?.orderItems);
    const sourceItems = orderItems.length ? orderItems : [order];

    return sourceItems.map((orderItem, itemIndex) => {
      const productId = normalizeIdentifier(orderItem.productId ?? order.productId);
      const product = typeof findProductById === 'function' ? findProductById(productId) : null;
      const priceValue = (
        orderItem.totalPrice
        ?? orderItem.orderPrice
        ?? order.totalPrice
        ?? order.finalPrice
        ?? orderItem.price
        ?? product?.price
        ?? 0
      );
      const firstItem = orderItem;

      return {
        id: normalizeIdentifier(
          orderItem.orderItemId
          ?? `${orderId || orderNumber || `order-${orderIndex}`}-${productId || itemIndex}`,
        ),
        orderId,
        orderItemId: normalizeIdentifier(orderItem.orderItemId),
        orderNumber,
        date: orderDate,
      title: firstItem.productName ?? product?.name ?? '주문 상품',
        status: normalizeOrderStatusLabel(orderStatusCode),
        statusCode: orderStatusCode,
        option: buildOrderOption(product, orderItem, order),
        image: orderItem.imgPath ?? product?.image ?? '',
        title: orderItem.productName ?? product?.name ?? '二쇰Ц ?곹뭹',
        price: formatPriceLabel(priceValue),
        productId: productId || normalizeIdentifier(product?.id),
        quantity: Number(orderItem.quantity ?? 1) || 1,
        canWriteReview: orderStatusCode === 'COMPLETED',
    };
    });
  }).slice(0, 5);
}

export const useMyPageStore = defineStore('myPage', {
  state: () => {
    const accountStore = useAccountStore();

    return {
      ...getMyPageStaticContent(),
      profile: getFallbackMyPageProfile(accountStore),
      isProfileLoading: false,
      profileError: '',
      loaded: false,
      loadedSessionKey: '',
    };
  },
  actions: {
    resetDynamicSections() {
      const baseContent = getMyPageStaticContent();
      this.summaryCards = baseContent.summaryCards;
      this.orderSteps = baseContent.orderSteps;
      this.recentOrders = baseContent.recentOrders;
      this.wishListItems = baseContent.wishListItems;
      this.recentViewItems = baseContent.recentViewItems;
    },
    async loadProfile() {
      const accountStore = useAccountStore();
      const catalogStore = useCatalogStore();
      accountStore.hydrate();
      const sessionKey = accountStore.accessToken
        ? String(accountStore.memberId ?? accountStore.loginId ?? 'member')
        : '';

      if (!accountStore.accessToken) {
        this.profile = getFallbackMyPageProfile(accountStore);
        this.resetDynamicSections();
        this.profileError = '';
        this.loaded = true;
        this.loadedSessionKey = '';
        return;
      }

      this.isProfileLoading = true;
      this.profileError = '';

      const [, memberResult, ordersResult, reviewsResult] = await Promise.allSettled([
        catalogStore.ensureCatalogLoaded(),
        getCurrentMember(),
        getMyOrders(),
        getMyReviews(),
      ]);

      try {
        if (memberResult.status === 'fulfilled') {
          const memberPayload = unwrapObjectPayload(memberResult.value);
          accountStore.setMemberSession(memberPayload);
          accountStore.setProfileHydrated(true);
          this.profile = normalizeMemberProfile(memberPayload, accountStore);
        } else {
          accountStore.setProfileHydrated(false);
          this.profile = getFallbackMyPageProfile(accountStore);
          this.profileError = '회원 정보를 다시 확인해 주세요.';
        }

        const orders = ordersResult.status === 'fulfilled'
          ? unwrapArrayPayload(ordersResult.value)
          : [];
        const reviews = reviewsResult.status === 'fulfilled'
          ? unwrapArrayPayload(reviewsResult.value)
          : [];

        this.summaryCards = buildSummaryCards(orders, reviews);
        this.orderSteps = buildOrderSteps(orders);
        this.recentOrders = buildRecentOrders(
          orders,
          (productId) => catalogStore.findProductById(productId),
        );
        this.wishListItems = [];
        this.recentViewItems = [];

        if (ordersResult.status === 'rejected' || reviewsResult.status === 'rejected') {
          this.profileError = this.profileError || '마이페이지 데이터를 모두 불러오지 못했습니다.';
        }
      } catch (error) {
        accountStore.setProfileHydrated(false);
        this.profile = getFallbackMyPageProfile(accountStore);
        this.resetDynamicSections();
        this.profileError = '회원 정보를 다시 확인해 주세요.';
        console.error(error);
      } finally {
        this.isProfileLoading = false;
        this.loaded = true;
        this.loadedSessionKey = sessionKey;
      }
    },
  },
});
