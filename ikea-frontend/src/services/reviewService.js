import httpRequester from '../libs/httpRequester';
import { useAccountStore } from '../stores/account';

function resolveCurrentMemberId() {
  const accountStore = useAccountStore();
  accountStore.hydrate();

  if (
    accountStore.memberId === null
    || accountStore.memberId === undefined
    || accountStore.memberId === ''
  ) {
    return null;
  }

  return accountStore.memberId;
}

function shouldFallbackReviewRequest(error) {
  return [400, 404, 405].includes(Number(error?.status ?? 0));
}

async function runReviewRequestWithFallback(requestFactories = []) {
  let lastError = null;

  for (let index = 0; index < requestFactories.length; index += 1) {
    const requestFactory = requestFactories[index];

    try {
      return await requestFactory();
    } catch (error) {
      lastError = error;

      if (!shouldFallbackReviewRequest(error) || index === requestFactories.length - 1) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error('Review request failed.');
}

function buildLegacyMemberReviewPath() {
  const memberId = resolveCurrentMemberId();
  return memberId === null ? '' : `/review/member/${memberId}`;
}

function buildLegacyMemberReviewCreatePath() {
  const memberId = resolveCurrentMemberId();
  return memberId === null ? '' : `/review/${memberId}`;
}

export function getProductReviews(productId) {
  return httpRequester.get(`/review/product/${productId}`);
}

export async function getMyReviews() {
  const legacyPath = buildLegacyMemberReviewPath();
  const requestFactories = [
    () => httpRequester.get('/review/me'),
    () => httpRequester.get('/review/my'),
  ];

  if (legacyPath) {
    requestFactories.push(() => httpRequester.get(legacyPath));
  }

  return runReviewRequestWithFallback(requestFactories);
}

export function getMemberReviews() {
  return getMyReviews();
}

export async function createMyReview(memberIdOrReviewRequest, maybeReviewRequest) {
  const reviewRequest = maybeReviewRequest ?? memberIdOrReviewRequest;
  const legacyPath = buildLegacyMemberReviewCreatePath();
  const requestFactories = [
    () => httpRequester.post('/review/me', reviewRequest),
    () => httpRequester.post('/review', reviewRequest),
  ];

  if (legacyPath) {
    requestFactories.push(() => httpRequester.post(legacyPath, reviewRequest));
  }

  return runReviewRequestWithFallback(requestFactories);
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
