import httpRequester from '../libs/httpRequester';
import { useAccountStore } from '../stores/account';

function resolveCurrentMemberId() {
  const accountStore = useAccountStore();
  accountStore.hydrate();

  if (accountStore.memberId === null || accountStore.memberId === undefined || accountStore.memberId === '') {
    throw new Error('Current memberId is unavailable.');
  }

  return accountStore.memberId;
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

export function updateCurrentMember(memberUpdateRequest, memberId = resolveCurrentMemberId()) {
  return httpRequester.put(`/member/${memberId}`, memberUpdateRequest);
}

export function updateMember(memberIdOrMemberUpdateRequest, maybeMemberUpdateRequest) {
  if (maybeMemberUpdateRequest === undefined) {
    return updateCurrentMember(memberIdOrMemberUpdateRequest);
  }

  return httpRequester.put(`/member/${memberIdOrMemberUpdateRequest}`, maybeMemberUpdateRequest);
}

export function deleteCurrentMember(memberId = resolveCurrentMemberId()) {
  return httpRequester.delete(`/member/${memberId}`);
}

export function deleteMember(memberId = resolveCurrentMemberId()) {
  return httpRequester.delete(`/member/${memberId}`);
}
