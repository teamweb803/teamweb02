import httpRequester from '../libs/httpRequester';
import { ROUTE_PATHS } from '../constants/routes';
import { useAccountStore } from '../stores/account';

function normalizeIdentifier(value) {
  return String(value ?? '').trim();
}

function normalizeNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

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

  return Number(accountStore.memberId);
}

function shouldFallbackPaymentRequest(error, fallbackStatuses = [400, 404, 405]) {
  return fallbackStatuses.includes(Number(error?.status ?? 0));
}

async function runPaymentRequestWithFallback(requestFactories = [], options = {}) {
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

      if (!shouldFallbackPaymentRequest(error, fallbackStatuses)) {
        throw error;
      }
    }
  }

  if (fallbackMessage) {
    throw new Error(fallbackMessage);
  }

  throw lastError ?? new Error('Payment request failed.');
}

function buildMemberQueryConfig(memberId = resolveCurrentMemberId()) {
  return memberId === null ? {} : { params: { memberId } };
}

function resolveClientOrigin() {
  if (typeof window === 'undefined') {
    return 'http://localhost:5173';
  }

  return window.location.origin;
}

function buildReturnUrls(provider = 'kakaopay') {
  const origin = resolveClientOrigin();

  if (provider === 'tosspay') {
    return {
      successUrl: `${origin}${ROUTE_PATHS.paymentTossSuccess}`,
      failUrl: `${origin}${ROUTE_PATHS.paymentTossFail}`,
    };
  }

  return {
    successUrl: `${origin}${ROUTE_PATHS.paymentKakaoSuccess}`,
    cancelUrl: `${origin}${ROUTE_PATHS.paymentKakaoCancel}`,
    failUrl: `${origin}${ROUTE_PATHS.paymentKakaoFail}`,
  };
}

function normalizeReadyResponse(response = {}) {
  const source = response?.data ?? response ?? {};

  return {
    orderId: normalizeNumber(source.orderId, 0) || null,
    orderNumber: normalizeIdentifier(source.orderNo ?? source.orderNumber),
    tid: normalizeIdentifier(source.tid ?? source.paymentKey),
    redirectUrl: normalizeIdentifier(
      source.redirectUrl
      ?? source.checkoutUrl
      ?? source.nextRedirectPcUrl
      ?? source.nextRedirectMobileUrl
      ?? source.checkout?.url,
    ),
  };
}

function buildKakaoReadyBody(orderPayload = {}) {
  const body = {
    ...buildReturnUrls('kakaopay'),
  };
  const orderId = normalizeNumber(orderPayload.orderId, 0);
  const orderNo = normalizeIdentifier(orderPayload.orderNo ?? orderPayload.orderNumber);
  const amount = normalizeNumber(orderPayload.amount, 0);

  if (orderId > 0) {
    body.orderId = orderId;
  }

  if (orderNo) {
    body.orderNo = orderNo;
  }

  if (amount > 0) {
    body.amount = amount;
  }

  return body;
}

function buildTossReadyBody(payload = {}) {
  const body = {
    ...buildReturnUrls('tosspay'),
  };
  const orderId = normalizeNumber(payload.orderId, 0);
  const orderNo = normalizeIdentifier(payload.orderNo ?? payload.orderNumber);
  const amount = normalizeNumber(payload.amount, 0);

  if (orderId > 0) {
    body.orderId = orderId;
  }

  if (orderNo) {
    body.orderNo = orderNo;
  }

  if (amount > 0) {
    body.amount = amount;
  }

  return body;
}

export function getMyPayments() {
  return httpRequester.get('/payment/my');
}

