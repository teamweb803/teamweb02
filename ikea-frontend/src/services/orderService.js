import httpRequester from '../libs/httpRequester';

export function createMemberOrder(memberId, orderRequest) {
  return httpRequester.post(`/order/${memberId}`, orderRequest);
}

export function getOrderDetail(orderId) {
  return httpRequester.get(`/order/detail/${orderId}`);
}

export function getMemberOrders(memberId) {
  return httpRequester.get(`/order/${memberId}`);
}

export function cancelMemberOrder(orderId) {
  return httpRequester.delete(`/order/${orderId}`);
}
