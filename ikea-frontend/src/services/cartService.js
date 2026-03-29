import httpRequester from '../libs/httpRequester';
import {
  createCommerceCartSeed,
  createCommerceRecommendations,
} from '../data/commerceSeed';

export function getMemberCart(memberId) {
  return httpRequester.get(`/cart/${memberId}`);
}

export function addCartItem(memberId, cartRequest) {
  return httpRequester.post(`/cart/${memberId}`, cartRequest);
}

export function updateCartItemQuantity(cartItemId, quantity) {
  return httpRequester.patch(`/cart/${cartItemId}/quantity`, { quantity });
}

export function deleteCartItem(cartItemId) {
  return httpRequester.delete(`/cart/${cartItemId}`);
}

export function clearMemberCart(memberId) {
  return httpRequester.delete(`/cart/${memberId}/clear`);
}

export function getFallbackCartItems() {
  return createCommerceCartSeed();
}

export function getFallbackRecommendations(excludeIds = []) {
  return createCommerceRecommendations(excludeIds);
}
