import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { useAccountStore } from './account';
import {
  COMMERCE_SESSION_KEYS,
  VIRTUAL_ACCOUNT_BANKS,
  VIRTUAL_ACCOUNT_DUE_DAYS,
} from '../constants/commerce';
import { buildProductDetailPath } from '../constants/routes';
import { createCommerceCartItem } from '../data/commerceSeed';
import {
  addCartItem as addCartItemRequest,
  deleteCartItem as deleteCartItemRequest,
  getFallbackRecommendations,
  getMyCart,
  updateCartItemQuantity,
} from '../services/cartService';
import {
  buildCompletedOrderSnapshot,
  getCheckoutItems,
  removeCheckoutItems,
} from '../mappers/commerceMapper';
import {
  buildGuestOrderRequest,
  buildMemberOrderRequest,
} from '../mappers/orderRequestMapper';
import {
  cancelMemberOrder,
  createGuestOrder,
  createMyOrder,
  getOrderDetail,
} from '../services/orderService';
import {
  confirmKakaoPayment,
  confirmTossPayment,
  readyKakaoPayment,
  readyTossPayment,
} from '../services/paymentService';
import {
  decorateStorefrontItems,
  primeStorefrontInventory,
  resolveStorefrontAvailability,
} from '../services/storefrontStockService';

const STORAGE_KEY = COMMERCE_SESSION_KEYS.cart;
const ORDER_COMPLETION_KEY = COMMERCE_SESSION_KEYS.orderCompletion;
const GUEST_ORDER_HISTORY_KEY = COMMERCE_SESSION_KEYS.guestOrderHistory;
const PENDING_PAYMENT_KEY = COMMERCE_SESSION_KEYS.pendingPayment;
const GUEST_ORDER_HISTORY_LIMIT = 20;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function normalizeIdentifier(value) {
  return String(value ?? '').trim();
}

