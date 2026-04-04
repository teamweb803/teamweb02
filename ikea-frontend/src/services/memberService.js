import httpRequester from '../libs/httpRequester';

export function joinMember(memberJoinRequest) {
  return httpRequester.post('/member/join', memberJoinRequest);
}

export function loginMember(memberLoginRequest) {
  return httpRequester.post('/member/login', memberLoginRequest);
}

export function getCurrentMember() {
  return httpRequester.get('/member/me');
}

export function getMember(_memberId) {
  return getCurrentMember();
}

export function updateCurrentMember(memberUpdateRequest) {
  return httpRequester.put('/member/me', memberUpdateRequest);
}

export function updateMember(memberIdOrMemberUpdateRequest, maybeMemberUpdateRequest) {
  const memberUpdateRequest = maybeMemberUpdateRequest === undefined
    ? memberIdOrMemberUpdateRequest
    : maybeMemberUpdateRequest;

  return updateCurrentMember(memberUpdateRequest);
}

export function deleteCurrentMember() {
  return httpRequester.delete('/member/me');
}

export function deleteMember(_memberId) {
  return deleteCurrentMember();
}
