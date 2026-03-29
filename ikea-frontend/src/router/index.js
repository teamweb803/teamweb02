import { createRouter, createWebHistory } from 'vue-router';
import {
  buildCustomerServiceNoticeDetailPath,
  buildProductCategoryPath,
  buildProductDetailPath,
  DEFAULT_CATEGORY_ID,
  DEFAULT_NOTICE_ID,
  DEFAULT_PRODUCT_ID,
  ROUTE_PATHS,
} from '../constants/routes';

const HomeView = () => import('../views/HomeView.vue');
const AdminDashboardView = () => import('../views/AdminDashboardView.vue');
const ProductCategoryView = () => import('../views/ProductCategoryView.vue');
const CartView = () => import('../views/CartView.vue');
const CheckoutView = () => import('../views/CheckoutView.vue');
const OrderCompleteView = () => import('../views/OrderCompleteView.vue');
const CustomerServiceView = () => import('../views/CustomerServiceView.vue');
const CustomerServiceNoticeDetailView = () => import('../views/CustomerServiceNoticeDetailView.vue');
const LoginView = () => import('../views/LoginView.vue');
const MyPageView = () => import('../views/MyPageView.vue');
const JoinTermsView = () => import('../views/JoinTermsView.vue');
const JoinFormView = () => import('../views/JoinFormView.vue');
const JoinCompleteView = () => import('../views/JoinCompleteView.vue');
const ProductDetailView = () => import('../views/ProductDetailView.vue');

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    return {
      top: 0,
      left: 0,
    };
  },
  routes: [
    {
      path: ROUTE_PATHS.home,
      name: 'home',
      component: HomeView,
    },
    {
      path: ROUTE_PATHS.adminDashboard,
      name: 'admin-dashboard',
      component: AdminDashboardView,
    },
    {
      path: ROUTE_PATHS.productCategoryBase,
      redirect: buildProductCategoryPath(),
    },
    {
      path: `${ROUTE_PATHS.productCategoryBase}/:categoryId(\\d+)`,
      redirect: (to) => buildProductCategoryPath(to.params.categoryId ?? DEFAULT_CATEGORY_ID),
    },
    {
      path: `${ROUTE_PATHS.productCategoryBase}/:categorySlug`,
      name: 'product-category',
      component: ProductCategoryView,
    },
    {
      path: ROUTE_PATHS.cart,
      name: 'cart',
      component: CartView,
    },
    {
      path: ROUTE_PATHS.orderCheckout,
      name: 'order-checkout',
      component: CheckoutView,
    },
    {
      path: ROUTE_PATHS.orderComplete,
      name: 'order-complete',
      component: OrderCompleteView,
    },
    {
      path: `${ROUTE_PATHS.customerServiceNotice}/:noticeId`,
      name: 'customer-service-notice-detail',
      component: CustomerServiceNoticeDetailView,
    },
    {
      path: ROUTE_PATHS.customerServiceNotice,
      name: 'customer-service-notice',
      component: CustomerServiceView,
    },
    {
      path: ROUTE_PATHS.customerServiceFaq,
      name: 'customer-service-faq',
      component: CustomerServiceView,
    },
    {
      path: ROUTE_PATHS.customerServiceQna,
      name: 'customer-service-qna',
      component: CustomerServiceView,
    },
    {
      path: ROUTE_PATHS.memberLogin,
      name: 'member-login',
      component: LoginView,
    },
    {
      path: ROUTE_PATHS.memberMyPage,
      name: 'member-my-page',
      component: MyPageView,
    },
    {
      path: ROUTE_PATHS.memberJoin,
      name: 'member-join',
      component: JoinTermsView,
    },
    {
      path: ROUTE_PATHS.memberJoinForm,
      name: 'member-join-form',
      component: JoinFormView,
    },
    {
      path: ROUTE_PATHS.memberJoinComplete,
      name: 'member-join-complete',
      component: JoinCompleteView,
    },
    {
      path: `${ROUTE_PATHS.productBase}/:productId`,
      name: 'product-detail',
      component: ProductDetailView,
    },
    {
      path: `${ROUTE_PATHS.productCategoryLegacyBase}/:categoryValue`,
      redirect: (to) => buildProductCategoryPath(to.params.categoryValue ?? DEFAULT_CATEGORY_ID),
    },
    {
      path: ROUTE_PATHS.productCategoryLegacyBase,
      redirect: buildProductCategoryPath(),
    },
    {
      path: '/checkout',
      redirect: ROUTE_PATHS.orderCheckout,
    },
    {
      path: '/login',
      redirect: ROUTE_PATHS.memberLogin,
    },
    {
      path: '/mypage',
      redirect: ROUTE_PATHS.memberMyPage,
    },
    {
      path: '/signup',
      redirect: ROUTE_PATHS.memberJoin,
    },
    {
      path: '/signup/info',
      redirect: ROUTE_PATHS.memberJoinForm,
    },
    {
      path: '/signup/complete',
      redirect: ROUTE_PATHS.memberJoinComplete,
    },
    {
      path: '/goods/:productId',
      redirect: (to) => buildProductDetailPath(to.params.productId ?? DEFAULT_PRODUCT_ID),
    },
    {
      path: '/customer-service',
      redirect: ROUTE_PATHS.customerServiceNotice,
    },
    {
      path: ROUTE_PATHS.adminBase,
      redirect: ROUTE_PATHS.adminDashboard,
    },
    {
      path: '/cs/notice/:noticeId',
      redirect: (to) => buildCustomerServiceNoticeDetailPath(to.params.noticeId ?? DEFAULT_NOTICE_ID),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: ROUTE_PATHS.home,
    },
  ],
});

export default router;