function normalizeInteger(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildOrderItemSignature(items = []) {
  return items
    .map((item) => `${normalizeIdentifier(item.productId)}:${Math.max(1, normalizeInteger(item.quantity, 1))}`)
    .sort()
    .join('|');
}

function unwrapArrayPayload(payload) {
  const source = payload?.data ?? payload;

  if (Array.isArray(source)) {
    return source;
  }

  if (Array.isArray(source?.cartItems)) {
    return source.cartItems;
  }

  if (Array.isArray(source?.items)) {
    return source.items;
  }

  if (Array.isArray(source?.content)) {
    return source.content;
  }

  return [];
}

function unwrapObjectPayload(payload) {
  return payload?.data ?? payload ?? {};
}

function resolveOrderId(payload) {
  const source = unwrapObjectPayload(payload);
  const candidate = source?.orderId ?? source?.id ?? source;

  if (typeof candidate === 'number' && Number.isFinite(candidate)) {
    return candidate;
  }

  const normalizedCandidate = normalizeIdentifier(candidate);

  if (/^\d+$/.test(normalizedCandidate)) {
    return Number(normalizedCandidate);
  }

  return null;
}

function resolveOrderStatusLabel(statusCode, isBankTransfer = false) {
  const normalizedStatus = normalizeIdentifier(statusCode).toUpperCase();

  switch (normalizedStatus) {
    case 'PENDING':
    case 'ORDERED':
      return isBankTransfer ? '입금 대기' : '주문 접수';
    case 'PAID':
    case 'COMPLETED':
      return '주문 완료';
    case 'DELIVERING':
      return '배송 중';
    case 'DELIVERED':
      return '배송 완료';
    case 'CANCELLED':
      return '주문 취소';
    default:
      return isBankTransfer ? '입금 대기' : '주문 완료';
  }
}

function buildStorefrontCartItem(productId, overrides = {}) {
  const normalizedProductId = normalizeIdentifier(productId);
  const cartItemId = normalizeIdentifier(
    overrides.cartItemId ?? overrides.id ?? `cart-${normalizedProductId || 'item'}`,
  );
  const seededOverrides = {
    id: cartItemId,
    cartItemId,
    productId: normalizedProductId,
    quantity: Math.max(1, normalizeInteger(overrides.quantity, 1)),
    selected: overrides.selected ?? true,
  };

  Object.entries(overrides).forEach(([key, value]) => {
    if (value !== undefined) {
      seededOverrides[key] = value;
    }
  });

  try {
    return createCommerceCartItem(normalizedProductId, seededOverrides);
  } catch {
    const resolvedPrice = Number.isFinite(Number(overrides.price))
      ? Number(overrides.price)
      : 0;
    const resolvedOriginalPrice = Number.isFinite(Number(overrides.originalPrice))
      ? Number(overrides.originalPrice)
      : resolvedPrice;

    return {
      id: cartItemId,
      cartItemId,
      productId: normalizedProductId,
      selected: overrides.selected ?? true,
      brand: overrides.brand ?? 'HOMiO',
      seller: overrides.seller ?? 'HOMiO',
      deliveryLabel: overrides.deliveryLabel ?? 'HOMiO Shipping',
      deliverySubLabel: overrides.deliverySubLabel ?? 'Shipping details are confirmed at checkout.',
      name: overrides.name ?? 'Product',
      option: overrides.option ?? 'Option details',
      image: overrides.image ?? '',
      quantity: Math.max(1, normalizeInteger(overrides.quantity, 1)),
      price: resolvedPrice,
      originalPrice: resolvedOriginalPrice,
      shippingText: overrides.shippingText ?? 'Standard Shipping',
      shippingSubText: overrides.shippingSubText ?? 'Shipping details are confirmed at checkout.',
      shippingNote: overrides.shippingNote ?? overrides.shippingSubText ?? '',
      shippingLink: overrides.shippingLink ?? 'Shipping guide',
      detailPath: overrides.detailPath ?? buildProductDetailPath(normalizedProductId),
      categoryLabel: overrides.categoryLabel ?? '',
      label: overrides.label ?? '',
      color: overrides.color ?? '',
      material: overrides.material ?? '',
    };
  }
}

function mapRemoteCartItem(source = {}) {
  const productId = normalizeIdentifier(source.productId);
  const quantity = Math.max(1, normalizeInteger(source.quantity, 1));
  const cartItemId = normalizeIdentifier(source.cartItemId ?? source.id ?? `cart-${productId}`);
  const hasPrice = Number.isFinite(Number(source.price));
  const baseItem = buildStorefrontCartItem(productId, {
    id: cartItemId,
    cartItemId,
    productId,
    quantity,
    selected: true,
  });
  const resolvedPrice = hasPrice ? Number(source.price) : Number(baseItem.price ?? 0);
  const resolvedOriginalPrice = Number.isFinite(Number(source.originalPrice))
    ? Number(source.originalPrice)
    : Number(baseItem.originalPrice ?? resolvedPrice);

  return {
    ...baseItem,
    id: cartItemId || baseItem.id,
    cartItemId: cartItemId || baseItem.cartItemId || baseItem.id,
    productId: productId || normalizeIdentifier(baseItem.productId),
    name: source.productName ?? source.name ?? baseItem.name,
    image: source.imgPath ?? source.image ?? baseItem.image,
    quantity,
    price: resolvedPrice,
    originalPrice: resolvedOriginalPrice,
    totalPrice: Number.isFinite(Number(source.totalPrice))
      ? Number(source.totalPrice)
      : resolvedPrice * quantity,
    selected: true,
  };
}

function mergeCompletedOrderSnapshot(localSnapshot, remotePayload) {
  const source = unwrapObjectPayload(remotePayload);
  const nextSnapshot = {
    ...localSnapshot,
  };
  const normalizedStatus = normalizeIdentifier(source.orderStatus ?? source.status).toUpperCase();
  const paymentMethodLabel = normalizeIdentifier(
    source.payment ?? source.paymentMethodLabel ?? localSnapshot.paymentMethodLabel,
  );

  if (source.orderId !== undefined && source.orderId !== null) {
    nextSnapshot.orderId = source.orderId;
  }

  if (source.orderNo || source.orderNumber) {
    nextSnapshot.orderNumber = source.orderNo ?? source.orderNumber;
  }

  if (paymentMethodLabel) {
    nextSnapshot.paymentMethodLabel = paymentMethodLabel;
  }

  if (normalizedStatus) {
    nextSnapshot.status = normalizedStatus.toLowerCase();
    nextSnapshot.statusCode = normalizedStatus;
    nextSnapshot.statusLabel = resolveOrderStatusLabel(
      normalizedStatus,
      nextSnapshot.paymentMethod === 'bank',
    );
  }

  if (Number.isFinite(Number(source.totalPrice))) {
    nextSnapshot.productTotal = Number(source.totalPrice);
  }

  if (Number.isFinite(Number(source.finalPrice))) {
    nextSnapshot.finalTotal = Number(source.finalPrice);
  }

  if (Array.isArray(source.orderItems) && source.orderItems.length) {
    const remoteItems = source.orderItems.map((item, index) => {
      const productId = normalizeIdentifier(item.productId);
      const matchedItem = nextSnapshot.orderItems.find(
        (orderItem) => normalizeIdentifier(orderItem.productId) === productId,
      ) ?? nextSnapshot.orderItems[index] ?? buildStorefrontCartItem(productId);
      const quantity = Math.max(1, normalizeInteger(item.quantity, matchedItem.quantity ?? 1));
      const hasOrderPrice = Number.isFinite(Number(item.orderPrice ?? item.price));
      const resolvedPrice = hasOrderPrice
        ? Number(item.orderPrice ?? item.price)
        : Number(matchedItem.price ?? 0);

      return {
        ...matchedItem,
        id: normalizeIdentifier(item.orderItemId ?? matchedItem.id ?? `${productId}-${index}`),
        orderItemId: normalizeIdentifier(item.orderItemId ?? ''),
        productId: productId || normalizeIdentifier(matchedItem.productId),
        name: item.productName ?? matchedItem.name,
        quantity,
        price: resolvedPrice,
        originalPrice: Number.isFinite(Number(item.originalPrice))
          ? Number(item.originalPrice)
          : Number(matchedItem.originalPrice ?? resolvedPrice),
        totalPrice: Number.isFinite(Number(item.totalPrice))
          ? Number(item.totalPrice)
          : resolvedPrice * quantity,
      };
    });

    nextSnapshot.orderItems = remoteItems;
    nextSnapshot.orderCount = remoteItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  return nextSnapshot;
}

function syncCartItemsWithAvailability(items = []) {
  return decorateStorefrontItems(items).map((item) => ({
    ...item,
    selected: item.isSoldOut ? false : Boolean(item.selected),
  }));
}

function readStoredCart() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length
      ? syncCartItemsWithAvailability(parsed)
      : [];
  } catch {
    return [];
  }
}

