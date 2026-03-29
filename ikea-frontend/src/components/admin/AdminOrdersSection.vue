<script setup>
import { computed, ref, watch } from 'vue';
import AdminPagination from './AdminPagination.vue';
import AdminPanel from './AdminPanel.vue';

const props = defineProps({
  orderRows: {
    type: Array,
    default: () => [],
  },
  orderStatusCards: {
    type: Array,
    default: () => [],
  },
});

const currentPage = ref(1);
const pageSize = 8;

const pageCount = computed(() => Math.max(Math.ceil(props.orderRows.length / pageSize), 1));
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return props.orderRows.slice(start, start + pageSize);
});

watch(
  () => props.orderRows.length,
  () => {
    if (currentPage.value > pageCount.value) {
      currentPage.value = pageCount.value;
    }
  },
);
</script>

<template>
  <section class="admin-orders-section">
    <AdminPanel title="주문 상태">
      <div class="admin-orders-section__status-grid">
        <article v-for="item in orderStatusCards" :key="item.id" class="admin-orders-section__status-card">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </article>
      </div>
    </AdminPanel>

    <AdminPanel title="전체 주문">
      <div class="admin-orders-section__table">
        <div class="admin-orders-section__head">
          <span>주문번호 / 일시</span>
          <span>상태</span>
          <span>상품</span>
          <span>결제</span>
          <span>금액</span>
        </div>
        <div class="admin-orders-section__body">
          <article v-for="row in pagedRows" :key="row.id" class="admin-orders-section__row">
            <div class="admin-orders-section__order-meta">
              <strong>#{{ row.id }}</strong>
              <span>{{ row.dateTime }}</span>
            </div>
            <span>{{ row.status }}</span>
            <p>{{ row.itemSummary }}</p>
            <span>{{ row.payment }}</span>
            <b>{{ row.totalPrice }}</b>
          </article>
        </div>
      </div>

      <AdminPagination v-model:current-page="currentPage" :page-count="pageCount" />
    </AdminPanel>
  </section>
</template>

<style scoped>
.admin-orders-section {
  display: grid;
  gap: 28px;
}

.admin-orders-section__status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.admin-orders-section__status-card {
  min-height: 120px;
  padding: 18px;
  border: 1px solid #e6e6e6;
  background: #ffffff;
}

.admin-orders-section__status-card span {
  display: block;
  color: #777777;
  font-size: 13px;
}

.admin-orders-section__status-card strong {
  display: block;
  margin-top: 10px;
  color: #111111;
  font-size: 30px;
  line-height: 1.1;
  font-weight: 700;
}

.admin-orders-section__head,
.admin-orders-section__row {
  display: grid;
  grid-template-columns: 200px 110px minmax(0, 1fr) 90px 120px;
  gap: 14px;
  align-items: center;
}

.admin-orders-section__head {
  min-height: 52px;
  border-bottom: 1px solid #e6e6e6;
  color: #555555;
  font-size: 14px;
  font-weight: 600;
}

.admin-orders-section__row {
  min-height: 78px;
  border-bottom: 1px solid #efefef;
}

.admin-orders-section__row:last-child {
  border-bottom: 0;
}

.admin-orders-section__row strong,
.admin-orders-section__row span,
.admin-orders-section__row p,
.admin-orders-section__row b {
  color: #111111;
  font-size: 14px;
}

.admin-orders-section__order-meta {
  display: grid;
  gap: 6px;
}

.admin-orders-section__order-meta strong {
  line-height: 1.2;
}

.admin-orders-section__order-meta span {
  color: #666666;
  font-size: 12px;
  line-height: 1.4;
}

.admin-orders-section__row p {
  margin: 0;
  line-height: 1.5;
  word-break: keep-all;
}

.admin-orders-section__row b {
  font-size: 16px;
}

@media (max-width: 1080px) {
  .admin-orders-section__status-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .admin-orders-section__status-grid {
    grid-template-columns: 1fr;
  }

  .admin-orders-section__head {
    display: none;
  }

  .admin-orders-section__row {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 16px 0;
  }
}
</style>
