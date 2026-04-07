import { defineStore } from 'pinia';
import { ROUTE_PATHS } from '../constants/routes';
import {
  readWishlistProductIds,
  resolveWishlistSessionKey,
  writeWishlistProductIds,
} from '../services/wishlistService';
import { useAccountStore } from './account';

const WISHLIST_TOAST_DURATION = 2200;

let wishlistToastTimer = 0;

function clearWishlistToastTimer() {
  if (typeof window === 'undefined' || !wishlistToastTimer) {
    return;
  }

  window.clearTimeout(wishlistToastTimer);
  wishlistToastTimer = 0;
}

function normalizeProductId(productId = '') {
  return String(productId ?? '').trim();
}

function resolveToastMessage(added) {
  return added
    ? '찜한 상품에 추가되었습니다.'
    : '찜한 상품에서 제거되었습니다.';
}

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    productIds: [],
    loadedSessionKey: '',
    loginPromptOpen: false,
    loginPromptRedirectPath: ROUTE_PATHS.home,
    toastOpen: false,
    toastMessage: '',
    toastTone: 'added',
  }),
  getters: {
    isProductWishlisted: (state) => (productId) => (
      state.productIds.includes(normalizeProductId(productId))
    ),
  },
  actions: {
    ensureHydrated() {
      const accountStore = useAccountStore();
      accountStore.hydrate();

      const sessionKey = resolveWishlistSessionKey(accountStore);

      if (this.loadedSessionKey === sessionKey) {
        return;
      }

      this.productIds = sessionKey ? readWishlistProductIds(sessionKey) : [];
      this.loadedSessionKey = sessionKey;
    },
    closeLoginPrompt() {
      this.loginPromptOpen = false;
      this.loginPromptRedirectPath = ROUTE_PATHS.home;
    },
    openLoginPrompt(redirectPath = ROUTE_PATHS.home) {
      this.loginPromptRedirectPath = String(redirectPath ?? '').startsWith('/')
        ? redirectPath
        : ROUTE_PATHS.home;
      this.loginPromptOpen = true;
    },
    dismissToast() {
      clearWishlistToastTimer();
      this.toastOpen = false;
      this.toastMessage = '';
    },
    showToast(added) {
      clearWishlistToastTimer();
      this.toastTone = added ? 'added' : 'removed';
      this.toastMessage = resolveToastMessage(added);
      this.toastOpen = true;

      if (typeof window === 'undefined') {
        return;
      }

      wishlistToastTimer = window.setTimeout(() => {
        this.toastOpen = false;
        this.toastMessage = '';
        wishlistToastTimer = 0;
      }, WISHLIST_TOAST_DURATION);
    },
    toggleProduct(product, options = {}) {
      this.ensureHydrated();

      if (!this.loadedSessionKey) {
        this.openLoginPrompt(options.redirectPath);
        return { status: 'login-required' };
      }

      const productId = normalizeProductId(product?.id ?? product?.productId);

      if (!productId) {
        return { status: 'invalid' };
      }

      const alreadyWishlisted = this.productIds.includes(productId);

      this.productIds = alreadyWishlisted
        ? this.productIds.filter((currentId) => currentId !== productId)
        : [productId, ...this.productIds.filter((currentId) => currentId !== productId)];

      writeWishlistProductIds(this.loadedSessionKey, this.productIds);
      this.showToast(!alreadyWishlisted);

      return {
        status: alreadyWishlisted ? 'removed' : 'added',
      };
    },
  },
});
