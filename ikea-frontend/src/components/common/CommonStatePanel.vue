<script setup>
import { computed, useSlots } from 'vue';

const props = defineProps({
  align: {
    type: String,
    default: 'center',
  },
  compact: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  layout: {
    type: String,
    default: 'embedded',
  },
  title: {
    type: String,
    required: true,
  },
  tone: {
    type: String,
    default: 'neutral',
  },
});

const slots = useSlots();

const toneLabelMap = {
  neutral: '안내',
  loading: '불러오는 중',
  error: '확인 필요',
  success: '완료',
};

const resolvedLabel = computed(() => props.label || toneLabelMap[props.tone] || toneLabelMap.neutral);
const hasDescription = computed(() => Boolean(String(props.description ?? '').trim()));
const hasActions = computed(() => Boolean(slots.actions));
</script>

<template>
  <section
    class="common-state-panel"
    :class="[
      `common-state-panel--${tone}`,
      `common-state-panel--${layout}`,
      `common-state-panel--align-${align}`,
      { 'common-state-panel--compact': compact },
    ]"
  >
    <span class="common-state-panel__label">{{ resolvedLabel }}</span>
    <strong class="common-state-panel__title">{{ title }}</strong>
    <p v-if="hasDescription" class="common-state-panel__description">{{ description }}</p>
    <div v-if="hasActions" class="common-state-panel__actions">
      <slot name="actions" />
    </div>
  </section>
</template>

<style scoped>
.common-state-panel {
  width: 100%;
  display: grid;
  gap: 8px;
}

.common-state-panel--embedded {
  padding: 22px 0;
}

.common-state-panel--boxed {
  padding: 18px 20px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
}

.common-state-panel--compact.common-state-panel--embedded {
  padding: 18px 0;
  gap: 6px;
}

.common-state-panel--compact.common-state-panel--boxed {
  padding: 16px 18px;
  gap: 6px;
}

.common-state-panel--align-center {
  justify-items: center;
  text-align: center;
}

.common-state-panel--align-left {
  justify-items: start;
  text-align: left;
}

.common-state-panel--loading.common-state-panel--boxed {
  border-color: #dbe4ee;
  background: #f8fbff;
}

.common-state-panel--error.common-state-panel--boxed {
  border-color: #f1d8d8;
  background: #fff8f8;
}

.common-state-panel__label {
  color: #6b7280;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.common-state-panel--loading .common-state-panel__label {
  color: #3f6b96;
}

.common-state-panel--error .common-state-panel__label {
  color: #a73f3f;
}

.common-state-panel__title {
  color: #111111;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.45;
  letter-spacing: -0.03em;
}

.common-state-panel--compact .common-state-panel__title {
  font-size: 16px;
}

.common-state-panel__description {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.65;
  max-width: 560px;
}

.common-state-panel--align-left .common-state-panel__description {
  max-width: none;
}

.common-state-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}
</style>
