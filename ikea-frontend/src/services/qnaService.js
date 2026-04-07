import httpRequester from '../libs/httpRequester';

export function getQnaList(query) {
  return httpRequester.get('/qna', { params: query });
}

export function getQnaDetail(qnaId) {
  return httpRequester.get(`/qna/${qnaId}`);
}

export function createQnaQuestion(qnaRequest) {
  return httpRequester.post('/qna', qnaRequest);
}

export function updateQnaQuestion(qnaId, qnaRequest) {
  return httpRequester.put(`/qna/${qnaId}`, qnaRequest);
}

export function deleteQnaQuestion(qnaId) {
  return httpRequester.delete(`/qna/${qnaId}`);
}
