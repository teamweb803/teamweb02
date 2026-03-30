import httpRequester from '../libs/httpRequester';
import {
  createCommerceCartSeed,
  createCommerceRecommendations,
} from '../data/commerceSeed';

export function getMyCart() {
  return httpRequester.get('/cart');
}

export function getMemberCart() {
  return getMyCart();
}

export function addCartItem(memberIdOrCartRequest, maybeCartRequest) {
  const cartRequest = maybeCartRequest === undefined ? memberIdOrCartRequest : maybeCartRequest;
  return httpRequester.post('/cart', cartRequest);
}

export function updateCartItemQuantity(cartItemId, quantity) {
  return httpRequester.patch(
    `/cart/${cartItemId}/quantity`,
    { quantity },
    { query: { quantity } },
  );
}

export function deleteCartItem(cartItemId) {
  return httpRequester.delete(`/cart/${cartItemId}`);
}

export function clearMyCart() {
  return httpRequester.delete('/cart/clear');
}

export function clearMemberCart() {
  return clearMyCart();
}

export function getFallbackCartItems() {
  return createCommerceCartSeed();
}

export function getFallbackRecommendations(excludeIds = []) {
  return createCommerceRecommendations(excludeIds);
}
