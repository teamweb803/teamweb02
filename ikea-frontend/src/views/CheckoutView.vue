<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SiteChrome from '../components/layout/SiteChrome.vue';
import { completeCheckout, getCheckoutSeedItems } from '../composables/useCommerceCart';
import { ROUTE_PATHS } from '../constants/routes';

const route = useRoute();
const router = useRouter();

const orderItems = ref([]);
const ordererName = ref('김민진');
const ordererPhone = ref('010-9438-0461');
const sameAsOrderer = ref(true);
const receiverName = ref('김민진');
const receiverPhone = ref('010-9438-0461');
const zoneCode = ref('');
const addressMain = ref('');
const addressDetail = ref('');
const deliveryRequest = ref('');
const elevatorOption = ref('1-7인승');
const carAccess = ref('진입가능');
const freeCarryService = ref(false);
const scheduleYear = ref('2026');
const scheduleMonth = ref('3월');
const scheduleDay = ref('25일');
const scheduleTime = ref('오후');
const pointAmount = ref('0');
const paymentMethod = ref('kakaopay');
const finalAgreement = ref(false);
const isSubmitting = ref(false);

const paymentMethods = [
  { id: 'kakaopay', label: '카카오페이' },
  { id: 'tosspay', label: '토스페이' },
  { id: 'card', label: '신용카드' },
  { id: 'bank', label: '무통장입금' },
];

function syncOrderItems() {
  orderItems.value = getCheckoutSeedItems(
    String(route.query.mode ?? 'all'),
    String(route.query.itemId ?? ''),
  );
}

onMounted(() => {
  syncOrderItems();
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
});

watch(
  () => [route.query.mode, route.query.itemId],
  () => {
    syncOrderItems();
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  },
);

watch([sameAsOrderer, ordererName, ordererPhone], ([checked, name, phone]) => {
  if (checked) {
    receiverName.value = name;
    receiverPhone.value = phone;
  }
}, { immediate: true });

watch(pointAmount, (value) => {
  const normalized = String(value ?? '').replace(/[^\d]/g, '');
  pointAmount.value = normalized === '' ? '0' : String(Number(normalized));
});

const orderCount = computed(() => orderItems.value.reduce((sum, item) => sum + item.quantity, 0));
const productTotal = computed(() => orderItems.value.reduce(
  (sum, item) => sum + ((item.originalPrice ?? item.price) * item.quantity),
  0,
));
const catalogDiscountTotal = computed(() => orderItems.value.reduce(
  (sum, item) => sum + (((item.originalPrice ?? item.price) - item.price) * item.quantity),
  0,
));
const couponDiscount = computed(() => 0);
const shippingTotal = computed(() => 0);
const pointApplied = computed(() => Math.min(Number(pointAmount.value || '0'), Math.max(0, productTotal.value - catalogDiscountTotal.value)));
const finalTotal = computed(() => Math.max(0, productTotal.value - catalogDiscountTotal.value - couponDiscount.value - pointApplied.value + shippingTotal.value));
const selectedPaymentMethod = computed(
  () => paymentMethods.find((method) => method.id === paymentMethod.value) ?? paymentMethods[0],
);
const paymentMethodNotice = computed(() => (
  paymentMethod.value === 'bank'
    ? '무통장입금 선택 시 주문완료 페이지에서 가상계좌와 입금기한을 확인할 수 있습니다.'
    : '선택한 결제수단으로 주문이 완료되면 결제 완료 화면으로 이동합니다.'
));
const installationCategoryCounts = computed(() => {
  const grouped = new Map();

  orderItems.value.forEach((item) => {
    const currentCount = grouped.get(item.categoryLabel) ?? 0;
    grouped.set(item.categoryLabel, currentCount + item.quantity);
  });

  return Array.from(grouped.entries()).map(([label, quantity]) => ({ label, quantity }));
});

function formatPrice(value) {
  return `${Number(value ?? 0).toLocaleString('ko-KR')}원`;
}
const installNoticeChecked = ref(false);
const showInstallNoticeModal = ref(false);
const showShippingGuideModal = ref(false);
const shippingGuideTitle = ref('');
const shippingGuideBody = ref('');

function openInstallNoticeModal() {
  showInstallNoticeModal.value = true;
}

