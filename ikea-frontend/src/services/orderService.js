import httpRequester from '../libs/httpRequester';

function resolveOrderRequest(memberIdOrOrderRequest, maybeOrderRequest) {
  if (maybeOrderRequest !== undefined) {
    return maybeOrderRequest;
  }

  return memberIdOrOrderRequest ?? {};
}

export async function createMyOrder(memberIdOrOrderRequest, maybeOrderRequest) {
  const orderRequest = resolveOrderRequest(memberIdOrOrderRequest, maybeOrderRequest);
  return httpRequester.post('/order', orderRequest);
}

export async function createGuestOrder(orderRequest = {}) {
  return httpRequester.post('/order/guest', orderRequest);
}

export function createMemberOrder(memberIdOrOrderRequest, maybeOrderRequest) {
  return createMyOrder(memberIdOrOrderRequest, maybeOrderRequest);
}

export function getOrderDetail(orderId) {
  return httpRequester.get(`/order/detail/${orderId}`);
}

export async function getMyOrders() {
  return httpRequester.get('/order');
}

export function getMemberOrders(_memberId) {
  return getMyOrders();
}

export function cancelMemberOrder(orderId) {
  return httpRequester.delete(`/order/${orderId}`);
}
