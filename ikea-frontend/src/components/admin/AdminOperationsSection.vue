<script setup>
import AdminPanel from './AdminPanel.vue';

defineProps({
  serviceChecks: {
    type: Array,
    default: () => [],
  },
  supportQueue: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <section class="admin-operations-section">
    <AdminPanel title="연동 상태">
      <div class="admin-operations-section__checks">
        <article v-for="item in serviceChecks" :key="item.id" class="admin-operations-section__check-row">
          <div>
            <strong>{{ item.label }}</strong>
            <p>{{ item.detail }}</p>
          </div>
          <span>{{ item.status }}</span>
        </article>
      </div>
    </AdminPanel>

    <AdminPanel title="고객센터">
      <div class="admin-operations-section__support">
        <article v-for="item in supportQueue" :key="item.id" class="admin-operations-section__support-row">
          <div class="admin-operations-section__support-type">{{ item.type }}</div>
          <div class="admin-operations-section__support-copy">
            <strong>{{ item.title }}</strong>
            <p>{{ item.detail }}</p>
          </div>
          <RouterLink :to="item.actionTo">{{ item.actionLabel }}</RouterLink>
        </article>
      </div>
    </AdminPanel>
  </section>
</template>

<style scoped>
.admin-operations-section {
  display: grid;
  gap: 28px;
}

.admin-operations-section__checks,
.admin-operations-section__support {
  display: grid;
}

.admin-operations-section__check-row,
.admin-operations-section__support-row {
  border-bottom: 1px solid #efefef;
}

.admin-operations-section__check-row:last-child,
.admin-operations-section__support-row:last-child {
  border-bottom: 0;
}

.admin-operations-section__check-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 88px;
}

.admin-operations-section__check-row strong,
.admin-operations-section__support-copy strong {
  display: block;
  color: #111111;
  font-size: 16px;
}

.admin-operations-section__check-row p,
.admin-operations-section__support-copy p {
  margin: 8px 0 0;
  color: #666666;
  font-size: 13px;
  line-height: 1.6;
}

.admin-operations-section__check-row span {
  flex: 0 0 auto;
  color: #111111;
  font-size: 14px;
  font-weight: 700;
}

.admin-operations-section__support-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr) 128px;
  gap: 16px;
  align-items: center;
  min-height: 88px;
  padding: 8px 0;
}

.admin-operations-section__support-type {
  color: #777777;
  font-size: 13px;
  font-weight: 700;
}

.admin-operations-section__support-copy {
  min-width: 0;
}

.admin-operations-section__support-row a {
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
  .admin-operations-section__support-row {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 16px 0;
  }
}
</style>
