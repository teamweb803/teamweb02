function normalizeIdentifier(value) {
  return String(value ?? '').trim();
}

function extractOrderDateParts(orderNumber = '') {
  const normalizedOrderNumber = normalizeIdentifier(orderNumber).toUpperCase();
  const matched = normalizedOrderNumber.match(/(?:^|[_-])(\d{4})(\d{2})(\d{2})(?=$|[_-])/);

  if (!matched) {
    return null;
  }

  const [, year, month, day] = matched;
  const candidate = new Date(`${year}-${month}-${day}T00:00:00`);

  if (Number.isNaN(candidate.getTime())) {
    return null;
  }

  if (
    candidate.getFullYear() !== Number(year)
    || candidate.getMonth() + 1 !== Number(month)
    || candidate.getDate() !== Number(day)
  ) {
    return null;
  }

  return { year, month, day };
}

export function resolveOrderDateValue(order = {}) {
  const directValue = normalizeIdentifier(order.createdAt ?? order.orderedAt ?? order.orderDate);

  if (directValue) {
    return directValue;
  }

  const dateParts = extractOrderDateParts(order.orderNo ?? order.orderNumber);

  if (!dateParts) {
    return '';
  }

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

export function resolveOrderDateTimeValue(order = {}) {
  const directValue = normalizeIdentifier(order.createdAt ?? order.orderedAt);

  if (directValue) {
    return directValue;
  }

  const dateValue = resolveOrderDateValue(order);

  if (!dateValue) {
    return '';
  }

  return `${dateValue}T00:00:00`;
}
