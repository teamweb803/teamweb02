<script setup>
import { computed, ref } from 'vue';
import CommonStatePanel from '../components/common/CommonStatePanel.vue';
import SiteChrome from '../components/layout/SiteChrome.vue';
import MyPageReviewDialog from '../components/my-page/MyPageReviewDialog.vue';
import { ROUTE_PATHS } from '../constants/routes';
import { useMyPage } from '../composables/useMyPage';
import { useMyPageReviewComposer } from '../composables/useMyPageReviewComposer';

const {
  accountHighlights,
  buildProductDetailPath,
  isProfileLoading,
  orderSteps,
  profile,
  profileError,
  quickLinks,
  recentOrders,
  recentViewItems,
  sectionLinks,
  summaryCards,
  supportCards,
  wishListItems,
} = useMyPage();

const activeSectionId = ref(sectionLinks[0]?.id ?? 'overview');

const sectionMetaMap = {
  overview: {
    title: '회원 요약',
  },
  orders: {
    title: '주문 관리',
  },
  activity: {
    title: '관심 활동',
  },
  support: {
    title: '고객 지원',
  },
};

const activeSectionMeta = computed(
  () => sectionMetaMap[activeSectionId.value] ?? sectionMetaMap.overview,
);
const {
  closeDialog: closeReviewDialog,
  getActionLabel: getReviewActionLabel,
  isActionDisabled: isReviewActionDisabled,
  isDialogOpen: isReviewDialogOpen,
  isSubmitting: isReviewSubmitting,
  openDialog: openReviewDialog,
  selectedOrder: selectedReviewOrder,
  shouldShowAction: shouldShowReviewAction,
  statusMessage: reviewStatusMessage,
  statusTone: reviewStatusTone,
  submitReview,
} = useMyPageReviewComposer();

const statusMessage = computed(() => {
  if (isProfileLoading.value) {
    return '회원 정보를 불러오는 중입니다.';
  }

  return profileError.value;
});
const profileStateTone = computed(() => (isProfileLoading.value ? 'loading' : 'error'));
const profileStateTitle = computed(() => (
  isProfileLoading.value
    ? '회원 정보를 불러오는 중입니다.'
    : '회원 정보를 확인할 수 없습니다.'
));
const profileStateDescription = computed(() => (
  isProfileLoading.value
    ? '저장된 회원 정보와 최근 주문 상태를 확인하고 있습니다.'
    : statusMessage.value
));

const reviewStatusClass = computed(() => ({
  'my-order-board__status--error': reviewStatusTone.value === 'error',
  'my-order-board__status--success': reviewStatusTone.value === 'success',
}));

