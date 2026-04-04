function normalizeIdentifier(value) {
  return String(value ?? '').trim();
}

function hasMeaningfulMessage(message = '') {
  const normalizedMessage = normalizeIdentifier(message);

  if (!normalizedMessage) {
    return false;
  }

  return ![
    'Request failed',
    'Payment request failed.',
    'Cart request failed.',
    'Network Error',
    'Failed to fetch',
  ].includes(normalizedMessage);
}

function resolveStatus(error) {
  return Number(error?.status ?? 0);
}

export function resolveLoginErrorMessage(
  error,
  fallbackMessage = '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.',
) {
  if (hasMeaningfulMessage(error?.message)) {
    return error.message;
  }

  const status = resolveStatus(error);

  if (status === 0) {
    return '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';
  }

  switch (status) {
    case 400:
    case 401:
      return '아이디 또는 비밀번호를 다시 확인해 주세요.';
    case 403:
      return '현재 계정으로는 로그인할 수 없습니다.';
    case 404:
      return '계정 정보를 찾지 못했습니다. 아이디 또는 이메일을 다시 확인해 주세요.';
    case 409:
      return '로그인 요청이 이미 처리 중입니다. 잠시 후 다시 시도해 주세요.';
    default:
      return fallbackMessage;
  }
}

export function resolveJoinErrorMessage(
  error,
  fallbackMessage = '회원가입에 실패했습니다. 입력한 정보를 다시 확인해 주세요.',
) {
  if (hasMeaningfulMessage(error?.message)) {
    return error.message;
  }

  const status = resolveStatus(error);

  if (status === 0) {
    return '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';
  }

  switch (status) {
    case 400:
    case 422:
      return '입력한 회원 정보를 다시 확인해 주세요.';
    case 409:
      return '이미 사용 중인 아이디, 이메일 또는 휴대전화번호일 수 있습니다. 입력값을 다시 확인해 주세요.';
    default:
      return fallbackMessage;
  }
}

export function resolveCartActionErrorMessage(
  error,
  fallbackMessage = '장바구니 작업을 처리하지 못했습니다.',
) {
  if (hasMeaningfulMessage(error?.message)) {
    return error.message;
  }

  switch (resolveStatus(error)) {
    case 400:
      return '장바구니 정보를 다시 확인해 주세요.';
    case 401:
      return '로그인 상태를 다시 확인해 주세요.';
    case 403:
      return '현재 상품은 장바구니에 담을 수 없습니다.';
    case 404:
      return '상품 정보를 찾지 못했습니다. 목록을 다시 확인해 주세요.';
    case 409:
      return '장바구니 또는 재고 상태가 변경되었습니다. 다시 확인해 주세요.';
    default:
      return fallbackMessage;
  }
}

export function resolveCheckoutErrorMessage(error, fallbackMessage = '주문을 처리하지 못했습니다.') {
  if (hasMeaningfulMessage(error?.message)) {
    return error.message;
  }

  switch (resolveStatus(error)) {
    case 400:
      return '주문 정보 또는 결제 정보를 다시 확인해 주세요.';
    case 401:
      return '로그인 상태를 다시 확인한 뒤 주문을 진행해 주세요.';
    case 403:
      return '현재 계정으로는 주문을 진행할 수 없습니다.';
    case 404:
      return '주문 대상 정보를 찾지 못했습니다. 장바구니를 다시 확인해 주세요.';
    case 409:
      return '주문 상태가 변경되었습니다. 장바구니와 재고 상태를 다시 확인해 주세요.';
    case 422:
      return '입력한 주문 정보가 올바른지 다시 확인해 주세요.';
    default:
      return fallbackMessage;
  }
}

export function resolvePaymentApprovalErrorMessage(error, providerLabel = '결제') {
  if (hasMeaningfulMessage(error?.message)) {
    return error.message;
  }

  switch (resolveStatus(error)) {
    case 400:
      return `${providerLabel} 승인 정보를 다시 확인해 주세요.`;
    case 401:
    case 403:
      return `${providerLabel} 승인 권한을 다시 확인해 주세요.`;
    case 404:
      return '주문 또는 결제 정보를 찾지 못했습니다. 주문 상태를 먼저 확인해 주세요.';
    case 409:
      return '이미 처리된 결제이거나 주문 상태가 변경되었습니다.';
    default:
      return `${providerLabel} 승인 처리 중 문제가 생겼습니다. 주문 상태를 다시 확인해 주세요.`;
  }
}

