<script setup>
import { computed, ref, watch } from 'vue';
import AdminPagination from './AdminPagination.vue';
import AdminPanel from './AdminPanel.vue';

const props = defineProps({
  productRows: {
    type: Array,
    default: () => [],
  },
});

const currentPage = ref(1);
const pageSize = 8;

const pageCount = computed(() => Math.max(Math.ceil(props.productRows.length / pageSize), 1));
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return props.productRows.slice(start, start + pageSize);
});

watch(
  () => props.productRows.length,
  () => {
    if (currentPage.value > pageCount.value) {
      currentPage.value = pageCount.value;
    }
  },
);
</script>

<template>
  <section class="admin-products-section">
    <AdminPanel title="상품 목록">
      <div class="admin-products-section__table">
        <div class="admin-products-section__head">
          <span>상품</span>
          <span>카테고리</span>
          <span>가격</span>
          <span>재고</span>
          <span>등록일</span>
          <span>이동</span>
        </div>
        <div class="admin-products-section__body">
          <article v-for="row in pagedRows" :key="row.id" class="admin-products-section__row">
            <div class="admin-products-section__product">
              <img :src="row.image" :alt="row.title" />
              <strong>{{ row.title }}</strong>
            </div>
            <span>{{ row.categoryName }}</span>
            <span>{{ row.price }}</span>
            <b :class="`is-${row.stockState}`">{{ row.stockLabel }}</b>
            <span>{{ row.date }}</span>
            <RouterLink :to="row.to">상품 보기</RouterLink>
          </article>
        </div>
      </div>

      <AdminPagination v-model:current-page="currentPage" :page-count="pageCount" />
    </AdminPanel>
  </section>
</template>

<style scoped>
.admin-products-section__head,
.admin-products-section__row {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) 130px 120px 88px 90px 110px;
  gap: 14px;
  align-items: center;
}

.admin-products-section__head {
  min-height: 52px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
}

.admin-products-section__row {
  min-height: 86px;
  border-bottom: 1px solid var(--border-muted);
}

.admin-products-section__row:last-child {
  border-bottom: 0;
}

.admin-products-section__product {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.admin-products-section__product img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border: 1px solid var(--border-muted);
}

.admin-products-section__product strong,
.admin-products-section__row span,
.admin-products-section__row b {
  color: var(--text-strong);
  font-size: 14px;
  line-height: 1.45;
  word-break: keep-all;
}

.admin-products-section__row b.is-critical {
  color: #c0392b;
}

.admin-products-section__row b.is-warning {
  color: #b57216;
}

.admin-products-section__row b.is-stable {
  color: #1c6b45;
}

.admin-products-section__head span:last-child,
.admin-products-section__row > :last-child {
  justify-self: end;
}

.admin-products-section__row a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  justify-self: end;
  min-width: 110px;
  height: var(--action-height);
  border: 1px solid var(--border-default);
  color: var(--text-strong);
  text-decoration: none;
  font-size: 13px;
}

@media (max-width: 720px) {
  .admin-products-section__head {
    display: none;
  }

  .admin-products-section__row {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 16px 0;
  }
}
</style>
