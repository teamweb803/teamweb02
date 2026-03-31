import httpRequester from '../libs/httpRequester';

function resolveOrderRequest(memberIdOrOrderRequest, maybeOrderRequest) {
  if (maybeOrderRequest !== undefined) {
    return maybeOrderRequest;
  }

  return memberIdOrOrderRequest ?? {};
}

export function createMyOrder(memberIdOrOrderRequest, maybeOrderRequest) {
  return httpRequester.post('/order', resolveOrderRequest(memberIdOrOrderRequest, maybeOrderRequest));
}

export function createMemberOrder(memberIdOrOrderRequest, maybeOrderRequest) {
  return createMyOrder(memberIdOrOrderRequest, maybeOrderRequest);
}

export function getOrderDetail(orderId) {
  return httpRequester.get(`/order/detail/${orderId}`);
}

export function getMyOrders() {
  return httpRequester.get('/order');
}

export function getMemberOrders() {
  return getMyOrders();
}

export function cancelMemberOrder(orderId) {
  return httpRequester.delete(`/order/${orderId}`);
}
