<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true,
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
    class="hs-pick-card"
    :class="{ 'is-soldout': item.isSoldOut }"
    role="button"
    tabindex="0"
    @click="handleActivate"
    @keydown="handleKeydown"
  >
    <div class="hs-pick-card__image-wrap">
      <img :src="item.image" :alt="item.title" :loading="imageLoading" decoding="async" />
      <span
        class="hs-pick-card__badge"
        :class="item.isSoldOut ? 'is-soldout' : (item.accent === 'yellow' ? 'is-yellow' : 'is-blue')"
      >
        {{ item.isSoldOut ? '품절' : item.badge }}
      </span>
    </div>
    <div class="hs-pick-card__copy">
      <p>{{ item.brand }}</p>
      <h3>{{ item.title }}</h3>
      <div class="hs-pick-card__price">
        <span v-if="item.discount">{{ item.discount }}</span>
        <strong>{{ item.price }}</strong>
      </div>
      <p v-if="item.isSoldOut" class="hs-pick-card__stock">품절 · 재입고 전까지 구매할 수 없습니다.</p>
      <div class="hs-pick-card__meta">
        <span v-if="item.rating">평점 {{ item.rating }}</span>
        <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.hs-pick-card {
  position: relative;
  display: grid;
  gap: 18px;
  border: 1px solid var(--hs-line);
  background: #ffffff;
  padding: 16px;
  cursor: pointer;
}

.hs-pick-card.is-soldout {
  background: #fbfbfc;
}

.hs-pick-card:focus-visible {
  outline: 2px solid var(--hs-blue);
  outline-offset: 2px;
}

.hs-pick-card__image-wrap {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f7f9fb;
}

.hs-pick-card__image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.hs-pick-card__badge {
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

.hs-pick-card__badge.is-yellow {
  background: var(--hs-badge-yellow);
  color: var(--hs-badge-yellow-ink);
}

.hs-pick-card__badge.is-blue {
  background: var(--hs-badge-blue);
  color: var(--hs-badge-blue-ink);
}

.hs-pick-card__badge.is-soldout {
  background: var(--hs-badge-danger);
  color: var(--hs-badge-danger-ink);
}

.hs-pick-card__copy {
  display: grid;
  gap: 10px;
}

.hs-pick-card__copy p {
  margin: 0;
  color: var(--hs-muted);
  font-size: 13px;
}

.hs-pick-card__stock {
  color: #b42318;
  font-size: 13px;
  font-weight: 700;
}

.hs-pick-card__copy h3 {
  margin: 0;
  color: var(--hs-ink);
  font-size: 22px;
  line-height: 1.42;
  letter-spacing: -0.02em;
}

.hs-pick-card__price {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.hs-pick-card__price strong {
  color: var(--hs-ink);
  font-size: 22px;
  line-height: 1;
}

.hs-pick-card__price span {
  color: #ef4444;
  font-size: 18px;
  font-weight: 700;
}

.hs-pick-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hs-pick-card__meta span {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--hs-soft);
  color: var(--hs-muted);
  font-size: 12px;
  font-weight: 600;
}

</style>
