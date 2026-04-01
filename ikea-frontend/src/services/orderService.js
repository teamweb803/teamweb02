import httpRequester from '../libs/httpRequester';
import { useAccountStore } from '../stores/account';

function resolveCurrentMemberId() {
  const accountStore = useAccountStore();
  accountStore.hydrate();

  if (
    accountStore.memberId === null
    || accountStore.memberId === undefined
    || accountStore.memberId === ''
  ) {
    return null;
  }

  return accountStore.memberId;
}

function resolveOrderRequest(memberIdOrOrderRequest, maybeOrderRequest) {
  if (maybeOrderRequest !== undefined) {
    return maybeOrderRequest;
  }

  return memberIdOrOrderRequest ?? {};
}

function shouldFallbackOrderRequest(error, fallbackStatuses = [400, 404, 405]) {
  return fallbackStatuses.includes(Number(error?.status ?? 0));
}

async function runOrderRequestWithFallback(requestFactories = [], options = {}) {
  const {
    fallbackMessage = '',
    fallbackStatuses = [400, 404, 405],
  } = options;
  let lastError = null;

  for (let index = 0; index < requestFactories.length; index += 1) {
    const requestFactory = requestFactories[index];

    try {
      return await requestFactory();
    } catch (error) {
      lastError = error;

      if (!shouldFallbackOrderRequest(error, fallbackStatuses)) {
        throw error;
      }
    }
  }

  if (fallbackMessage) {
    throw new Error(fallbackMessage);
  }

  throw lastError ?? new Error('Order request failed.');
}

function buildLegacyMemberOrderPath() {
  const memberId = resolveCurrentMemberId();
  return memberId === null ? '' : `/order/${memberId}`;
}

export async function createMyOrder(memberIdOrOrderRequest, maybeOrderRequest) {
  const orderRequest = resolveOrderRequest(memberIdOrOrderRequest, maybeOrderRequest);
  const legacyPath = buildLegacyMemberOrderPath();
  const requestFactories = [
    () => httpRequester.post('/order/me', orderRequest),
    () => httpRequester.post('/order', orderRequest),
  ];

  if (legacyPath) {
    requestFactories.push(() => httpRequester.post(legacyPath, orderRequest));
  }

  return runOrderRequestWithFallback(requestFactories);
}

export async function createGuestOrder(orderRequest = {}) {
  return runOrderRequestWithFallback(
    [
      () => httpRequester.post('/order/guest', orderRequest),
      () => httpRequester.post('/guest/order', orderRequest),
    ],
    {
      fallbackMessage: '비회원 주문 API가 아직 준비되지 않았습니다.',
      fallbackStatuses: [0, 400, 401, 404, 405],
    },
  );
}

export function createMemberOrder(memberIdOrOrderRequest, maybeOrderRequest) {
  if (maybeOrderRequest !== undefined) {
    return httpRequester.post(`/order/${memberIdOrOrderRequest}`, maybeOrderRequest);
  }

  return createMyOrder(memberIdOrOrderRequest);
}

export function getOrderDetail(orderId) {
  return httpRequester.get(`/order/detail/${orderId}`);
}

export async function getMyOrders() {
  const legacyPath = buildLegacyMemberOrderPath();
  const requestFactories = [
    () => httpRequester.get('/order/me'),
    () => httpRequester.get('/order'),
  ];

  if (legacyPath) {
    requestFactories.push(() => httpRequester.get(legacyPath));
  }

  return runOrderRequestWithFallback(requestFactories);
}

export function getMemberOrders(memberId) {
  if (memberId !== undefined) {
    return httpRequester.get(`/order/${memberId}`);
  }

  return getMyOrders();
}

export function cancelMemberOrder(orderId) {
  return httpRequester.delete(`/order/${orderId}`);
}
