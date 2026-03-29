import { defineStore } from 'pinia';

const AUTH_STORAGE_KEY = 'homio-auth-session';

function createDefaultAuthState() {
  return {
    accessToken: '',
    refreshToken: '',
    memberId: null,
    loginId: '',
    memberName: '',
    email: '',
    phoneNumber: '',
    zoneCode: '',
    addressMain: '',
    addressDetail: '',
    address: '',
    role: '',
    profileHydrated: false,
    profileRequested: false,
    hydrated: false,
  };
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function readPersistedAuthState() {
  if (!canUseStorage()) {
    return createDefaultAuthState();
  }

  try {
    const raw = window.sessionStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return createDefaultAuthState();
    }

    const parsed = JSON.parse(raw);

    return {
      ...createDefaultAuthState(),
      accessToken: parsed.accessToken ?? '',
      refreshToken: parsed.refreshToken ?? '',
      memberId: parsed.memberId ?? null,
      loginId: parsed.loginId ?? '',
      memberName: parsed.memberName ?? '',
      email: parsed.email ?? '',
      phoneNumber: parsed.phoneNumber ?? '',
      zoneCode: parsed.zoneCode ?? '',
      addressMain: parsed.addressMain ?? '',
      addressDetail: parsed.addressDetail ?? '',
      address: parsed.address ?? '',
      role: parsed.role ?? '',
      profileHydrated: parsed.profileHydrated ?? false,
    };
  } catch {
    return createDefaultAuthState();
  }
}

function persistAuthState(state) {
  if (!canUseStorage()) {
    return;
  }

  const snapshot = {
    accessToken: state.accessToken ?? '',
    refreshToken: state.refreshToken ?? '',
    memberId: state.memberId ?? null,
    loginId: state.loginId ?? '',
    memberName: state.memberName ?? '',
    email: state.email ?? '',
    phoneNumber: state.phoneNumber ?? '',
    zoneCode: state.zoneCode ?? '',
    addressMain: state.addressMain ?? '',
    addressDetail: state.addressDetail ?? '',
    address: state.address ?? '',
    role: state.role ?? '',
    profileHydrated: state.profileHydrated ?? false,
  };

  const hasAuthData = Object.values(snapshot).some((value) => value !== '' && value !== null);

  if (!hasAuthData) {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(snapshot));
}

export const useAccountStore = defineStore('account', {
  state: () => createDefaultAuthState(),
  getters: {
    checked: (state) => state.hydrated,
    loggedIn: (state) => Boolean(state.accessToken),
    displayAddress: (state) => {
      const joinedAddress = [state.addressMain, state.addressDetail]
        .filter((value) => String(value ?? '').trim() !== '')
        .join(' ');

      return joinedAddress || state.address || '';
    },
  },
  actions: {
    hydrate() {
      if (this.hydrated) {
        return;
      }

      Object.assign(this, readPersistedAuthState(), { hydrated: true });
    },
    setAccessToken(accessToken = '') {
      this.accessToken = accessToken;
      persistAuthState(this);
    },
    setRefreshToken(refreshToken = '') {
      this.refreshToken = refreshToken;
      persistAuthState(this);
    },
    setTokens(tokens = {}) {
      this.accessToken = tokens.accessToken ?? '';
      this.refreshToken = tokens.refreshToken ?? '';
      persistAuthState(this);
    },
    setMemberSession(session = {}) {
      const zoneCode = session.zoneCode ?? session.zipCode ?? '';
      const addressMain = session.addressMain ?? session.baseAddress ?? '';
      const addressDetail = session.addressDetail ?? session.detailAddress ?? '';
      const displayAddress = session.address ?? [addressMain, addressDetail]
        .filter((value) => String(value ?? '').trim() !== '')
        .join(' ');

      this.memberId = session.memberId ?? null;
      this.loginId = session.loginId ?? '';
      this.memberName = session.memberName ?? session.name ?? '';
      this.email = session.email ?? '';
      this.phoneNumber = session.phoneNumber ?? session.phone ?? session.tel ?? '';
      this.zoneCode = zoneCode;
      this.addressMain = addressMain;
      this.addressDetail = addressDetail;
      this.address = displayAddress;
      this.role = session.role ?? session.memberRole ?? '';
      persistAuthState(this);
    },
    setProfileHydrated(hydrated = true) {
      this.profileHydrated = hydrated;
      persistAuthState(this);
    },
    setProfileRequested(requested = true) {
      this.profileRequested = requested;
    },
    setAuthSession(payload = {}) {
      this.setTokens(payload.tokens ?? {});
      this.setMemberSession(payload.member ?? {});
    },
    clearMemberSession() {
      this.memberId = null;
      this.loginId = '';
      this.memberName = '';
      this.email = '';
      this.phoneNumber = '';
      this.zoneCode = '';
      this.addressMain = '';
      this.addressDetail = '';
      this.address = '';
      this.role = '';
      this.profileHydrated = false;
      this.profileRequested = false;
      persistAuthState(this);
    },
    clearAuth() {
      Object.assign(this, createDefaultAuthState(), { hydrated: true });
      persistAuthState(this);
    },
  },
});
