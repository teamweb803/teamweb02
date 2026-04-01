import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { buildProductDetailPath } from '../constants/routes';
import { createCatalogItem } from '../mappers/myPageMapper';
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
    recentViewItems,
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

  onMounted(() => {
    accountStore.hydrate();
    void catalogStore.ensureCatalogLoaded();
    wishlistStore.ensureHydrated();
    const currentSessionKey = accountStore.accessToken
      ? String(accountStore.memberId ?? accountStore.loginId ?? 'member')
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