function moveToSection(sectionId) {
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
    <main class="my-page">
      <div class="my-page__inner">
        <div class="my-breadcrumb">
          <RouterLink to="/" class="my-breadcrumb__home" aria-label="홈으로 이동">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 10.5L12 4L20 10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 9.8V19H17V9.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
          <span>〉</span>
          <span>마이페이지</span>
        </div>

        <section class="my-layout">
          <aside class="my-sidebar">
            <h1>마이페이지</h1>
            <nav class="my-sidebar__nav" aria-label="마이페이지 섹션">
              <button
                v-for="section in sectionLinks"
                :key="section.id"
                class="my-sidebar__link"
                :class="{ 'is-active': activeSectionId === section.id }"
                type="button"
                @click="moveToSection(section.id)"
              >
                <strong>{{ section.label }}</strong>
              </button>
            </nav>

            <div class="my-sidebar__support">
              <strong>고객센터 연결</strong>
              <RouterLink :to="ROUTE_PATHS.customerServiceFaq">FAQ</RouterLink>
              <RouterLink :to="ROUTE_PATHS.customerServiceQna">QnA</RouterLink>
              <RouterLink :to="ROUTE_PATHS.customerServiceNotice">공지사항</RouterLink>
            </div>
          </aside>

          <section class="my-content">
            <header class="my-content__header">
              <h2>{{ activeSectionMeta.title }}</h2>
            </header>

            <section v-if="activeSectionId === 'overview'" id="overview" class="my-section">
              <div class="my-overview">
                <article class="my-overview__account my-overview__account--full">
                  <div class="my-overview__account-row">
                    <span>회원명</span>
                    <strong>{{ profile.memberName }}</strong>
                  </div>
                  <div class="my-overview__account-row">
                    <span>로그인 계정</span>
                    <strong>{{ profile.loginId }}</strong>
                  </div>
                  <div class="my-overview__account-row">
                    <span>회원 등급</span>
                    <strong>{{ profile.membershipLabel }}</strong>
                  </div>
                  <div class="my-overview__account-row">
                    <span>회원 구분</span>
                    <strong>{{ profile.role }}</strong>
                  </div>
                  <div class="my-overview__account-row">
                    <span>기본 배송지</span>
                    <strong>{{ profile.address }}</strong>
                  </div>
                  <div class="my-overview__account-row">
                    <span>연락처</span>
                    <strong>{{ profile.phone }}</strong>
                  </div>
                </article>
              </div>
              <CommonStatePanel
                v-if="statusMessage"
                class="my-overview__status"
                :tone="profileStateTone"
                :title="profileStateTitle"
                :description="profileStateDescription"
                layout="boxed"
                align="left"
                compact
              />

              <div class="my-summary-grid" aria-label="마이페이지 요약">
                <article v-for="card in summaryCards" :key="card.id" class="my-summary-card">
                  <span>{{ card.label }}</span>
                  <strong>{{ card.value }}</strong>
                </article>
              </div>

              <div class="my-shortcut-grid">
                <RouterLink v-for="link in quickLinks" :key="link.id" :to="link.to" class="my-shortcut-card">
                  <strong>{{ link.label }}</strong>
                  <span>바로가기</span>
                </RouterLink>
              </div>
            </section>

            <section v-else-if="activeSectionId === 'orders'" id="orders" class="my-section">
              <div class="my-section__action-bar">
                <RouterLink :to="ROUTE_PATHS.customerServiceQna">배송 문의 바로가기</RouterLink>
              </div>

              <div class="my-status-grid">
                <article v-for="step in orderSteps" :key="step.id" class="my-status-card">
                  <strong>{{ step.count }}</strong>
                  <span>{{ step.label }}</span>
                </article>
              </div>

              <p v-if="reviewStatusMessage" class="my-order-board__status" :class="reviewStatusClass">
                {{ reviewStatusMessage }}
              </p>

              <div class="my-order-board">
                <div class="my-order-board__head">
                  <span>주문일</span>
                  <span>상품정보</span>
                  <span>상태</span>
                  <span>금액</span>
                  <span>관리</span>
                </div>

                <template v-if="recentOrders.length">
                  <article v-for="order in recentOrders" :key="order.id" class="my-order-row">
                    <span class="my-order-row__date">{{ order.date }}</span>
                    <div class="my-order-row__product">
                      <img :src="order.image" :alt="order.title" />
                      <div>
                        <strong>{{ order.title }}</strong>
                        <p>{{ order.option }}</p>
                      </div>
                    </div>
                    <span class="my-order-row__status">{{ order.status }}</span>
                    <strong class="my-order-row__price">{{ order.price }}</strong>
                    <div class="my-order-row__actions">
                      <button
                        v-if="shouldShowReviewAction(order)"
                        type="button"
                        class="my-order-row__action-button"
                        :class="{ 'is-complete': isReviewActionDisabled(order) }"
                        :disabled="isReviewActionDisabled(order)"
                        @click="openReviewDialog(order)"
                      >
                        {{ getReviewActionLabel(order) }}
                      </button>
                      <RouterLink :to="buildProductDetailPath(order.productId)">상품 보기</RouterLink>
                      <RouterLink :to="ROUTE_PATHS.cart">장바구니</RouterLink>
                    </div>
                  </article>
                </template>
                <CommonStatePanel
                  v-else
                  title="표시할 주문 내역이 없습니다."
                  description="주문이 완료되면 최근 주문 목록이 이 영역에 표시됩니다."
                  align="left"
                  compact
                />
              </div>
            </section>

            <section v-else-if="activeSectionId === 'activity'" id="activity" class="my-section">
              <div class="my-section__action-bar">
                <RouterLink :to="ROUTE_PATHS.home">계속 둘러보기</RouterLink>
              </div>

              <div class="my-panel-grid">
                <section class="my-panel">
                  <header class="my-panel__head">
                    <strong>찜한 상품</strong>
                  </header>
                  <div v-if="wishListItems.length" class="my-product-list">
                    <RouterLink
                      v-for="item in wishListItems"
                      :key="item.id"
                      :to="buildProductDetailPath(item.productId)"
                      class="my-product-row"
                    >
                      <img :src="item.image" :alt="item.title" />
                      <div class="my-product-row__copy">
                        <span>{{ item.brand }}</span>
                        <strong>{{ item.title }}</strong>
                        <p>{{ item.subtitle }}</p>
                      </div>
                      <b>{{ item.price }}</b>
                    </RouterLink>
                  </div>
                  <CommonStatePanel
                    v-else
                    title="찜한 상품이 없습니다."
                    description="관심 상품을 저장하면 이 영역에서 다시 확인할 수 있습니다."
                    align="left"
                    compact
                  />
                </section>

                <section class="my-panel">
                  <header class="my-panel__head">
                    <strong>최근 본 상품</strong>
                  </header>
                  <div v-if="recentViewItems.length" class="my-product-list">
                    <RouterLink
                      v-for="item in recentViewItems"
                      :key="item.id"
                      :to="item.to"
                      class="my-product-row"
                    >
                      <img :src="item.image" :alt="item.title" />
                      <div class="my-product-row__copy">
                        <span>{{ item.brand }}</span>
                        <strong>{{ item.title }}</strong>
                        <p>{{ item.subtitle }}</p>
                      </div>
                      <b>{{ item.price }}</b>
                    </RouterLink>
                  </div>
                  <CommonStatePanel
                    v-else
                    title="최근 본 상품이 없습니다."
                    description="둘러본 상품이 생기면 최근 본 상품 목록에 자동으로 표시됩니다."
                    align="left"
                    compact
                  />
                </section>
              </div>
            </section>

            <section v-else id="support" class="my-section">
              <div class="my-panel-grid my-panel-grid--support">
                <section class="my-panel">
                  <header class="my-panel__head">
                    <strong>회원 정보</strong>
                  </header>
                  <div class="my-account-board">
                    <article class="my-account-row">
                      <span>{{ accountHighlights[0].label }}</span>
                      <strong>{{ profile.loginId }}</strong>
                    </article>
                    <article class="my-account-row">
                      <span>{{ accountHighlights[1].label }}</span>
                      <strong>{{ profile.address }}</strong>
                    </article>
                    <article class="my-account-row">
                      <span>{{ accountHighlights[2].label }}</span>
                      <strong>{{ profile.phone }}</strong>
                    </article>
                  </div>
                </section>

                <section class="my-panel">
                  <header class="my-panel__head">
                    <strong>고객센터 바로가기</strong>
                  </header>
                  <div class="my-support-board">
                    <RouterLink v-for="item in supportCards" :key="item.id" :to="item.to" class="my-support-row">
                      <strong>{{ item.title }}</strong>
                      <span>{{ item.actionLabel }}</span>
                    </RouterLink>
                  </div>
                </section>
              </div>
            </section>
          </section>
        </section>
      </div>
    </main>
    <MyPageReviewDialog
      :is-open="isReviewDialogOpen"
      :is-submitting="isReviewSubmitting"
      :order="selectedReviewOrder"
      :status-message="reviewStatusMessage"
      :status-tone="reviewStatusTone"
      @close="closeReviewDialog"
      @submit="submitReview"
    />
  </SiteChrome>
</template>

<style scoped>
.my-page {
  background: #ffffff;
}

.my-page__inner {
  width: min(1280px, calc(100% - 40px));
  margin: 0 auto;
  padding: 28px 0 96px;
}

.my-breadcrumb {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #8f8f8f;
  font-size: 13px;
  line-height: 1;
}

.my-breadcrumb__home {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: #8f8f8f;
}

.my-breadcrumb__home svg {
  width: 100%;
  height: 100%;
}

.my-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 64px;
  margin-top: 40px;
}