function writeStoredCart(items) {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function readStoredCompletedOrder() {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(ORDER_COMPLETION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredCompletedOrder(orderSnapshot) {
  if (!canUseStorage()) {
    return;
  }

  if (!orderSnapshot) {
    window.sessionStorage.removeItem(ORDER_COMPLETION_KEY);
    return;
  }

  window.sessionStorage.setItem(ORDER_COMPLETION_KEY, JSON.stringify(orderSnapshot));
}

function readStoredGuestOrderHistory() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(GUEST_ORDER_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredGuestOrderHistory(orderSnapshots) {
  if (!canUseStorage()) {
    return;
  }

  if (!Array.isArray(orderSnapshots) || !orderSnapshots.length) {
    window.sessionStorage.removeItem(GUEST_ORDER_HISTORY_KEY);
    return;
  }

  window.sessionStorage.setItem(GUEST_ORDER_HISTORY_KEY, JSON.stringify(orderSnapshots));
}

function readStoredPendingPayment() {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(PENDING_PAYMENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredPendingPayment(paymentSnapshot) {
  if (!canUseStorage()) {
    return;
  }

  if (!paymentSnapshot) {
    window.sessionStorage.removeItem(PENDING_PAYMENT_KEY);
    return;
  }

  window.sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(paymentSnapshot));
}

function normalizePaymentMethodCode(value) {
  const normalizedValue = normalizeIdentifier(value).toUpperCase();

  switch (normalizedValue) {
    case 'KAKAO':
    case 'KAKAOPAY':
    case 'KAKAO_PAY':
      return 'kakaopay';
    case 'TOSS':
    case 'TOSSPAY':
    case 'TOSS_PAY':
      return 'tosspay';
    case 'BANK':
    case 'VIRTUAL_ACCOUNT':
      return 'bank';
    case 'CARD':
      return 'card';
    default:
      return '';
  }
}

function isExternalCheckoutPaymentMethod(paymentMethod = '') {
  const normalizedPaymentMethod = normalizePaymentMethodCode(paymentMethod);
  return normalizedPaymentMethod === 'kakaopay' || normalizedPaymentMethod === 'tosspay';
}

function resolvePaymentMethodLabel(paymentMethodCode, fallbackLabel = '') {
  switch (normalizePaymentMethodCode(paymentMethodCode)) {
    case 'kakaopay':
      return '카카오페이';
    case 'tosspay':
      return '토스페이';
    case 'bank':
      return '무통장입금';
    case 'card':
      return '신용카드';
    default:
      return fallbackLabel;
  }
}

function resolvePaymentStatusLabel(statusCode, fallbackLabel = '결제 완료') {
  const normalizedStatus = normalizeIdentifier(statusCode).toUpperCase();

  switch (normalizedStatus) {
    case 'READY':
      return '결제 진행 중';
    case 'PENDING':
      return '결제 대기';
    case 'PAID':
    case 'DONE':
    case 'SUCCESS':
    case 'APPROVED':
      return '결제 완료';
    case 'CANCELLED':
    case 'CANCELED':
      return '결제 취소';
    case 'FAILED':
    case 'FAIL':
      return '결제 실패';
    default:
      return fallbackLabel;
  }
}

function mergePaymentSnapshot(snapshot = {}, paymentPayload) {
  const source = unwrapObjectPayload(paymentPayload);
  const nextSnapshot = {
    ...snapshot,
  };
  const paymentMethodCode = source?.paymentMethod;
  const paymentStatusCode = normalizeIdentifier(source?.paymentStatus).toUpperCase();

  if (source?.orderId !== undefined && source?.orderId !== null) {
    nextSnapshot.orderId = source.orderId;
  }

  if (source?.orderNo) {
    nextSnapshot.orderNumber = source.orderNo;
  }

  if (Number.isFinite(Number(source?.amount))) {
    nextSnapshot.finalTotal = Number(source.amount);
  }

  if (paymentMethodCode) {
    const resolvedPaymentMethod = normalizePaymentMethodCode(paymentMethodCode);

    if (resolvedPaymentMethod) {
      nextSnapshot.paymentMethod = resolvedPaymentMethod;
    }

    nextSnapshot.paymentMethodLabel = resolvePaymentMethodLabel(
      paymentMethodCode,
      nextSnapshot.paymentMethodLabel,
    );
  }

  if (paymentStatusCode) {
    nextSnapshot.statusCode = paymentStatusCode;
    nextSnapshot.status = paymentStatusCode.toLowerCase();
    nextSnapshot.statusLabel = resolvePaymentStatusLabel(
      paymentStatusCode,
      nextSnapshot.statusLabel,
    );
  }

  nextSnapshot.virtualAccount = null;
  return nextSnapshot;
}

export const useCartStore = defineStore('cart', () => {
  const accountStore = useAccountStore();
  accountStore.hydrate();

  const cartItems = ref(accountStore.accessToken ? [] : readStoredCart());
  const completedOrder = ref(readStoredCompletedOrder());
  const guestCompletedOrders = ref(readStoredGuestOrderHistory());
  const pendingPayment = ref(readStoredPendingPayment());
  const remoteHydrated = ref(false);
  let pendingRemoteSync = null;

  const selectableItems = computed(() => cartItems.value.filter((item) => !item.isSoldOut));
  const selectedItems = computed(() => selectableItems.value.filter((item) => item.selected));
  const allSelected = computed(() => (
    selectableItems.value.length > 0 && selectableItems.value.every((item) => item.selected)
  ));
  const recommendations = computed(() => getFallbackRecommendations(
    cartItems.value.map((item) => item.productId),
  ));

  function isLoggedIn() {
    accountStore.hydrate();
    return Boolean(accountStore.accessToken);
  }

  watch(
    cartItems,
    (items) => {
      if (!isLoggedIn()) {
        writeStoredCart(items);
      }
    },
    { deep: true },
  );

  watch(
    completedOrder,
    (orderSnapshot) => {
      writeStoredCompletedOrder(orderSnapshot);
    },
    { deep: true },
  );

  watch(
    guestCompletedOrders,
    (orderSnapshots) => {
      writeStoredGuestOrderHistory(orderSnapshots);
    },
    { deep: true },
  );

  watch(
    pendingPayment,
    (paymentSnapshot) => {
      writeStoredPendingPayment(paymentSnapshot);
    },
    { deep: true },
  );

  watch(
    () => accountStore.accessToken,
    (accessToken) => {
      if (accessToken) {
        remoteHydrated.value = false;
        cartItems.value = [];
        void syncRemoteCart().catch(() => {});
        return;
      }

      remoteHydrated.value = false;
      cartItems.value = syncCartItemsWithAvailability(readStoredCart());
    },
  );

  async function syncRemoteCart() {
    if (!isLoggedIn()) {
      remoteHydrated.value = false;
      cartItems.value = syncCartItemsWithAvailability(readStoredCart());
      return cartItems.value;
    }

    if (pendingRemoteSync) {
      return pendingRemoteSync;
    }

    pendingRemoteSync = (async () => {
      const response = await getMyCart();
      const mappedCartItems = unwrapArrayPayload(response).map((item) => mapRemoteCartItem(item));
      await primeStorefrontInventory(mappedCartItems).catch(() => {});
      const nextCartItems = syncCartItemsWithAvailability(mappedCartItems);

      cartItems.value = nextCartItems;
      remoteHydrated.value = true;
      return cartItems.value;
    })();

    try {
      return await pendingRemoteSync;
    } finally {
      pendingRemoteSync = null;
    }
  }

  async function ensureCartLoaded(options = {}) {
    const { force = false } = options;

    if (!isLoggedIn()) {
      cartItems.value = syncCartItemsWithAvailability(readStoredCart());
      return cartItems.value;
    }

    if (!force && remoteHydrated.value) {
      cartItems.value = syncCartItemsWithAvailability(cartItems.value);
      return cartItems.value;
    }

    return syncRemoteCart();
  }

  function setAllSelected(value) {
    cartItems.value = syncCartItemsWithAvailability(
      cartItems.value.map((item) => ({ ...item, selected: value })),
    );
  }

  function setItemSelected(itemId, value) {
    cartItems.value = syncCartItemsWithAvailability(cartItems.value.map((item) => (
      String(item.id) === String(itemId)
        ? { ...item, selected: item.isSoldOut ? false : value }
        : item
    )));
  }

  async function updateQuantity(itemId, delta) {
    if (isLoggedIn()) {
      const targetItem = cartItems.value.find((item) => String(item.id) === String(itemId));

      if (!targetItem || targetItem.isSoldOut) {
        return targetItem ?? null;
      }

      const nextQuantity = Math.max(1, targetItem.quantity + delta);
      await updateCartItemQuantity(targetItem.cartItemId ?? targetItem.id, nextQuantity);
      await syncRemoteCart();
      return cartItems.value.find((item) => String(item.id) === String(itemId)) ?? null;
    }

    cartItems.value = syncCartItemsWithAvailability(cartItems.value).map((item) => {
      if (String(item.id) !== String(itemId)) {
        return item;
      }

      if (item.isSoldOut) {
        return item;
      }

      return {
        ...item,
        quantity: Math.max(1, item.quantity + delta),
      };
    });

    return cartItems.value.find((item) => String(item.id) === String(itemId)) ?? null;
  }

  async function addCartItem(productId, { quantity = 1, selected = true } = {}) {
    const normalizedProductId = normalizeIdentifier(productId);
    const normalizedQuantity = Math.max(1, normalizeInteger(quantity, 1));

    if (!normalizedProductId) {
      return null;
    }

    let availability = resolveStorefrontAvailability({ productId: normalizedProductId });

    if (!availability.isTracked) {
      await primeStorefrontInventory([{ productId: normalizedProductId }]).catch(() => {});
      availability = resolveStorefrontAvailability({ productId: normalizedProductId });
    }

    if (availability.isSoldOut) {
      return null;
    }

    if (isLoggedIn()) {
      await addCartItemRequest({
        productId: Number(normalizedProductId),
        quantity: normalizedQuantity,
      });
      await syncRemoteCart();

      return cartItems.value.find(
        (item) => normalizeIdentifier(item.productId) === normalizedProductId,
      ) ?? null;
    }

    const existingItem = cartItems.value.find(
      (item) => normalizeIdentifier(item.productId) === normalizedProductId,
    );

    if (existingItem) {
      cartItems.value = syncCartItemsWithAvailability(cartItems.value).map((item) => (
        normalizeIdentifier(item.productId) === normalizedProductId
          ? {
            ...item,
            quantity: item.quantity + normalizedQuantity,
            selected,
          }
          : item
      ));

      return cartItems.value.find(
        (item) => normalizeIdentifier(item.productId) === normalizedProductId,
      ) ?? null;
    }

    const createdItem = createCommerceCartItem(normalizedProductId, {
      quantity: normalizedQuantity,
      selected,
    });

    cartItems.value = syncCartItemsWithAvailability([createdItem, ...cartItems.value]);
    return cartItems.value.find(
      (item) => normalizeIdentifier(item.productId) === normalizedProductId,
    ) ?? null;
  }

  async function removeItem(itemId) {
    if (isLoggedIn()) {
      const targetItem = cartItems.value.find((item) => String(item.id) === String(itemId));

      if (!targetItem) {
        return;
      }

      await deleteCartItemRequest(targetItem.cartItemId ?? targetItem.id);
      await syncRemoteCart();
      return;
    }

    cartItems.value = cartItems.value.filter((item) => String(item.id) !== String(itemId));
  }

  async function removeSelected() {
    if (isLoggedIn()) {
      const selectedCartItemIds = cartItems.value
        .filter((item) => item.selected)
        .map((item) => item.cartItemId ?? item.id);

      if (!selectedCartItemIds.length) {
        return;
      }

      await Promise.all(selectedCartItemIds.map((cartItemId) => deleteCartItemRequest(cartItemId)));
      await syncRemoteCart();
      return;
    }

    cartItems.value = cartItems.value.filter((item) => !item.selected);
  }

  function resolveCheckoutItems(mode = 'all', itemId = '') {
    cartItems.value = syncCartItemsWithAvailability(cartItems.value);
    return getCheckoutItems(cartItems.value, mode, itemId);
  }

  function isFullCartCheckout(payload = {}) {
    const checkoutSignature = buildOrderItemSignature(payload.orderItems ?? []);
    const currentCartSignature = buildOrderItemSignature(
      cartItems.value.filter((item) => !item.isSoldOut),
    );

    return Boolean(checkoutSignature) && checkoutSignature === currentCartSignature;
  }

  function ensureSupportedMemberCheckoutScope(payload = {}) {
    if (String(payload.mode ?? 'all') === 'all') {
      return;
    }

    if (isFullCartCheckout(payload)) {
      return;
    }

    throw new Error('현재 선택 주문/바로주문은 백엔드 지원이 없어 전체 주문만 가능합니다.');
  }

  function storeGuestCompletedOrder(orderSnapshot) {
    const orderNumber = normalizeIdentifier(orderSnapshot?.orderNumber);

    if (!orderNumber) {
      return;
    }

    guestCompletedOrders.value = [
      orderSnapshot,
      ...guestCompletedOrders.value.filter(
        (storedOrder) => normalizeIdentifier(storedOrder?.orderNumber) !== orderNumber,
      ),
    ].slice(0, GUEST_ORDER_HISTORY_LIMIT);
  }

  function buildPendingPaymentSnapshot(orderSnapshot, provider, payload = {}, orderId = null) {
    return {
      provider,
      orderId,
      orderNumber: normalizeIdentifier(orderSnapshot.orderNumber),
      tid: '',
      redirectUrl: '',
      amount: Number(orderSnapshot.finalTotal ?? 0),
      requestedAt: new Date().toISOString(),
      checkoutContext: {
        mode: String(payload.mode ?? 'all'),
        itemId: String(payload.itemId ?? ''),
      },
      orderSnapshot: {
        ...orderSnapshot,
        paymentMethod: provider,
        paymentMethodLabel: resolvePaymentMethodLabel(provider, orderSnapshot.paymentMethodLabel),
        status: 'payment-pending',
        statusCode: 'READY',
        statusLabel: '결제 진행 중',
        virtualAccount: null,
      },
    };
  }

  function resolveReadyRedirectUrl(readyResponse = {}) {
    return normalizeIdentifier(
      readyResponse?.redirectUrl
      ?? readyResponse?.checkoutUrl
      ?? readyResponse?.nextRedirectPcUrl
      ?? readyResponse?.nextRedirectMobileUrl,
    );
  }

  async function createMemberCompletedOrderSnapshot(payload) {
    ensureSupportedMemberCheckoutScope(payload);

    const orderSnapshot = {
      ...buildCompletedOrderSnapshot(payload, {
        virtualAccountBanks: VIRTUAL_ACCOUNT_BANKS,
        virtualAccountDueDays: VIRTUAL_ACCOUNT_DUE_DAYS,
      }),
      isGuestOrder: false,
    };
    const createResponse = await createMyOrder(buildMemberOrderRequest(payload));
    const createdOrderId = resolveOrderId(createResponse);
    let orderDetailResponse = null;

    if (createdOrderId !== null) {
      try {
        orderDetailResponse = await getOrderDetail(createdOrderId);
      } catch {
        orderDetailResponse = { orderId: createdOrderId };
      }
    }

    const mergedSnapshot = {
      ...mergeCompletedOrderSnapshot(
        orderSnapshot,
        orderDetailResponse ?? createResponse,
      ),
      isGuestOrder: false,
    };

    if (createdOrderId !== null && mergedSnapshot.orderId === undefined) {
      mergedSnapshot.orderId = createdOrderId;
    }

    return {
      createdOrderId,
      orderDetailResponse,
      orderSnapshot: mergedSnapshot,
    };
  }

  async function createGuestCompletedOrderSnapshot(payload) {
    const orderSnapshot = {
      ...buildCompletedOrderSnapshot(payload, {
        virtualAccountBanks: VIRTUAL_ACCOUNT_BANKS,
        virtualAccountDueDays: VIRTUAL_ACCOUNT_DUE_DAYS,
      }),
      isGuestOrder: true,
    };
    const createResponse = await createGuestOrder(buildGuestOrderRequest(payload));
    const createdOrderId = resolveOrderId(createResponse);
    const mergedSnapshot = {
      ...mergeCompletedOrderSnapshot(orderSnapshot, createResponse),
      isGuestOrder: true,
    };

    if (createdOrderId !== null && mergedSnapshot.orderId === undefined) {
      mergedSnapshot.orderId = createdOrderId;
    }

    return {
      createdOrderId,
      orderSnapshot: mergedSnapshot,
    };
  }

  function resolvePendingOrderId(orderSnapshot = {}, createdOrderId = null) {
    if (createdOrderId !== null) {
      return createdOrderId;
    }

    const orderId = normalizeInteger(orderSnapshot.orderId, 0);
    return orderId > 0 ? orderId : null;
  }

  async function createCheckoutPendingOrderSnapshot(payload) {
    if (isLoggedIn()) {
      return createMemberCompletedOrderSnapshot(payload);
    }

    return createGuestCompletedOrderSnapshot(payload);
  }

  async function finalizeConfirmedPayment(pendingPaymentSnapshot, paymentResponse) {
    const isGuestOrder = Boolean(pendingPaymentSnapshot?.orderSnapshot?.isGuestOrder);
    let baseSnapshot = pendingPaymentSnapshot?.orderSnapshot ?? {};

    if (!isGuestOrder && pendingPaymentSnapshot?.orderId !== null && pendingPaymentSnapshot?.orderId !== undefined) {
      const orderDetailResponse = await getOrderDetail(pendingPaymentSnapshot.orderId)
        .catch(() => ({ orderId: pendingPaymentSnapshot.orderId }));

      baseSnapshot = mergeCompletedOrderSnapshot(baseSnapshot, orderDetailResponse);
    }

    const mergedSnapshot = {
      ...mergePaymentSnapshot(baseSnapshot, paymentResponse),
      isGuestOrder,
    };

    completedOrder.value = mergedSnapshot;
    pendingPayment.value = null;

    if (isGuestOrder) {
      storeGuestCompletedOrder(mergedSnapshot);
      cartItems.value = syncCartItemsWithAvailability(
        removeCheckoutItems(
          cartItems.value,
          pendingPaymentSnapshot?.checkoutContext?.mode ?? 'all',
          pendingPaymentSnapshot?.checkoutContext?.itemId ?? '',
        ),
      );
      return mergedSnapshot;
    }

    await syncRemoteCart();
    return mergedSnapshot;
  }

  async function completeCheckout(payload) {
    const isGuestOrder = !isLoggedIn();

    if (isExternalCheckoutPaymentMethod(payload.paymentMethod)) {
      throw new Error(`${resolvePaymentMethodLabel(payload.paymentMethod, '외부 결제')} 흐름으로 다시 진행해 주세요.`);
    }

    const orderSnapshot = {
      ...buildCompletedOrderSnapshot(payload, {
      virtualAccountBanks: VIRTUAL_ACCOUNT_BANKS,
      virtualAccountDueDays: VIRTUAL_ACCOUNT_DUE_DAYS,
      }),
      isGuestOrder,
    };

    if (isGuestOrder) {
      completedOrder.value = orderSnapshot;
      storeGuestCompletedOrder(orderSnapshot);
      cartItems.value = syncCartItemsWithAvailability(
        removeCheckoutItems(cartItems.value, payload.mode, payload.itemId),
      );
      return orderSnapshot;
    }

    const { orderSnapshot: mergedSnapshot } = await createMemberCompletedOrderSnapshot(payload);
    completedOrder.value = mergedSnapshot;
    pendingPayment.value = null;
    await syncRemoteCart();
    return mergedSnapshot;
  }

  async function startKakaoCheckout(payload) {
    const checkoutPayload = {
      ...payload,
      paymentMethod: 'kakaopay',
      paymentMethodLabel: '카카오페이',
    };
    const isGuestOrder = !isLoggedIn();
    const { createdOrderId, orderSnapshot } = await createCheckoutPendingOrderSnapshot(checkoutPayload);
    const pendingOrderId = resolvePendingOrderId(orderSnapshot, createdOrderId);

    if (pendingOrderId === null && !normalizeIdentifier(orderSnapshot.orderNumber)) {
      throw new Error('결제에 필요한 주문 정보를 확인하지 못했습니다.');
    }

    pendingPayment.value = buildPendingPaymentSnapshot(
      orderSnapshot,
      'kakaopay',
      checkoutPayload,
      pendingOrderId,
    );

    try {
      const readyResponse = await readyKakaoPayment(
        {
          orderId: pendingOrderId,
          orderNo: pendingPayment.value.orderNumber,
          amount: pendingPayment.value.amount,
        },
        { isGuestOrder },
      );
      const redirectUrl = resolveReadyRedirectUrl(readyResponse);

      if (!redirectUrl) {
        throw new Error(
          `카카오페이 결제 창을 열지 못했습니다. 주문번호 ${pendingPayment.value.orderNumber || pendingOrderId}를 확인해 주세요.`,
        );
      }

      pendingPayment.value = {
        ...pendingPayment.value,
        tid: normalizeIdentifier(readyResponse?.tid),
        redirectUrl,
      };
      completedOrder.value = null;

      if (!isGuestOrder) {
        await syncRemoteCart();
      }

      return {
        orderId: pendingOrderId,
        orderNumber: pendingPayment.value.orderNumber,
        redirectUrl,
        tid: pendingPayment.value.tid,
      };
    } catch (error) {
      pendingPayment.value = null;
      throw error;
    }
  }

  async function startTossCheckout(payload) {
    const checkoutPayload = {
      ...payload,
      paymentMethod: 'tosspay',
      paymentMethodLabel: '토스페이',
    };
    const isGuestOrder = !isLoggedIn();
    const { createdOrderId, orderSnapshot } = await createCheckoutPendingOrderSnapshot(checkoutPayload);
    const pendingOrderId = resolvePendingOrderId(orderSnapshot, createdOrderId);

    pendingPayment.value = buildPendingPaymentSnapshot(
      orderSnapshot,
      'tosspay',
      checkoutPayload,
      pendingOrderId,
    );

    try {
      const readyResponse = await readyTossPayment(
        {
          orderId: pendingOrderId,
          orderNo: pendingPayment.value.orderNumber,
          amount: pendingPayment.value.amount,
        },
        { isGuestOrder },
      );
      const redirectUrl = resolveReadyRedirectUrl(readyResponse);

      if (!redirectUrl) {
        throw new Error(
          `토스페이 결제 창을 열지 못했습니다. 주문번호 ${pendingPayment.value.orderNumber || pendingOrderId || ''}를 확인해 주세요.`,
        );
      }

      pendingPayment.value = {
        ...pendingPayment.value,
        redirectUrl,
      };
      completedOrder.value = null;

      if (!isGuestOrder) {
        await syncRemoteCart();
      }

      return {
        orderId: pendingOrderId,
        orderNumber: pendingPayment.value.orderNumber,
        redirectUrl,
      };
    } catch (error) {
      pendingPayment.value = null;
      throw error;
    }
  }

  async function startExternalCheckout(payload) {
    const paymentMethod = normalizePaymentMethodCode(payload.paymentMethod);

    if (paymentMethod === 'kakaopay') {
      return startKakaoCheckout(payload);
    }

    if (paymentMethod === 'tosspay') {
      return startTossCheckout(payload);
    }

    throw new Error('외부 결제수단 정보를 다시 확인해 주세요.');
  }

  async function confirmPendingKakaoPayment(pgToken) {
    const pendingPaymentSnapshot = pendingPayment.value;
    const normalizedPgToken = normalizeIdentifier(pgToken);
    const isGuestOrder = Boolean(pendingPaymentSnapshot?.orderSnapshot?.isGuestOrder);

    if (
      pendingPaymentSnapshot?.provider !== 'kakaopay'
      || (!pendingPaymentSnapshot?.orderId && !pendingPaymentSnapshot?.orderNumber)
      || !pendingPaymentSnapshot?.tid
      || !normalizedPgToken
    ) {
      throw new Error('카카오페이 승인 정보를 다시 확인해 주세요.');
    }

    const paymentResponse = await confirmKakaoPayment(
      {
        pgToken: normalizedPgToken,
        tid: pendingPaymentSnapshot.tid,
        orderId: pendingPaymentSnapshot.orderId,
        orderNo: pendingPaymentSnapshot.orderNumber,
        amount: pendingPaymentSnapshot.amount,
      },
      { isGuestOrder },
    );

    return finalizeConfirmedPayment(pendingPaymentSnapshot, paymentResponse);
  }

  async function confirmPendingTossPayment(payload = {}) {
    const pendingPaymentSnapshot = pendingPayment.value;
    const isGuestOrder = Boolean(pendingPaymentSnapshot?.orderSnapshot?.isGuestOrder);
    const paymentKey = normalizeIdentifier(payload.paymentKey);
    const orderNo = normalizeIdentifier(
      payload.orderNo
      ?? payload.orderNumber
      ?? pendingPaymentSnapshot?.orderNumber,
    );
    const amount = normalizeInteger(
      payload.amount
      ?? pendingPaymentSnapshot?.amount
      ?? pendingPaymentSnapshot?.orderSnapshot?.finalTotal,
      0,
    );

    if (
      pendingPaymentSnapshot?.provider !== 'tosspay'
      || !paymentKey
      || !orderNo
      || amount <= 0
    ) {
      throw new Error('토스페이 승인 정보를 다시 확인해 주세요.');
    }

    const paymentResponse = await confirmTossPayment(
      {
        paymentKey,
        orderNo,
        amount,
      },
      { isGuestOrder },
    );

    return finalizeConfirmedPayment(pendingPaymentSnapshot, paymentResponse);
  }

  async function cancelPendingPaymentFlow() {
    const pendingPaymentSnapshot = pendingPayment.value;

    if (!pendingPaymentSnapshot) {
      return null;
    }

    if (
      !pendingPaymentSnapshot?.orderSnapshot?.isGuestOrder
      && pendingPaymentSnapshot.orderId !== undefined
      && pendingPaymentSnapshot.orderId !== null
    ) {
      try {
        await cancelMemberOrder(pendingPaymentSnapshot.orderId);
      } catch {
        // Keep the UI flow moving even if backend cancellation is unavailable.
      }
    }

    pendingPayment.value = null;
    completedOrder.value = null;

    if (!pendingPaymentSnapshot?.orderSnapshot?.isGuestOrder) {
      await syncRemoteCart().catch(() => {});
    }

    return pendingPaymentSnapshot;
  }

  function refreshAvailability() {
    cartItems.value = syncCartItemsWithAvailability(cartItems.value);
    void primeStorefrontInventory(cartItems.value)
      .then(() => {
        cartItems.value = syncCartItemsWithAvailability(cartItems.value);
      })
      .catch(() => {});
  }

  function getLatestCompletedOrder() {
    return completedOrder.value;
  }

  function getGuestCompletedOrders() {
    return guestCompletedOrders.value;
  }

  function getPendingPayment() {
    return pendingPayment.value;
  }

  if (accountStore.accessToken) {
    void syncRemoteCart().catch(() => {});
  }

  return {
    allSelected,
    cartItems,
    completedOrder,
    confirmPendingKakaoPayment,
    confirmPendingTossPayment,
    recommendations,
    cancelPendingPaymentFlow,
    addCartItem,
    ensureCartLoaded,
    getGuestCompletedOrders,
    getPendingPayment,
    selectedItems,
    completeCheckout,
    getLatestCompletedOrder,
    refreshAvailability,
    removeItem,
    removeSelected,
    resolveCheckoutItems,
    setAllSelected,
    setItemSelected,
    startExternalCheckout,
    startKakaoCheckout,
    syncRemoteCart,
    updateQuantity,
  };
});
