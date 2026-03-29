<script setup>
import { computed } from 'vue';

const props = defineProps({
  chart: {
    type: Object,
    required: true,
  },
});

const width = 560;
const height = 220;
const paddingX = 18;
const paddingTop = 18;
const paddingBottom = 26;

const points = computed(() => props.chart.points ?? []);
const labels = computed(() => props.chart.labels ?? []);

const maxValue = computed(() => Math.max(...points.value, 1));
const minValue = computed(() => Math.min(...points.value, 0));
const totalValue = computed(() => points.value.reduce((sum, point) => sum + Number(point ?? 0), 0));
const latestValue = computed(() => points.value.at(-1) ?? 0);
const previousValue = computed(() => points.value.at(-2) ?? latestValue.value);
const deltaValue = computed(() => latestValue.value - previousValue.value);

const normalizedPoints = computed(() => {
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingTop - paddingBottom;
  const range = Math.max(maxValue.value - minValue.value, 1);
  const step = points.value.length > 1 ? usableWidth / (points.value.length - 1) : usableWidth;

  return points.value.map((value, index) => {
    const x = paddingX + step * index;
    const y = height - paddingBottom - ((value - minValue.value) / range) * usableHeight;
    return { x, y, value, label: labels.value[index] };
  });
});

const polylinePoints = computed(() => normalizedPoints.value.map((point) => `${point.x},${point.y}`).join(' '));
const areaPath = computed(() => {
  if (!normalizedPoints.value.length) {
    return '';
  }

  const first = normalizedPoints.value[0];
  const last = normalizedPoints.value.at(-1);
  const curve = normalizedPoints.value.map((point) => `L ${point.x} ${point.y}`).join(' ');

  return `M ${first.x} ${height - paddingBottom} ${curve} L ${last.x} ${height - paddingBottom} Z`;
});

function formatValue(value) {
  const suffix = props.chart.valueSuffix ?? '';
  return `${Number(value ?? 0).toLocaleString('ko-KR')}${suffix}`;
}
</script>

<template>
  <div class="admin-line-chart">
    <div class="admin-line-chart__canvas">
      <svg :viewBox="`0 0 ${width} ${height}`" class="admin-line-chart__svg" aria-hidden="true">
        <defs>
          <linearGradient id="adminLineArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#dce8fb" stop-opacity="1" />
            <stop offset="100%" stop-color="#dce8fb" stop-opacity="0" />
          </linearGradient>
        </defs>

        <path
          v-for="grid in 4"
          :key="`grid-${grid}`"
          :d="`M ${paddingX} ${paddingTop + ((height - paddingTop - paddingBottom) / 3) * (grid - 1)} H ${width - paddingX}`"
          stroke="#f1f1f1"
          stroke-width="1"
          fill="none"
        />

        <path :d="areaPath" fill="url(#adminLineArea)" />
        <polyline
          :points="polylinePoints"
          stroke="#1c3f94"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          v-if="normalizedPoints.length"
          :cx="normalizedPoints.at(-1).x"
          :cy="normalizedPoints.at(-1).y"
          r="5"
          fill="#1c3f94"
        />
      </svg>
    </div>

    <div class="admin-line-chart__labels" :style="{ gridTemplateColumns: `repeat(${Math.max(labels.length, 1)}, minmax(0, 1fr))` }">
      <span v-for="label in labels" :key="label">{{ label }}</span>
    </div>

    <div class="admin-line-chart__summary">
      <article>
        <small>합계</small>
        <strong>{{ formatValue(totalValue) }}</strong>
      </article>
      <article>
        <small>마지막</small>
        <strong>{{ formatValue(latestValue) }}</strong>
      </article>
      <article>
        <small>직전 대비</small>
        <strong>{{ deltaValue > 0 ? '+' : '' }}{{ formatValue(deltaValue) }}</strong>
      </article>
    </div>
  </div>
</template>

<style scoped>
.admin-line-chart {
  display: grid;
  gap: 12px;
}

.admin-line-chart__canvas {
  overflow: hidden;
}

.admin-line-chart__svg {
  display: block;
  width: 100%;
  height: auto;
}

.admin-line-chart__labels {
  display: grid;
  gap: 8px;
}

.admin-line-chart__labels span {
  color: #666666;
  font-size: 12px;
  text-align: center;
}

.admin-line-chart__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.admin-line-chart__summary article {
  padding: 12px 14px;
  border: 1px solid #e9e9e9;
  background: #ffffff;
}

.admin-line-chart__summary small {
  display: block;
  color: #777777;
  font-size: 12px;
}

.admin-line-chart__summary strong {
  display: block;
  margin-top: 8px;
  color: #111111;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 700;
}

@media (max-width: 720px) {
  .admin-line-chart__summary {
    grid-template-columns: 1fr;
  }
}
</style>
