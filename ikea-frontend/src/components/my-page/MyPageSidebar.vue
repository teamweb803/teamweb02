<script setup>
import { ROUTE_PATHS } from '../../constants/routes';

defineProps({
  sectionLinks: {
    type: Array,
    required: true,
  },
  activeSectionId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['select-section']);

function selectSection(sectionId) {
  emit('select-section', sectionId);
}
</script>

<template>
  <aside class="my-sidebar">
    <h1>마이페이지</h1>
    <nav class="my-sidebar__nav" aria-label="마이페이지 섹션">
      <button
        v-for="section in sectionLinks"
        :key="section.id"
        class="my-sidebar__link"
        :class="{ 'is-active': activeSectionId === section.id }"
        type="button"
        @click="selectSection(section.id)"
      >
        <strong>{{ section.label }}</strong>
      </button>
    </nav>

    <div class="my-sidebar__support">
      <strong>고객센터 연결</strong>
      <RouterLink :to="ROUTE_PATHS.customerServiceFaq">FAQ</RouterLink>
      <RouterLink :to="ROUTE_PATHS.customerServiceQna">QnA</RouterLink>
      <RouterLink :to="ROUTE_PATHS.customerServiceNotice">공지사항</RouterLink>
    </div>
  </aside>
</template>

<style scoped>
.my-sidebar h1 {
  margin: 0 0 28px;
  font-size: 36px;
  line-height: 1.2;
  font-weight: 700;
  color: var(--text-strong);
}

.my-sidebar__nav {
  display: grid;
  border-top: 2px solid var(--border-strong);
}

.my-sidebar__link {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 56px;
  padding: 0;
  border: 0;
  border-bottom: 1px solid var(--border-soft);
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.my-sidebar__link strong {
  color: #222222;
  font-size: 16px;
  font-weight: 500;
}

.my-sidebar__link.is-active strong {
  color: var(--text-strong);
  font-weight: 700;
}

.my-sidebar__support {
  display: grid;
  gap: 10px;
  margin-top: 28px;
  padding-top: 22px;
  border-top: 1px solid var(--border-soft);
}

.my-sidebar__support strong {
  color: var(--text-strong);
  font-size: 15px;
  font-weight: 700;
}

.my-sidebar__support a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
}

@media (max-width: 720px) {
  .my-sidebar h1 {
    font-size: 28px;
  }
}
</style>
