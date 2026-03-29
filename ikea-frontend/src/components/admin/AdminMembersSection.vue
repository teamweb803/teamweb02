<script setup>
import { computed, ref, watch } from 'vue';
import AdminPagination from './AdminPagination.vue';
import AdminPanel from './AdminPanel.vue';

const props = defineProps({
  memberRows: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['remove-member']);

const currentPage = ref(1);
const pageSize = 8;

const pageCount = computed(() => Math.max(Math.ceil(props.memberRows.length / pageSize), 1));
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return props.memberRows.slice(start, start + pageSize);
});

watch(
  () => props.memberRows.length,
  () => {
    if (currentPage.value > pageCount.value) {
      currentPage.value = pageCount.value;
    }
  },
);
</script>

<template>
  <section class="admin-members-section">
    <AdminPanel title="회원 목록">
      <div class="admin-members-section__table">
        <div class="admin-members-section__head">
          <span>이름</span>
          <span>아이디</span>
          <span>이메일</span>
          <span>권한</span>
          <span>가입일</span>
          <span>관리</span>
        </div>
        <div class="admin-members-section__body">
          <article v-for="row in pagedRows" :key="row.id" class="admin-members-section__row">
            <strong>{{ row.name }}</strong>
            <span>{{ row.loginId }}</span>
            <p>{{ row.email }}</p>
            <b :class="{ 'is-admin': row.role === 'ADMIN' }">{{ row.role }}</b>
            <span>{{ row.date }}</span>
            <button
              v-if="row.canDelete"
              type="button"
              class="admin-members-section__delete"
              @click="emit('remove-member', row.id)"
            >
              탈퇴 처리
            </button>
            <span v-else class="admin-members-section__locked">잠금</span>
          </article>
        </div>
      </div>

      <AdminPagination v-model:current-page="currentPage" :page-count="pageCount" />
    </AdminPanel>
  </section>
</template>

<style scoped>
.admin-members-section__head,
.admin-members-section__row {
  display: grid;
  grid-template-columns: 110px 140px minmax(0, 1.4fr) 90px 90px 110px;
  gap: 14px;
  align-items: center;
}

.admin-members-section__head {
  min-height: 52px;
  border-bottom: 1px solid #e6e6e6;
  color: #555555;
  font-size: 14px;
  font-weight: 600;
}

.admin-members-section__row {
  min-height: 74px;
  border-bottom: 1px solid #efefef;
}

.admin-members-section__row:last-child {
  border-bottom: 0;
}

.admin-members-section__row strong,
.admin-members-section__row span,
.admin-members-section__row p {
  color: #111111;
  font-size: 14px;
}

.admin-members-section__row p {
  margin: 0;
  color: #666666;
  line-height: 1.5;
}

.admin-members-section__head span:last-child,
.admin-members-section__row > :last-child {
  justify-self: end;
}

.admin-members-section__row b {
  color: #555555;
  font-size: 14px;
}

.admin-members-section__row b.is-admin {
  color: #111111;
  font-weight: 700;
}

.admin-members-section__delete,
.admin-members-section__locked {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  justify-self: end;
  min-width: 110px;
  height: 40px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  color: #111111;
  font-size: 13px;
}

.admin-members-section__delete {
  cursor: pointer;
}

.admin-members-section__locked {
  color: #777777;
}

@media (max-width: 720px) {
  .admin-members-section__head {
    display: none;
  }

  .admin-members-section__row {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 16px 0;
  }
}
</style>
