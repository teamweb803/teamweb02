import { ROUTE_PATHS } from '../constants/routes';
import { createEmptyOrderStatusSteps } from '../constants/orderStatus';
import { createFallbackProfile } from '../mappers/myPageMapper';

export function getMyPageStaticContent() {
  return {
    sectionLinks: [
      { id: 'overview', label: '내역 보기' },
      { id: 'orders', label: '주문 관리' },
      { id: 'activity', label: '관심 활동' },
      { id: 'support', label: '고객 지원' },
    ],
    summaryCards: [
      { id: 'orders', label: '진행중 주문', value: '0건' },
      { id: 'coupon', label: '사용 가능 쿠폰', value: '0장' },
      { id: 'point', label: '보유 포인트', value: '0P' },
      { id: 'review', label: '작성 가능 리뷰', value: '0건' },
    ],
    orderSteps: createEmptyOrderStatusSteps(),
    quickLinks: [
      {
        id: 'cart',
        label: '장바구니 확인',
        to: ROUTE_PATHS.cart,
      },
      {
        id: 'home',
        label: '홈으로 가기',
        to: ROUTE_PATHS.home,
      },
      {
        id: 'qna',
        label: '1:1 QnA 가기',
        to: ROUTE_PATHS.customerServiceQna,
      },
    ],
    supportCards: [
      {
        id: 'faq',
        title: '자주 묻는 질문',
        actionLabel: 'FAQ 보기',
        to: ROUTE_PATHS.customerServiceFaq,
      },
      {
        id: 'notice',
        title: '공지사항 확인',
        actionLabel: '공지 보기',
        to: ROUTE_PATHS.customerServiceNotice,
      },
      {
        id: 'qna',
        title: '1:1 QnA',
        actionLabel: 'QnA 바로가기',
        to: ROUTE_PATHS.customerServiceQna,
      },
    ],
    accountHighlights: [
      { id: 'account', label: '로그인 계정' },
      { id: 'address', label: '기본 배송지' },
      { id: 'phone', label: '연락처' },
    ],
    recentOrders: [],
    wishListItems: [],
    recentViewItems: [],
  };
}

export function getFallbackMyPageProfile(accountStore) {
  return createFallbackProfile(accountStore);
}