function closeInstallNoticeModal() {
  showInstallNoticeModal.value = false;
}

function confirmInstallNotice() {
  installNoticeChecked.value = true;
  closeInstallNoticeModal();
}

function toggleInstallNotice() {
  if (installNoticeChecked.value) {
    installNoticeChecked.value = false;
    return;
  }

  openInstallNoticeModal();
}

function openShippingGuide(title, body) {
  shippingGuideTitle.value = title || '배송 안내';
  shippingGuideBody.value = body || '결제 단계에서 배송 일정과 추가 비용을 다시 확인할 수 있습니다.';
  showShippingGuideModal.value = true;
}

function closeShippingGuideModal() {
  showShippingGuideModal.value = false;
}

function buildScheduleText() {
  return [
    scheduleYear.value,
    scheduleMonth.value,
    scheduleDay.value,
    scheduleTime.value,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
}

function validateCheckout() {
  if (!orderItems.value.length) {
    return '주문할 상품이 없습니다.';
  }

  if (!String(ordererName.value ?? '').trim()) {
    return '주문자 이름을 입력해 주세요.';
  }

  if (!String(ordererPhone.value ?? '').trim()) {
    return '주문자 연락처를 입력해 주세요.';
  }

  if (!String(receiverName.value ?? '').trim()) {
    return '받으시는 분 이름을 입력해 주세요.';
  }

  if (!String(receiverPhone.value ?? '').trim()) {
    return '받으시는 분 연락처를 입력해 주세요.';
  }

  if (!String(zoneCode.value ?? '').trim()) {
    return '우편번호를 입력해 주세요.';
  }

  if (!String(addressMain.value ?? '').trim()) {
    return '기본 주소를 입력해 주세요.';
  }

  if (!finalAgreement.value) {
    return '결제 진행 동의 후 주문을 완료해 주세요.';
  }

  return '';
}

async function submitOrder() {
  if (isSubmitting.value) {
    return;
  }

  const validationMessage = validateCheckout();

  if (validationMessage) {
    window.alert(validationMessage);
    return;
  }

  isSubmitting.value = true;

  try {
    const completedOrder = completeCheckout({
      mode: String(route.query.mode ?? 'all'),
      itemId: String(route.query.itemId ?? ''),
      orderItems: orderItems.value,
      ordererName: ordererName.value.trim(),
      ordererPhone: ordererPhone.value.trim(),
      receiverName: receiverName.value.trim(),
      receiverPhone: receiverPhone.value.trim(),
      zoneCode: zoneCode.value.trim(),
      addressMain: addressMain.value.trim(),
      addressDetail: addressDetail.value.trim(),
      deliveryRequest: deliveryRequest.value.trim(),
      scheduleText: buildScheduleText(),
      paymentMethod: paymentMethod.value,
      paymentMethodLabel: selectedPaymentMethod.value.label,
      productTotal: productTotal.value,
      discountTotal: catalogDiscountTotal.value,
      couponDiscount: couponDiscount.value,
      pointApplied: pointApplied.value,
      shippingTotal: shippingTotal.value,
      finalTotal: finalTotal.value,
    });

    await router.push({
      path: ROUTE_PATHS.orderComplete,
      query: {
        orderNumber: completedOrder.orderNumber,
      },
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <SiteChrome>
    <main class="checkout-page">
      <div class="checkout-page__inner">
        <nav class="checkout-breadcrumb" aria-label="breadcrumb">
          <RouterLink to="/" class="checkout-breadcrumb__home" aria-label="홈으로 이동">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 10.5L12 4L20 10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 9.8V19H17V9.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
          <span>〉</span>
          <span>주문서작성</span>
        </nav>

        <section class="checkout-section">
          <div class="checkout-section__title-row">
            <h1>주문서작성</h1>
            <button class="checkout-outline-button" type="button" @click="router.push(ROUTE_PATHS.cart)">장바구니가기</button>
          </div>

          <div v-if="orderItems.length" class="checkout-board">
            <div class="checkout-board__head">
              <span class="checkout-board__info">상품정보</span>
              <span>수량</span>
              <span>상품금액</span>
              <span>배송정보</span>
            </div>

            <div class="checkout-board__bundle">
              <strong>HOMiO 주문 상품 ({{ orderCount }})</strong>
              <span>배송 일정과 배송비는 상품 유형과 주소지에 따라 결제 단계에서 최종 안내됩니다.</span>
            </div>

            <article v-for="item in orderItems" :key="item.id" class="checkout-item">
              <div class="checkout-item__info">
                <RouterLink :to="item.detailPath" class="checkout-item__thumb">
                  <img :src="item.image" :alt="item.name" />
                </RouterLink>
                <div class="checkout-item__copy">
                  <div class="checkout-item__meta">
                    <strong>{{ item.brand }}</strong>
                    <span>{{ item.seller }}</span>
                  </div>
                  <h2>
                    <RouterLink :to="item.detailPath">{{ item.name }}</RouterLink>
                  </h2>
                  <p>{{ item.option }}</p>
                </div>
              </div>

              <div class="checkout-item__qty">{{ item.quantity }}</div>

              <div class="checkout-item__price">
                <strong>{{ formatPrice(item.price * item.quantity) }}</strong>
                <span v-if="(item.originalPrice ?? item.price) > item.price">
                  {{ formatPrice((item.originalPrice ?? item.price) * item.quantity) }}
                </span>
              </div>

              <div class="checkout-item__shipping">
                <button
                  class="checkout-shipping-trigger"
                  type="button"
                  @click="openShippingGuide(item.shippingText, item.shippingSubText)"
                >
                  {{ item.shippingText }}
                </button>
                <p>{{ item.shippingSubText }}</p>
              </div>
            </article>

            <div class="checkout-total-strip">
              <article>
                <span>총 상품금액</span>
                <strong>{{ formatPrice(productTotal) }}</strong>
              </article>
              <article>
                <span>총 할인금액</span>
                <strong>{{ formatPrice(catalogDiscountTotal + couponDiscount + pointApplied) }}</strong>
              </article>
              <article>
                <span>총 배송비</span>
                <strong>{{ formatPrice(shippingTotal) }}</strong>
              </article>
              <article class="is-accent">
                <span>총 결제예정금액</span>
                <strong>{{ formatPrice(finalTotal) }}</strong>
              </article>
            </div>
          </div>

          <div v-else class="checkout-empty">
            <p>주문할 상품이 없습니다.</p>
            <button class="checkout-outline-button" type="button" @click="router.push(ROUTE_PATHS.cart)">장바구니로 돌아가기</button>
          </div>
        </section>

        <div v-if="orderItems.length" class="checkout-layout">
          <section class="checkout-main-column">
            <section class="checkout-panel checkout-delivery-panel">
              <header class="checkout-panel__head">
                <h2>주문 상품 배송정보</h2>
              </header>

              <div class="checkout-form-table">
                <div class="checkout-form-row">
                  <div class="checkout-form-row__label">주문자 정보</div>
                  <div class="checkout-form-row__content checkout-form-row__content--inline">
                    <input v-model="ordererName" type="text" placeholder="주문자 이름" />
                    <input v-model="ordererPhone" type="text" placeholder="휴대폰 번호" />
                    <button class="checkout-outline-button is-small" type="button">주문자 정보 변경</button>
                  </div>
                </div>

                <div class="checkout-form-row">
                  <div class="checkout-form-row__label">받으시는 분 <span>*</span></div>
                  <div class="checkout-form-row__content">
                    <div class="checkout-inline">
                      <input v-model="receiverName" type="text" placeholder="받으시는 분 이름" :disabled="sameAsOrderer" />
                      <label class="checkout-check">
                        <input v-model="sameAsOrderer" type="checkbox" />
                        <span>주문자 정보와 동일</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="checkout-form-row">
                  <div class="checkout-form-row__label">배송지 주소 <span>*</span></div>
                  <div class="checkout-form-row__content">
                    <div class="checkout-inline checkout-inline--zip">
                      <input v-model="zoneCode" type="text" placeholder="우편번호" />
                      <button class="checkout-outline-button is-small" type="button">우편번호 찾기</button>
                    </div>
                    <input v-model="addressMain" type="text" placeholder="기본 주소" />
                    <input v-model="addressDetail" type="text" placeholder="상세 주소" />
                  </div>
                </div>

                <div class="checkout-form-row">
                  <div class="checkout-form-row__label">휴대폰 번호 <span>*</span></div>
                  <div class="checkout-form-row__content">
                    <input v-model="receiverPhone" type="text" placeholder="'-' 없이 숫자만 입력해 주세요" />
                  </div>
                </div>

                <div class="checkout-form-row">
                  <div class="checkout-form-row__label">배송 / 설치 참고 정보 <span>*</span></div>
                  <div class="checkout-form-row__content checkout-form-row__content--install">
                    <div class="checkout-choice-row">
                      <span>엘리베이터</span>
                      <div class="checkout-choice-group">
                        <label><input v-model="elevatorOption" type="radio" value="1-7인승" /> 1~7인승</label>
                        <label><input v-model="elevatorOption" type="radio" value="8-10인승" /> 8~10인승</label>
                        <label><input v-model="elevatorOption" type="radio" value="11인승 이상" /> 11인승 이상</label>
                        <label><input v-model="elevatorOption" type="radio" value="없음" /> 없음</label>
                      </div>
                    </div>

                    <div class="checkout-choice-row">
                      <span>차량현장 진입</span>
                      <div class="checkout-choice-group">
                        <label><input v-model="carAccess" type="radio" value="진입가능" /> 진입가능</label>
                        <label><input v-model="carAccess" type="radio" value="진입불가" /> 진입불가</label>
                      </div>
                    </div>

                    <div class="checkout-option-row">
                      <button class="checkout-option-row__main" type="button" @click="toggleInstallNotice">
                        <span class="checkout-option-row__box" :class="{ 'is-active': installNoticeChecked }">✓</span>
                        <span class="checkout-option-row__text">필수 설치 공간 및 현장 추가비용 안내를 확인했습니다.</span>
                      </button>
                      <button class="checkout-inline-link" type="button" @click="openInstallNoticeModal">자세히 보기</button>
                    </div>

                    <div class="checkout-option-row is-muted">
                      <label class="checkout-option-row__main checkout-option-row__main--label">
                        <input v-model="freeCarryService" class="checkout-option-row__input" type="checkbox" />
                        <span class="checkout-option-row__box" :class="{ 'is-active': freeCarryService }">✓</span>
                        <span class="checkout-option-row__text">배송 전 추가 확인 요청</span>
                      </label>
                      <button
                        class="checkout-inline-link"
                        type="button"
                        @click="openShippingGuide('배송 전 추가 확인 요청', '설치 및 추가 배송 조건을 함께 확인해야 하는 주문에서 배송 직전 재확인을 진행합니다.')"
                      >
                        자세히 보기
                      </button>
                    </div>

                    <div class="checkout-count-list">
                      <div v-for="item in installationCategoryCounts" :key="item.label">
                        <span>{{ item.label }}</span>
                        <strong>{{ item.quantity }}개</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="checkout-form-row">
                  <div class="checkout-form-row__label">배송 일정 선택</div>
                  <div class="checkout-form-row__content checkout-inline">
                    <select v-model="scheduleYear"><option>2026</option></select>
                    <select v-model="scheduleMonth"><option>3월</option></select>
                    <select v-model="scheduleDay"><option>25일</option></select>
                    <select v-model="scheduleTime"><option>오후</option></select>
                  </div>
                </div>

                <div class="checkout-form-row">
                  <div class="checkout-form-row__label">배송 요청사항</div>
                  <div class="checkout-form-row__content">
                    <textarea v-model="deliveryRequest" rows="4" placeholder="추가 요청사항이 있다면 입력해 주세요"></textarea>
                  </div>
                </div>
              </div>
            </section>

            <section class="checkout-panel">
              <header class="checkout-panel__head">
                <h2>할인 / 혜택 적용</h2>
              </header>
              <div class="checkout-kv-list">
                <div><span>총 상품금액</span><strong>{{ formatPrice(productTotal) }}</strong></div>
                <div><span>상품할인</span><strong>{{ formatPrice(catalogDiscountTotal) }}</strong></div>
                <div class="checkout-kv-list__inline">
                  <span>상품쿠폰할인</span>
                  <div>
                    <input type="text" :value="couponDiscount" readonly />
                    <button class="checkout-outline-button is-small" type="button">적용가능쿠폰 (0)</button>
                  </div>
                </div>
                <div class="checkout-kv-list__inline">
                  <span>포인트</span>
                  <div>
                    <input v-model="pointAmount" type="text" />
                    <button class="checkout-outline-button is-small" type="button">전액사용</button>
                  </div>
                </div>
              </div>
            </section>

            <section class="checkout-panel">
              <header class="checkout-panel__head">
                <h2>결제수단 선택</h2>
              </header>
              <div class="checkout-payment-grid">
                <button
                  v-for="method in paymentMethods"
                  :key="method.id"
                  class="checkout-payment-button"
                  :class="{ 'is-active': paymentMethod === method.id }"
                  type="button"
                  @click="paymentMethod = method.id"
                >
                  {{ method.label }}
                </button>
              </div>
              <p class="checkout-payment-note">{{ paymentMethodNotice }}</p>
            </section>
          </section>

          <aside class="checkout-final-card">
            <h2>최종 결제금액</h2>
            <div class="checkout-final-card__rows">
              <div><span>총 상품금액</span><strong>{{ formatPrice(productTotal) }}</strong></div>
              <div><span>총 배송비</span><strong>{{ formatPrice(shippingTotal) }}</strong></div>
              <div><span>총 할인금액</span><strong>{{ formatPrice(catalogDiscountTotal + couponDiscount) }}</strong></div>
              <div><span>포인트 사용금액</span><strong>{{ formatPrice(pointApplied) }}</strong></div>
            </div>

          <div class="checkout-final-card__total">
            <span>최종결제금액</span>
            <strong>{{ formatPrice(finalTotal) }}</strong>
          </div>

            <label class="checkout-check checkout-check--final">
              <input v-model="finalAgreement" type="checkbox" />
              <span>필수 약관을 모두 확인했고 결제에 동의합니다.</span>
            </label>

            <button
              class="checkout-pay-button"
              type="button"
              :disabled="isSubmitting"
              @click="submitOrder"
            >
              {{ isSubmitting ? '주문 처리 중...' : '결제하기' }}
            </button>

            <ul class="checkout-final-card__notes">
              <li>영수증과 주문 내역은 주문 완료 후 마이페이지에서 다시 확인할 수 있습니다.</li>
              <li>배송 일정은 상품 준비 상태와 배송 환경에 따라 조정될 수 있습니다.</li>
              <li>배송지 변경은 상품 준비 상태에 따라 제한될 수 있습니다.</li>
            </ul>
          </aside>
        </div>
      </div>
    </main>

    <Teleport to="body">
      <div v-if="showInstallNoticeModal" class="checkout-modal-overlay" @click.self="closeInstallNoticeModal">
        <section class="checkout-modal" role="dialog" aria-modal="true" aria-label="설치 안내">
          <button class="checkout-modal__close" type="button" aria-label="닫기" @click="closeInstallNoticeModal">×</button>
          <h2>필수 설치 공간 및 현장 추가비용 안내</h2>
          <div class="checkout-modal__divider"></div>
          <p>설치 상품은 엘리베이터, 진입 가능 여부, 계단 폭, 현장 여건에 따라 추가 운반비가 달라질 수 있으며, 결제 단계에서 모두 확정되기 어려울 수 있습니다.</p>
          <ul>
            <li>현장 구조와 진입 동선에 따라 결제 단계에서 예상하지 못한 추가 운반비가 현장에서 별도 안내될 수 있습니다.</li>
            <li>현장 상황에 따라 사다리차, 추가 인력, 분해 및 재조립 비용이 발생할 수 있습니다.</li>
            <li>설치 전 안내된 조건과 실제 현장 상황이 다르면 배송 일정이 조정될 수 있습니다.</li>
            <li>필수 안내를 확인한 뒤에만 설치 상품 주문을 진행해 주세요.</li>
          </ul>
          <button class="checkout-modal__confirm" type="button" @click="confirmInstallNotice">확인</button>
        </section>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showShippingGuideModal" class="checkout-modal-overlay" @click.self="closeShippingGuideModal">
        <section class="checkout-modal" role="dialog" aria-modal="true" aria-label="배송 안내">
          <button class="checkout-modal__close" type="button" aria-label="닫기" @click="closeShippingGuideModal">×</button>
          <h2>{{ shippingGuideTitle }}</h2>
          <div class="checkout-modal__divider"></div>
          <p>{{ shippingGuideBody }}</p>
          <ul>
            <li>배송 일정과 추가 비용은 주문서작성 단계에서 주소와 설치 환경을 기준으로 다시 계산됩니다.</li>
            <li>상품과 현장 조건에 따라 결제 단계에서 확정되지 않은 추가 비용이 배송 연락 또는 현장 확인 과정에서 별도 안내될 수 있습니다.</li>
            <li>대형 가구와 설치 상품은 현장 진입 동선, 사다리차 여부, 추가 인력 필요 여부에 따라 추가금이 발생할 수 있습니다.</li>
          </ul>
          <button class="checkout-modal__confirm" type="button" @click="closeShippingGuideModal">확인</button>
        </section>
      </div>
    </Teleport>
  </SiteChrome>
</template>

<style scoped>
.checkout-page {
  padding: 28px 0 88px;
  background: #ffffff;
}

.checkout-page__inner {
  width: min(1280px, calc(100% - 40px));
  margin: 0 auto;
  display: grid;
  gap: 40px;
  color: #111827;
}

.checkout-breadcrumb {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #8f8f8f;
  font-size: 13px;
  line-height: 1;
}

.checkout-breadcrumb__home {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: #8f8f8f;
}

.checkout-breadcrumb__home svg {
  width: 100%;
  height: 100%;
}

.checkout-section__title-row,
.checkout-block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.checkout-section__title-row {
  padding-bottom: 18px;
  border-bottom: 2px solid #111111;
}

.checkout-section__title-row h1,
.checkout-block__head h2,
.checkout-final-card h2 {
  margin: 0;
  color: #111111;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.checkout-section__title-row h1 {
  font-size: 32px;
  line-height: 1.2;
}

.checkout-block__head h2,
.checkout-final-card h2 {
  font-size: 24px;
  line-height: 1.25;
}

.checkout-outline-button {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid #d5d8dd;
  background: #ffffff;
  color: #555555;
  font-size: 13px;
  cursor: pointer;
}

.checkout-outline-button.is-small {
  min-height: 34px;
  padding: 0 10px;
}

.checkout-board {
  display: grid;
}

.checkout-board__head,
.checkout-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 128px 168px 188px;
  align-items: center;
}

.checkout-board__head {
  min-height: 58px;
  border-bottom: 1px solid #d8dde5;
  color: #555555;
  font-size: 14px;
  font-weight: 600;
}

.checkout-board__head span:nth-child(n + 2) {
  text-align: center;
}

.checkout-board__info {
  text-align: left !important;
}

.checkout-board__bundle {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 56px;
  border-bottom: 1px solid #d8dde5;
  font-size: 14px;
}

.checkout-board__bundle span,
.checkout-item__copy p,
.checkout-item__shipping p,
.checkout-final-card__notes li {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

.checkout-item {
  gap: 10px;
  padding: 22px 0;
  border-bottom: 1px solid #eceff3;
}

.checkout-item__info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.checkout-item__thumb {
  display: block;
}

.checkout-item__thumb img {
  width: 94px;
  height: 94px;
  object-fit: contain;
  border: 1px solid #f0f0f0;
  background: #ffffff;
}

.checkout-item__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666666;
  font-size: 13px;
}

.checkout-item__copy h2 {
  margin: 8px 0 6px;
  font-size: 18px;
  line-height: 1.45;
}

.checkout-item__copy a {
  color: inherit;
}

.checkout-item__qty,
.checkout-item__price,
.checkout-item__shipping {
  display: grid;
  justify-items: center;
  gap: 8px;
  text-align: center;
}

.checkout-item__qty {
  font-size: 16px;
  font-weight: 600;
}

.checkout-item__price strong,
.checkout-total-strip strong,
.checkout-kv-list strong,
.checkout-final-card strong {
  color: #111111;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.checkout-item__price strong {
  font-size: 24px;
}

.checkout-item__price span {
  color: #9ca3af;
  font-size: 13px;
  text-decoration: line-through;
}

.checkout-item__shipping strong {
  color: var(--accent);
  font-size: 15px;
}

.checkout-total-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  padding-top: 28px;
}

.checkout-total-strip article {
  min-height: 112px;
  padding: 20px 22px;
  border: 1px solid #e5e7eb;
  display: grid;
  gap: 10px;
  align-content: start;
}

.checkout-total-strip span {
  color: #6b7280;
  font-size: 14px;
}

.checkout-total-strip strong {
  font-size: 28px;
}

.checkout-total-strip .is-accent strong {
  color: #111111;
}

.checkout-empty {
  display: grid;
  justify-items: center;
  gap: 16px;
  padding: 48px 0 0;
}

.checkout-empty p {
  margin: 0;
  color: #6b7280;
}

.checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 36px;
  align-items: start;
  margin-top: 2px;
}

.checkout-main-column {
  display: grid;
  gap: 28px;
  padding-top: 18px;
  border-top: 2px solid #111111;
}

.checkout-panel {
  display: grid;
  gap: 18px;
}

.checkout-panel__head {
  padding-bottom: 18px;
  border-bottom: 1px solid #e5e7eb;
}

.checkout-panel__head h2 {
  margin: 0;
  color: #111111;
  font-size: 24px;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.checkout-form-section {
  display: grid;
  gap: 28px;
}

.checkout-form-board,
.checkout-side-block {
  display: grid;
  gap: 18px;
}

.checkout-form-board {
  border-top: 2px solid #111111;
}

.checkout-form-row {
  display: grid;
  grid-template-columns: 168px minmax(0, 1fr);
  min-height: 76px;
  border-bottom: 1px solid #ededed;
}

.checkout-form-row__label {
  padding: 20px 18px;
  background: #f7f7f8;
  color: #444444;
  font-size: 14px;
  font-weight: 700;
}

.checkout-form-row__label span {
  color: #d63b2d;
}

.checkout-form-row__content {
  display: grid;
  gap: 14px;
  align-content: center;
  padding: 16px 20px;
}

.checkout-form-row__content--install {
  gap: 16px;
}

.checkout-form-row__content--inline {
  grid-template-columns: minmax(0, 180px) minmax(0, 180px) auto;
}

.checkout-form-row__content input:not([type='checkbox']):not([type='radio']),
.checkout-form-row__content textarea,
.checkout-kv-list__inline input,
.checkout-form-row__content select {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid #e3e5e8;
  background: #ffffff;
  color: #222222;
  font-size: 14px;
  box-sizing: border-box;
}

.checkout-form-row__content textarea {
  min-height: 108px;
  padding-top: 12px;
  resize: vertical;
}

.checkout-inline {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkout-inline--zip {
  max-width: 330px;
}

.checkout-check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #222222;
  font-size: 14px;
}

.checkout-check--block {
  min-height: 40px;
}

.checkout-check input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: #111111;
}

.checkout-choice-row {
  display: grid;
  gap: 10px;
}

.checkout-choice-row > span {
  color: #111111;
  font-size: 14px;
  font-weight: 700;
}

.checkout-choice-group {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: #222222;
  font-size: 14px;
}

.checkout-shipping-trigger {
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--accent);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.45;
  cursor: pointer;
}

.checkout-shipping-link {
  border: 0;
  background: transparent;
  padding: 0;
  color: #666666;
  font-size: 12px;
  text-decoration: underline;
  cursor: pointer;
}

.checkout-option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
}

