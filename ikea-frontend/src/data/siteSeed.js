import { backendCategories as catalogCategories } from './catalog';
import { categoryDealFilters, categoryDealCollections, curatedSpotlight, newItemCollections, newItemFilters, pickSection, weeklyDeals } from './home/collections';
import { heroSlides } from './home/heroSlides';
import { topShortcutBoxes } from './home/topShortcuts';

export const sofaTypeCards = catalogCategories.find((category) => category.slug === 'sofa')?.cards ?? [];

export const mainTabs = [
  { id: 'furniture', label: '가구/홈리빙' },
  { id: 'customer-service', label: '고객센터' },
];

export const backendCategories = catalogCategories;

export {
  categoryDealCollections,
  categoryDealFilters,
  curatedSpotlight,
  heroSlides,
  newItemCollections,
  newItemFilters,
  pickSection,
  topShortcutBoxes,
  weeklyDeals,
};

export const footerLinks = ['회사소개', '이용약관', '개인정보처리방침', '고객센터'];

export const footerSupportCards = [
  {
    title: '상품 문의',
    description: '상품, 주문, 배송 관련 상담',
    phone: '1688-4945',
    cta: '문의하기',
  },
  {
    title: '설치/반품 문의',
    description: '설치 일정, 교환, 반품 상담',
    phone: '1688-4945',
    cta: '고객센터',
  },
];

export const footerInfoLines = [
  'HOMiO 온라인 스토어',
  '상담시간 평일 09:00 - 18:00',
  '토요일 09:00 - 13:00',
  '일요일 및 공휴일 휴무',
];

export const footerNotice = '';
