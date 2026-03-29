<script setup>
import { computed, ref, watch } from 'vue';
import AdminPagination from './AdminPagination.vue';
import AdminPanel from './AdminPanel.vue';

const props = defineProps({
  reviewRows: {
    type: Array,
    default: () => [],
  },
});

const currentPage = ref(1);
const pageSize = 8;

const pageCount = computed(() => Math.max(Math.ceil(props.reviewRows.length / pageSize), 1));
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return props.reviewRows.slice(start, start + pageSize);
});

watch(
  () => props.reviewRows.length,
  () => {
    if (currentPage.value > pageCount.value) {
      currentPage.value = pageCount.value;
    }
  },
);
</script>

<template>
  <section class="admin-reviews-section">
    <AdminPanel title="리뷰 목록">
      <div class="admin-reviews-section__table">
        <div class="admin-reviews-section__head">
          <span>상품</span>
          <span>작성자</span>
          <span>내용</span>
          <span>평점</span>
          <span>등록일</span>
        </div>
        <div class="admin-reviews-section__body">
          <article v-for="row in pagedRows" :key="row.id" class="admin-reviews-section__row">
            <strong>{{ row.productName }}</strong>
            <span>{{ row.memberName }}</span>
            <p>{{ row.content }}</p>
            <b>{{ row.rating }}</b>
            <span>{{ row.date }}</span>
          </article>
        </div>
      </div>

      <AdminPagination v-model:current-page="currentPage" :page-count="pageCount" />
    </AdminPanel>
  </section>
</template>

<style scoped>
.admin-reviews-section__head,
.admin-reviews-section__row {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) 110px minmax(0, 1.6fr) 80px 90px;
  gap: 14px;
  align-items: center;
}

.admin-reviews-section__head {
  min-height: 52px;
  border-bottom: 1px solid #e6e6e6;
  color: #555555;
  font-size: 14px;
  font-weight: 600;
}

.admin-reviews-section__row {
  min-height: 78px;
  border-bottom: 1px solid #efefef;
}

.admin-reviews-section__row:last-child {
  border-bottom: 0;
}

.admin-reviews-section__row strong,
.admin-reviews-section__row span,
.admin-reviews-section__row p,
.admin-reviews-section__row b {
  color: #111111;
  font-size: 14px;
}

.admin-reviews-section__row p {
  margin: 0;
  color: #666666;
  line-height: 1.5;
}

.admin-reviews-section__row b {
  font-size: 15px;
}

@media (max-width: 720px) {
  .admin-reviews-section__head {
    display: none;
  }

  .admin-reviews-section__row {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 16px 0;
  }
}
</style>
