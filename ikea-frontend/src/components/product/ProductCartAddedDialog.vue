<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  product: {
    type: Object,
    default: () => ({}),
  },
  recommendations: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['close', 'view-cart', 'select-product']);

function formatPrice(value) {
  return `${Number(value ?? 0).toLocaleString('ko-KR')}원`;
}

function formatRating(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(1) : null;
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="cart-added-dialog"
      role="presentation"
      @click.self="$emit('close')"
    >
      <section
        class="cart-added-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-added-dialog-title"
      >
        <button
          class="cart-added-dialog__close"
          type="button"
          aria-label="팝업 닫기"
          @click="$emit('close')"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6L18 18M18 6L6 18"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <div class="cart-added-dialog__hero">
          <p class="cart-added-dialog__eyebrow">{{ product.brand }}</p>
          <h2 id="cart-added-dialog-title">장바구니에 상품을 담았습니다</h2>
          <p class="cart-added-dialog__product">{{ product.name }}</p>
          <button class="cart-added-dialog__cta" type="button" @click="$emit('view-cart')">
            장바구니 보기
          </button>
        </div>

        <section v-if="recommendations.length" class="cart-added-dialog__section">
          <div class="cart-added-dialog__section-head">
            <strong>많은 분들이 함께 본 상품</strong>
            <span>상세페이지 흐름에 맞춰 이어서 볼 수 있습니다.</span>
          </div>

          <div class="cart-added-dialog__grid">
            <article
              v-for="item in recommendations"
              :key="item.id"
              class="cart-added-dialog__card"
            >
              <button
                class="cart-added-dialog__card-link"
                type="button"
                :aria-label="`${item.name} 상세페이지 보기`"
                @click="$emit('select-product', item.id)"
              />

              <div class="cart-added-dialog__card-image">
                <img :src="item.image" :alt="item.imageAlt ?? item.name" />
              </div>

              <div class="cart-added-dialog__card-copy">
                <p>{{ item.brand }}</p>
                <h3>{{ item.name }}</h3>
                <strong>{{ formatPrice(item.price) }}</strong>
                <span v-if="formatRating(item.rating)" class="cart-added-dialog__rating">
                  ★ {{ formatRating(item.rating) }} ({{ Number(item.reviews ?? 0).toLocaleString('ko-KR') }})
                </span>
              </div>
            </article>
          </div>
        </section>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.cart-added-dialog {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  background: rgba(17, 24, 39, 0.42);
  padding: 24px;
}

.cart-added-dialog__panel {
  position: relative;
  width: min(720px, 100%);
  border-radius: 24px;
  background: #ffffff;
  padding: 34px 40px 40px;
  box-shadow: 0 26px 72px rgba(15, 23, 42, 0.18);
}

.cart-added-dialog__close {
  position: absolute;
  top: 20px;
  right: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #111827;
  cursor: pointer;
}

.cart-added-dialog__close svg {
  width: 22px;
  height: 22px;
}

.cart-added-dialog__hero {
  display: grid;
  justify-items: center;
  gap: 10px;
  text-align: center;
}

.cart-added-dialog__eyebrow {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.cart-added-dialog__hero h2 {
  margin: 0;
  font-size: 30px;
  line-height: 1.2;
  color: #111827;
}

.cart-added-dialog__product {
  margin: 0;
  max-width: 420px;
  font-size: 15px;
  line-height: 1.5;
  color: #4b5563;
}

.cart-added-dialog__cta {
  min-width: 190px;
  height: 50px;
  margin-top: 6px;
  border: 0;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.cart-added-dialog__section {
  margin-top: 34px;
}

.cart-added-dialog__section-head {
  display: grid;
  gap: 6px;
  margin-bottom: 18px;
}

.cart-added-dialog__section-head strong {
  font-size: 22px;
  color: #111827;
}

.cart-added-dialog__section-head span {
  font-size: 13px;
  color: #6b7280;
}

.cart-added-dialog__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.cart-added-dialog__card {
  position: relative;
  display: grid;
  gap: 10px;
}

.cart-added-dialog__card-link {
  position: absolute;
  inset: 0;
  z-index: 1;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.cart-added-dialog__card-image {
  border-radius: 14px;
  background: #f7f7f7;
  overflow: hidden;
  aspect-ratio: 1 / 1;
}

.cart-added-dialog__card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cart-added-dialog__card-copy {
  display: grid;
  gap: 4px;
}

.cart-added-dialog__card-copy p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.cart-added-dialog__card-copy h3 {
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
  color: #111827;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.cart-added-dialog__card-copy strong {
  font-size: 17px;
  color: #111827;
}

.cart-added-dialog__rating {
  font-size: 12px;
  color: #6b7280;
}

@media (max-width: 820px) {
  .cart-added-dialog__panel {
    padding: 28px 20px 24px;
  }

  .cart-added-dialog__hero h2 {
    font-size: 24px;
  }

  .cart-added-dialog__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
