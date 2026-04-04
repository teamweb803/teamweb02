import { ROUTE_PATHS } from './routes';

export const CUSTOMER_SERVICE_NAV_ITEMS = [
  {
    id: 'faq',
    label: 'FAQ',
    to: ROUTE_PATHS.customerServiceFaq,
    routeNames: ['customer-service-faq'],
  },
  {
    id: 'qna',
    label: 'QnA',
    to: ROUTE_PATHS.customerServiceQna,
    routeNames: [
      'customer-service-qna',
      'customer-service-qna-write',
      'guest-order-lookup',
    ],
  },
  {
    id: 'notice',
    label: '공지사항',
    to: ROUTE_PATHS.customerServiceNotice,
    routeNames: ['customer-service-notice', 'customer-service-notice-detail'],
  },
];

export function resolveCustomerServiceSection(routeName) {
  return CUSTOMER_SERVICE_NAV_ITEMS.find((item) => item.routeNames.includes(routeName))?.id ?? 'notice';
}

export function resolveCustomerServiceLabel(routeName, fallbackLabel = '공지사항') {
  return CUSTOMER_SERVICE_NAV_ITEMS.find((item) => item.routeNames.includes(routeName))?.label ?? fallbackLabel;
}
