<script setup>
defineProps({
  spotlight: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['featured-activate', 'product-activate']);

function handleKeydown(event, payload, eventName) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    emit(eventName, payload);
  }
}
</script>

<template>
  <section class="hs-editorial">
    <div class="hs-section__title-wrap hs-section__title-wrap--simple">
      <h2>{{ spotlight.title }}</h2>
    </div>
    <div class="hs-editorial__grid">
      <article
        class="hs-editorial__featured"
        role="button"
        tabindex="0"
        @click="emit('featured-activate', spotlight.featured)"
        @keydown="handleKeydown($event, spotlight.featured, 'featured-activate')"
      >
        <img
          :src="spotlight.featured.image"
          :alt="spotlight.featured.title"
          loading="lazy"
          decoding="async"
        />
        <div class="hs-editorial__featured-copy">
          <span>{{ spotlight.featured.label }}</span>
          <strong>{{ spotlight.featured.title }}</strong>
          <p>{{ spotlight.featured.description }}</p>
        </div>
      </article>
      <div class="hs-editorial__side">
        <article
          v-for="item in spotlight.items"
          :key="item.id"
          class="hs-mini-product"
          role="button"
          tabindex="0"
          @click="emit('product-activate', item)"
          @keydown="handleKeydown($event, item, 'product-activate')"
        >
          <img :src="item.image" :alt="item.title" loading="lazy" decoding="async" />
          <div class="hs-mini-product__copy">
            <span class="hs-mini-product__badge">{{ item.badge }}</span>
            <h3>{{ item.title }}</h3>
            <p class="hs-product-card__meta">{{ item.metaText }}</p>
            <strong>{{ item.price }}</strong>
            <div class="hs-mini-product__tags">
              <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
            </div>
          </div>
          <button class="hs-mini-product__wish" type="button" aria-label="찜하기" @click.stop>
            &#9825;
          </button>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hs-editorial {
  display: grid;
  gap: 24px;
  width: min(1280px, calc(100% - 40px));
  margin: 0 auto;
}

.hs-section__title-wrap {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.hs-section__title-wrap--simple {
  padding-bottom: 0;
  border-bottom: 0;
}

.hs-section__title-wrap h2 {
  margin: 0;
  color: var(--hs-ink);
  font-size: 34px;
  line-height: 1.15;
  letter-spacing: -0.04em;
}

.hs-editorial__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(360px, 0.75fr);
  gap: 18px;
}

.hs-editorial__featured,
.hs-mini-product {
  border: 1px solid var(--hs-line);
  background: #ffffff;
}

.hs-editorial__featured {
  position: relative;
  overflow: hidden;
  min-height: 420px;
  cursor: pointer;
}

.hs-editorial__featured:focus-visible,
.hs-mini-product:focus-visible {
  outline: 2px solid var(--hs-blue);
  outline-offset: 2px;
}

.hs-editorial__featured img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hs-editorial__featured-copy {
  position: absolute;
  right: 22px;
  bottom: 22px;
  left: 22px;
  display: grid;
  gap: 10px;
  padding: 20px 22px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(8px);
}

.hs-editorial__featured-copy span {
  color: var(--hs-blue);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hs-editorial__featured-copy strong {
  color: var(--hs-ink);
  font-size: 30px;
  line-height: 1.22;
  letter-spacing: -0.03em;
}

.hs-editorial__featured-copy p {
  margin: 0;
  color: #374151;
  font-size: 15px;
  line-height: 1.7;
}

.hs-editorial__side {
  display: grid;
  gap: 14px;
}

.hs-mini-product {
  display: grid;
  grid-template-columns: 118px minmax(0, 1fr) 46px;
  align-items: stretch;
  gap: 14px;
  padding: 14px;
  cursor: pointer;
}

.hs-mini-product img {
  width: 118px;
  height: 118px;
  object-fit: contain;
  background: #f7f9fb;
}

.hs-mini-product__copy {
  display: grid;
  gap: 8px;
  align-content: start;
}

.hs-mini-product__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--hs-soft);
  color: var(--hs-blue);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.hs-mini-product__copy h3 {
  margin: 0;
  color: var(--hs-ink);
  font-size: 20px;
  line-height: 1.45;
  letter-spacing: -0.02em;
}

.hs-mini-product__copy strong {
  color: var(--hs-ink);
  font-size: 20px;
}

.hs-product-card__meta {
  margin: 0;
  color: var(--hs-muted);
  font-size: 14px;
  line-height: 1.55;
}

.hs-mini-product__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hs-mini-product__tags span {
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

.hs-mini-product__wish {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border: 1px solid #d8dde5;
  border-radius: 50%;
  background: #ffffff;
  color: var(--hs-ink);
  cursor: pointer;
  font-size: 14px;
}

@media (max-width: 1180px) {
  .hs-editorial {
    gap: 56px;
  }

  .hs-editorial__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .hs-editorial {
    width: calc(100% - 24px);
  }

  .hs-mini-product {
    grid-template-columns: 1fr;
  }

  .hs-mini-product img {
    width: 100%;
    height: 180px;
  }

  .hs-section__title-wrap h2 {
    font-size: 28px;
  }
}
</style>