.my-sidebar h1 {
  margin: 0 0 28px;
  font-size: 36px;
  line-height: 1.2;
  font-weight: 700;
  color: #111111;
}

.my-sidebar__nav {
  display: grid;
  border-top: 2px solid #111111;
}

.my-sidebar__link {
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

.my-sidebar__link strong {
  color: #222222;
  font-size: 16px;
  font-weight: 500;
}

.my-sidebar__link.is-active strong {
  color: #111111;
  font-weight: 700;
}

.my-sidebar__support {
  display: grid;
  gap: 10px;
  margin-top: 28px;
  padding-top: 22px;
  border-top: 1px solid #e6e6e6;
}

.my-sidebar__support strong {
  color: #111111;
  font-size: 15px;
  font-weight: 700;
}

.my-empty-state {
  margin: 0;
  padding: 22px 0;
  color: #666666;
  font-size: 14px;
  line-height: 1.7;
}

.my-sidebar__support a {
  color: #555555;
  text-decoration: none;
  font-size: 14px;
}

.my-content {
  min-width: 0;
}

.my-content__header {
  padding-bottom: 18px;
  border-bottom: 2px solid #111111;
}

.my-content__header h2 {
  margin: 0;
  color: #111111;
  font-size: 32px;
  line-height: 1.2;
  font-weight: 700;
}

.my-section {
  margin-top: 40px;
}

.my-section__action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-bottom: 18px;
}

