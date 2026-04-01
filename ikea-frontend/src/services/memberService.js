import httpRequester from '../libs/httpRequester';
import { useAccountStore } from '../stores/account';

function resolveCurrentMemberId() {
  const accountStore = useAccountStore();
  accountStore.hydrate();

  if (
    accountStore.memberId === null
    || accountStore.memberId === undefined
    || accountStore.memberId === ''
  ) {
    return null;
  }

  return accountStore.memberId;
}

function shouldFallbackMemberRequest(error) {
  return [400, 404, 405].includes(Number(error?.status ?? 0));
}

async function runMemberRequestWithFallback(primaryRequest, fallbackRequest) {
  try {
    return await primaryRequest();
  } catch (error) {
    if (!fallbackRequest || !shouldFallbackMemberRequest(error)) {
      throw error;
    }

    return fallbackRequest();
  }
}

export function joinMember(memberJoinRequest) {
  return httpRequester.post('/member/join', memberJoinRequest);
}

export function loginMember(memberLoginRequest) {
  return httpRequester.post('/member/login', memberLoginRequest);
}

export function getMember(memberId) {
  return httpRequester.get(`/member/${memberId}`);
}

export function getCurrentMember() {
  return httpRequester.get('/member/me');
}

export function updateCurrentMember(memberUpdateRequest) {
  const memberId = resolveCurrentMemberId();

  return runMemberRequestWithFallback(
    () => httpRequester.put('/member/me', memberUpdateRequest),
    memberId === null
      ? null
      : () => httpRequester.put(`/member/${memberId}`, memberUpdateRequest),
  );
}

export function updateMember(memberIdOrMemberUpdateRequest, maybeMemberUpdateRequest) {
  if (maybeMemberUpdateRequest === undefined) {
    return updateCurrentMember(memberIdOrMemberUpdateRequest);
  }

  return httpRequester.put(`/member/${memberIdOrMemberUpdateRequest}`, maybeMemberUpdateRequest);
}

export function deleteCurrentMember() {
  const memberId = resolveCurrentMemberId();

  return runMemberRequestWithFallback(
    () => httpRequester.delete('/member/me'),
    memberId === null ? null : () => httpRequester.delete(`/member/${memberId}`),
  );
}

export function deleteMember(memberId = resolveCurrentMemberId()) {
  if (memberId === null || memberId === undefined || memberId === '') {
    return deleteCurrentMember();
  }

  return httpRequester.delete(`/member/${memberId}`);
}
