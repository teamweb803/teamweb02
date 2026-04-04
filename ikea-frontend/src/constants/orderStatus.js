export const ORDER_STATUS_LABELS = Object.freeze({
  PENDING: '결제 대기',
  PAID: '결제 완료',
  ORDERED: '주문 접수',
  DELIVERING: '배송 중',
  COMPLETED: '배송 완료',
  CANCELLED: '취소 완료',
});

const ORDER_STATUS_ALIASES = Object.freeze({
  READY: 'ORDERED',
  PREPARING: 'ORDERED',
  SHIPPING: 'DELIVERING',
  DELIVERED: 'COMPLETED',
});

export const ORDER_STATUS_SUMMARY_STEPS = Object.freeze([
  { id: 'pending', code: 'PENDING', label: ORDER_STATUS_LABELS.PENDING },
  { id: 'paid', code: 'PAID', label: ORDER_STATUS_LABELS.PAID },
  { id: 'ordered', code: 'ORDERED', label: ORDER_STATUS_LABELS.ORDERED },
  { id: 'delivering', code: 'DELIVERING', label: ORDER_STATUS_LABELS.DELIVERING },
  { id: 'completed', code: 'COMPLETED', label: ORDER_STATUS_LABELS.COMPLETED },
]);

export function normalizeOrderStatusCode(value) {
  const normalizedValue = String(value ?? '').trim().toUpperCase();

  if (!normalizedValue) {
    return '';
  }

  return ORDER_STATUS_ALIASES[normalizedValue] ?? normalizedValue;
}

export function getOrderStatusLabel(value, fallback = '-') {
  const normalizedStatus = normalizeOrderStatusCode(value);

  if (normalizedStatus && ORDER_STATUS_LABELS[normalizedStatus]) {
    return ORDER_STATUS_LABELS[normalizedStatus];
  }

  return String(value ?? '').trim() || fallback;
}

export function createEmptyOrderStatusSteps() {
  return ORDER_STATUS_SUMMARY_STEPS.map((step) => ({
    id: step.id,
    label: step.label,
    count: 0,
  }));
}

export function buildOrderStatusSteps(statusCounts = {}) {
  return ORDER_STATUS_SUMMARY_STEPS.map((step) => ({
    id: step.id,
    label: step.label,
    count: Number(statusCounts[step.code] ?? 0) || 0,
  }));
}

export function canCancelOrder(value) {
  return normalizeOrderStatusCode(value) === 'PENDING';
}

export function canCancelPayment(value) {
  const normalizedStatus = normalizeOrderStatusCode(value);
  return normalizedStatus === 'PAID' || normalizedStatus === 'ORDERED';
}
