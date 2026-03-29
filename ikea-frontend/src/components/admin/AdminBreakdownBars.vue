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

function formatValue(segment) {
  if (segment.formattedValue) {
    return segment.formattedValue;
  }

  if (props.chart.legendSuffix) {
    return `${segment.value}${props.chart.legendSuffix}`;
  }

  return `${segment.value}`;
}

function getPercent(value) {
  if (!total.value) {
    return 0;
  }

  return Math.round((Number(value ?? 0) / total.value) * 100);
}
</script>

<template>
  <div class="admin-breakdown-bars">
    <div class="admin-breakdown-bars__headline">
      <strong>{{ chart.valueLabel }}</strong>
      <span>{{ chart.totalText }}</span>
    </div>

    <div class="admin-breakdown-bars__rows">
      <article
        v-for="segment in segments"
        :key="segment.label"
        class="admin-breakdown-bars__row"
      >
        <div class="admin-breakdown-bars__meta">
          <div class="admin-breakdown-bars__label">
            <span
              class="admin-breakdown-bars__dot"
              :style="{ backgroundColor: segment.color }"
            />
            <b>{{ segment.label }}</b>
          </div>
          <strong>{{ formatValue(segment) }}</strong>
        </div>
        <div class="admin-breakdown-bars__track" aria-hidden="true">
          <span
            class="admin-breakdown-bars__fill"
            :style="{
              width: `${getPercent(segment.value)}%`,
              backgroundColor: segment.color,
            }"
          />
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.admin-breakdown-bars {
  display: grid;
  gap: 20px;
}

.admin-breakdown-bars__headline strong {
  display: block;
  color: #111111;
  font-size: 30px;
  line-height: 1;
  font-weight: 700;
}

.admin-breakdown-bars__headline span {
  display: block;
  margin-top: 8px;
  color: #777777;
  font-size: 13px;
}

.admin-breakdown-bars__rows {
  display: grid;
  gap: 14px;
}

.admin-breakdown-bars__row {
  display: grid;
  gap: 10px;
}

.admin-breakdown-bars__meta {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
}

.admin-breakdown-bars__label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.admin-breakdown-bars__dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.admin-breakdown-bars__label b {
  color: #333333;
  font-size: 14px;
  font-weight: 500;
}

.admin-breakdown-bars__meta strong {
  color: #111111;
  font-size: 14px;
  font-weight: 700;
}

.admin-breakdown-bars__track {
  width: 100%;
  height: 10px;
  padding: 2px;
  overflow: hidden;
  background: #edf1f6;
  border: 1px solid #e4e9f1;
  border-radius: 999px;
  box-sizing: border-box;
}

.admin-breakdown-bars__fill {
  display: block;
  height: 100%;
  border-radius: 999px;
}
</style>
