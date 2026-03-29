<script setup>
import { computed, ref, watch } from 'vue';
import AdminPagination from './AdminPagination.vue';
import AdminPanel from './AdminPanel.vue';

const props = defineProps({
  qnaRows: {
    type: Array,
    default: () => [],
  },
});

const currentPage = ref(1);
const pageSize = 8;

const pageCount = computed(() => Math.max(Math.ceil(props.qnaRows.length / pageSize), 1));
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return props.qnaRows.slice(start, start + pageSize);
});

watch(
  () => props.qnaRows.length,
  () => {
    if (currentPage.value > pageCount.value) {
      currentPage.value = pageCount.value;
    }
  },
);
</script>

<template>
  <section class="admin-qna-section">
    <AdminPanel title="문의 목록">
      <div class="admin-qna-section__table">
        <div class="admin-qna-section__head">
          <span>제목</span>
          <span>작성자</span>
          <span>상태</span>
          <span>등록일</span>
          <span>이동</span>
        </div>
        <div class="admin-qna-section__body">
          <article v-for="row in pagedRows" :key="row.id" class="admin-qna-section__row">
            <strong>{{ row.title }}</strong>
            <span>{{ row.writer }}</span>
            <b :class="{ 'is-pending': row.status === '답변대기' }">{{ row.status }}</b>
            <span>{{ row.date }}</span>
            <RouterLink :to="row.to">문의 보기</RouterLink>
          </article>
        </div>
      </div>

      <AdminPagination v-model:current-page="currentPage" :page-count="pageCount" />
    </AdminPanel>
  </section>
</template>

<style scoped>
.admin-qna-section__head,
.admin-qna-section__row {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) 120px 110px 90px 120px;
  gap: 14px;
  align-items: center;
}

.admin-qna-section__head {
  min-height: 52px;
  border-bottom: 1px solid #e6e6e6;
  color: #555555;
  font-size: 14px;
  font-weight: 600;
}

.admin-qna-section__row {
  min-height: 74px;
  border-bottom: 1px solid #efefef;
}

.admin-qna-section__row:last-child {
  border-bottom: 0;
}

.admin-qna-section__row strong,
.admin-qna-section__row span {
  color: #111111;
  font-size: 14px;
}

.admin-qna-section__row b {
  color: #18794e;
  font-size: 14px;
}

.admin-qna-section__row b.is-pending {
  color: #c0392b;
}

.admin-qna-section__row a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border: 1px solid #d9d9d9;
  color: #111111;
  text-decoration: none;
  font-size: 13px;
}

@media (max-width: 720px) {
  .admin-qna-section__head {
    display: none;
  }

  .admin-qna-section__row {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 16px 0;
  }
}
</style>
