import httpRequester from '../libs/httpRequester';

export function joinMember(memberJoinRequest) {
  return httpRequester.post('/member/join', memberJoinRequest);
}

export function loginMember(memberLoginRequest) {
  return httpRequester.post('/member/login', memberLoginRequest);
}

export function getMember(memberId) {
  return httpRequester.get(`/member/${memberId}`);
}

export async function getCurrentMember() {
  try {
    return await httpRequester.get('/member/me');
  } catch (error) {
    if (error?.status !== 404 && error?.status !== 405) {
      throw error;
    }
  }

  return httpRequester.get('/auth/me');
}

export function updateMember(memberId, memberUpdateRequest) {
  return httpRequester.put(`/member/${memberId}`, memberUpdateRequest);
}

export function deleteMember(memberId) {
  return httpRequester.delete(`/member/${memberId}`);
}
