<script setup>
import AdminPanel from './AdminPanel.vue';

defineProps({
  categoryRows: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <section class="admin-catalog-section">
    <AdminPanel title="카테고리 운영 현황">
      <div class="admin-catalog-section__table">
        <div class="admin-catalog-section__head">
          <span>카테고리</span>
          <span>상품 수</span>
          <span>서브메뉴</span>
          <span>리뷰 수</span>
          <span>이동</span>
        </div>
        <div class="admin-catalog-section__body">
          <article v-for="row in categoryRows" :key="row.id" class="admin-catalog-section__row">
            <strong>{{ row.label }}</strong>
            <span>{{ row.productCount }}</span>
            <span>{{ row.submenuCount }}</span>
            <span>{{ row.reviewCount }}</span>
            <RouterLink :to="row.to">카테고리 보기</RouterLink>
          </article>
        </div>
      </div>
    </AdminPanel>
  </section>
</template>

<style scoped>
.admin-catalog-section__head,
.admin-catalog-section__row {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) 110px 110px 120px 140px;
  gap: 14px;
  align-items: center;
}

.admin-catalog-section__head {
  min-height: 52px;
  border-bottom: 1px solid #e6e6e6;
  color: #555555;
  font-size: 14px;
  font-weight: 600;
}

.admin-catalog-section__row {
  min-height: 74px;
  border-bottom: 1px solid #efefef;
}

.admin-catalog-section__row:last-child {
  border-bottom: 0;
}

.admin-catalog-section__row strong,
.admin-catalog-section__row span {
  color: #111111;
  font-size: 14px;
}

.admin-catalog-section__row a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  color: #111111;
  text-decoration: none;
  font-size: 13px;
}

@media (max-width: 720px) {
  .admin-catalog-section__head {
    display: none;
  }

  .admin-catalog-section__row {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 16px 0;
  }
}
</style>
