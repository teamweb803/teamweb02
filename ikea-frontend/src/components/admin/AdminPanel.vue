<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <section class="admin-panel">
    <header class="admin-panel__head">
      <div class="admin-panel__heading">
        <strong>{{ title }}</strong>
        <p v-if="description">{{ description }}</p>
      </div>
      <div v-if="$slots.action" class="admin-panel__action">
        <slot name="action" />
      </div>
    </header>
    <div class="admin-panel__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.admin-panel {
  border-top: 2px solid #111111;
  background: #ffffff;
}

.admin-panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 0 16px;
  border-bottom: 1px solid #e6e6e6;
}

.admin-panel__heading {
  min-width: 0;
  flex: 1 1 auto;
}

.admin-panel__head strong {
  display: block;
  color: #111111;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-panel__head p {
  margin: 8px 0 0;
  color: #666666;
  font-size: 14px;
  line-height: 1.6;
}

.admin-panel__action {
  display: flex;
  flex: 0 1 320px;
  min-width: 0;
  justify-content: flex-end;
}

.admin-panel__body {
  padding-top: 18px;
}

@media (max-width: 720px) {
  .admin-panel__head {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-panel__action {
    width: 100%;
    flex-basis: auto;
    justify-content: stretch;
  }
}
</style>
