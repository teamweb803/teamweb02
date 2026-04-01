<script setup>
defineProps({
  openGroups: {
    type: Object,
    required: true,
  },
  priceFilterResetKey: {
    type: String,
    required: true,
  },
  priceInputs: {
    type: Object,
    required: true,
  },
  defaultPrice: {
    type: Object,
    required: true,
  },
  priceStep: {
    type: Number,
    required: true,
  },
  priceRange: {
    type: Object,
    required: true,
  },
  priceTrackStyle: {
    type: Object,
    required: true,
  },
  priceMinLabel: {
    type: String,
    required: true,
  },
  priceMaxLabel: {
    type: String,
    required: true,
  },
  filterGroups: {
    type: Array,
    required: true,
  },
  filterState: {
    type: Object,
    required: true,
  },
  formatPrice: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits([
  'reset-filters',
  'toggle-group',
  'update-price-input',
  'commit-price-input',
  'update-price-range',
  'toggle-filter',
]);

function resetFilters() {
  emit('reset-filters');
}

function toggleGroup(groupId) {
  emit('toggle-group', groupId);
}

function updatePriceInput(side, value) {
  emit('update-price-input', { side, value });
}

function commitPriceInput(side) {
  emit('commit-price-input', side);
}

function updatePriceRange(side, value) {
  emit('update-price-range', { side, value });
}

function toggleFilter(groupId, option) {
  emit('toggle-filter', { groupId, option });
}
</script>

<template>
  <aside class="hs-filter-panel">
    <div class="hs-filter-panel__head">
      <strong>필터</strong>
      <button type="button" @click="resetFilters">초기화</button>
    </div>

    <div class="hs-filter-group">
      <button class="hs-filter-group__toggle" type="button" @click="toggleGroup('price')">
        <span>가격</span>
        <span>{{ openGroups.price ? '−' : '+' }}</span>
      </button>

      <div v-if="openGroups.price" :key="priceFilterResetKey" class="hs-price-filter">
        <div class="hs-price-filter__inputs">
          <label class="hs-price-input">
            <span>최소</span>
            <div class="hs-price-input__field">
              <input
                :value="priceInputs.min"
                type="text"
                inputmode="numeric"
                :min="defaultPrice.min"
                :max="defaultPrice.max"
                :step="priceStep"
                @input="updatePriceInput('min', $event.target.value)"
                @blur="commitPriceInput('min')"
              />
              <em>원</em>
            </div>
          </label>
          <span class="hs-price-filter__dash">~</span>
          <label class="hs-price-input">
            <span>최대</span>
            <div class="hs-price-input__field">
              <input
                :value="priceInputs.max"
                type="text"
                inputmode="numeric"
                :min="defaultPrice.min"
                :max="defaultPrice.max"
                :step="priceStep"
                @input="updatePriceInput('max', $event.target.value)"
                @blur="commitPriceInput('max')"
              />
              <em>원</em>
            </div>
          </label>
        </div>
        <div class="hs-price-filter__summary">
          <strong>{{ priceMinLabel }}</strong>
          <span>—</span>
          <strong>{{ priceMaxLabel }}</strong>
        </div>
        <div class="hs-price-filter__slider-wrap" :style="priceTrackStyle">
          <div class="hs-price-filter__track"></div>
          <input
            :value="priceRange.min"
            :key="`${priceFilterResetKey}-min-range`"
            class="hs-price-filter__range hs-price-filter__range--min"
            type="range"
            :min="defaultPrice.min"
            :max="defaultPrice.max"
            :step="priceStep"
            @input="updatePriceRange('min', $event.target.value)"
          />
          <input
            :value="priceRange.max"
            :key="`${priceFilterResetKey}-max-range`"
            class="hs-price-filter__range hs-price-filter__range--max"
            type="range"
            :min="defaultPrice.min"
            :max="defaultPrice.max"
            :step="priceStep"
            @input="updatePriceRange('max', $event.target.value)"
          />
        </div>
        <div class="hs-price-filter__labels">
          <span>{{ formatPrice(defaultPrice.min) }}</span>
          <span>{{ formatPrice(defaultPrice.max) }}</span>
        </div>
      </div>
    </div>

    <div v-for="group in filterGroups" :key="group.id" class="hs-filter-group">
      <button class="hs-filter-group__toggle" type="button" @click="toggleGroup(group.id)">
        <span>{{ group.title }}</span>
        <span>{{ openGroups[group.id] ? '−' : '+' }}</span>
      </button>

      <div v-if="openGroups[group.id]" class="hs-filter-options">
        <button
          v-for="option in group.options"
          :key="option"
          class="hs-filter-chip"
          :class="{ 'is-active': filterState[group.id].includes(option) }"
          type="button"
          @click="toggleFilter(group.id, option)"
        >
          {{ option }}
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.hs-filter-panel {
  display: grid;
  gap: 16px;
  padding: 18px 16px 20px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface-strong);
}

.hs-filter-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hs-filter-panel__head strong {
  font-size: 18px;
}

.hs-filter-panel__head button {
  border: 0;
  background: transparent;
  color: #6b7280;
  font: inherit;
  cursor: pointer;
}

.hs-filter-group {
  display: grid;
  gap: 14px;
  padding-top: 14px;
  border-top: 1px solid #eef2f7;
}

.hs-filter-group__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 0;
  background: transparent;
  padding: 0;
  color: #111827;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.hs-filter-options,
.hs-price-filter__inputs,
.hs-price-filter__summary,
.hs-price-filter__labels {
  display: flex;
  align-items: center;
}

.hs-filter-options {
  flex-wrap: wrap;
  gap: 8px;
}

.hs-filter-chip {
  border: 1px solid var(--border-default);
  background: var(--surface-strong);
  border-radius: var(--radius-pill);
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
}

.hs-filter-chip.is-active {
  border-color: var(--accent);
  background: #edf4ff;
  color: var(--accent);
}

.hs-price-filter {
  display: grid;
  gap: 12px;
}

.hs-price-filter__inputs,
.hs-price-filter__summary,
.hs-price-filter__labels {
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: 10px;
}

.hs-price-filter__inputs {
  align-items: end;
}

.hs-price-filter__summary {
  align-items: baseline;
}

.hs-price-filter__summary strong:first-child,
.hs-price-filter__labels span:first-child {
  text-align: left;
}

.hs-price-filter__summary strong:last-child,
.hs-price-filter__labels span:last-child {
  text-align: right;
}

.hs-price-input {
  flex: 1;
  display: grid;
  gap: 6px;
}

.hs-price-input > span {
  font-size: 12px;
  color: #6b7280;
}

.hs-price-input__field {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 42px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface-strong);
}

