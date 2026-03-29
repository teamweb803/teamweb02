<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  pageCount: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['update:currentPage']);

function moveTo(page) {
  if (page < 1 || page > props.pageCount || page === props.currentPage) {
    return;
  }

  emit('update:currentPage', page);
}
</script>

<template>
  <nav v-if="pageCount > 1" class="admin-pagination" aria-label="페이지 이동">
    <button
      type="button"
      class="admin-pagination__control"
      :disabled="currentPage === 1"
      @click="moveTo(currentPage - 1)"
    >
      이전
    </button>

    <button
      v-for="page in pageCount"
      :key="page"
      type="button"
      class="admin-pagination__page"
      :class="{ 'is-active': currentPage === page }"
      @click="moveTo(page)"
    >
      {{ page }}
    </button>

    <button
      type="button"
      class="admin-pagination__control"
      :disabled="currentPage === pageCount"
      @click="moveTo(currentPage + 1)"
    >
      다음
    </button>
  </nav>
</template>

<style scoped>
.admin-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.admin-pagination__control,
.admin-pagination__page {
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  color: #111111;
  font-size: 13px;
  cursor: pointer;
}

.admin-pagination__page.is-active {
  border-color: #111111;
  background: #111111;
  color: #ffffff;
  font-weight: 700;
}

.admin-pagination__control:disabled,
.admin-pagination__page:disabled {
  cursor: default;
  opacity: 0.45;
}
</style>
