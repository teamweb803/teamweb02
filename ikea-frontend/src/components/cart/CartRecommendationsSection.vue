<script setup>
defineProps({
  formatPrice: {
    type: Function,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <section class="cart-recommend">
    <div class="cart-recommend__head">
      <h2>장바구니와 함께 보면 좋은 상품</h2>
    </div>

    <div class="cart-recommend__grid">
      <article v-for="item in items" :key="item.id" class="recommend-card">
        <RouterLink :to="item.detailPath" class="recommend-card__link">
          <div class="recommend-card__image-wrap">
            <span class="recommend-card__badge">{{ item.badge }}</span>
            <img :src="item.image" :alt="item.title" />
          </div>
          <p>{{ item.brand }}</p>
          <h3>{{ item.title }}</h3>
          <div class="recommend-card__price">
            <span v-if="item.originalPrice > item.price">{{ formatPrice(item.originalPrice) }}</span>
            <strong>{{ formatPrice(item.price) }}</strong>
          </div>
        </RouterLink>
      </article>
    </div>
  </section>
</template>

<style scoped>
.cart-recommend {
  display: grid;
  gap: 22px;
}

.cart-recommend h2 {
  margin: 0;
  color: #111111;
  font-size: 28px;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.cart-recommend__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.recommend-card__link {
  display: grid;
  gap: 14px;
  color: inherit;
}

.recommend-card__image-wrap {
  position: relative;
  min-height: 220px;
  border: 1px solid #eceff3;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recommend-card__image-wrap img {
  width: 86%;
  height: auto;
  object-fit: contain;
}

.recommend-card__badge {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #364152;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
}

.recommend-card p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.recommend-card h3 {
  margin: 0;
  font-size: 18px;
  line-height: 1.45;
  letter-spacing: -0.03em;
}

.recommend-card__price {
  display: grid;
  gap: 4px;
}

.recommend-card__price span {
  color: #9ca3af;
  font-size: 13px;
  text-decoration: line-through;
}

.recommend-card__price strong {
  font-size: 18px;
  letter-spacing: -0.03em;
}

@media (max-width: 1180px) {
  .cart-recommend__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .cart-recommend__grid {
    grid-template-columns: 1fr;
  }
}
</style>
