<script setup>
import { computed, onMounted, ref } from 'vue';
import SiteChrome from '../components/layout/SiteChrome.vue';
import { getLatestCompletedOrder } from '../composables/useCommerceCart';
import { buildProductDetailPath, ROUTE_PATHS } from '../constants/routes';

const order = ref(getLatestCompletedOrder());

onMounted(() => {
  order.value = getLatestCompletedOrder();
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
});

const hasOrder = computed(() => Boolean(order.value?.orderNumber));
const isBankTransfer = computed(() => order.value?.paymentMethod === 'bank');
const pageTitle = computed(() => (
  isBankTransfer.value
    ? '주문이 접수되었습니다.'
    : '결제가 완료되었습니다.'
));
const pageDescription = computed(() => (
  isBankTransfer.value
    ? '가상계좌 입금이 확인되면 배송 준비가 시작됩니다. 아래 계좌 정보와 입금기한을 꼭 확인해 주세요.'
    : '주문과 결제가 정상적으로 완료되었습니다. 배송 일정과 주문 내역은 아래에서 다시 확인할 수 있습니다.'
));
const totalDiscount = computed(() => (
  Number(order.value?.discountTotal ?? 0)
  + Number(order.value?.couponDiscount ?? 0)
  + Number(order.value?.pointApplied ?? 0)
));
const deliveryAddress = computed(() => {
  if (!order.value) {
    return '';
  }

  return [
    order.value.zoneCode ? `(${order.value.zoneCode})` : '',
    order.value.addressMain,
    order.value.addressDetail,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
});

function formatPrice(value) {
  return `${Number(value ?? 0).toLocaleString('ko-KR')}원`;
}

function resolveDetailPath(item) {
  return item.detailPath || buildProductDetailPath(item.productId);
}
</script>

<template>
  <SiteChrome>
    <main class="order-complete-page">
      <div class="order-complete-page__inner">
        <nav class="order-complete-breadcrumb" aria-label="breadcrumb">
          <RouterLink to="/" class="order-complete-breadcrumb__home" aria-label="홈으로 이동">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 10.5L12 4L20 10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 9.8V19H17V9.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
          <span>/</span>
          <RouterLink :to="ROUTE_PATHS.orderCheckout">주문서작성</RouterLink>
          <span>/</span>
          <span>주문완료</span>
        </nav>

        <template v-if="hasOrder">
          <section class="order-complete-hero">
            <div class="order-complete-hero__copy">
              <span class="order-complete-hero__eyebrow">ORDER COMPLETE</span>
              <h1>{{ pageTitle }}</h1>
              <p>{{ pageDescription }}</p>
            </div>

            <div class="order-complete-hero__meta">
              <article>
                <span>주문번호</span>
                <strong>{{ order.orderNumber }}</strong>
              </article>
              <article>
                <span>주문일시</span>
                <strong>{{ order.orderedAt }}</strong>
              </article>
              <article>
                <span>결제수단</span>
                <strong>{{ order.paymentMethodLabel }}</strong>
              </article>
              <article>
                <span>주문상태</span>
                <strong>{{ order.statusLabel }}</strong>
              </article>
            </div>
          </section>

          <div class="order-complete-layout">
            <section class="order-complete-main">
              <section v-if="order.virtualAccount" class="order-complete-panel order-complete-panel--account">
                <header class="order-complete-panel__head">
                  <div>
                    <h2>가상계좌 안내</h2>
                    <p>무통장입금 주문에만 표시되는 입금 정보입니다.</p>
                  </div>
                  <span class="order-complete-status-chip">{{ order.statusLabel }}</span>
                </header>

                <div class="order-complete-account-grid">
                  <article>
                    <span>입금은행</span>
                    <strong>{{ order.virtualAccount.bankName }}</strong>
                  </article>
                  <article>
                    <span>가상계좌번호</span>
                    <strong>{{ order.virtualAccount.accountNumber }}</strong>
                  </article>
                  <article>
                    <span>예금주</span>
                    <strong>{{ order.virtualAccount.depositorName }}</strong>
                  </article>
                  <article>
                    <span>입금금액</span>
                    <strong>{{ formatPrice(order.virtualAccount.amount) }}</strong>
                  </article>
                  <article>
                    <span>입금기한</span>
                    <strong>{{ order.virtualAccount.dueDateLabel }}</strong>
                  </article>
                </div>

                <ul class="order-complete-note-list">
                  <li>입금 확인 전까지 주문은 입금 대기 상태로 유지됩니다.</li>
                  <li>입금 금액과 예금주명이 다르면 자동 확인이 지연될 수 있습니다.</li>
                  <li>입금기한 내 미입금 시 주문은 자동으로 취소될 수 있습니다.</li>
                </ul>
              </section>

              <section class="order-complete-panel">
                <header class="order-complete-panel__head">
                  <div>
                    <h2>주문 상품</h2>
                    <p>총 {{ order.orderCount }}개 상품이 주문되었습니다.</p>
                  </div>
                </header>

                <div class="order-complete-item-list">
                  <article
                    v-for="item in order.orderItems"
                    :key="item.id"
                    class="order-complete-item"
                  >
                    <RouterLink :to="resolveDetailPath(item)" class="order-complete-item__thumb">
                      <img :src="item.image" :alt="item.name" />
                    </RouterLink>

                    <div class="order-complete-item__copy">
                      <div class="order-complete-item__meta">
                        <strong>{{ item.brand }}</strong>
                        <span>{{ item.seller }}</span>
                      </div>
                      <h3>
                        <RouterLink :to="resolveDetailPath(item)">{{ item.name }}</RouterLink>
                      </h3>
                      <p>{{ item.option }}</p>
                    </div>

                    <div class="order-complete-item__qty">{{ item.quantity }}개</div>
                    <strong class="order-complete-item__price">{{ formatPrice(item.price * item.quantity) }}</strong>
                  </article>
                </div>
              </section>

              <section class="order-complete-panel">
                <header class="order-complete-panel__head">
                  <div>
                    <h2>배송 정보</h2>
                    <p>주문 시 입력한 수령 정보입니다.</p>
                  </div>
                </header>

                <div class="order-complete-kv-grid">
                  <article>
                    <span>받는 분</span>
                    <strong>{{ order.receiverName }}</strong>
                  </article>
                  <article>
                    <span>연락처</span>
                    <strong>{{ order.receiverPhone }}</strong>
                  </article>
                  <article class="is-wide">
                    <span>배송지</span>
                    <strong>{{ deliveryAddress }}</strong>
                  </article>
                  <article v-if="order.scheduleText" class="is-wide">
                    <span>희망 일정</span>
                    <strong>{{ order.scheduleText }}</strong>
                  </article>
                  <article v-if="order.deliveryRequest" class="is-wide">
                    <span>배송 요청사항</span>
                    <strong>{{ order.deliveryRequest }}</strong>
                  </article>
                </div>
              </section>
            </section>

            <aside class="order-complete-side">
              <section class="order-complete-side-card">
                <h2>최종 결제 정보</h2>
                <div class="order-complete-side-card__rows">
                  <div>
                    <span>총 상품금액</span>
                    <strong>{{ formatPrice(order.productTotal) }}</strong>
                  </div>
                  <div>
                    <span>총 할인금액</span>
                    <strong>{{ formatPrice(totalDiscount) }}</strong>
                  </div>
                  <div>
                    <span>배송비</span>
                    <strong>{{ formatPrice(order.shippingTotal) }}</strong>
                  </div>
                </div>

                <div class="order-complete-side-card__total">
                  <span>{{ isBankTransfer ? '입금 예정금액' : '최종 결제금액' }}</span>
                  <strong>{{ formatPrice(order.finalTotal) }}</strong>
                </div>
              </section>

              <section class="order-complete-side-card">
                <h2>다음 단계</h2>
                <ul class="order-complete-note-list order-complete-note-list--compact">
                  <li>주문 내역과 배송 진행 상태는 마이페이지에서 다시 확인할 수 있습니다.</li>
                  <li v-if="isBankTransfer">입금 확인 후 배송 준비가 시작되며, 상태가 자동으로 업데이트됩니다.</li>
                  <li v-else>결제가 완료된 주문은 상품 준비 상태에 따라 배송 일정이 순차적으로 반영됩니다.</li>
                </ul>

                <div class="order-complete-actions">
                  <RouterLink :to="ROUTE_PATHS.memberMyPage" class="order-complete-action order-complete-action--primary">
                    주문내역 확인
                  </RouterLink>
                  <RouterLink :to="ROUTE_PATHS.home" class="order-complete-action order-complete-action--secondary">
                    쇼핑 계속하기
                  </RouterLink>
                </div>
              </section>
            </aside>
          </div>
        </template>

        <section v-else class="order-complete-empty">
          <h1>확인할 주문 정보가 없습니다.</h1>
          <p>주문 완료 후 이 페이지로 다시 이동하면 결제 정보와 배송 내용을 확인할 수 있습니다.</p>
          <div class="order-complete-empty__actions">
            <RouterLink :to="ROUTE_PATHS.cart" class="order-complete-action order-complete-action--secondary">
              장바구니 가기
            </RouterLink>
            <RouterLink :to="ROUTE_PATHS.home" class="order-complete-action order-complete-action--primary">
              홈으로 이동
            </RouterLink>
          </div>
        </section>
      </div>
    </main>
  </SiteChrome>
</template>

<style scoped>
.order-complete-page {
  padding: 28px 0 88px;
  background: #ffffff;
}

.order-complete-page__inner {
  width: min(1280px, calc(100% - 40px));
  margin: 0 auto;
  display: grid;
  gap: 36px;
  color: #111827;
}

.order-complete-breadcrumb {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #8f8f8f;
  font-size: 13px;
  line-height: 1;
}

.order-complete-breadcrumb a,
.order-complete-breadcrumb span {
  color: inherit;
}

.order-complete-breadcrumb__home {
  display: inline-flex;
  width: 14px;
  height: 14px;
}

.order-complete-breadcrumb__home svg {
  width: 100%;
  height: 100%;
}

.order-complete-hero {
  display: grid;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 2px solid #111111;
}

.order-complete-hero__copy {
  display: grid;
  gap: 10px;
}

.order-complete-hero__eyebrow {
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.order-complete-hero__copy h1,
.order-complete-panel__head h2,
.order-complete-side-card h2,
.order-complete-empty h1 {
  margin: 0;
  color: #111111;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.order-complete-hero__copy h1,
.order-complete-empty h1 {
  font-size: 32px;
  line-height: 1.2;
}

.order-complete-panel__head h2,
.order-complete-side-card h2 {
  font-size: 24px;
  line-height: 1.25;
}

.order-complete-hero__copy p,
.order-complete-panel__head p,
.order-complete-empty p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
}

.order-complete-hero__meta {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.order-complete-hero__meta article,
.order-complete-kv-grid article,
.order-complete-account-grid article {
  padding: 16px 18px;
  border: 1px solid #e5e7eb;
  display: grid;
  gap: 8px;
}

.order-complete-hero__meta span,
.order-complete-kv-grid span,
.order-complete-account-grid span,
.order-complete-side-card__rows span,
.order-complete-side-card__total span {
  color: #6b7280;
  font-size: 14px;
}

.order-complete-hero__meta strong,
.order-complete-kv-grid strong,
.order-complete-account-grid strong,
.order-complete-side-card__rows strong,
.order-complete-side-card__total strong,
.order-complete-item__price {
  color: #111111;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.order-complete-hero__meta strong {
  font-size: 20px;
}

.order-complete-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 36px;
  align-items: start;
}

.order-complete-main {
  display: grid;
  gap: 28px;
}

.order-complete-panel,
.order-complete-side-card,
.order-complete-empty {
  display: grid;
  gap: 16px;
  padding: 18px 18px 20px;
  border: 1px solid #e5e7eb;
  border-top: 2px solid #111111;
  background: #ffffff;
}

.order-complete-panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid #eceff3;
}

.order-complete-status-chip {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid #d8dde5;
  background: #f7f9fb;
  color: #111111;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.order-complete-account-grid,
.order-complete-kv-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.order-complete-kv-grid .is-wide,
.order-complete-account-grid article:last-child {
  grid-column: 1 / -1;
}

.order-complete-note-list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 10px;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.65;
}

.order-complete-note-list--compact {
  padding-left: 16px;
}

.order-complete-item-list {
  display: grid;
}

.order-complete-item {
  display: grid;
  grid-template-columns: 102px minmax(0, 1fr) 84px 160px;
  gap: 16px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eceff3;
}

.order-complete-item:first-child {
  padding-top: 0;
}

.order-complete-item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.order-complete-item__thumb {
  display: block;
}

.order-complete-item__thumb img {
  width: 92px;
  height: 92px;
  object-fit: contain;
  border: 1px solid #f0f0f0;
  background: #ffffff;
}

.order-complete-item__copy {
  display: grid;
  gap: 6px;
}

.order-complete-item__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666666;
  font-size: 13px;
}

