import { COMMERCE_SESSION_KEYS } from '../constants/commerce';

const CUSTOMER_QNA_STORAGE_KEY = 'homio-customer-qna';

const fallbackQnaRows = [
  {
    id: 1,
    title: '배송 일정 문의',
    status: '답변완료',
    date: '2026.03.25',
    writer: '김민지',
    phoneNumber: '01022561104',
    type: '배송',
    content: '소파 설치 가능 일정을 확인하고 싶습니다.',
  },
  {
    id: 2,
    title: '교환 가능 여부 문의',
    status: '접수완료',
    date: '2026.03.21',
    writer: '박도윤',
    phoneNumber: '01088249921',
    type: '교환/반품',
    content: '색상 교환이 가능한지 문의드립니다.',
  },
  {
    id: 3,
    title: '비회원 주문 조회 문의',
    status: '답변완료',
    date: '2026.03.18',
    writer: '이현우',
    phoneNumber: '01044483381',
    type: '주문/결제',
    content: '비회원 주문조회 방법을 확인하고 싶습니다.',
  },
  {
    id: 4,
    title: '배송비 및 설치비 확인 문의',
    status: '답변완료',
    date: '2026.03.15',
    writer: '정유리',
    phoneNumber: '01066211212',
    type: '배송',
    content: '지방권 배송비와 설치비를 함께 문의드립니다.',
  },
  {
    id: 5,
    title: '주소 변경 가능 여부 문의',
    status: '접수완료',
    date: '2026.03.12',
    writer: '최대훈',
    phoneNumber: '01090231717',
    type: '배송',
    content: '주문 후 배송지 변경이 가능한지 확인 부탁드립니다.',
  },
  {
    id: 6,
    title: '주문 취소 처리 상태 문의',
    status: '답변완료',
    date: '2026.03.09',
    writer: '서하림',
    phoneNumber: '01030072323',
    type: '주문/결제',
    content: '취소 접수 후 환불 일정이 궁금합니다.',
  },
];

const fallbackGuestOrders = [
  {
    orderNumber: '2403201089',
    orderedAt: '2026.03.22 10:10',
    buyerName: '김지민',
    phoneNumber: '01012345678',
    statusLabel: '결제완료',
    paymentMethodLabel: '신용카드',
    finalTotal: 2240000,
    orderItems: [{ name: '아일랜드 모듈 소파', quantity: 1 }],
  },
  {
    orderNumber: '2403190941',
    orderedAt: '2026.03.25 09:40',
    buyerName: '박서준',
    phoneNumber: '01099887766',
    statusLabel: '배송중',
    paymentMethodLabel: '무통장입금',
    finalTotal: 1480000,
    orderItems: [{ name: '라운지 글로우 테이블', quantity: 1 }],
  },
];

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeDigits(value) {
  return String(value ?? '').replace(/\D+/g, '');
}

function formatDisplayDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function readStoredQnaRows() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CUSTOMER_QNA_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredQnaRows(rows) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(CUSTOMER_QNA_STORAGE_KEY, JSON.stringify(rows));
}

function readLatestCompletedOrder() {
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(COMMERCE_SESSION_KEYS.orderCompletion);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getCustomerSupportQnaRows() {
  return [...readStoredQnaRows(), ...fallbackQnaRows];
}

export function createCustomerSupportQna(payload) {
  const createdAt = new Date();
  const createdRow = {
    id: `local-${createdAt.getTime()}`,
    title: payload.title.trim(),
    status: '접수완료',
    date: formatDisplayDate(createdAt),
    writer: payload.writer.trim(),
    phoneNumber: normalizeDigits(payload.phoneNumber),
    email: payload.email.trim(),
    type: payload.type.trim(),
    content: payload.content.trim(),
  };

  writeStoredQnaRows([createdRow, ...readStoredQnaRows()]);
  return createdRow;
}

export function getGuestLookupOrders() {
  const latestOrder = readLatestCompletedOrder();
  const sessionOrder = latestOrder?.orderNumber
    ? {
        orderNumber: latestOrder.orderNumber,
        orderedAt: latestOrder.orderedAt,
        buyerName: latestOrder.receiverName || latestOrder.ordererName || '',
        phoneNumber: normalizeDigits(latestOrder.receiverPhone || latestOrder.ordererPhone || ''),
        statusLabel: latestOrder.statusLabel,
        paymentMethodLabel: latestOrder.paymentMethodLabel,
        finalTotal: latestOrder.finalTotal,
        orderItems: latestOrder.orderItems ?? [],
      }
    : null;

  const orders = sessionOrder ? [sessionOrder, ...fallbackGuestOrders] : fallbackGuestOrders;
  return [...new Map(orders.map((order) => [order.orderNumber, order])).values()];
}

export function lookupGuestOrders({ buyerName = '', orderNumber = '', phoneNumber = '' }) {
  const normalizedName = String(buyerName ?? '').trim();
  const normalizedOrderNumber = String(orderNumber ?? '').trim();
  const normalizedPhoneNumber = normalizeDigits(phoneNumber);

  return getGuestLookupOrders().filter((order) => {
    const nameMatches = !normalizedName || order.buyerName === normalizedName;
    const orderMatches = !normalizedOrderNumber || order.orderNumber === normalizedOrderNumber;
    const phoneMatches = !normalizedPhoneNumber || normalizeDigits(order.phoneNumber) === normalizedPhoneNumber;

    return nameMatches && orderMatches && phoneMatches;
  });
}
