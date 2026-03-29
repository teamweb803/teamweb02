<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <article class="admin-metric-card">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
    <p v-if="detail">{{ detail }}</p>
  </article>
</template>

<style scoped>
.admin-metric-card {
  min-height: 132px;
  padding: 22px 20px;
  border: 1px solid #e6e6e6;
  background: #ffffff;
  box-sizing: border-box;
}

.admin-metric-card span {
  display: block;
  color: #777777;
  font-size: 13px;
}

.admin-metric-card strong {
  display: block;
  margin-top: 12px;
  color: #111111;
  font-size: 32px;
  line-height: 1.05;
  font-weight: 700;
}

.admin-metric-card p {
  margin: 12px 0 0;
  color: #666666;
  font-size: 13px;
  line-height: 1.6;
}
</style>