export function resolveAdminActionErrorMessage(
  error,
  fallbackMessage = '요청을 처리하지 못했습니다.',
) {
  if (hasMeaningfulMessage(error?.message)) {
    return error.message;
  }

  switch (resolveStatus(error)) {
    case 400:
      return '입력값을 다시 확인해 주세요.';
    case 401:
      return '로그인 상태를 다시 확인해 주세요.';
    case 403:
      return '현재 계정으로는 이 작업을 수행할 수 없습니다.';
    case 404:
      return '대상 정보를 찾지 못했습니다. 목록을 새로고침한 뒤 다시 시도해 주세요.';
    case 409:
      return '이미 변경된 항목입니다. 목록을 다시 확인해 주세요.';
    default:
      return fallbackMessage;
  }
}

export function resolveOrderActionErrorMessage(
  error,
  actionLabel = '요청',
  fallbackMessage = `${actionLabel}을 처리하지 못했습니다.`,
) {
  if (hasMeaningfulMessage(error?.message)) {
    return error.message;
  }

  switch (resolveStatus(error)) {
    case 400:
      return `${actionLabel} 조건을 다시 확인해 주세요.`;
    case 401:
      return '로그인 상태를 다시 확인해 주세요.';
    case 403:
      return `현재 주문 상태에서는 ${actionLabel}할 수 없습니다.`;
    case 404:
      return '주문 정보를 찾지 못했습니다. 주문내역을 새로고침한 뒤 다시 시도해 주세요.';
    case 409:
      return '이미 변경된 주문이거나 주문 상태가 달라졌습니다. 주문내역을 다시 확인해 주세요.';
    default:
      return fallbackMessage;
  }
}

export function resolveLookupErrorMessage(
  error,
  fallbackMessage = '조회 결과를 불러오지 못했습니다.',
) {
  if (hasMeaningfulMessage(error?.message)) {
    return error.message;
  }

  switch (resolveStatus(error)) {
    case 400:
      return '조회 조건을 다시 확인해 주세요.';
    case 401:
      return '로그인 상태를 다시 확인해 주세요.';
    case 403:
      return '현재 계정으로는 이 정보를 조회할 수 없습니다.';
    case 404:
      return '입력한 정보와 일치하는 내역을 찾지 못했습니다.';
    default:
      return fallbackMessage;
  }
}

export function resolveProfileErrorMessage(
  error,
  fallbackMessage = '회원 정보를 다시 확인해 주세요.',
) {
  if (hasMeaningfulMessage(error?.message)) {
    return error.message;
  }

  switch (resolveStatus(error)) {
    case 401:
      return '로그인 상태를 다시 확인해 주세요.';
    case 403:
      return '현재 계정으로는 회원 정보를 확인할 수 없습니다.';
    case 404:
      return '회원 정보를 찾지 못했습니다.';
    default:
      return fallbackMessage;
  }
}

export function resolveMemberActionErrorMessage(
  error,
  fallbackMessage = '회원 작업을 처리하지 못했습니다.',
) {
  if (hasMeaningfulMessage(error?.message)) {
    return error.message;
  }

  switch (resolveStatus(error)) {
    case 400:
      return '회원 정보를 다시 확인해 주세요.';
    case 401:
      return '로그인 상태를 다시 확인해 주세요.';
    case 403:
      return '현재 계정으로는 이 작업을 수행할 수 없습니다.';
    case 404:
      return '회원 정보를 찾지 못했습니다.';
    case 409:
      return '회원 상태가 변경되었습니다. 다시 확인해 주세요.';
    default:
      return fallbackMessage;
  }
}

export function resolveReviewErrorMessage(
  error,
  fallbackMessage = '리뷰 작업을 처리하지 못했습니다.',
) {
  if (hasMeaningfulMessage(error?.message)) {
    return error.message;
  }

  switch (resolveStatus(error)) {
    case 400:
      return '리뷰 내용을 다시 확인해 주세요.';
    case 401:
      return '로그인 상태를 다시 확인해 주세요.';
    case 403:
      return '현재 주문 상태에서는 리뷰를 작성할 수 없습니다.';
    case 404:
      return '리뷰 대상 주문 또는 상품 정보를 찾지 못했습니다.';
    case 409:
      return '이미 등록된 리뷰이거나 주문 상태가 변경되었습니다.';
    default:
      return fallbackMessage;
  }
}

export function resolveReviewLookupErrorMessage(
  error,
  fallbackMessage = '리뷰를 불러오지 못했습니다.',
) {
  if (hasMeaningfulMessage(error?.message)) {
    return error.message;
  }

  switch (resolveStatus(error)) {
    case 400:
      return '리뷰 요청 정보를 다시 확인해 주세요.';
    case 401:
      return '로그인 상태를 다시 확인한 뒤 리뷰를 확인해 주세요.';
    case 403:
      return '현재 계정으로는 이 리뷰를 확인할 수 없습니다.';
    case 404:
      return '상품 리뷰 정보를 찾지 못했습니다.';
    default:
      return fallbackMessage;
  }
}
