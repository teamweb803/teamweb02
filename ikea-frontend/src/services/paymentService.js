import httpRequester from '../libs/httpRequester';

export function getMyPayments() {
  return httpRequester.get('/payment/my');
}

export function readyKakaoPayment(orderIdOrPayload) {
  const orderId = typeof orderIdOrPayload === 'object'
    ? orderIdOrPayload?.orderId
    : orderIdOrPayload;

  return httpRequester.post('/payment/kakao/ready', {
    orderId: Number(orderId),
  });
}

export function confirmKakaoPayment(payload = {}) {
  return httpRequester.post('/payment/confirm/kakao', {
    pgToken: String(payload.pgToken ?? '').trim(),
    tid: String(payload.tid ?? '').trim(),
    orderId: Number(payload.orderId),
  });
}

export function confirmTossPayment(payload = {}) {
  return httpRequester.post('/payment/confirm/toss', {
    paymentKey: String(payload.paymentKey ?? '').trim(),
    orderNo: String(payload.orderNo ?? '').trim(),
    amount: Number(payload.amount ?? 0),
  });
}