.my-section__action-bar a {
  color: #111111;
  font-size: 14px;
  text-decoration: none;
}

.my-overview {
  border-top: 1px solid #111111;
  border-bottom: 1px solid #e6e6e6;
}

.my-overview__account {
  padding: 24px 0;
}

.my-overview__status {
  margin: 14px 0 0;
  color: #0058a3;
  font-size: 14px;
  line-height: 1.6;
}

.my-overview__account {
  padding-inline: 0;
}

.my-overview__account--full {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 48px;
}

.my-overview__account-row,
.my-account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 52px;
  border-bottom: 1px solid #efefef;
}

.my-overview__account-row:last-child,
.my-account-row:last-child {
  border-bottom: 0;
}

.my-overview__account-row span,
.my-account-row span {
  color: #666666;
  font-size: 14px;
}

.my-overview__account-row strong,
.my-account-row strong {
  color: #111111;
  font-size: 15px;
  text-align: right;
}

.my-summary-grid,
.my-shortcut-grid,
.my-status-grid,
.my-panel-grid {
  display: grid;
  gap: 44px;
}

.my-summary-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 20px;
}

.my-summary-card,
.my-status-card {
  padding: 20px 18px;
  border: 1px solid #e6e6e6;
  background: #ffffff;
}

.my-summary-card span,
.my-status-card span {
  display: block;
  color: #777777;
  font-size: 13px;
}

.my-summary-card strong,
.my-status-card strong {
  display: block;
  margin-top: 10px;
  color: #111111;
  font-size: 28px;
  line-height: 1.1;
}

.my-shortcut-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 20px;
}

.my-shortcut-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  min-height: 78px;
  padding: 18px 20px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  color: #111111;
  text-decoration: none;
}

.my-shortcut-card strong {
  font-size: 17px;
  line-height: 1.3;
}

.my-shortcut-card span {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
}

.my-status-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.my-order-board {
  margin-top: 18px;
  border-top: 1px solid #111111;
}

.my-order-board__status {
  margin: 18px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.my-order-board__status--error {
  color: #c62828;
}

.my-order-board__status--success {
  color: #0f6b3b;
}

.my-order-board__head,
.my-order-row {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) 110px 130px 156px;
  gap: 12px;
  align-items: center;
}

.my-order-board__head {
  min-height: 52px;
  border-bottom: 1px solid #e6e6e6;
  color: #555555;
  font-size: 14px;
  font-weight: 600;
}

.my-order-board__head span,
.my-order-row__date,
.my-order-row__status,
.my-order-row__price {
  display: flex;
  justify-content: center;
}

.my-order-row {
  min-height: 148px;
  border-bottom: 1px solid #efefef;
}

.my-order-row__date,
.my-order-row__status {
  color: #555555;
  font-size: 14px;
}

.my-order-row__status {
  font-weight: 700;
}

.my-order-row__product {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  min-width: 0;
}

.my-order-row__product img {
  width: 96px;
  height: 96px;
  object-fit: cover;
}

.my-order-row__product strong {
  display: block;
  color: #111111;
  font-size: 18px;
  line-height: 1.45;
}

