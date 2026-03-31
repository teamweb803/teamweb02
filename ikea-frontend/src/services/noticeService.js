import httpRequester from '../libs/httpRequester';

function unwrapArrayPayload(payload) {
  const source = payload?.data ?? payload;

  if (Array.isArray(source)) {
    return source;
  }

  if (Array.isArray(source?.content)) {
    return source.content;
  }

  if (Array.isArray(source?.items)) {
    return source.items;
  }

  if (Array.isArray(source?.notices)) {
    return source.notices;
  }

  return [];
}

function formatNoticeDate(value, { includeTime = false } = {}) {
  const normalizedValue = String(value ?? '').trim();

  if (!normalizedValue) {
    return '-';
  }

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    if (includeTime) {
      return normalizedValue.replace('T', ' ').slice(0, 19);
    }

    if (/^\d{4}-\d{2}-\d{2}/.test(normalizedValue)) {
      return normalizedValue.slice(0, 10).replace(/-/g, '.');
    }

    return normalizedValue;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (!includeTime) {
    return `${year}.${month}.${day}`;
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function splitNoticeContent(content) {
  return String(content ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeAttachment(item = {}) {
  return {
    attachmentId: String(item.attachmentId ?? item.id ?? ''),
    fileName: String(item.fileName ?? item.name ?? ''),
    fileUrl: String(item.fileUrl ?? item.url ?? ''),
  };
}

export function normalizeNoticeListItem(item = {}) {
  return {
    id: String(item.noticeId ?? item.id ?? ''),
    badge: '공지',
    title: String(item.title ?? '').trim() || '공지사항',
    date: formatNoticeDate(item.createdAt),
    rawCreatedAt: String(item.createdAt ?? ''),
  };
}

export function normalizeNoticeDetail(item = {}) {
  return {
    id: String(item.noticeId ?? item.id ?? ''),
    title: String(item.title ?? '').trim() || '공지사항',
    writer: String(item.writer ?? '').trim(),
    date: formatNoticeDate(item.createdAt, { includeTime: true }),
    content: String(item.content ?? '').trim(),
    lines: splitNoticeContent(item.content),
    attachments: unwrapArrayPayload(item.attachments).map((attachment) => normalizeAttachment(attachment)),
  };
}

export function getNoticeList() {
  return httpRequester.get('/notice');
}

export function getNoticeDetail(noticeId) {
  return httpRequester.get(`/notice/${noticeId}`);
}

export async function getCustomerNoticeRows() {
  const response = await getNoticeList();
  return unwrapArrayPayload(response)
    .map((item) => normalizeNoticeListItem(item))
    .filter((item) => item.id)
    .sort((left, right) => {
      const rightTime = new Date(right.rawCreatedAt).getTime();
      const leftTime = new Date(left.rawCreatedAt).getTime();

      if (!Number.isNaN(rightTime) && !Number.isNaN(leftTime)) {
        return rightTime - leftTime;
      }

      return String(right.id).localeCompare(String(left.id), 'ko-KR', { numeric: true });
    });
}

export async function getCustomerNoticeDetail(noticeId) {
  const response = await getNoticeDetail(noticeId);
  return normalizeNoticeDetail(response);
}
