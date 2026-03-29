import httpRequester from '../libs/httpRequester';

export function getProductReviews(productId) {
  return httpRequester.get(`/review/product/${productId}`);
}

export function getMemberReviews(memberId) {
  return httpRequester.get(`/review/member/${memberId}`);
}

export function createMemberReview(memberId, reviewRequest) {
  return httpRequester.post(`/review/${memberId}`, reviewRequest);
}

export function updateMemberReview(reviewId, reviewRequest) {
  return httpRequester.put(`/review/${reviewId}`, reviewRequest);
}

export function deleteMemberReview(reviewId) {
  return httpRequester.delete(`/review/${reviewId}`);
}
