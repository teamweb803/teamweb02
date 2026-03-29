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

const PAYMENT_METHODS = {
  CARD: { label: '신용카드', color: '#1c3f94' },
  BANK: { label: '무통장입금', color: '#4f86f7' },
  KAKAO: { label: '카카오페이', color: '#88aef2' },
  TOSS: { label: '토스페이', color: '#c7d7f7' },
};

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

function toOrderStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] ?? status ?? '-';
}

function normalizePaymentCode(payment) {
  const code = String(payment ?? '')
    .trim()
    .toUpperCase();

  if (code === 'KAKAOPAY') {
    return 'KAKAO';
  }

  if (code === 'TOSSPAY') {
    return 'TOSS';
  }

  if (code in PAYMENT_METHODS) {
    return code;
  }

  return code;
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

function resolveStockState(stock) {
  if (stock <= 3) {
    return 'critical';
  }

  if (stock <= 10) {
    return 'warning';
  }

  return 'stable';
}

function buildChartWindowLabels() {
  const today = new Date();
  const labels = [];

  for (let index = 6; index >= 0; index -= 1) {
    const target = new Date(today);
    target.setDate(today.getDate() - index);
    labels.push(
      new Intl.DateTimeFormat('ko-KR', {
        month: 'numeric',
        day: 'numeric',
      }).format(target),
    );
  }

  return labels;
}

function createTrendBuckets(orders, valueSelector) {
  const labels = buildChartWindowLabels();
  const buckets = new Map(labels.map((label) => [label, 0]));

  orders.forEach((order) => {
    const dateLabel = formatDate(order.createdAt);
    if (!buckets.has(dateLabel)) {
      return;
    }

    buckets.set(dateLabel, Number(buckets.get(dateLabel) ?? 0) + Number(valueSelector(order) ?? 0));
  });

  return {
    labels,
    points: labels.map((label) => buckets.get(label) ?? 0),
  };
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

export function createFallbackReviews(orderReviewItems = []) {
  const seededReviews = orderReviewItems
    .filter((item) => item.review)
    .map((item, index) => ({
      reviewId: index + 1,
      memberName: item.memberName ?? item.orderNo?.replace('HS-', '') ?? 'guest',
      productName: item.product,
      content: item.review.content,
      rating: item.review.rating,
      createdAt: `2026-03-${String(18 - index).padStart(2, '0')}T10:00:00`,
    }));

  return seededReviews.length
    ? seededReviews
    : [
        {
          reviewId: 1,
          memberName: 'roomtone',
          productName: '아일랜드 모듈 소파',
          content: '조합성이 좋고 패브릭 촉감도 좋아 거실용 소파로 만족하며 사용 중입니다.',
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
        writer: '운영 관리자',
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

    const reviewCount = matchedProducts.reduce((sum, product) => sum + Number(product.reviews ?? 0), 0);

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
      reviewText: `리뷰 ${formatNumber(product.reviews ?? 0)}건 · 평점 ${Number(product.rating ?? 0).toFixed(1)}`,
      price: formatCurrency(product.price),
      image: product.image ?? product.imgPath,
      to: buildProductDetailPath(product.id ?? product.productId),
    }));
}

export function createQuestionRows(qnas) {
  const answers = new Map();

  qnas.forEach((item) => {
    if (Number(item.level ?? 0) === 1) {
      answers.set(item.parentId, item);
    }
  });

  return qnas
    .filter((item) => Number(item.level ?? 0) === 0)
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
      rating: `평점 ${item.rating ?? '-'}`,
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
    .map((item) => {
      const rawPayment = normalizePaymentCode(item.payment);

      return {
        id: item.orderId,
        status: toOrderStatusLabel(item.orderStatus),
        itemSummary: item.orderItems?.[0]
          ? `${item.orderItems[0].productName ?? item.orderItems[0].name}${item.orderItems.length > 1 ? ` 외 ${item.orderItems.length - 1}건` : ''}`
          : '-',
        payment: PAYMENT_METHODS[rawPayment]?.label ?? item.payment ?? '-',
        totalPrice: formatCurrency(item.totalPrice),
        date: formatDate(item.createdAt),
        rawStatus: item.orderStatus,
        rawPayment,
      };
    })
    .sort((left, right) => Number(right.id) - Number(left.id));
}

function createOrderTrendChart(orders) {
  const trend = createTrendBuckets(orders, () => 1);

  return {
    labels: trend.labels,
    points: trend.points,
    valueSuffix: '건',
  };
}

function createSalesTrendChart(orders) {
  const trend = createTrendBuckets(orders, (order) => order.totalPrice);

  return {
    labels: trend.labels,
    points: trend.points,
    valueSuffix: '원',
  };
}

function createStatusChart(orderRows) {
  const segments = [
    { label: '결제완료', key: 'ORDERED' },
    { label: '배송중', key: 'DELIVERING' },
    { label: '배송완료', key: 'COMPLETED' },
    { label: '취소', key: 'CANCELLED' },
  ].map((item) => {
    const count = orderRows.filter((row) => row.rawStatus === item.key).length;

    return {
      label: item.label,
      value: count,
      formattedValue: `${count}건`,
      color: STATUS_COLORS[item.key],
    };
  });

  return {
    segments,
    valueLabel: `${orderRows.length}건`,
    totalText: '주문 기준',
  };
}

function createSupportChart(qnaRows) {
  const answered = qnaRows.filter((item) => item.status === '답변완료').length;
  const waiting = qnaRows.length - answered;

  return {
    segments: [
      { label: '답변완료', value: answered, formattedValue: `${answered}건`, color: '#1c3f94' },
      { label: '답변대기', value: waiting, formattedValue: `${waiting}건`, color: '#c7d7f7' },
    ],
    valueLabel: `${qnaRows.length}건`,
    totalText: '문의 기준',
  };
}

function createPaymentChart(orders) {
  const paymentEntries = Object.entries(PAYMENT_METHODS)
    .map(([key, method]) => {
      const count = orders.filter((order) => normalizePaymentCode(order.payment) === key).length;

      return {
        label: method.label,
        value: count,
        formattedValue: `${count}건`,
        color: method.color,
      };
    })
    .filter((item) => item.value > 0);

  return {
    segments: paymentEntries.length
      ? paymentEntries
      : [{ label: '결제 없음', value: 1, formattedValue: '0건', color: '#dbe6fb' }],
    valueLabel: `${orders.length}건`,
    totalText: '결제 기준',
  };
}

function createCategoryChart(categoryRows) {
  const palette = ['#1c3f94', '#4f86f7', '#88aef2', '#c7d7f7', '#7ca0eb', '#dbe6fb'];

  const segments = categoryRows
    .filter((item) => item.productCount > 0)
    .map((item, index) => ({
      label: item.label,
      value: item.productCount,
      formattedValue: `${item.productCount}개`,
      color: palette[index % palette.length],
    }));

  const totalCount = categoryRows.reduce((sum, row) => sum + row.productCount, 0);

  return {
    segments,
    valueLabel: `${totalCount}개`,
    totalText: '상품 기준',
  };
}

function createStockRows(productRows) {
  return [...productRows]
    .sort((left, right) => left.stock - right.stock)
    .slice(0, 5);
}

export function buildAdminDashboard({
  categories = [],
  products = [],
  orders = [],
  members = [],
  reviews = [],
  qnas = [],
  productCount = products.length,
  orderCount = orders.length,
} = {}) {
  const normalizedProductMap = buildNormalizedProductMap(products);
  const categoryRows = createCategoryRows(categories, products);
  const productRows = createProductRows(products);
  const orderRows = createOrderRows(orders);
  const memberRows = createMemberRows(members);
  const qnaRows = createQuestionRows(qnas);
  const reviewRows = createReviewRows(reviews).map((row) => {
    const matchedProduct = normalizedProductMap.get(String(row.productName ?? '').trim().toLowerCase());

    return {
      ...row,
      image: matchedProduct?.image ?? matchedProduct?.imgPath ?? '',
    };
  });

  return {
    summaryCards: [
      { id: 'products', label: '상품 수', value: `${productCount}개` },
      { id: 'orders', label: '주문 수', value: `${orderCount}건` },
      { id: 'members', label: '회원 수', value: `${memberRows.length}명` },
      { id: 'reviews', label: '리뷰 수', value: `${reviewRows.length}건` },
    ],
    trendChart: createOrderTrendChart(orders),
    salesChart: createSalesTrendChart(orders),
    categoryChart: createCategoryChart(categoryRows),
    statusChart: createStatusChart(orderRows),
    paymentChart: createPaymentChart(orders),
    supportChart: createSupportChart(qnaRows),
    stockRows: createStockRows(productRows),
    watchProducts: createWatchProducts(products),
    qnaRows,
    reviewRows,
    categoryRows,
    memberRows,
    orderRows,
    productRows,
  };
}
