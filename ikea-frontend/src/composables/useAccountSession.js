import { computed, reactive, shallowRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { ROUTE_PATHS } from '../constants/routes';
import { loginAuth, logoutAuth } from '../services/authService';
import { getCurrentMember } from '../services/memberService';
import { useAccountStore } from '../stores/account';

function unwrapPayload(payload) {
  return payload?.data ?? payload ?? {};
}

function extractTokens(payload) {
  const source = unwrapPayload(payload);
  const candidate = source.tokens ?? source.token ?? source.auth ?? source;

  return {
    accessToken: candidate.accessToken ?? candidate.access ?? '',
    refreshToken: candidate.refreshToken ?? candidate.refresh ?? '',
  };
}

function extractMemberSession(payload) {
  const source = unwrapPayload(payload);
  const candidate = source.member ?? source.me ?? source.user ?? source.profile ?? source;

  if (candidate && (candidate.memberId || candidate.loginId || candidate.name || candidate.memberName)) {
    return candidate;
  }

  return null;
}

function resolveRedirectPath(redirectPath) {
  if (typeof redirectPath === 'string' && redirectPath.startsWith('/')) {
    return redirectPath;
  }

  return ROUTE_PATHS.home;
}

export function useAccountSession() {
  const router = useRouter();
  const route = useRoute();
  const accountStore = useAccountStore();
  const loginForm = reactive({
    loginId: '',
    password: '',
  });
  const loginError = shallowRef('');
  const loginSubmitting = shallowRef(false);
  const logoutSubmitting = shallowRef(false);
  const {
    accessToken,
    loggedIn,
    loginId,
    memberName,
    profileHydrated,
    profileRequested,
    refreshToken,
  } = storeToRefs(accountStore);

  const displayName = computed(() => memberName.value || loginId.value || '');

  async function hydrateCurrentMember(options = {}) {
    const { force = false, silent = true } = options;

    if (!accessToken.value) {
      return null;
    }

    if (!force && (profileHydrated.value || profileRequested.value)) {
      return null;
    }

    accountStore.setProfileRequested(true);

    try {
      const response = await getCurrentMember();
      const session = extractMemberSession(response);

      if (session) {
        accountStore.setMemberSession(session);
      }

      accountStore.setProfileHydrated(true);
      return response;
    } catch (error) {
      if (!silent) {
        throw error;
      }

      return null;
    }
  }

  async function submitLogin(options = {}) {
    const { redirectPath = route.query.redirect } = options;
    loginError.value = '';
    loginSubmitting.value = true;

    try {
      const response = await loginAuth({
        loginId: loginForm.loginId.trim(),
        password: loginForm.password,
      });
      const tokens = extractTokens(response);

      if (!tokens.accessToken) {
        throw new Error('로그인 응답에 accessToken이 없습니다.');
      }

      accountStore.setTokens(tokens);
      accountStore.setProfileRequested(false);
      accountStore.setProfileHydrated(false);

      const memberSession = extractMemberSession(response);

      if (memberSession) {
        accountStore.setMemberSession(memberSession);
        accountStore.setProfileHydrated(true);
      } else {
        await hydrateCurrentMember({ force: true, silent: true });
      }

      router.push(resolveRedirectPath(redirectPath));
      return response;
    } catch (error) {
      loginError.value = error?.message ?? '로그인에 실패했습니다.';
      throw error;
    } finally {
      loginSubmitting.value = false;
    }
  }

  async function submitLogout() {
    if (logoutSubmitting.value) {
      return;
    }

    logoutSubmitting.value = true;

    try {
      if (refreshToken.value) {
        await logoutAuth(refreshToken.value);
      }
    } catch {
      // Preserve the current UX even if the backend logout endpoint is not ready yet.
    } finally {
      accountStore.clearAuth();
      logoutSubmitting.value = false;
    }

    router.push(ROUTE_PATHS.home);
  }

  return {
    displayName,
    hydrateCurrentMember,
    loggedIn,
    loginError,
    loginForm,
    loginSubmitting,
    logoutSubmitting,
    submitLogin,
    submitLogout,
  };
}
