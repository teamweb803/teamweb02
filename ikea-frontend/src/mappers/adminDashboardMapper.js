import {
  buildProductCategoryPath,
  buildProductDetailPath,
  ROUTE_PATHS,
} from '../constants/routes';

const ORDER_STATUS_LABELS = {
  ORDERED: '결제완료',
  DELIVERING: '배송중',
  COMPLETED: '배송완료',
  CANCELLED: '취소',
};

const STATUS_COLORS = {
  ORDERED: '#2759c6',
  DELIVERING: '#4f86f7',
  COMPLETED: '#111111',
  CANCELLED: '#d95f5f',
};

const PAYMENT_LABELS = {
  CARD: '카드결제',
  BANK: '계좌이체',
  KAKAO: '간편결제',
  NAVER: '간편결제',
  TOSS: '간편결제',
  PAYCO: '간편결제',
};

const PAYMENT_COLORS = ['#1c3f94', '#4f86f7', '#88aef2', '#c7d7f7'];

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString('ko-KR');
}

function formatCurrency(value) {
  return `${formatNumber(value)}원`;
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function toOrderStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] ?? status ?? '-';
}

function buildStockSeed(sourceId) {
  const id = String(sourceId ?? '');
  const hash = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  if (hash % 7 === 0) {
    return 3;
  }

  if (hash % 5 === 0) {
    return 7;
  }

  return (hash % 18) + 11;
}

function buildSalesSeed(sourceId, reviews) {
  const id = String(sourceId ?? '');
  const hash = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const reviewBoost = Math.max(1, Math.round(Number(reviews ?? 0) / 45));

  return reviewBoost + (hash % 9) + 4;
}

function resolveStockState(stock) {
  if (stock <= 3) {
    return 'critical';
  }

  if (stock <= 10) {
    return 'warning';
  }

  return 'stable';
}

function buildNormalizedProductMap(products) {
  return products.reduce((result, product) => {
    const key = String(product.name ?? '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    if (!key) {
      return result;
    }

    result.set(key, product);
    return result;
  }, new Map());
}

function findCategoryForProduct(product, categories) {
  if (product.categorySlug) {
    return categories.find((category) => category.slug === product.categorySlug) ?? null;
  }

  return categories.find((category) => category.label === product.categoryName) ?? null;
}

export function createFallbackReviews(orderReviewItems = []) {
  const seededReviews = orderReviewItems
    .filter((item) => item.review)
    .map((item, index) => ({
      reviewId: index + 1,
      memberName: item.orderNo.replace('HS-', ''),
      productName: item.product,
      content: item.review.content,
      rating: item.review.rating,
      createdAt: `2026-03-${18 - index}T10:00:00`,
    }));

  return seededReviews.length
    ? seededReviews
    : [
        {
          reviewId: 1,
          memberName: 'roomtone',
          productName: '아일랜드 모듈 소파',
          content: '조합성이 좋고 패브릭 촉감도 좋아서 가족용 소파로 만족하고 있습니다.',
          rating: 5,
          createdAt: '2026-03-18T10:00:00',
        },
      ];
}

export function createFallbackQnas(qnaThreads = []) {
  return qnaThreads.flatMap((thread) => {
    const question = {
      qnaId: thread.id * 10,
      level: 0,
      parentId: thread.id * 10,
      title: thread.title,
      content: thread.question,
      writer: thread.author,
      createdAt: `${thread.date}T09:00:00`,
    };

    if (!thread.answer) {
      return [question];
    }

    return [
      question,
      {
        qnaId: thread.id * 10 + 1,
        level: 1,
        parentId: thread.id * 10,
        title: `${thread.title} 답변`,
        content: thread.answer,
        writer: '관리자',
        createdAt: `${thread.date}T14:00:00`,
      },
    ];
  });
}

export function createCategoryRows(categories, products) {
  return categories.map((category) => {
    const matchedProducts = products.filter((product) => {
      if (product.categorySlug) {
        return product.categorySlug === category.slug;
      }

      return product.categoryName === category.label;
    });

    const reviewCount = matchedProducts.reduce(
      (sum, product) => sum + Number(product.reviews ?? 0),
      0,
    );

    return {
      id: category.slug,
      label: category.label,
      productCount: matchedProducts.length,
      reviewCount,
      to: buildProductCategoryPath(category.slug),
    };
  });
}

export function createWatchProducts(products) {
  return [...products]
    .sort((left, right) => Number(right.reviews ?? 0) - Number(left.reviews ?? 0))
    .slice(0, 5)
    .map((product) => ({
      id: String(product.id ?? product.productId),
      brand: product.brand ?? 'HOMiO',
      title: product.name,
      categoryLabel: product.categoryLabel ?? product.categoryName ?? '-',
      reviewText: `리뷰 ${formatNumber(product.reviews ?? 0)}개 · 평점 ${Number(product.rating ?? 0).toFixed(1)}`,
      price: formatCurrency(product.price),
      image: product.image ?? product.imgPath,
      to: buildProductDetailPath(product.id ?? product.productId),
    }));
}

