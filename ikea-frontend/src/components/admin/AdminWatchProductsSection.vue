<script setup>
import AdminPanel from './AdminPanel.vue';

defineProps({
  watchProducts: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <section class="admin-watch-products-section">
    <AdminPanel title="검수 우선 상품">
      <div class="admin-watch-products-section__list">
        <RouterLink
          v-for="item in watchProducts"
          :key="item.id"
          :to="item.to"
          class="admin-watch-products-section__row"
        >
          <img :src="item.image" :alt="item.title" />
          <div class="admin-watch-products-section__copy">
            <span>{{ item.brand }}</span>
            <strong>{{ item.title }}</strong>
            <p>{{ item.categoryLabel }} · {{ item.reviewText }}</p>
          </div>
          <b>{{ item.price }}</b>
        </RouterLink>
      </div>
    </AdminPanel>
  </section>
</template>

<style scoped>
.admin-watch-products-section__list {
  display: grid;
}

.admin-watch-products-section__row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  min-height: 126px;
  border-bottom: 1px solid #efefef;
  color: #111111;
  text-decoration: none;
}

.admin-watch-products-section__row:last-child {
  border-bottom: 0;
}

.admin-watch-products-section__row img {
  width: 96px;
  height: 96px;
  object-fit: contain;
}

.admin-watch-products-section__copy {
  min-width: 0;
}

.admin-watch-products-section__copy span {
  color: #888888;
  font-size: 12px;
}

.admin-watch-products-section__copy strong {
  display: block;
  margin-top: 8px;
  color: #111111;
  font-size: 20px;
  line-height: 1.45;
  word-break: keep-all;
}

.admin-watch-products-section__copy p {
  margin: 8px 0 0;
  color: #666666;
  font-size: 13px;
  line-height: 1.5;
}

.admin-watch-products-section__row b {
  color: #111111;
  font-size: 18px;
}

@media (max-width: 720px) {
  .admin-watch-products-section__row {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 16px 0;
  }

  .admin-watch-products-section__row img {
    width: 100%;
    height: 180px;
  }
}
</style>
