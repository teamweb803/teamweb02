export const orderReviewItems = [
  {
    productId: 3,
    orderNo: 'HS-240320-1089',
    memberName: 'roomtone',
    product: '아일랜드 모듈 소파',
    option: '4인 카우치형 / 샌드 베이지',
    status: '배송완료',
    review: {
      rating: 5,
      title: '거실 분위기가 바로 달라졌어요',
      content: '조합성이 좋고 패브릭 촉감도 좋아서 가족용 소파로 만족하며 사용 중입니다.',
    },
  },
  {
    productId: 4,
    orderNo: 'HS-240315-0951',
    memberName: 'oakmemo',
    product: '사이드 모션 데스크',
    option: '1400 / 오크',
    status: '리뷰 작성 가능',
    review: null,
  },
];

export const qnaThreads = [
  {
    id: 1,
    title: '리클라이너 체험 가능 매장 문의',
    author: 'roomtone',
    date: '2026-03-18',
    image: '/content-images/modular-sofa.jpg',
    question:
      '온라인에서 본 리클라이너를 직접 앉아보고 싶습니다. 수도권에 체험 가능한 매장이 있을까요?',
    answer:
      '목동 플래그십과 분당 라이프샵에서 전시 중입니다. 방문 예약 후 상담받으실 수 있습니다.',
    status: '답변완료',
  },
  {
    id: 2,
    title: '상판 색상 샘플 요청',
    author: 'oakmemo',
    date: '2026-03-17',
    image: '/content-images/dining-table.jpg',
    question:
      '내추럴 오크와 브라운 오크를 실제 질감으로 비교하고 싶습니다. 온라인으로 샘플 요청이 가능할까요?',
    answer: null,
    status: '답변대기',
  },
];
