const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

function normalizeText(value = '') {
  return String(value ?? '').trim();
}

export function resolveGuestQnaLookupMode(value = 'email') {
  return value === 'phone' ? 'phone' : 'email';
}

export function normalizeGuestQnaLookupEmail(value = '') {
  return normalizeText(value).toLowerCase();
}

export function normalizeGuestQnaLookupPhone(value = '') {
  return String(value ?? '').replace(/\D+/g, '').slice(0, 11);
}

export function validateGuestQnaLookupForm(form = {}, options = {}) {
  const { allowPartial = false } = options;
  const mode = resolveGuestQnaLookupMode(form.inquiryType ?? form.mode);
  const writer = normalizeText(form.writer ?? form.name);
  const email = normalizeGuestQnaLookupEmail(form.email);
  const phoneNumber = normalizeGuestQnaLookupPhone(form.phoneNumber);
  const activeValue = mode === 'email' ? email : phoneNumber;

  if (allowPartial && !writer && !activeValue) {
    return '';
  }

  if (!writer) {
    return '작성자 이름을 입력해 주세요.';
  }

  if (mode === 'email') {
    if (!email) {
      return '이메일 주소를 입력해 주세요.';
    }

    if (!EMAIL_PATTERN.test(email)) {
      return '올바른 이메일 주소를 입력해 주세요.';
    }

    return '';
  }

  if (!phoneNumber) {
    return '휴대전화번호를 입력해 주세요.';
  }

  if (!/^\d{10,11}$/.test(phoneNumber)) {
    return '휴대전화번호는 10~11자리 숫자로 입력해 주세요.';
  }

  return '';
}

export function buildGuestQnaLookupQuery(form = {}) {
  const mode = resolveGuestQnaLookupMode(form.inquiryType ?? form.mode);
  const query = {
    name: normalizeText(form.writer ?? form.name),
    mode,
  };

  if (mode === 'email') {
    query.email = normalizeGuestQnaLookupEmail(form.email);
    return query;
  }

  query.phoneNumber = normalizeGuestQnaLookupPhone(form.phoneNumber);
  return query;
}
