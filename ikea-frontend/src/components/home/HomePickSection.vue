<script setup>
import HomePickCard from './HomePickCard.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['product-activate']);
</script>

<template>
  <section class="hs-pick-section">
    <div class="hs-section__title-wrap hs-section__title-wrap--simple">
      <h2>{{ title }}</h2>
    </div>
    <div class="hs-pick-grid">
      <HomePickCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        image-loading="lazy"
        @activate="emit('product-activate', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.hs-pick-section {
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

.hs-pick-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

@media (max-width: 1180px) {
  .hs-pick-section {
    gap: 56px;
  }

  .hs-pick-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .hs-pick-section {
    width: calc(100% - 24px);
  }

  .hs-pick-grid {
    grid-template-columns: 1fr;
  }

  .hs-section__title-wrap h2 {
    font-size: 28px;
  }
}
</style>
