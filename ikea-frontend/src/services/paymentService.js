import httpRequester from '../libs/httpRequester';

export function getMyPayments() {
  return httpRequester.get('/payment/my');
}
