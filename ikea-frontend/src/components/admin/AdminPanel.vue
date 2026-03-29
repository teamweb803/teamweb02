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
      <div>
        <strong>{{ title }}</strong>
        <p v-if="description">{{ description }}</p>
      </div>
      <slot name="action" />
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
  gap: 16px;
  padding: 20px 0 16px;
  border-bottom: 1px solid #e6e6e6;
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

.admin-panel__body {
  padding-top: 16px;
}
</style>
