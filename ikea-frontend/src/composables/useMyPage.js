import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { buildProductDetailPath } from '../constants/routes';
import { createCatalogItem } from '../mappers/myPageMapper';
import {
  readRecentViewEntries,
  resolveRecentViewSessionKey,
} from '../services/recentViewService';
import { useAccountStore } from '../stores/account';
import { useCatalogStore } from '../stores/catalog';
import { useMyPageStore } from '../stores/myPage';
import { useWishlistStore } from '../stores/wishlist';

export function useMyPage() {
  const myPageStore = useMyPageStore();
  const accountStore = useAccountStore();
  const catalogStore = useCatalogStore();
  const wishlistStore = useWishlistStore();
  const {
    accountHighlights,
    isProfileLoading,
    loadedSessionKey,
    orderSteps,
    profile,
    profileError,
    quickLinks,
    recentOrders,
    sectionLinks,
    summaryCards,
    supportCards,
  } = storeToRefs(myPageStore);
  const { productIds: wishlistedProductIds } = storeToRefs(wishlistStore);

  const wishListItems = computed(() => (
    wishlistedProductIds.value
      .map((productId, index) => {
        const item = createCatalogItem(productId, null, (currentProductId) => (
          catalogStore.findProductById(currentProductId)
        ));

        if (!item) {
          return null;
        }

        return {
          id: `wishlist-${productId}-${index}`,
          ...item,
        };
      })
      .filter(Boolean)
  ));
  const recentViewItems = computed(() => {
    const sessionKey = resolveRecentViewSessionKey(accountStore);

    if (!sessionKey) {
      return [];
    }

    return readRecentViewEntries(sessionKey)
      .map((entry, index) => {
        const item = createCatalogItem(entry.productId, entry, (currentProductId) => (
          catalogStore.findProductById(currentProductId)
        ));

        if (!item) {
          return null;
        }

        return {
          id: `recent-view-${entry.productId}-${index}`,
          to: buildProductDetailPath(entry.productId),
          ...item,
        };
      })
      .filter(Boolean);
  });

  onMounted(() => {
    accountStore.hydrate();
    const recentViewSessionKey = resolveRecentViewSessionKey(accountStore);
    const recentViewEntries = recentViewSessionKey ? readRecentViewEntries(recentViewSessionKey) : [];

    void catalogStore.ensureCatalogLoaded();
    void Promise.allSettled(
      recentViewEntries
        .map((entry) => entry.productId)
        .filter((productId) => !catalogStore.findProductById(productId))
        .map((productId) => catalogStore.loadProductDetail(productId).catch(() => null)),
    );
    wishlistStore.ensureHydrated();
    const currentSessionKey = accountStore.accessToken
      ? String(accountStore.loginId ?? accountStore.memberId ?? 'member')
      : '';

    if (!myPageStore.isProfileLoading && (!myPageStore.loaded || loadedSessionKey.value !== currentSessionKey)) {
      myPageStore.loadProfile();
    }
  });

  return {
    accountHighlights,
    buildProductDetailPath,
    isProfileLoading,
    orderSteps,
    profile,
    profileError,
    quickLinks,
    recentOrders,
    recentViewItems,
    sectionLinks,
    summaryCards,
    supportCards,
    wishListItems,
  };
}
