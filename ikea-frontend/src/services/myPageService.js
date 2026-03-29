import {
  buildProductCategoryPath,
  buildProductDetailPath,
  ROUTE_PATHS,
} from '../constants/routes';
import {
  createCatalogItem,
  createFallbackProfile,
} from '../mappers/myPageMapper';

export function getMyPageStaticContent(findProductById) {
  return {
    sectionLinks: [
      { id: 'overview', label: '내역 보기' },
      { id: 'orders', label: '주문 관리' },
      { id: 'activity', label: '관심 활동' },
      { id: 'support', label: '고객 지원' },
    ],
    summaryCards: [
      { id: 'orders', label: '진행중 주문', value: '2건' },
      { id: 'coupon', label: '사용 가능 쿠폰', value: '3장' },
      { id: 'point', label: '적립 포인트', value: '12,400P' },
      { id: 'review', label: '작성 가능한 리뷰', value: '2건' },
    ],
    orderSteps: [
      { id: 'paid', label: '결제완료', count: 1 },
      { id: 'ready', label: '배송준비', count: 1 },
      { id: 'shipping', label: '배송중', count: 1 },
      { id: 'done', label: '구매확정', count: 3 },
    ],
    quickLinks: [
      {
        id: 'cart',
        label: '장바구니 확인',
        to: ROUTE_PATHS.cart,
      },
      {
        id: 'sofa',
        label: '소파 다시 보기',
        to: buildProductCategoryPath('sofa'),
      },
      {
        id: 'qna',
        label: '1:1 문의 남기기',
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
        title: '1:1 문의하기',
        actionLabel: '문의 바로가기',
        to: ROUTE_PATHS.customerServiceQna,
      },
    ],
    accountHighlights: [
      { id: 'account', label: '로그인 계정' },
      { id: 'address', label: '기본 배송지' },
      { id: 'phone', label: '연락처' },
    ],
    recentOrders: [
      {
        id: '20260318-1842',
        date: '2026.03.18',
        status: '배송 준비',
        option: '거실 / 기본형',
        ...createCatalogItem('10489009', {
          brand: 'GLOSTAD',
          title: 'GLOSTAD 글로스타드 2인용소파 - 크니사 다크그레이',
          subtitle: '소파 / 2인용 소파',
          price: '140,000원',
          image: '/theme-images/apartment-neutral.jpg',
          productId: '10489009',
        }, findProductById),
      },
      {
        id: '20260312-0915',
        date: '2026.03.12',
        status: '배송중',
        option: '거실 / 모듈형',
        ...createCatalogItem('s69305616', {
          brand: 'SÖDERHAMN',
          title: 'SÖDERHAMN 쇠데르함 3인용섹션 - 비아르프 베이지/브라운',
          subtitle: '소파 / 모듈형 소파',
          price: '649,000원',
          image: '/content-images/modular-sofa.jpg',
          productId: 's69305616',
        }, findProductById),
      },
    ],
    wishListItems: [
      {
        id: 'wish-1',
        ...createCatalogItem('40595937', {
          brand: 'GLOSTAD',
          title: 'GLOSTAD 글로스타드 3인용소파 - 크니사 다크그레이',
          subtitle: '소파 / 3인용 소파',
          price: '199,000원',
          image: '/content-images/showroom-furniture.jpg',
          productId: '40595937',
        }, findProductById),
      },
      {
        id: 'wish-2',
        ...createCatalogItem('s99495827', {
          brand: 'HYLTARP',
          title: 'HYLTARP 휠타르프 3인용소파+오른쪽긴의자 - 그란셀 스크베이지',
          subtitle: '소파 / 카우치형 소파',
          price: '1,899,000원',
          image: '/theme-images/family-comfort.jpg',
          productId: 's99495827',
        }, findProductById),
      },
    ],
    recentViewItems: [
      {
        id: 'recent-1',
        to: buildProductDetailPath('70571242'),
        ...createCatalogItem('70571242', {
          brand: 'SLATTUM',
          title: 'SLATTUM 슬라툼 쿠션형 침대프레임 - 비슬레 다크그레이 120x200 cm',
          subtitle: '침대/매트리스 / 침대',
          price: '179,000원',
          image: '/content-images/hotel-bed.jpg',
          productId: '70571242',
        }, findProductById),
      },
      {
        id: 'recent-2',
        to: buildProductDetailPath('s09420394'),
        ...createCatalogItem('s09420394', {
          brand: 'SANDSBERG',
          title: 'SANDSBERG 산드베리 테이블 블랙 110x67 cm',
          subtitle: '식탁/테이블/의자 / 테이블',
          price: '79,900원',
          image: '/content-images/dining-table.jpg',
          productId: 's09420394',
        }, findProductById),
      },
    ],
  };
}

export function getFallbackMyPageProfile(accountStore) {
  return createFallbackProfile(accountStore);
}
