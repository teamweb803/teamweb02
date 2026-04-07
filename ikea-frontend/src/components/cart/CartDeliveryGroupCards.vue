<script setup>
defineProps({
  group: {
    type: Object,
    required: true,
  },
  formatPrice: {
    type: Function,
    required: true,
  },
  updateQuantity: {
    type: Function,
    required: true,
  },
  removeItem: {
    type: Function,
    required: true,
  },
  goToCheckout: {
    type: Function,
    required: true,
  },
  openShippingGuide: {
    type: Function,
    required: true,
  },
});
</script>

<template>
  <div class="cart-group-cards">
    <article
      v-for="entry in group.items"
      :key="entry.key"
      class="cart-group-card"
      :class="{ 'is-soldout': entry.item.isSoldOut }"
    >
      <div class="cart-group-card__top">
        <label class="cart-check cart-group-card__select">
          <input v-model="entry.item.selected" type="checkbox" :disabled="entry.item.isSoldOut" />
        </label>

        <RouterLink :to="entry.item.detailPath" class="cart-group-card__thumb-link">
          <img :src="entry.item.image" :alt="entry.item.name" />
        </RouterLink>

        <div class="cart-group-card__copy">
          <div class="cart-group-card__brand-line">
            <strong>{{ entry.item.brand }}</strong>
            <span>{{ entry.item.seller }}</span>
          </div>

          <h2>
            <RouterLink :to="entry.item.detailPath" class="cart-group-card__title-link">
              {{ entry.item.name }}
            </RouterLink>
          </h2>

          <p>{{ entry.item.option }}</p>
          <p v-if="entry.item.isSoldOut" class="cart-group-card__soldout">
            품절 상품입니다. 재입고 전까지 주문할 수 없습니다.
          </p>
        </div>
      </div>

      <div class="cart-group-card__meta">
        <div class="cart-group-card__meta-row">
          <span class="cart-group-card__meta-label">수량</span>
          <div class="qty-stepper">
            <button
              type="button"
              aria-label="수량 감소"
              :disabled="entry.item.isSoldOut"
              @click="updateQuantity(entry.item.id, -1)"
            >
              -
            </button>
            <span>{{ entry.item.quantity }}</span>
            <button
              type="button"
              aria-label="수량 증가"
              :disabled="entry.item.isSoldOut"
              @click="updateQuantity(entry.item.id, 1)"
            >
              +
            </button>
          </div>
        </div>

        <div class="cart-group-card__meta-row">
          <span class="cart-group-card__meta-label">상품금액</span>
          <div class="cart-group-card__price">
            <strong>{{ formatPrice(entry.item.price * entry.item.quantity) }}</strong>
            <span v-if="(entry.item.originalPrice ?? entry.item.price) > entry.item.price">
              {{ formatPrice((entry.item.originalPrice ?? entry.item.price) * entry.item.quantity) }}
            </span>
          </div>
        </div>

        <div class="cart-group-card__meta-row">
          <span class="cart-group-card__meta-label">배송정보</span>
          <div class="cart-group-card__shipping">
            <button
              class="cart-shipping-trigger"
              type="button"
              @click="openShippingGuide(entry.deliveryGuide.modalTitle, entry.deliveryGuide.modalBody)"
            >
              {{ entry.deliveryGuide.shippingText }}
            </button>
            <p>{{ entry.deliveryGuide.shippingSubText }}</p>
          </div>
        </div>
      </div>

      <div class="cart-group-card__actions">
        <button
          class="cart-group-card__order-btn"
          type="button"
          :disabled="entry.item.isSoldOut"
          @click="goToCheckout('single', entry.item.productId)"
        >
          {{ entry.item.isSoldOut ? '품절' : '바로주문' }}
        </button>
        <button class="cart-group-card__remove-btn" type="button" @click="removeItem(entry.item.id)">
          삭제
        </button>
      </div>
    </article>
  </div>
</template>

<style scoped>
.cart-group-cards {
  display: grid;
  gap: 0;
}

.cart-group-card {
  display: grid;
  gap: 18px;
  padding: 20px 0;
  border-bottom: 1px solid #eceff3;
}

.cart-group-card.is-soldout {
  background: linear-gradient(90deg, rgba(248, 250, 252, 0.8), rgba(255, 255, 255, 0));
}

.cart-group-card__top {
  display: grid;
  grid-template-columns: 32px 88px minmax(0, 1fr);
  align-items: start;
  gap: 14px;
}

.cart-group-card__select {
  display: inline-flex;
  justify-content: center;
  padding-top: 4px;
}

.cart-check input {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: #111111;
}

.cart-group-card__thumb-link {
  display: block;
}

.cart-group-card__thumb-link img {
  display: block;
  width: 88px;
  height: 88px;
  object-fit: contain;
  background: #ffffff;
}

.cart-group-card__copy {
  display: grid;
  gap: 10px;
}

.cart-group-card__brand-line {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 13px;
}

.cart-group-card__brand-line strong {
  color: #111827;
}

.cart-group-card__copy h2,
.cart-group-card__copy p {
  margin: 0;
}

.cart-group-card__title-link {
  color: #111827;
  font-size: 17px;
  line-height: 1.5;
}

.cart-group-card__copy p {
  color: #6b7280;
  font-size: 14px;
}

.cart-group-card__soldout {
  color: #b42318;
  font-weight: 700;
}

.cart-group-card__meta {
  display: grid;
  gap: 12px;
}

.cart-group-card__meta-row {
  display: grid;
  gap: 10px;
}

.cart-group-card__meta-label {
  color: #6b7280;
  font-size: 13px;
  font-weight: 700;
}

.qty-stepper {
  display: inline-grid;
  grid-template-columns: 36px 44px 36px;
  align-items: center;
  height: 38px;
  border: 1px solid #d8dde5;
  background: #ffffff;
}

.qty-stepper button {
  border: 0;
  background: #ffffff;
  height: 100%;
  color: #111111;
  font-size: 18px;
  cursor: pointer;
}

.qty-stepper button:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: default;
}

.qty-stepper span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  border-left: 1px solid #d8dde5;
  border-right: 1px solid #d8dde5;
}

.cart-group-card__price {
  display: grid;
  gap: 6px;
}

.cart-group-card__price strong {
  font-size: 24px;
  line-height: 1.2;
  letter-spacing: -0.04em;
  color: #111111;
}

.cart-group-card__price span {
  color: #9ca3af;
  font-size: 13px;
  text-decoration: line-through;
}

.cart-group-card__shipping {
  display: grid;
  gap: 6px;
}

.cart-shipping-trigger {
  width: fit-content;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: #0058a3;
  font-size: 15px;
  font-weight: 700;
}

.cart-group-card__shipping p {
  margin: 0;
  color: #6b7280;
  white-space: pre-line;
  font-size: 13px;
  line-height: 1.55;
}

.cart-group-card__actions {
  display: grid;
  gap: 10px;
}

.cart-group-card__order-btn,
.cart-group-card__remove-btn {
  min-height: 46px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.cart-group-card__order-btn {
  border: 1px solid #111827;
  background: #111827;
  color: #ffffff;
}

.cart-group-card__order-btn:disabled {
  border-color: #d8dde5;
  background: #eef1f4;
  color: #8a93a0;
  cursor: default;
}

.cart-group-card__remove-btn {
  border: 1px solid #d8dde5;
  background: #ffffff;
  color: #374151;
}
</style>
