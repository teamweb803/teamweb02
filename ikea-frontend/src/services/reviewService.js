import httpRequester from '../libs/httpRequester';

export function getProductReviews(productId) {
  return httpRequester.get(`/review/product/${productId}`);
}

export async function getMyReviews() {
  return httpRequester.get('/review/my');
}

export function getMemberReviews() {
  return getMyReviews();
}

export async function createMyReview(memberIdOrReviewRequest, maybeReviewRequest) {
  const reviewRequest = maybeReviewRequest ?? memberIdOrReviewRequest;
  return httpRequester.post('/review', reviewRequest);
}

export function createMemberReview(memberIdOrReviewRequest, maybeReviewRequest) {
  return createMyReview(memberIdOrReviewRequest, maybeReviewRequest);
}

export function updateMemberReview(reviewId, reviewRequest) {
  return httpRequester.put(`/review/${reviewId}`, reviewRequest);
}

export function deleteMemberReview(reviewId) {
  return httpRequester.delete(`/review/${reviewId}`);
}
