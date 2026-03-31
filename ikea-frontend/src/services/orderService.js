import httpRequester from '../libs/httpRequester';
import { useAccountStore } from '../stores/account';

function resolveCurrentMemberId() {
  const accountStore = useAccountStore();
  accountStore.hydrate();

  if (accountStore.memberId === null || accountStore.memberId === undefined || accountStore.memberId === '') {
    throw new Error('Current memberId is unavailable.');
  }

  return accountStore.memberId;
}

export function createMyOrder(memberIdOrOrderRequest, maybeOrderRequest) {
  if (maybeOrderRequest === undefined) {
    return httpRequester.post(
      `/order/${resolveCurrentMemberId()}`,
      undefined,
      { params: memberIdOrOrderRequest },
    );
  }

  return httpRequester.post(
    `/order/${memberIdOrOrderRequest}`,
    undefined,
    { params: maybeOrderRequest },
  );
}

export function createMemberOrder(memberIdOrOrderRequest, maybeOrderRequest) {
  return createMyOrder(memberIdOrOrderRequest, maybeOrderRequest);
}

export function getOrderDetail(orderId) {
  return httpRequester.get(`/order/detail/${orderId}`);
}

export function getMyOrders(memberId = resolveCurrentMemberId()) {
  return httpRequester.get(`/order/${memberId}`);
}

export function getMemberOrders(memberId = resolveCurrentMemberId()) {
  return getMyOrders(memberId);
}

export function cancelMemberOrder(orderId) {
  return httpRequester.delete(`/order/${orderId}`);
}
