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

export async function getCurrentMember(memberId) {
  const normalizedMemberId = Number.parseInt(memberId, 10);

  if (!Number.isFinite(normalizedMemberId)) {
    return null;
  }

  try {
    return await httpRequester.get('/member/me', {
      query: {
        memberId: normalizedMemberId,
      },
    });
  } catch (error) {
    if (error?.status !== 400 && error?.status !== 404 && error?.status !== 405) {
      throw error;
    }
  }

  return httpRequester.get(`/member/${normalizedMemberId}`);
}

export function updateMember(memberId, memberUpdateRequest) {
  return httpRequester.put(`/member/${memberId}`, memberUpdateRequest);
}

export function deleteMember(memberId) {
  return httpRequester.delete(`/member/${memberId}`);
}
