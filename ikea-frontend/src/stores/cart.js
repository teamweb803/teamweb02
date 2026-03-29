import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import {
  COMMERCE_SESSION_KEYS,
  VIRTUAL_ACCOUNT_BANKS,
  VIRTUAL_ACCOUNT_DUE_DAYS,
} from '../constants/commerce';
import {
  getFallbackCartItems,
  getFallbackRecommendations,
} from '../services/cartService';
import {
  buildCompletedOrderSnapshot,
  cloneCartItems,
  getCheckoutItems,
  removeCheckoutItems,
} from '../mappers/commerceMapper';

const STORAGE_KEY = COMMERCE_SESSION_KEYS.cart;
const ORDER_COMPLETION_KEY = COMMERCE_SESSION_KEYS.orderCompletion;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function cloneFallbackCart() {
  return cloneCartItems(getFallbackCartItems());
}

function readStoredCart() {
  if (!canUseStorage()) {
    return cloneFallbackCart();
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return cloneFallbackCart();
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : cloneFallbackCart();
  } catch {
    return cloneFallbackCart();
  }
}

function writeStoredCart(items) {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function readStoredCompletedOrder() {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(ORDER_COMPLETION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredCompletedOrder(orderSnapshot) {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.setItem(ORDER_COMPLETION_KEY, JSON.stringify(orderSnapshot));
}

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref(readStoredCart());
  const completedOrder = ref(readStoredCompletedOrder());
  const selectedItems = computed(() => cartItems.value.filter((item) => item.selected));
  const allSelected = computed(() => (
    cartItems.value.length > 0 && cartItems.value.every((item) => item.selected)
  ));
  const recommendations = computed(() => getFallbackRecommendations(
    cartItems.value.map((item) => item.productId),
  ));

  watch(
    cartItems,
    (items) => {
      writeStoredCart(items);
    },
    { deep: true },
  );

  watch(
    completedOrder,
    (orderSnapshot) => {
      if (orderSnapshot) {
        writeStoredCompletedOrder(orderSnapshot);
      }
    },
    { deep: true },
  );

  function setAllSelected(value) {
    cartItems.value = cartItems.value.map((item) => ({ ...item, selected: value }));
  }

  function setItemSelected(itemId, value) {
    cartItems.value = cartItems.value.map((item) => (
      item.id === itemId ? { ...item, selected: value } : item
    ));
  }

  function updateQuantity(itemId, delta) {
    cartItems.value = cartItems.value.map((item) => {
      if (item.id !== itemId) {
        return item;
      }

      return {
        ...item,
        quantity: Math.max(1, item.quantity + delta),
      };
    });
  }

  function removeItem(itemId) {
    cartItems.value = cartItems.value.filter((item) => item.id !== itemId);
  }

  function removeSelected() {
    cartItems.value = cartItems.value.filter((item) => !item.selected);
  }

  function resolveCheckoutItems(mode = 'all', itemId = '') {
    return getCheckoutItems(cartItems.value, mode, itemId);
  }

  function completeCheckout(payload) {
    const orderSnapshot = buildCompletedOrderSnapshot(payload, {
      virtualAccountBanks: VIRTUAL_ACCOUNT_BANKS,
      virtualAccountDueDays: VIRTUAL_ACCOUNT_DUE_DAYS,
    });

    completedOrder.value = orderSnapshot;
    cartItems.value = removeCheckoutItems(cartItems.value, payload.mode, payload.itemId);

    return orderSnapshot;
  }

  function getLatestCompletedOrder() {
    return completedOrder.value;
  }

  return {
    allSelected,
    cartItems,
    completedOrder,
    recommendations,
    selectedItems,
    completeCheckout,
    getLatestCompletedOrder,
    removeItem,
    removeSelected,
    resolveCheckoutItems,
    setAllSelected,
    setItemSelected,
    updateQuantity,
  };
});
