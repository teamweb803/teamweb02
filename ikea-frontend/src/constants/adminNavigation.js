import { ROUTE_PATHS } from './routes';

export const ADMIN_NAV_ITEMS = [
  {
    id: 'dashboard',
    label: '대시보드',
    title: '대시보드',
    to: ROUTE_PATHS.adminDashboard,
  },
  {
    id: 'products',
    label: '상품 관리',
    title: '상품 관리',
    to: ROUTE_PATHS.adminProducts,
  },
  {
    id: 'inventory',
    label: '재고 관리',
    title: '재고 관리',
    to: ROUTE_PATHS.adminInventory,
  },
  {
    id: 'orders',
    label: '주문 관리',
    title: '주문 관리',
    to: ROUTE_PATHS.adminOrders,
  },
  {
    id: 'members',
    label: '회원 관리',
    title: '회원 관리',
    to: ROUTE_PATHS.adminMembers,
  },
  {
    id: 'qna',
    label: '문의 관리',
    title: '문의 관리',
    to: ROUTE_PATHS.adminQna,
  },
  {
    id: 'reviews',
    label: '리뷰 관리',
    title: '리뷰 관리',
    to: ROUTE_PATHS.adminReviews,
  },
  {
    id: 'notices',
    label: '공지 관리',
    title: '공지 관리',
    to: ROUTE_PATHS.adminNotices,
  },
];

export function resolveAdminNavItem(pathname) {
  return ADMIN_NAV_ITEMS.find((item) => pathname === item.to) ?? ADMIN_NAV_ITEMS[0];
}
