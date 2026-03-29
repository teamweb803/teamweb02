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
    role="button"
    tabindex="0"
    @click="handleActivate"
    @keydown="handleKeydown"
  >
    <div class="hs-pick-card__image-wrap">
      <img :src="item.image" :alt="item.title" :loading="imageLoading" decoding="async" />
      <span class="hs-pick-card__badge" :class="item.accent === 'yellow' ? 'is-yellow' : 'is-blue'">
        {{ item.badge }}
      </span>
    </div>
    <div class="hs-pick-card__copy">
      <p>{{ item.brand }}</p>
      <h3>{{ item.title }}</h3>
      <div class="hs-pick-card__price">
        <span v-if="item.discount">{{ item.discount }}</span>
        <strong>{{ item.price }}</strong>
      </div>
      <div class="hs-pick-card__meta">
        <span v-if="item.rating">평점 {{ item.rating }}</span>
        <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
      </div>
    </div>
    <button class="hs-pick-card__wish" type="button" aria-label="찜하기" @click.stop>
      &#9825;
    </button>
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
  background: rgba(17, 24, 39, 0.82);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.hs-pick-card__badge.is-yellow {
  background: var(--hs-yellow);
  color: #111827;
}

.hs-pick-card__badge.is-blue {
  background: var(--hs-blue);
  color: #ffffff;
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

.hs-pick-card__wish {
  position: absolute;
  top: 24px;
  right: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #d8dde5;
  border-radius: 50%;
  background: #ffffff;
  color: var(--hs-ink);
  cursor: pointer;
  font-size: 14px;
}
</style>
