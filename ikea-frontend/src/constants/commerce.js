export const COMMERCE_SESSION_KEYS = Object.freeze({
  cart: 'homio-commerce-cart',
  orderCompletion: 'homio-last-completed-order',
  guestOrderHistory: 'homio-guest-order-history',
  pendingPayment: 'homio-pending-payment',
});

export const VIRTUAL_ACCOUNT_BANKS = Object.freeze([
  { name: '하나은행', prefix: '391' },
  { name: '국민은행', prefix: '527' },
  { name: '신한은행', prefix: '110' },
]);

export const VIRTUAL_ACCOUNT_DUE_DAYS = 1;
