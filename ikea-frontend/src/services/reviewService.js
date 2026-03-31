import httpRequester from '../libs/httpRequester';
import { useAccountStore } from '../stores/account';

function resolveCurrentMemberId() {
  const accountStore = useAccountStore();
  accountStore.hydrate();

  if (accountStore.memberId === null || accountStore.memberId === undefined || accountStore.memberId === '') {
    throw new Error('Current memberId is unavailable.');
  }

  return accountStore.memberId;
}

export function getProductReviews(productId) {
  return httpRequester.get(`/review/product/${productId}`);
}

export function getMyReviews(memberId = resolveCurrentMemberId()) {
  return httpRequester.get(`/review/member/${memberId}`);
}

export function getMemberReviews(memberId = resolveCurrentMemberId()) {
  return getMyReviews(memberId);
}

export function createMyReview(memberIdOrReviewRequest, maybeReviewRequest) {
  if (maybeReviewRequest === undefined) {
    return httpRequester.post(`/review/${resolveCurrentMemberId()}`, memberIdOrReviewRequest);
  }

  return httpRequester.post(`/review/${memberIdOrReviewRequest}`, maybeReviewRequest);
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
