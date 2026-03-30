import httpRequester from '../libs/httpRequester';

export function createMyOrder(memberIdOrOrderRequest, maybeOrderRequest) {
  const orderRequest = maybeOrderRequest === undefined ? memberIdOrOrderRequest : maybeOrderRequest;
  return httpRequester.post('/order', orderRequest);
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
