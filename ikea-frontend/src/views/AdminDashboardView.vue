<script setup>
import { computed, shallowRef } from 'vue';
import AdminMembersSection from '../components/admin/AdminMembersSection.vue';
import AdminOrdersSection from '../components/admin/AdminOrdersSection.vue';
import AdminOverviewSection from '../components/admin/AdminOverviewSection.vue';
import AdminProductsSection from '../components/admin/AdminProductsSection.vue';
import AdminQnaSection from '../components/admin/AdminQnaSection.vue';
import AdminReviewsSection from '../components/admin/AdminReviewsSection.vue';
import SiteChrome from '../components/layout/SiteChrome.vue';
import { useAdminDashboard } from '../composables/useAdminDashboard';

const {
  dashboard,
  isDashboardLoading,
  operatorLabel,
  removeMember,
} = useAdminDashboard();

const adminSections = [
  { id: 'overview', label: '개요', title: '개요' },
  { id: 'products', label: '상품 관리', title: '상품 관리' },
  { id: 'orders', label: '주문 관리', title: '주문 관리' },
  { id: 'reviews', label: '리뷰 관리', title: '리뷰 관리' },
  { id: 'qna', label: '문의 관리', title: '문의 관리' },
  { id: 'members', label: '회원 관리', title: '회원 관리' },
];

const activeSectionId = shallowRef('overview');

const activeSectionMeta = computed(
  () => adminSections.find((section) => section.id === activeSectionId.value) ?? adminSections[0],
);

function moveToSection(sectionId) {
  if (!adminSections.some((section) => section.id === sectionId)) {
    return;
  }

  activeSectionId.value = sectionId;
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'auto',
  });
}
</script>

<template>
  <SiteChrome>
    <main class="admin-page">
      <div class="admin-page__inner">
        <div class="admin-breadcrumb">
          <RouterLink to="/" class="admin-breadcrumb__home" aria-label="홈으로 이동">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 10.5L12 4L20 10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 9.8V19H17V9.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
          <span>〉</span>
          <span>관리자 대시보드</span>
        </div>

        <section class="admin-layout">
          <aside class="admin-sidebar">
            <h1>관리자</h1>

            <nav class="admin-sidebar__nav" aria-label="관리자 대시보드 섹션">
              <button
                v-for="section in adminSections"
                :key="section.id"
                class="admin-sidebar__link"
                :class="{ 'is-active': activeSectionId === section.id }"
                type="button"
                @click="moveToSection(section.id)"
              >
                <strong>{{ section.label }}</strong>
              </button>
            </nav>

            <div class="admin-sidebar__meta">
              <article>
                <span>운영자</span>
                <strong>{{ operatorLabel }}</strong>
              </article>
              <article>
                <span>데이터 상태</span>
                <strong>{{ isDashboardLoading ? '불러오는 중' : '표시 중' }}</strong>
              </article>
            </div>
          </aside>

          <section class="admin-content">
            <header class="admin-content__header">
              <div class="admin-content__copy">
                <h2>{{ activeSectionMeta.title }}</h2>
              </div>
            </header>

            <section class="admin-section">
              <AdminOverviewSection
                v-if="activeSectionId === 'overview'"
                :category-chart="dashboard.categoryChart"
                :payment-chart="dashboard.paymentChart"
                :qna-rows="dashboard.qnaRows"
                :review-rows="dashboard.reviewRows"
                :sales-chart="dashboard.salesChart"
                :status-chart="dashboard.statusChart"
                :stock-rows="dashboard.stockRows"
                :summary-cards="dashboard.summaryCards"
                :support-chart="dashboard.supportChart"
                :trend-chart="dashboard.trendChart"
                :watch-products="dashboard.watchProducts"
              />

              <AdminProductsSection
                v-else-if="activeSectionId === 'products'"
                :product-rows="dashboard.productRows"
              />

              <AdminOrdersSection
                v-else-if="activeSectionId === 'orders'"
                :order-rows="dashboard.orderRows"
                :order-status-cards="dashboard.orderStatusCards"
              />

              <AdminReviewsSection
                v-else-if="activeSectionId === 'reviews'"
                :review-rows="dashboard.reviewRows"
              />

              <AdminQnaSection
                v-else-if="activeSectionId === 'qna'"
                :qna-rows="dashboard.qnaRows"
              />

              <AdminMembersSection
                v-else
                :member-rows="dashboard.memberRows"
                @remove-member="removeMember"
              />
            </section>
          </section>
        </section>
      </div>
    </main>
  </SiteChrome>
</template>

<style scoped>
.admin-page {
  background: #ffffff;
}

.admin-page__inner {
  width: min(1280px, calc(100% - 40px));
  margin: 0 auto;
  padding: 28px 0 96px;
}

.admin-breadcrumb {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #8f8f8f;
  font-size: 13px;
  line-height: 1;
}

.admin-breadcrumb__home {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: #8f8f8f;
}

.admin-breadcrumb__home svg {
  width: 100%;
  height: 100%;
}

.admin-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 64px;
  margin-top: 40px;
}

.admin-sidebar {
  align-self: start;
}

.admin-sidebar h1 {
  margin: 0 0 28px;
  color: #111111;
  font-size: 36px;
  line-height: 1.2;
  font-weight: 700;
}

.admin-sidebar__nav {
  display: grid;
  border-top: 2px solid #111111;
}

.admin-sidebar__link {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 56px;
  padding: 0;
  border: 0;
  border-bottom: 1px solid #e6e6e6;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.admin-sidebar__link strong {
  color: #222222;
  font-size: 16px;
  font-weight: 500;
}

.admin-sidebar__link.is-active strong {
  color: #111111;
  font-weight: 700;
}

.admin-sidebar__meta {
  display: grid;
  gap: 12px;
  margin-top: 28px;
  padding-top: 22px;
  border-top: 1px solid #e6e6e6;
}

.admin-sidebar__meta article {
  padding: 16px 18px;
  border: 1px solid #e6e6e6;
  background: #ffffff;
}

.admin-sidebar__meta span {
  display: block;
  color: #777777;
  font-size: 13px;
}

.admin-sidebar__meta strong {
  display: block;
  margin-top: 8px;
  color: #111111;
  font-size: 18px;
  line-height: 1.35;
}

.admin-content {
  min-width: 0;
}

.admin-content__header {
  padding-bottom: 10px;
}

.admin-content__copy h2 {
  margin: 0;
  color: #111111;
  font-size: 32px;
  line-height: 1.2;
  font-weight: 700;
}

.admin-section {
  margin-top: 16px;
}

@media (max-width: 1080px) {
  .admin-layout {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}

@media (max-width: 720px) {
  .admin-page__inner {
    width: calc(100% - 28px);
    padding: 24px 0 72px;
  }

  .admin-sidebar h1,
  .admin-content__copy h2 {
    font-size: 28px;
  }

  .admin-sidebar__nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
