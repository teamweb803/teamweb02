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
  <div class="admin-segmented-bar-chart">
    <div class="admin-segmented-bar-chart__headline">
      <strong>{{ chart.valueLabel }}</strong>
      <span>{{ chart.totalText }}</span>
    </div>

    <div class="admin-segmented-bar-chart__track" aria-hidden="true">
      <span
        v-for="segment in segments"
        :key="segment.label"
        class="admin-segmented-bar-chart__fill"
        :style="{
          width: `${getPercent(segment.value)}%`,
          backgroundColor: segment.color,
        }"
      />
    </div>

    <ul class="admin-segmented-bar-chart__legend">
      <li v-for="segment in segments" :key="segment.label">
        <div class="admin-segmented-bar-chart__label">
          <span
            class="admin-segmented-bar-chart__dot"
            :style="{ backgroundColor: segment.color }"
          />
          <b>{{ segment.label }}</b>
        </div>
        <div class="admin-segmented-bar-chart__value">
          <span>{{ getPercent(segment.value) }}%</span>
          <strong>{{ formatValue(segment) }}</strong>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.admin-segmented-bar-chart {
  display: grid;
  gap: 18px;
}

.admin-segmented-bar-chart__headline strong {
  display: block;
  color: #111111;
  font-size: 30px;
  line-height: 1;
  font-weight: 700;
}

.admin-segmented-bar-chart__headline span {
  display: block;
  margin-top: 8px;
  color: #777777;
  font-size: 13px;
}

.admin-segmented-bar-chart__track {
  display: flex;
  width: 100%;
  height: 18px;
  padding: 2px;
  overflow: hidden;
  background: #edf1f6;
  border: 1px solid #e4e9f1;
  border-radius: 999px;
  box-sizing: border-box;
}

.admin-segmented-bar-chart__fill {
  display: block;
  height: 100%;
}

.admin-segmented-bar-chart__legend {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.admin-segmented-bar-chart__legend li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid #ededed;
  background: #ffffff;
}

.admin-segmented-bar-chart__label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.admin-segmented-bar-chart__dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.admin-segmented-bar-chart__label b {
  color: #333333;
  font-size: 14px;
  font-weight: 500;
}

.admin-segmented-bar-chart__value {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.admin-segmented-bar-chart__value span {
  color: #777777;
  font-size: 13px;
}

.admin-segmented-bar-chart__value strong {
  color: #111111;
  font-size: 14px;
  font-weight: 700;
}
</style>
