import { ADMIN_PRODUCT_ATTRIBUTE_FIELD_IDS } from '../constants/productAttributeConfig';

export function formatAdminNumber(value) {
  return Number(value ?? 0).toLocaleString('ko-KR');
}

export function normalizeArrayPayload(payload, fallback = []) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return fallback;
}

export function normalizeObjectPayload(payload, fallback = {}) {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
      return payload.data;
    }

    return payload;
  }

  return fallback;
}

export function formatAdminCurrency(value) {
  return `${formatAdminNumber(value)}원`;
}

export function formatAdminDate(value) {
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
  }).format(date);
}

export function formatAdminDateTime(value) {
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

export function normalizeAdminProduct(product, categories = []) {
  const resolvedCategory = categories.find((category) => {
    if (product.categoryId && String(category.backendCategoryId) === String(product.categoryId)) {
      return true;
    }

    if (product.categorySlug && category.slug === product.categorySlug) {
      return true;
    }

    return product.categoryName && category.label === product.categoryName;
  });

  const price = Number(product.price ?? 0);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;
  const calculatedDiscountRate = (
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0
  );

  const attributes = Object.fromEntries(
    ADMIN_PRODUCT_ATTRIBUTE_FIELD_IDS.map((fieldId) => [
      fieldId,
      product.attributes?.[fieldId] ?? product[fieldId] ?? '',
    ]),
  );

  return {
    productId: String(product.productId ?? product.id ?? ''),
    id: String(product.id ?? product.productId ?? ''),
    name: product.name ?? '',
    description: product.description ?? '',
    price,
    originalPrice,
    discountRate: Number(product.discountRate ?? 0) || calculatedDiscountRate,
    categoryId: resolvedCategory?.backendCategoryId ?? product.categoryId ?? '',
    categoryName: resolvedCategory?.label ?? product.categoryName ?? product.categoryLabel ?? '',
    categoryLabel: resolvedCategory?.label ?? product.categoryLabel ?? product.categoryName ?? '',
    categorySlug: resolvedCategory?.slug ?? product.categorySlug ?? '',
    image: product.imgPath ?? product.image ?? '',
    altImage: product.altImage ?? '',
    createdAt: product.createdAt ?? '',
    reviews: Number(product.reviews ?? 0),
    rating: Number(product.rating ?? 0),
    brand: product.brand ?? 'HOMiO',
    badge: product.badge ?? '',
    label: product.label ?? '',
    typeSlug: product.typeSlug ?? '',
    color: product.color ?? attributes.color ?? '',
    material: product.material ?? attributes.material ?? '',
    size: product.size ?? attributes.size ?? '',
    firmness: product.firmness ?? attributes.firmness ?? '',
    function: product.function ?? attributes.function ?? '',
    warmth: product.warmth ?? attributes.warmth ?? '',
    seatCount: product.seatCount ?? attributes.seatCount ?? '',
    shape: product.shape ?? attributes.shape ?? '',
    installation: product.installation ?? attributes.installation ?? '',
    configuration: product.configuration ?? attributes.configuration ?? '',
    use: product.use ?? attributes.use ?? '',
    attributes,
    detailDraft: product.detailDraft ?? null,
  };
}

export function normalizeAdminMember(member) {
  return {
    memberId: String(member.memberId ?? member.id ?? ''),
    loginId: member.loginId ?? '',
    name: member.name ?? '',
    email: member.email ?? '',
    phoneNumber: member.phoneNumber ?? member.phone ?? member.tel ?? '',
    memberRole: member.memberRole ?? member.role ?? 'USER',
    zoneCode: member.zoneCode ?? '',
    addressMain: member.addressMain ?? '',
    addressDetail: member.addressDetail ?? '',
    address: member.address ?? '',
    createdAt: member.createdAt ?? '',
  };
}

export function normalizeAdminOrder(order) {
  return {
    orderId: String(order.orderId ?? ''),
    orderStatus: order.orderStatus ?? 'ORDERED',
    payment: order.payment ?? '',
    totalPrice: Number(order.totalPrice ?? order.finalTotal ?? 0),
    address: order.address ?? [order.addressMain, order.addressDetail].filter(Boolean).join(' '),
    createdAt: order.createdAt ?? order.orderedAt ?? '',
    orderItems: order.orderItems ?? [],
  };
}

export function normalizeAdminReview(review) {
  return {
    reviewId: String(review.reviewId ?? review.id ?? ''),
    productName: review.productName ?? '',
    memberName: review.memberName ?? review.writer ?? '',
    content: review.content ?? '',
    rating: Number(review.rating ?? 0),
    createdAt: review.createdAt ?? '',
  };
}

function buildThreadFromQuestion(question, answer) {
  return {
    id: String(question.qnaId ?? question.id ?? ''),
    title: question.title ?? '',
    writer: question.writer ?? '',
    createdAt: question.createdAt ?? '',
    status: answer ? '답변완료' : '답변대기',
    question: {
      qnaId: String(question.qnaId ?? question.id ?? ''),
      title: question.title ?? '',
      content: question.content ?? question.question ?? '',
      writer: question.writer ?? '',
      createdAt: question.createdAt ?? '',
    },
    answer: answer
      ? {
          qnaId: String(answer.qnaId ?? answer.id ?? ''),
          title: answer.title ?? '',
          content: answer.content ?? answer.answer ?? '',
          writer: answer.writer ?? '운영 관리자',
          createdAt: answer.createdAt ?? '',
        }
      : null,
  };
}

export function normalizeAdminQnaThreads(items = []) {
  if (!items.length) {
    return [];
  }

  if ('question' in items[0]) {
    return items.map((item, index) => ({
      id: String(item.id ?? index + 1),
      title: item.title ?? '',
      writer: item.author ?? item.writer ?? '',
      createdAt: item.date ? `${item.date}T09:00:00` : '',
      status: item.answer ? '답변완료' : '답변대기',
      question: {
        qnaId: String((item.id ?? index + 1) * 10),
        title: item.title ?? '',
        content: item.question ?? '',
        writer: item.author ?? item.writer ?? '',
        createdAt: item.date ? `${item.date}T09:00:00` : '',
      },
      answer: item.answer
        ? {
            qnaId: String((item.id ?? index + 1) * 10 + 1),
            title: `${item.title ?? '문의'} 답변`,
            content: item.answer,
            writer: '운영 관리자',
            createdAt: item.date ? `${item.date}T14:00:00` : '',
          }
        : null,
    }));
  }

  const questions = items.filter((item) => Number(item.level ?? 0) === 0);
  const answersByParent = new Map(
    items
      .filter((item) => Number(item.level ?? 0) === 1)
      .map((item) => [String(item.parentId ?? ''), item]),
  );

  return questions.map((question) => buildThreadFromQuestion(question, answersByParent.get(String(question.qnaId))));
}

export function normalizeAdminNotice(notice) {
  return {
    noticeId: String(notice.noticeId ?? notice.id ?? ''),
    title: notice.title ?? '',
    content: notice.content ?? '',
    writer: notice.writer ?? '운영팀',
    createdAt: notice.createdAt ?? notice.date ?? '',
    attachments: notice.attachments ?? [],
  };
}