.order-complete-item__copy h3 {
  margin: 0;
  font-size: 18px;
  line-height: 1.45;
}

.order-complete-item__copy a {
  color: inherit;
}

.order-complete-item__copy p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

.order-complete-item__qty {
  color: #111111;
  font-size: 15px;
  font-weight: 700;
  text-align: center;
}

.order-complete-item__price {
  font-size: 24px;
  text-align: right;
}

.order-complete-side {
  display: grid;
  gap: 20px;
  position: sticky;
  top: var(--hs-sticky-offset, 96px);
}

.order-complete-side-card__rows {
  display: grid;
  gap: 12px;
}

.order-complete-side-card__rows div,
.order-complete-side-card__total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.order-complete-side-card__rows strong {
  font-size: 16px;
}

.order-complete-side-card__total {
  padding-top: 18px;
  border-top: 1px solid #eceff3;
}

.order-complete-side-card__total strong {
  font-size: 30px;
}

.order-complete-actions,
.order-complete-empty__actions {
  display: grid;
  gap: 12px;
}

.order-complete-action {
  min-height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
}

.order-complete-action--primary {
  background: #111827;
  color: #ffffff;
}

.order-complete-action--secondary {
  border: 1px solid #d5d8dd;
  background: #ffffff;
  color: #555555;
}

.order-complete-empty {
  justify-items: center;
  text-align: center;
  padding-top: 34px;
  padding-bottom: 34px;
}

@media (max-width: 1120px) {
  .order-complete-layout {
    grid-template-columns: 1fr;
  }

  .order-complete-side {
    position: static;
  }
}

@media (max-width: 980px) {
  .order-complete-hero__meta,
  .order-complete-account-grid,
  .order-complete-kv-grid,
  .order-complete-item {
    grid-template-columns: 1fr;
  }

  .order-complete-item__qty,
  .order-complete-item__price {
    text-align: left;
  }
}
</style>
