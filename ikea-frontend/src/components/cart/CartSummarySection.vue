<script setup>
defineProps({
  canCheckoutAll: {
    type: Boolean,
    default: false,
  },
  canCheckoutSelected: {
    type: Boolean,
    default: false,
  },
  discountTotal: {
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
  productTotal: {
    type: Number,
    required: true,
  },
  shippingTotal: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['checkout']);

function handleCheckout(mode) {
  emit('checkout', mode);
}
</script>

<template>
  <section class="cart-summary">
    <div class="cart-summary__totals">
      <article>
        <p>총 상품금액</p>
        <strong>{{ formatPrice(productTotal) }}</strong>
      </article>
      <span class="cart-summary__symbol">−</span>
      <article>
        <p>총 할인금액</p>
        <strong>{{ formatPrice(discountTotal) }}</strong>
      </article>
      <span class="cart-summary__symbol">+</span>
      <article>
        <p>총 배송비</p>
        <strong>{{ formatPrice(shippingTotal) }}</strong>
      </article>
      <span class="cart-summary__symbol">=</span>
      <article class="is-accent">
        <p>총 결제예정금액</p>
        <strong>{{ formatPrice(finalTotal) }}</strong>
      </article>
    </div>

    <div class="cart-summary__detail">
      <div>
        <p>상품금액</p>
        <strong>{{ formatPrice(productTotal) }}</strong>
      </div>
      <div>
        <p>상품할인</p>
        <strong>{{ formatPrice(discountTotal) }}</strong>
      </div>
      <div>
        <p>배송비</p>
        <strong>{{ formatPrice(shippingTotal) }}</strong>
      </div>
    </div>

    <div class="cart-summary__notes">
      <p>* 배송비가 미정인 상품은 결제 단계에서 지역과 설치 조건에 따라 다시 계산됩니다.</p>
      <p>* 현재 합계는 선택된 상품 기준이며, 실제 주문 시점의 혜택 적용 여부에 따라 달라질 수 있습니다.</p>
    </div>

    <div class="cart-summary__buttons">
      <button type="button" :disabled="!canCheckoutSelected" @click="handleCheckout('selected')">선택 상품 주문</button>
      <button class="is-dark" type="button" :disabled="!canCheckoutAll" @click="handleCheckout('all')">전체 상품 주문</button>
    </div>
  </section>
</template>

<style scoped>
.cart-summary {
  display: grid;
  gap: 24px;
  padding-top: 28px;
  border-top: 1px solid #e5e7eb;
}

.cart-summary__totals {
  display: grid;
  grid-template-columns: repeat(7, auto);
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.cart-summary__totals article {
  display: grid;
  gap: 8px;
  text-align: center;
}

.cart-summary__totals p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.cart-summary__totals strong {
  font-size: 34px;
  letter-spacing: -0.04em;
  color: #111827;
}

.cart-summary__symbol {
  color: #9ca3af;
  font-size: 30px;
}

.cart-summary__detail {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.cart-summary__detail div {
  min-height: 120px;
  padding: 20px 22px;
  border: 1px solid #e5e7eb;
  display: grid;
  gap: 12px;
  align-content: start;
}

.cart-summary__detail p,
.cart-summary__notes p {
  margin: 0;
  color: #6b7280;
}

.cart-summary__detail strong {
  font-size: 26px;
  letter-spacing: -0.04em;
}

.cart-summary__notes {
  display: grid;
  gap: 8px;
}

.cart-summary__buttons {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

.cart-summary__buttons button {
  flex: 0 0 248px;
  width: 248px;
  min-width: 248px;
  min-height: 46px;
  white-space: nowrap;
  font-size: 16px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.cart-summary__buttons button:not(.is-dark) {
  min-height: 46px;
  padding: 0 20px;
  border: 1px solid #d8dde5;
  background: #ffffff;
  color: #374151;
}

.cart-summary__buttons .is-dark {
  border: 1px solid #111827;
  background: #111827;
  color: #ffffff;
}

.cart-summary__buttons button:disabled {
  border-color: #d8dde5;
  background: #eef1f4;
  color: #8a93a0;
  cursor: default;
}

@media (max-width: 820px) {
  .cart-summary__totals {
    grid-template-columns: 1fr;
    justify-items: start;
  }

  .cart-summary__detail {
    grid-template-columns: 1fr;
  }

  .cart-summary__buttons {
    flex-direction: column;
  }

  .cart-summary__buttons button {
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
  }
}
</style>