export function createQuestionRows(qnas) {
  const answers = new Map();

  qnas.forEach((item) => {
    if (item.level === 1) {
      answers.set(item.parentId, item);
    }
  });

  return qnas
    .filter((item) => item.level === 0)
    .map((item) => {
      const answer = answers.get(item.qnaId);

      return {
        id: item.qnaId,
        title: item.title,
        writer: item.writer,
        status: answer ? '답변완료' : '답변대기',
        date: formatDate(item.createdAt),
        to: ROUTE_PATHS.customerServiceQna,
      };
    })
    .sort((left, right) => (left.status === right.status ? 0 : left.status === '답변대기' ? -1 : 1));
}

export function createReviewRows(reviews) {
  return [...reviews]
    .sort((left, right) => new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime())
    .map((item) => ({
      id: item.reviewId,
      memberName: item.memberName,
      productName: item.productName,
      content: item.content,
      rating: `${item.rating ?? '-'}점`,
      date: formatDate(item.createdAt),
    }));
}

export function createMemberRows(members) {
  return [...members]
    .sort((left, right) => new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime())
    .map((item) => ({
      id: item.memberId,
      name: item.name,
      loginId: item.loginId,
      email: item.email,
      role: item.memberRole,
      date: formatDate(item.createdAt),
      canDelete: item.memberRole === 'USER',
    }));
}

export function createProductRows(products) {
  return products.map((item) => {
    const sourceId = String(item.productId ?? item.id ?? item.name);
    const stock = Number(item.stock ?? buildStockSeed(sourceId));

    return {
      id: sourceId,
      title: item.name,
      categoryName: item.categoryName ?? item.categoryLabel ?? '-',
      price: formatCurrency(item.price),
      image: item.imgPath ?? item.image,
      date: formatDate(item.createdAt),
      stock,
      stockLabel: `${stock}개`,
      stockState: resolveStockState(stock),
      to: buildProductDetailPath(sourceId),
    };
  });
}

export function createOrderRows(orders) {
  return orders
    .map((item) => ({
      id: item.orderId,
      status: toOrderStatusLabel(item.orderStatus),
      itemSummary: item.orderItems?.[0]
        ? `${item.orderItems[0].productName ?? item.orderItems[0].name}${item.orderItems.length > 1 ? ` 외 ${item.orderItems.length - 1}건` : ''}`
        : '-',
      payment: item.payment ?? '-',
      totalPrice: formatCurrency(item.totalPrice),
      date: formatDate(item.createdAt),
      dateTime: formatDateTime(item.createdAt),
      createdAt: item.createdAt,
    }))
    .sort((left, right) => Number(right.id) - Number(left.id));
}

export function createOrderStatusCards(orders) {
  const counts = orders.reduce((result, order) => {
    const key = order.orderStatus;
    result[key] = (result[key] ?? 0) + 1;
    return result;
  }, {});

  return ['ORDERED', 'DELIVERING', 'COMPLETED', 'CANCELLED'].map((status) => ({
    id: status,
    label: toOrderStatusLabel(status),
    value: `${formatNumber(counts[status] ?? 0)}건`,
  }));
}

export function createOrderTrendChart(orders) {
  const today = new Date('2026-03-28T00:00:00');
  const labels = [];
  const points = [];

  for (let index = 6; index >= 0; index -= 1) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - index);
    const key = targetDate.toISOString().slice(5, 10);

    labels.push(`${targetDate.getMonth() + 1}/${targetDate.getDate()}`);

    const count = orders.filter((order) => {
      if (!order.createdAt) {
        return false;
      }

      return String(order.createdAt).slice(5, 10) === key;
    }).length;

    points.push(count);
  }

  return {
    labels,
    points,
    valueSuffix: '건',
  };
}

export function createSalesTrendChart(orders) {
  const today = new Date('2026-03-28T00:00:00');
  const labels = [];
  const points = [];

  for (let index = 6; index >= 0; index -= 1) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - index);
    const key = targetDate.toISOString().slice(0, 10);

    labels.push(`${targetDate.getMonth() + 1}/${targetDate.getDate()}`);

    const salesAmount = orders.reduce((sum, order) => {
      if (!order.createdAt || String(order.createdAt).slice(0, 10) !== key) {
        return sum;
      }

      if (order.orderStatus === 'CANCELLED') {
        return sum;
      }

      return sum + Number(order.totalPrice ?? 0);
    }, 0);

    points.push(salesAmount);
  }

  return {
    labels,
    points,
    valueSuffix: '원',
  };
}

export function createStatusChart(orders) {
  const segments = ['ORDERED', 'DELIVERING', 'COMPLETED', 'CANCELLED'].map((status) => {
    const count = orders.filter((order) => order.orderStatus === status).length;

    return {
      label: toOrderStatusLabel(status),
      value: count,
      formattedValue: `${count}건`,
      color: STATUS_COLORS[status],
    };
  });

  return {
    valueLabel: '주문',
    segments,
    totalSuffix: '건',
  };
}