.my-order-row__product p {
  margin: 8px 0 0;
  color: #666666;
  font-size: 13px;
  line-height: 1.6;
}

.my-order-row__price {
  color: #111111;
  font-size: 18px;
  font-weight: 700;
}

.my-order-row__actions {
  display: grid;
  gap: 8px;
}

.my-order-row__actions a,
.my-order-row__action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border: 1px solid #d9d9d9;
  color: #111111;
  text-decoration: none;
  font-size: 13px;
  background: #ffffff;
}

.my-order-row__action-button {
  cursor: pointer;
}

.my-order-row__action-button.is-complete {
  background: #f6f6f6;
  color: #8a8a8a;
  cursor: default;
}

.my-panel-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
}

.my-panel {
  border-top: 1px solid #111111;
}

.my-panel__head {
  padding: 18px 0 16px;
  border-bottom: 1px solid #e6e6e6;
}

.my-panel__head strong {
  display: block;
  color: #111111;
  font-size: 20px;
}

.my-product-list,
.my-support-board,
.my-account-board {
  display: grid;
}

.my-product-row,
.my-support-row {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr) 132px;
  gap: 24px;
  align-items: center;
  min-height: 122px;
  border-bottom: 1px solid #efefef;
  color: #111111;
  text-decoration: none;
}

.my-product-row:last-child,
.my-support-row:last-child {
  border-bottom: 0;
}

.my-product-row img {
  width: 108px;
  height: 108px;
  object-fit: cover;
}

.my-product-row__copy {
  min-width: 0;
}

.my-product-row__copy span {
  color: #888888;
  font-size: 12px;
}

.my-product-row__copy strong {
  display: block;
  margin-top: 8px;
  color: #111111;
  font-size: 17px;
  line-height: 1.45;
}

.my-product-row__copy p {
  margin: 8px 0 0;
  color: #666666;
  font-size: 13px;
  line-height: 1.5;
}

.my-product-row b {
  color: #111111;
  font-size: 17px;
  justify-self: end;
  text-align: right;
}

.my-account-board {
  display: grid;
  grid-auto-rows: minmax(74px, auto);
  border-bottom: 1px solid #efefef;
}

.my-support-row {
  grid-template-columns: minmax(0, 1fr) auto;
  min-height: 74px;
}

.my-support-row strong {
  display: block;
  color: #111111;
  font-size: 16px;
}

.my-support-row span {
  color: #111111;
  font-size: 13px;
  font-weight: 700;
}

.my-panel-grid--support .my-panel {
  min-width: 0;
}

.my-panel-grid--support {
  gap: 52px;
}

@media (max-width: 1080px) {
  .my-layout {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .my-summary-grid,
  .my-shortcut-grid,
  .my-status-grid,
  .my-panel-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .my-overview {
    border-bottom: 1px solid #e6e6e6;
  }

  .my-overview__account--full {
    grid-template-columns: 1fr;
    column-gap: 0;
  }

  .my-order-board__head,
  .my-order-row {
    grid-template-columns: 92px minmax(0, 1fr) 120px;
  }

  .my-order-board__head span:nth-child(1),
  .my-order-row__date,
  .my-order-board__head span:nth-child(4),
  .my-order-row__price {
    display: none;
  }
}

@media (max-width: 720px) {
  .my-page__inner {
    width: calc(100% - 28px);
    padding: 24px 0 72px;
  }

  .my-sidebar h1,
  .my-content__header h2 {
    font-size: 28px;
  }

  .my-summary-grid,
  .my-shortcut-grid,
  .my-status-grid,
  .my-panel-grid {
    grid-template-columns: 1fr;
  }

  .my-section__action-bar {
    justify-content: flex-start;
  }

  .my-order-board__head {
    display: none;
  }

  .my-order-row {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 18px 0;
  }

  .my-order-row__status,
  .my-order-row__price {
    justify-content: flex-start;
  }

  .my-order-row__actions,
  .my-shortcut-card,
  .my-support-row {
    grid-template-columns: 1fr;
  }

  .my-product-row {
    grid-template-columns: 1fr;
    padding: 16px 0;
  }

  .my-product-row img {
    width: 100%;
    height: 180px;
  }

  .my-product-row b {
    justify-self: start;
  }
}
</style>
