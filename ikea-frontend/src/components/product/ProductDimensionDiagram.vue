<script setup>
import { computed } from 'vue';

const props = defineProps({
  caption: {
    type: String,
    default: '',
  },
  measurements: {
    type: Array,
    default: () => [],
  },
});

const primaryMeasurements = computed(() => props.measurements.slice(0, 4));
const secondaryMeasurements = computed(() => props.measurements.slice(4));

const anchorClasses = ['is-top-left', 'is-top-right', 'is-center', 'is-bottom'];
</script>

<template>
  <div class="dimension-diagram">
    <div class="dimension-diagram__canvas">
      <div class="dimension-diagram__grid" />
      <div class="dimension-diagram__frame">
        <div class="dimension-diagram__inner" />
      </div>

      <div
        v-for="(item, index) in primaryMeasurements"
        :key="`${item.label}-${item.value}`"
        class="dimension-diagram__anchor"
        :class="anchorClasses[index]"
      >
        <span>{{ item.label }} {{ item.value }}</span>
      </div>
    </div>

    <div v-if="secondaryMeasurements.length" class="dimension-diagram__chips">
      <span v-for="item in secondaryMeasurements" :key="`${item.label}-${item.value}`">
        {{ item.label }} {{ item.value }}
      </span>
    </div>

    <p v-if="caption" class="dimension-diagram__caption">{{ caption }}</p>
  </div>
</template>

<style scoped>
.dimension-diagram {
  display: grid;
  gap: 16px;
}

.dimension-diagram__canvas {
  position: relative;
  min-height: 348px;
  border: 1px solid #dbe3ef;
  background: #ffffff;
  overflow: hidden;
}

.dimension-diagram__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(148, 163, 184, 0.12) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(148, 163, 184, 0.12) 1px, transparent 1px);
  background-size: 32px 32px;
}

.dimension-diagram__frame {
  position: absolute;
  inset: 64px 68px;
  border: 2px solid rgba(0, 88, 163, 0.24);
  background: linear-gradient(180deg, rgba(239, 244, 250, 0.88) 0%, rgba(255, 255, 255, 0.96) 100%);
}

.dimension-diagram__frame::before,
.dimension-diagram__frame::after,
.dimension-diagram__inner::before,
.dimension-diagram__inner::after {
  content: '';
  position: absolute;
  background: rgba(0, 88, 163, 0.68);
}

.dimension-diagram__frame::before {
  top: 22px;
  left: 22px;
  right: 22px;
  height: 2px;
}

.dimension-diagram__frame::after {
  bottom: 22px;
  left: 22px;
  right: 22px;
  height: 2px;
}

.dimension-diagram__inner {
  position: absolute;
  inset: 22px;
}

.dimension-diagram__inner::before {
  top: 0;
  bottom: 0;
  left: 22px;
  width: 2px;
}

.dimension-diagram__inner::after {
  top: 0;
  bottom: 0;
  right: 22px;
  width: 2px;
}

.dimension-diagram__anchor {
  position: absolute;
  display: inline-flex;
}

.dimension-diagram__anchor span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #dbe3ef;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.dimension-diagram__anchor.is-top-left {
  top: 18px;
  left: 18px;
}

.dimension-diagram__anchor.is-top-right {
  top: 18px;
  right: 18px;
}

.dimension-diagram__anchor.is-center {
  left: 50%;
  bottom: 50%;
  transform: translate(-50%, 50%);
}

.dimension-diagram__anchor.is-bottom {
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
}

.dimension-diagram__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.dimension-diagram__chips span {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: #f8fafc;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

.dimension-diagram__caption {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 767px) {
  .dimension-diagram__canvas {
    min-height: 280px;
  }

  .dimension-diagram__frame {
    inset: 56px 20px;
  }

  .dimension-diagram__anchor span {
    min-height: 30px;
    padding: 0 12px;
    font-size: 12px;
  }
}
</style>