export function createSupportChart(qnaRows) {
  const pending = qnaRows.filter((item) => item.status === '답변대기').length;
  const answered = qnaRows.filter((item) => item.status === '답변완료').length;

  return {
    valueLabel: '문의',
    segments: [
      {
        label: '답변대기',
        value: pending,
        formattedValue: `${pending}건`,
        color: '#1c3f94',
      },
      {
        label: '답변완료',
        value: answered,
        formattedValue: `${answered}건`,
        color: '#c7d7f7',
      },
    ],
    totalSuffix: '건',
  };
}

export function createPaymentChart(orders) {
  const paymentMap = orders.reduce((result, order) => {
    const rawKey = String(order.payment ?? 'ETC').toUpperCase();
    const resolvedLabel = PAYMENT_LABELS[rawKey] ?? '기타';
    result.set(resolvedLabel, (result.get(resolvedLabel) ?? 0) + 1);
    return result;
  }, new Map());

  const segments = [...paymentMap.entries()].map(([label, value], index) => ({
    label,
    value,
    formattedValue: `${value}건`,
    color: PAYMENT_COLORS[index] ?? PAYMENT_COLORS.at(-1),
  }));

  return {
    valueLabel: '결제',
    segments,
    totalSuffix: '건',
  };
}

export function createCategoryChart(categories, products, orders) {
  const productMap = buildNormalizedProductMap(products);
  const categorySalesMap = categories.reduce((result, category) => {
    result.set(category.slug, {
      slug: category.slug,
      label: category.label,
      units: 0,
    });
    return result;
  }, new Map());

  products.forEach((product) => {
    const category = findCategoryForProduct(product, categories);
    if (!category) {
      return;
    }

    const categoryEntry = categorySalesMap.get(category.slug);
    categoryEntry.units += buildSalesSeed(product.productId ?? product.id ?? product.name, product.reviews);
  });

  orders.forEach((order) => {
    order.orderItems?.forEach((orderItem) => {
      const key = String(orderItem.productName ?? orderItem.name ?? '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

      const matchedProduct = productMap.get(key);
      const category = matchedProduct ? findCategoryForProduct(matchedProduct, categories) : null;

      if (!category) {
        return;
      }

      const categoryEntry = categorySalesMap.get(category.slug);
      categoryEntry.units += Number(orderItem.quantity ?? 1) * 3;
    });
  });

  const rows = [...categorySalesMap.values()]
    .filter((item) => item.units > 0)
    .sort((left, right) => right.units - left.units)
    .slice(0, 5);

  const totalUnits = rows.reduce((sum, row) => sum + row.units, 0);
  const colors = ['#1c3f94', '#4f86f7', '#88aef2', '#c7d7f7', '#e2e8f8'];

  let ratioSum = 0;

  return {
    valueLabel: '매출',
    segments: rows.map((row, index) => {
      const ratio = totalUnits
        ? index === rows.length - 1
          ? Math.max(0, 100 - ratioSum)
          : Math.round((row.units / totalUnits) * 100)
        : 0;

      ratioSum += ratio;

      return {
        label: row.label,
        value: ratio,
        formattedValue: `${ratio}%`,
        color: colors[index],
      };
    }),
    totalText: '총 100%',
  };
}

export function createStockRows(productRows) {
  return [...productRows]
    .filter((row) => row.stock <= 10)
    .sort((left, right) => left.stock - right.stock)
    .slice(0, 5);
}

export function buildAdminDashboard({
  categories,
  products,
  orders,
  members,
  reviews,
  qnas,
  productCount,
  orderCount,
}) {
  const productRows = createProductRows(products);
  const qnaRows = createQuestionRows(qnas);

  return {
    summaryCards: [
      { id: 'products', label: '상품 수', value: `${formatNumber(productCount ?? productRows.length)}개` },
      { id: 'orders', label: '주문 수', value: `${formatNumber(orderCount ?? orders.length)}건` },
      { id: 'members', label: '회원 수', value: `${formatNumber(members.length)}명` },
      { id: 'reviews', label: '리뷰 수', value: `${formatNumber(reviews.length)}건` },
    ],
    orderStatusCards: createOrderStatusCards(orders),
    trendChart: createOrderTrendChart(orders),
    salesChart: createSalesTrendChart(orders),
    statusChart: createStatusChart(orders),
    paymentChart: createPaymentChart(orders),
    categoryChart: createCategoryChart(categories, products, orders),
    categoryRows: createCategoryRows(categories, products),
    stockRows: createStockRows(productRows),
    memberRows: createMemberRows(members),
    orderRows: createOrderRows(orders),
    productRows,
    qnaRows,
    reviewRows: createReviewRows(reviews),
    supportChart: createSupportChart(qnaRows),
    watchProducts: createWatchProducts(products),
  };
}