.checkout-option-row.is-muted {
  color: #8f8f8f;
}

.checkout-option-row__main {
  flex: 1;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.checkout-option-row__main--label {
  cursor: pointer;
}

.checkout-option-row__input {
  position: absolute;
  width: auto;
  opacity: 0;
  pointer-events: none;
}

.checkout-option-row__box {
  display: inline-grid;
  place-items: center;
  width: 14px;
  min-width: 14px;
  height: 14px;
  border: 1px solid #d1d5db;
  border-radius: 2px;
  background: #ffffff;
  color: transparent;
  font-size: 11px;
  line-height: 1;
}

.checkout-option-row__box.is-active {
  background: #167ddd;
  border-color: #167ddd;
  color: #ffffff;
}

.checkout-option-row__text {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.45;
  word-break: keep-all;
}

.checkout-inline-link {
  border: 0;
  background: transparent;
  color: #666666;
  font-size: 13px;
  text-decoration: underline;
  cursor: pointer;
  white-space: nowrap;
}

.checkout-count-list {
  display: grid;
  gap: 10px;
  padding-top: 4px;
}

.checkout-count-list div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #111111;
  font-size: 14px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.checkout-side-block {
  border-top: 2px solid #111111;
  padding-top: 18px;
}

.checkout-kv-list {
  display: grid;
  gap: 0;
  border-top: 0;
}

.checkout-kv-list > div {
  min-height: 68px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #ededed;
}

.checkout-kv-list span {
  color: #444444;
  font-size: 14px;
  font-weight: 700;
}

.checkout-kv-list__inline > div {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
  width: 100%;
  max-width: 306px;
}

.checkout-kv-list__inline input {
  width: 170px;
  max-width: 170px;
  min-height: 40px;
  height: 40px;
}

.checkout-kv-list__inline .checkout-outline-button.is-small {
  min-width: 126px;
  min-height: 40px;
  height: 40px;
  padding: 0 14px;
  white-space: nowrap;
}

.checkout-payment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.checkout-payment-note {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

.checkout-payment-button {
  min-height: 48px;
  border: 1px solid #d8dde5;
  background: #ffffff;
  color: #111111;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.checkout-payment-button.is-active {
  border-color: #111827;
  background: #111827;
  color: #ffffff;
}

.checkout-final-card {
  display: grid;
  gap: 20px;
  padding: 22px 20px 24px;
  border: 1px solid #e5e7eb;
  border-top: 2px solid #111111;
  position: sticky;
  top: var(--hs-sticky-offset, 96px);
}

.checkout-final-card__rows {
  display: grid;
  gap: 12px;
}

.checkout-final-card__rows div,
.checkout-final-card__total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.checkout-final-card__rows span,
.checkout-final-card__total span {
  color: #6b7280;
  font-size: 14px;
}

.checkout-final-card__rows strong {
  font-size: 16px;
}

.checkout-final-card__total {
  padding-top: 18px;
  border-top: 1px solid #eceff3;
}

.checkout-final-card__total strong {
  font-size: 30px;
}

.checkout-check--final {
  align-items: flex-start;
}

.checkout-pay-button {
  min-height: 54px;
  border: 0;
  border-radius: 999px;
  background: #111827;
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}

.checkout-pay-button:disabled {
  cursor: default;
  opacity: 0.68;
}

.checkout-final-card__notes {
  margin: 0;
  padding-left: 16px;
  display: grid;
  gap: 8px;
}

.checkout-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(0, 0, 0, 0.58);
  display: grid;
  place-items: center;
}

.checkout-modal {
  position: relative;
  width: min(530px, calc(100vw - 48px));
  background: #ffffff;
  padding: 26px 32px 30px;
  box-sizing: border-box;
}

.checkout-modal h2 {
  margin: 0;
  color: #111111;
  font-size: 24px;
  letter-spacing: -0.04em;
}

.checkout-modal__close {
  position: absolute;
  top: 18px;
  right: 22px;
  border: 0;
  background: transparent;
  color: #111111;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}

.checkout-modal__divider {
  height: 2px;
  margin: 18px 0;
  background: #111111;
}

.checkout-modal p,
.checkout-modal li {
  margin: 0;
  color: #777777;
  font-size: 13px;
  line-height: 1.65;
}

.checkout-modal ul {
  margin: 18px 0 24px;
  padding-left: 18px;
  display: grid;
  gap: 10px;
}

.checkout-modal__confirm {
  width: 100%;
  max-width: 265px;
  height: 48px;
  margin: 0 auto;
  display: block;
  border: 0;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 1120px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .checkout-final-card {
    position: static;
  }
}

@media (max-width: 980px) {
  .checkout-board__head,
  .checkout-item,
  .checkout-total-strip,
  .checkout-payment-grid,
  .checkout-form-row,
  .checkout-form-row__content--inline {
    grid-template-columns: 1fr;
  }

  .checkout-board__head span,
  .checkout-item__qty,
  .checkout-item__price,
  .checkout-item__shipping {
    text-align: left;
    justify-items: start;
  }

  .checkout-board__bundle,
  .checkout-inline,
  .checkout-kv-list__inline > div {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