.hs-price-input__field input {
  width: 100%;
  border: 0;
  background: transparent;
  font: inherit;
  color: #111827;
  text-align: right;
  font-variant-numeric: tabular-nums;
  outline: none;
}

.hs-price-input__field input::-webkit-outer-spin-button,
.hs-price-input__field input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.hs-price-input__field input[type='number'] {
  -moz-appearance: textfield;
}

.hs-price-input__field em,
.hs-price-filter__dash,
.hs-price-filter__summary span,
.hs-price-filter__labels {
  color: #6b7280;
  font-style: normal;
}

.hs-price-filter__summary strong {
  font-size: 18px;
}

.hs-price-filter__slider-wrap {
  position: relative;
  height: 24px;
}

.hs-price-filter__track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 999px;
  transform: translateY(-50%);
  background: linear-gradient(
    to right,
    #d8dde5 0%,
    #d8dde5 var(--min-percent),
    #111827 var(--min-percent),
    #111827 var(--max-percent),
    #d8dde5 var(--max-percent),
    #d8dde5 100%
  );
}

.hs-price-filter__range {
  position: absolute;
  inset: 0;
  width: 100%;
  margin: 0;
  background: transparent;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
}

.hs-price-filter__range::-webkit-slider-runnable-track {
  height: 4px;
  background: transparent;
}

.hs-price-filter__range::-moz-range-track {
  height: 4px;
  background: transparent;
}

.hs-price-filter__range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  margin-top: -6px;
  border-radius: 50%;
  border: 2px solid var(--text);
  background: var(--surface-strong);
  pointer-events: auto;
  cursor: pointer;
}

.hs-price-filter__range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--text);
  background: var(--surface-strong);
  pointer-events: auto;
  cursor: pointer;
}

.hs-price-filter__range--min {
  z-index: 2;
}

.hs-price-filter__range--max {
  z-index: 3;
}

@media (max-width: 960px) {
  .hs-filter-panel {
    padding: 16px 14px 18px;
  }
}

@media (max-width: 640px) {
  .hs-price-filter__inputs {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: end;
  }

  .hs-price-input__field {
    padding: 0 10px;
  }

  .hs-price-input__field input {
    min-width: 0;
  }

  .hs-price-filter__summary strong {
    font-size: 17px;
  }
}

@media (max-width: 420px) {
  .hs-filter-panel {
    padding: 15px 12px 17px;
  }

  .hs-price-filter__inputs {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
  }

  .hs-price-filter__dash {
    display: none;
  }

  .hs-price-input__field {
    gap: 4px;
    padding: 0 8px;
  }

  .hs-price-input__field input {
    font-size: 15px;
  }

  .hs-price-filter__summary strong {
    font-size: 16px;
  }
}
</style>
