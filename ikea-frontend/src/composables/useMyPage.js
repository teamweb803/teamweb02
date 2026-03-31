import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { buildProductDetailPath } from '../constants/routes';
import { useAccountStore } from '../stores/account';
import { useMyPageStore } from '../stores/myPage';

export function useMyPage() {
  const myPageStore = useMyPageStore();
  const accountStore = useAccountStore();
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
    wishListItems,
  } = storeToRefs(myPageStore);

  onMounted(() => {
    accountStore.hydrate();
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
