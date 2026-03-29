<script setup>
import HomeProductCard from './HomeProductCard.vue';

defineProps({
  id: {
    type: String,
    default: undefined,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  items: {
    type: Array,
    required: true,
  },
  filters: {
    type: Array,
    default: () => [],
  },
  activeFilterId: {
    type: String,
    default: '',
  },
  moreTarget: {
    type: String,
    default: '',
  },
  badgeVariant: {
    type: String,
    default: 'default',
  },
});

const emit = defineEmits(['filter-change', 'more-click', 'product-activate']);
</script>

<template>
  <section :id="id" class="hs-section">
    <div class="hs-section__title-wrap">
      <h2>{{ title }}</h2>
      <a v-if="moreTarget" href="/" @click.prevent="emit('more-click', moreTarget)">더보기</a>
    </div>
    <p v-if="subtitle" class="hs-section__subtitle">{{ subtitle }}</p>
    <div v-if="filters.length" class="hs-filter-row">
      <button
        v-for="filter in filters"
        :key="filter.id"
        class="hs-filter-chip"
        :class="{ 'is-active': filter.id === activeFilterId }"
        type="button"
        @click="emit('filter-change', filter.id)"
      >
        {{ filter.label }}
      </button>
    </div>
    <div class="hs-product-grid">
      <HomeProductCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        :badge-variant="badgeVariant"
        image-loading="lazy"
        @activate="emit('product-activate', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.hs-section {
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
  padding-bottom: 14px;
  border-bottom: 1px solid var(--hs-line);
}

.hs-section__title-wrap h2 {
  margin: 0;
  color: var(--hs-ink);
  font-size: 34px;
  line-height: 1.15;
  letter-spacing: -0.04em;
}

.hs-section__title-wrap a {
  color: var(--hs-muted);
  font-size: 14px;
  font-weight: 700;
}

.hs-section__subtitle {
  margin: -10px 0 0;
  color: var(--hs-muted);
  font-size: 15px;
  line-height: 1.65;
}

.hs-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hs-filter-chip {
  min-height: 38px;
  padding: 0 18px;
  border: 1px solid var(--hs-line);
  border-radius: 999px;
  background: #ffffff;
  color: var(--hs-muted);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.hs-filter-chip.is-active {
  border-color: var(--hs-ink);
  background: var(--hs-ink);
  color: #ffffff;
}

.hs-product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

@media (max-width: 1180px) {
  .hs-section {
    gap: 56px;
  }

  .hs-product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .hs-section {
    width: calc(100% - 24px);
  }

  .hs-product-grid {
    grid-template-columns: 1fr;
  }

  .hs-section__title-wrap h2 {
    font-size: 28px;
  }
}
</style>
