import { defineStore } from 'pinia';
import { getMember } from '../services/memberService';
import {
  getFallbackMyPageProfile,
  getMyPageStaticContent,
} from '../services/myPageService';
import { normalizeMemberProfile } from '../mappers/myPageMapper';
import { useAccountStore } from './account';
import { useCatalogStore } from './catalog';

export const useMyPageStore = defineStore('myPage', {
  state: () => {
    const catalogStore = useCatalogStore();
    const accountStore = useAccountStore();

    return {
      ...getMyPageStaticContent((productId) => catalogStore.findProductById(productId)),
      profile: getFallbackMyPageProfile(accountStore),
      isProfileLoading: false,
      profileError: '',
      loaded: false,
    };
  },
  actions: {
    async loadProfile() {
      const accountStore = useAccountStore();

      if (!accountStore.memberId) {
        this.profile = getFallbackMyPageProfile(accountStore);
        this.loaded = true;
        return;
      }

      this.isProfileLoading = true;
      this.profileError = '';

      try {
        const response = await getMember(accountStore.memberId);
        this.profile = normalizeMemberProfile(response, accountStore);
      } catch (error) {
        this.profile = getFallbackMyPageProfile(accountStore);
        this.profileError = '회원 정보를 다시 확인해 주세요.';
        console.error(error);
      } finally {
        this.isProfileLoading = false;
        this.loaded = true;
      }
    },
  },
});
