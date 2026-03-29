import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCartStore } from '../stores/cart';

export function useCommerceCart() {
  const cartStore = useCartStore();
  const {
    cartItems,
    recommendations,
    selectedItems,
  } = storeToRefs(cartStore);

  const allSelected = computed({
    get() {
      return cartStore.allSelected;
    },
    set(value) {
      cartStore.setAllSelected(value);
    },
  });

  function updateQuantity(itemId, delta) {
    cartStore.updateQuantity(itemId, delta);
  }

  function removeItem(itemId) {
    cartStore.removeItem(itemId);
  }

  function removeSelected() {
    cartStore.removeSelected();
  }

  return {
    cartItems,
    selectedItems,
    allSelected,
    recommendations,
    updateQuantity,
    removeItem,
    removeSelected,
  };
}

export function getCheckoutSeedItems(mode = 'all', itemId = '') {
  return useCartStore().resolveCheckoutItems(mode, itemId);
}

export function completeCheckout(payload) {
  return useCartStore().completeCheckout(payload);
}

export function getLatestCompletedOrder() {
  return useCartStore().getLatestCompletedOrder();
}
