<script setup>
import { computed } from 'vue';

const props = defineProps({
  chart: {
    type: Object,
    required: true,
  },
});

const segments = computed(() => props.chart.segments ?? []);
const total = computed(() => segments.value.reduce((sum, segment) => sum + Number(segment.value ?? 0), 0));
const primarySegment = computed(() => segments.value[0] ?? null);
const completionRate = computed(() => {
  if (!primarySegment.value || !total.value) {
    return 0;
  }

  return Math.round((Number(primarySegment.value.value ?? 0) / total.value) * 100);
});

function formatValue(segment) {
  if (!segment) {
    return '0건';
  }

  if (segment.formattedValue) {
    return segment.formattedValue;
  }

  return `${segment.value}`;
}
</script>

<template>
  <div class="admin-completion-card">
    <div class="admin-completion-card__hero">
      <span>처리율</span>
      <strong>{{ completionRate }}%</strong>
      <p>{{ chart.totalText }}</p>
    </div>

    <div class="admin-completion-card__meter" aria-hidden="true">
      <span
        class="admin-completion-card__fill"
        :style="{
          width: `${completionRate}%`,
          backgroundColor: primarySegment?.color ?? '#1c3f94',
        }"
      />
    </div>

    <div class="admin-completion-card__stats">
      <article
        v-for="segment in segments"
        :key="segment.label"
      >
        <div class="admin-completion-card__label">
          <span
            class="admin-completion-card__dot"
            :style="{ backgroundColor: segment.color }"
          />
          <b>{{ segment.label }}</b>
        </div>
        <strong>{{ formatValue(segment) }}</strong>
      </article>
    </div>
  </div>
</template>

<style scoped>
.admin-completion-card {
  display: grid;
  gap: 18px;
}

.admin-completion-card__hero {
  display: grid;
  gap: 8px;
}

.admin-completion-card__hero span {
  color: #777777;
  font-size: 13px;
}

.admin-completion-card__hero strong {
  color: #111111;
  font-size: 34px;
  line-height: 1;
  font-weight: 700;
}

.admin-completion-card__hero p {
  margin: 0;
  color: #666666;
  font-size: 13px;
  line-height: 1.6;
}

.admin-completion-card__meter {
  width: 100%;
  height: 14px;
  padding: 2px;
  overflow: hidden;
  background: #edf1f6;
  border: 1px solid #e4e9f1;
  border-radius: 999px;
  box-sizing: border-box;
}

.admin-completion-card__fill {
  display: block;
  height: 100%;
  border-radius: 999px;
}

.admin-completion-card__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.admin-completion-card__stats article {
  padding: 14px 16px;
  border: 1px solid #e9e9e9;
  background: #ffffff;
}

.admin-completion-card__label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.admin-completion-card__dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.admin-completion-card__label b {
  color: #333333;
  font-size: 14px;
  font-weight: 500;
}

.admin-completion-card__stats strong {
  display: block;
  margin-top: 10px;
  color: #111111;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 700;
}

@media (max-width: 720px) {
  .admin-completion-card__stats {
    grid-template-columns: 1fr;
  }
}
</style>