export async function readyKakaoPayment(orderPayload = {}, options = {}) {
  const { isGuestOrder = false } = options;
  const requestBody = buildKakaoReadyBody(orderPayload);
  const requestFactories = isGuestOrder
    ? [
      () => httpRequester.post('/payment/guest/kakao/ready', requestBody),
      () => httpRequester.post('/payment/kakao/guest/ready', requestBody),
    ]
    : [
      () => httpRequester.post('/payment/kakao/ready', requestBody),
      () => httpRequester.post('/payment/kakao/ready', requestBody, buildMemberQueryConfig()),
    ];

  const response = await runPaymentRequestWithFallback(requestFactories, {
    fallbackMessage: isGuestOrder
      ? '비회원 카카오페이 API가 아직 준비되지 않았습니다.'
      : '',
    fallbackStatuses: isGuestOrder ? [0, 400, 401, 404, 405] : [400, 404, 405],
  });

  return normalizeReadyResponse(response);
}

export async function readyTossPayment(orderPayload = {}, options = {}) {
  const { isGuestOrder = false } = options;
  const requestBody = buildTossReadyBody(orderPayload);
  const requestFactories = isGuestOrder
    ? [
      () => httpRequester.post('/payment/guest/toss/ready', requestBody),
      () => httpRequester.post('/payment/toss/guest/ready', requestBody),
    ]
    : [
      () => httpRequester.post('/payment/toss/ready', requestBody),
      () => httpRequester.post('/payment/toss/ready', requestBody, buildMemberQueryConfig()),
    ];

  const response = await runPaymentRequestWithFallback(requestFactories, {
    fallbackMessage: isGuestOrder
      ? '비회원 토스페이 API가 아직 준비되지 않았습니다.'
      : '토스페이 준비 API가 아직 준비되지 않았습니다.',
    fallbackStatuses: isGuestOrder ? [0, 400, 401, 404, 405] : [0, 400, 404, 405],
  });

  return normalizeReadyResponse(response);
}

export async function confirmKakaoPayment(payload = {}, options = {}) {
  const { isGuestOrder = false } = options;
  const requestBody = {
    pgToken: normalizeIdentifier(payload.pgToken),
    tid: normalizeIdentifier(payload.tid),
  };
  const orderId = normalizeNumber(payload.orderId, 0);
  const orderNo = normalizeIdentifier(payload.orderNo ?? payload.orderNumber);
  const amount = normalizeNumber(payload.amount, 0);

  if (orderId > 0) {
    requestBody.orderId = orderId;
  }

  if (orderNo) {
    requestBody.orderNo = orderNo;
  }

  if (amount > 0) {
    requestBody.amount = amount;
  }

  const requestFactories = isGuestOrder
    ? [
      () => httpRequester.post('/payment/guest/confirm/kakao', requestBody),
      () => httpRequester.post('/payment/confirm/kakao/guest', requestBody),
    ]
    : [
      () => httpRequester.post('/payment/confirm/kakao', requestBody),
      () => httpRequester.post('/payment/confirm/kakao', requestBody, buildMemberQueryConfig()),
    ];

  return runPaymentRequestWithFallback(requestFactories, {
    fallbackMessage: isGuestOrder
      ? '비회원 카카오페이 승인 API가 아직 준비되지 않았습니다.'
      : '',
    fallbackStatuses: isGuestOrder ? [0, 400, 401, 404, 405] : [400, 404, 405],
  });
}

export async function confirmTossPayment(payload = {}, options = {}) {
  const { isGuestOrder = false } = options;
  const requestBody = {
    paymentKey: normalizeIdentifier(payload.paymentKey),
    orderNo: normalizeIdentifier(payload.orderNo ?? payload.orderNumber),
    amount: normalizeNumber(payload.amount, 0),
  };
  const requestFactories = isGuestOrder
    ? [
      () => httpRequester.post('/payment/guest/confirm/toss', requestBody),
      () => httpRequester.post('/payment/confirm/toss/guest', requestBody),
    ]
    : [
      () => httpRequester.post('/payment/confirm/toss', requestBody),
      () => httpRequester.post('/payment/confirm/toss', requestBody, buildMemberQueryConfig()),
    ];

  return runPaymentRequestWithFallback(requestFactories, {
    fallbackMessage: isGuestOrder
      ? '비회원 토스페이 승인 API가 아직 준비되지 않았습니다.'
      : '',
    fallbackStatuses: isGuestOrder ? [0, 400, 401, 404, 405] : [400, 404, 405],
  });
}
