import httpRequester from '../libs/httpRequester';

export function getNoticeList() {
  return httpRequester.get('/notices');
}

export function getNoticeDetail(noticeId) {
  return httpRequester.get(`/notices/${noticeId}`);
}
