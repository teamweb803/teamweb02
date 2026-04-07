<script setup>
const finalAgreement = defineModel('finalAgreement', {
  type: Boolean,
  default: false,
});

defineProps({
  catalogDiscountTotal: {
    type: Number,
    required: true,
  },
  couponDiscount: {
    type: Number,
    required: true,
  },
  finalTotal: {
    type: Number,
    required: true,
  },
  formatPrice: {
    type: Function,
    required: true,
  },
  isGuestCheckout: {
    type: Boolean,
    default: false,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  pointApplied: {
    type: Number,
    required: true,
  },
  productTotal: {
    type: Number,
    required: true,
  },
  shippingTotal: {
    type: Number,
    required: true,
  },
  submitButtonLabel: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['submit']);
</script>

<template>
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
      @click="emit('submit')"
    >
      {{ isSubmitting ? '주문 처리 중...' : submitButtonLabel }}
    </button>

    <ul class="checkout-final-card__notes">
      <li>{{ isGuestCheckout ? '비회원 주문은 완료 화면에서 주문번호를 먼저 확인해 주세요.' : '영수증과 주문 내역은 주문 완료 후 마이페이지에서 다시 확인할 수 있습니다.' }}</li>
      <li>배송 일정은 상품 준비 상태와 배송 환경에 따라 조정될 수 있습니다.</li>
      <li>배송지 변경은 상품 준비 상태에 따라 제한될 수 있습니다.</li>
      <li v-if="isGuestCheckout">비회원 주문은 완료 화면에 표시되는 주문번호를 꼭 저장해 주세요.</li>
    </ul>
  </aside>
</template>

<style scoped>
.checkout-final-card {
  display: grid;
  gap: 20px;
  padding: 22px 20px 24px;
  border: 1px solid #e5e7eb;
  border-top: 2px solid #111111;
  position: sticky;
  top: var(--hs-sticky-offset, 96px);
}

.checkout-final-card h2 {
  margin: 0;
  color: #111111;
  font-size: 24px;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.03em;
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

.checkout-final-card__rows strong,
.checkout-final-card__total strong {
  color: #111111;
  font-weight: 800;
  letter-spacing: -0.03em;
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

.checkout-check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #222222;
  font-size: 14px;
}

.checkout-check--final {
  align-items: flex-start;
}

.checkout-check input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: #111111;
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

.checkout-final-card__notes li {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 1120px) {
  .checkout-final-card {
    position: static;
  }
}
</style>
