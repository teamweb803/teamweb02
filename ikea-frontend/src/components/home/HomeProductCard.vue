<script setup>
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
});

const emit = defineEmits(['activate']);

function handleActivate() {
  emit('activate', props.item);
}

function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleActivate();
  }
}
</script>

<template>
  <article
    class="hs-product-card"
    role="button"
    tabindex="0"
    @click="handleActivate"
    @keydown="handleKeydown"
  >
    <div class="hs-product-card__image-wrap">
      <img :src="item.image" :alt="item.title" :loading="imageLoading" decoding="async" />
      <span
        v-if="item.badge"
        class="hs-product-card__badge"
        :class="{ 'hs-product-card__badge--yellow': badgeVariant === 'yellow' }"
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
  background: rgba(17, 24, 39, 0.82);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.hs-product-card__badge--yellow {
  background: var(--hs-yellow);
  color: #111827;
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
