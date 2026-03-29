import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { buildProductDetailPath } from '../constants/routes';
import { useMyPageStore } from '../stores/myPage';

export function useMyPage() {
  const myPageStore = useMyPageStore();
  const {
    accountHighlights,
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
  } = storeToRefs(myPageStore);

  onMounted(() => {
    if (!myPageStore.loaded && !myPageStore.isProfileLoading) {
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
