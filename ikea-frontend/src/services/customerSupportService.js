import httpRequester from '../libs/httpRequester';

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

  if (Array.isArray(source?.orders)) {
    return source.orders;
  }

  if (Array.isArray(source?.qnas)) {
    return source.qnas;
  }

  return [];
}

function normalizeDigits(value) {
  return String(value ?? '').replace(/\D+/g, '');
}

function formatDisplayDate(value) {
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

function normalizeQnaStatus(source = {}) {
  if (source.status) {
    return String(source.status).trim();
  }

  if (source.answerStatus) {
    return String(source.answerStatus).trim();
  }

  return source.answered || source.answerContent ? '답변완료' : '접수완료';
}

function normalizeQnaRow(source = {}) {
  return {
    id: String(source.qnaId ?? source.id ?? source.questionId ?? '-'),
    title: String(source.title ?? source.questionTitle ?? '문의 제목').trim(),
    status: normalizeQnaStatus(source),
    date: formatDisplayDate(source.createdAt ?? source.regDate ?? source.date),
  };
}

function normalizeGuestOrderItem(source = {}) {
  return {
    name: String(source.productName ?? source.name ?? '주문 상품').trim(),
    quantity: Number(source.quantity ?? 1) || 1,
  };
}

function normalizeGuestOrder(source = {}) {
  return {
    orderNumber: String(source.orderNo ?? source.orderNumber ?? source.id ?? '-').trim(),
    orderedAt: formatDisplayDate(source.orderedAt ?? source.createdAt ?? source.orderDate),
    buyerName: String(source.buyerName ?? source.receiverName ?? source.ordererName ?? '').trim(),
    phoneNumber: normalizeDigits(source.phoneNumber ?? source.receiverPhone ?? source.ordererPhone),
    statusLabel: String(source.statusLabel ?? source.orderStatusLabel ?? source.status ?? '-').trim(),
    paymentMethodLabel: String(source.paymentMethodLabel ?? source.payment ?? '-').trim(),
    finalTotal: Number(source.finalPrice ?? source.totalPrice ?? source.amount ?? 0) || 0,
    orderItems: unwrapArrayPayload(source.orderItems).map((item) => normalizeGuestOrderItem(item)),
  };
}

export async function getCustomerSupportQnaRows() {
  const response = await httpRequester.get('/qna');
  return unwrapArrayPayload(response).map((item) => normalizeQnaRow(item));
}

export async function createCustomerSupportQna(payload) {
  return httpRequester.post('/qna', {
    writer: String(payload.writer ?? '').trim(),
    title: String(payload.title ?? '').trim(),
    content: String(payload.content ?? '').trim(),
  });
}

export async function lookupGuestOrders({ buyerName = '', orderNumber = '', phoneNumber = '' }) {
  const response = await httpRequester.get('/order/guest-lookup', {
    params: {
      buyerName: String(buyerName ?? '').trim(),
      orderNumber: String(orderNumber ?? '').trim(),
      phoneNumber: normalizeDigits(phoneNumber),
    },
  });

  return unwrapArrayPayload(response).map((item) => normalizeGuestOrder(item));
}
