export function cloneCartItems(items = []) {
  return items.map((item) => ({ ...item }));
}

function formatDateParts(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return {
    compact: `${year}${month}${day}${hours}${minutes}`,
    label: `${year}.${month}.${day} ${hours}:${minutes}`,
  };
}

function buildOrderNumber(date = new Date()) {
  const { compact } = formatDateParts(date);
  const suffix = String(Math.floor(date.getTime() % 1000000)).padStart(6, '0');

  return `HM${compact}${suffix}`;
}

function buildVirtualAccount(orderNumber, amount, depositorName, banks = [], dueDays = 3) {
  const lastDigits = orderNumber.replace(/\D/g, '').slice(-10).padStart(10, '0');
  const bank = banks[Number(lastDigits.slice(-1)) % banks.length];
  const dueDate = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000);
  const dueDateParts = formatDateParts(dueDate);

  return {
    bankName: bank.name,
    accountNumber: `${bank.prefix}-${lastDigits.slice(0, 4)}-${lastDigits.slice(4)}`,
    depositorName,
    amount,
    dueDate: dueDate.toISOString(),
    dueDateLabel: `${dueDateParts.label}까지`,
  };
}

export function getCheckoutItems(items = [], mode = 'all', itemId = '') {
  if (mode === 'single') {
    const singleItem = items.find((item) => item.productId === String(itemId))
      ?? items[0]
      ?? null;

    return singleItem ? [singleItem] : [];
  }

  if (mode === 'selected') {
    const selectedItems = items.filter((item) => item.selected);
    return selectedItems.length ? selectedItems : (items[0] ? [items[0]] : []);
  }

  return items;
}

export function removeCheckoutItems(items = [], mode = 'all', itemId = '') {
  if (mode === 'single') {
    return items.filter((item) => item.productId !== String(itemId));
  }

  if (mode === 'selected') {
    return items.filter((item) => !item.selected);
  }

  return [];
}

export function buildCompletedOrderSnapshot(
  payload,
  {
    virtualAccountBanks = [],
    virtualAccountDueDays = 3,
  } = {},
) {
  const createdAt = new Date();
  const orderNumber = buildOrderNumber(createdAt);
  const orderedAt = formatDateParts(createdAt).label;
  const completedItems = cloneCartItems(payload.orderItems ?? []);
  const isBankTransfer = payload.paymentMethod === 'bank';

  return {
    orderNumber,
    orderedAt,
    orderedAtIso: createdAt.toISOString(),
    status: isBankTransfer ? 'deposit-pending' : 'paid',
    statusLabel: isBankTransfer ? '입금 대기' : '결제 완료',
    orderItems: completedItems,
    orderCount: completedItems.reduce((sum, item) => sum + item.quantity, 0),
    ordererName: payload.ordererName ?? '',
    ordererPhone: payload.ordererPhone ?? '',
    receiverName: payload.receiverName ?? '',
    receiverPhone: payload.receiverPhone ?? '',
    zoneCode: payload.zoneCode ?? '',
    addressMain: payload.addressMain ?? '',
    addressDetail: payload.addressDetail ?? '',
    deliveryRequest: payload.deliveryRequest ?? '',
    scheduleText: payload.scheduleText ?? '',
    paymentMethod: payload.paymentMethod ?? 'kakaopay',
    paymentMethodLabel: payload.paymentMethodLabel ?? '',
    productTotal: payload.productTotal ?? 0,
    discountTotal: payload.discountTotal ?? 0,
    couponDiscount: payload.couponDiscount ?? 0,
    pointApplied: payload.pointApplied ?? 0,
    shippingTotal: payload.shippingTotal ?? 0,
    finalTotal: payload.finalTotal ?? 0,
    virtualAccount: isBankTransfer
      ? buildVirtualAccount(
        orderNumber,
        payload.finalTotal ?? 0,
        payload.ordererName || payload.receiverName || '주문자',
        virtualAccountBanks,
        virtualAccountDueDays,
      )
      : null,
  };
}
