<script setup>
import { computed } from 'vue';

const props = defineProps({
  chart: {
    type: Object,
    required: true,
  },
  legendRows: {
    type: Number,
    default: 0,
  },
});

const segments = computed(() => props.chart.segments ?? []);
const total = computed(() => segments.value.reduce((sum, segment) => sum + Number(segment.value ?? 0), 0));

const donutBackground = computed(() => {
  if (!segments.value.length || total.value === 0) {
    return 'conic-gradient(#eef1f5 0deg 360deg)';
  }

  let current = 0;
  const stops = segments.value.map((segment) => {
    const start = (current / total.value) * 360;
    current += Number(segment.value ?? 0);
    const end = (current / total.value) * 360;
    return `${segment.color} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${stops.join(', ')})`;
});

const legendMinHeight = computed(() => {
  if (!props.legendRows) {
    return null;
  }

  const rows = Math.max(props.legendRows, segments.value.length, 1);
  return `${rows * 42 + (rows - 1) * 10}px`;
});

function formatLegendValue(segment) {
  if (segment.formattedValue) {
    return segment.formattedValue;
  }

  if (props.chart.legendSuffix) {
    return `${segment.value}${props.chart.legendSuffix}`;
  }

  return segment.value;
}
</script>

<template>
  <div class="admin-donut-chart">
    <div class="admin-donut-chart__shell">
      <div class="admin-donut-chart__ring" :style="{ background: donutBackground }">
        <div class="admin-donut-chart__center">
          <strong>{{ chart.valueLabel }}</strong>
          <span>{{ chart.totalText ?? `총 ${total}${chart.totalSuffix ?? ''}` }}</span>
        </div>
      </div>
    </div>

    <ul class="admin-donut-chart__legend" :style="{ minHeight: legendMinHeight ?? undefined }">
      <li v-for="segment in segments" :key="segment.label">
        <span class="admin-donut-chart__dot" :style="{ backgroundColor: segment.color }"></span>
        <b>{{ segment.label }}</b>
        <strong>{{ formatLegendValue(segment) }}</strong>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.admin-donut-chart {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 24px;
  align-items: center;
  height: 100%;
  min-height: 180px;
  align-content: center;
}

.admin-donut-chart__shell {
  display: grid;
  justify-content: center;
  align-self: center;
}

.admin-donut-chart__ring {
  display: grid;
  place-items: center;
  width: 160px;
  height: 160px;
  padding: 14px;
  border-radius: 999px;
}

.admin-donut-chart__center {
  display: grid;
  align-content: center;
  justify-items: center;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: #ffffff;
}

.admin-donut-chart__center strong {
  color: #111111;
  font-size: 22px;
  line-height: 1;
  font-weight: 700;
}

.admin-donut-chart__center span {
  margin-top: 8px;
  color: #777777;
  font-size: 12px;
}

.admin-donut-chart__legend {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
  align-content: center;
  align-self: center;
}

.admin-donut-chart__legend li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid #ededed;
  background: #ffffff;
}

.admin-donut-chart__dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.admin-donut-chart__legend b {
  color: #333333;
  font-size: 14px;
  font-weight: 500;
}

.admin-donut-chart__legend strong {
  color: #111111;
  font-size: 14px;
  font-weight: 700;
}

@media (max-width: 720px) {
  .admin-donut-chart {
    grid-template-columns: 1fr;
  }
}
</style>
