import { computed } from 'vue';
import { calculateShippingTotal } from '../services/commerceShippingService';

export function useCartViewState(router, orderCheckoutPath, selectedItems, recommendations) {
  const recommendProducts = computed(() => recommendations.value.slice(0, 4));
  const productTotal = computed(() =>
    selectedItems.value.reduce(
      (sum, item) => sum + ((item.originalPrice ?? item.price) * item.quantity),
      0,
    ));
  const discountTotal = computed(() =>
    selectedItems.value.reduce(
      (sum, item) => sum + (((item.originalPrice ?? item.price) - item.price) * item.quantity),
      0,
    ));
  const shippingTotal = computed(() => calculateShippingTotal(selectedItems.value));
  const finalTotal = computed(() => (
    selectedItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    + shippingTotal.value
  ));

  function formatPrice(value) {
    return `${Number(value ?? 0).toLocaleString('ko-KR')}원`;
  }

  function goToCheckout(mode = 'all', itemId = '') {
    const query = { mode };

    if (itemId) {
      query.itemId = itemId;
    }

    router.push({
      path: orderCheckoutPath,
      query,
    });
  }

  return {
    discountTotal,
    finalTotal,
    formatPrice,
    goToCheckout,
    productTotal,
    recommendProducts,
    shippingTotal,
  };
}
