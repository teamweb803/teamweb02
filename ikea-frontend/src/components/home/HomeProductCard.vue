<script setup>
import WishlistToggleButton from '../common/WishlistToggleButton.vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  badgeVariant: {
    type: String,
    default: 'default',
  },
  imageLoading: {
    type: String,
    default: 'lazy',
  },
  showWishlist: {
    type: Boolean,
    default: false,
  },
  isWishlisted: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['activate', 'toggle-wishlist']);

function handleActivate() {
  emit('activate', props.item);
}

function handleKeydown(event) {
  if (event.target !== event.currentTarget) {
    return;
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleActivate();
  }
}

function handleWishlistToggle() {
  emit('toggle-wishlist', props.item);
}
</script>

<template>
  <article
    class="hs-product-card"
    :class="{ 'is-soldout': item.isSoldOut }"
    role="button"
    tabindex="0"
    @click="handleActivate"
    @keydown="handleKeydown"
  >
    <div class="hs-product-card__image-wrap">
      <img :src="item.image" :alt="item.title" :loading="imageLoading" decoding="async" />
      <WishlistToggleButton
        v-if="showWishlist"
        class="hs-product-card__wishlist"
        :active="isWishlisted"
        @toggle="handleWishlistToggle"
      />
      <span
        v-if="item.isSoldOut"
        class="hs-product-card__badge hs-product-card__badge--soldout"
      >
        품절
      </span>
      <span
        v-else-if="item.badge"
        class="hs-product-card__badge"
        :class="{
          'hs-product-card__badge--yellow': badgeVariant === 'yellow',
          'hs-product-card__badge--blue': badgeVariant === 'blue',
        }"
      >
        {{ item.badge }}
      </span>
    </div>
    <div class="hs-product-card__copy">
      <p>{{ item.brand }}</p>
      <h3>{{ item.title }}</h3>
      <div class="hs-product-card__price-block">
        <span v-if="item.originalPrice" class="hs-price__original hs-price__original--top">{{ item.originalPrice }}</span>
        <div class="hs-price">
          <span v-if="item.discount" class="hs-price__discount">{{ item.discount }}</span>
          <strong>{{ item.price }}</strong>
        </div>
      </div>
      <p v-if="item.isSoldOut" class="hs-product-card__stock">품절 · 상세 페이지에서 재입고 여부를 확인해 주세요.</p>
      <p class="hs-product-card__meta">{{ item.metaText }}</p>
    </div>
  </article>
</template>

<style scoped>
.hs-product-card {
  display: grid;
  gap: 18px;
  border: 1px solid var(--hs-line);
  background: #ffffff;
  padding: 16px;
  cursor: pointer;
}

.hs-product-card.is-soldout {
  background: #fbfbfc;
}

.hs-product-card:focus-visible {
  outline: 2px solid var(--hs-blue);
  outline-offset: 2px;
}

.hs-product-card__image-wrap {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f7f9fb;
}

.hs-product-card__image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.hs-product-card__wishlist {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 1;
}

.hs-product-card__badge {
  position: absolute;
  top: 14px;
  left: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--hs-badge-dark);
  color: var(--hs-badge-dark-ink);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.hs-product-card__badge--yellow {
  background: var(--hs-badge-yellow);
  color: var(--hs-badge-yellow-ink);
}

.hs-product-card__badge--blue {
  background: var(--hs-badge-blue);
  color: var(--hs-badge-blue-ink);
}

.hs-product-card__badge--soldout {
  background: var(--hs-badge-danger);
  color: var(--hs-badge-danger-ink);
}

.hs-product-card__copy {
  display: grid;
  gap: 8px;
}

.hs-product-card__price-block {
  display: grid;
  gap: 4px;
}

.hs-product-card__copy p {
  margin: 0;
  color: var(--hs-muted);
  font-size: 13px;
}

.hs-product-card__stock {
  color: #b42318;
  font-size: 13px;
  font-weight: 700;
}

.hs-product-card__copy h3 {
  margin: 0;
  color: var(--hs-ink);
  font-size: 22px;
  line-height: 1.42;
  letter-spacing: -0.02em;
}

.hs-product-card__meta {
  color: var(--hs-muted);
  font-size: 14px;
  line-height: 1.55;
}

.hs-price {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.hs-price strong {
  color: var(--hs-ink);
  font-size: 22px;
  line-height: 1;
}

.hs-price__discount {
  color: #ef4444;
  font-size: 18px;
  font-weight: 700;
}

.hs-price__original {
  color: #9ca3af;
  font-size: 14px;
  text-decoration: line-through;
}

.hs-price__original--top {
  display: inline-block;
  line-height: 1.2;
}
</style>
