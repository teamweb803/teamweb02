<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SiteChrome from '../components/layout/SiteChrome.vue';
import {
  buildProductCategoryPath,
  buildProductDetailPath,
  resolveCategoryRoute,
} from '../constants/routes';
import {
  FILTER_TITLES,
  createDefaultOpenGroups,
  createEmptyFilterState,
  getFilterFieldIds,
  getFilterOptions,
  getProductFilterValue,
} from '../constants/categoryFilters';
import { useCatalogStore } from '../stores/catalog';

const route = useRoute();
const router = useRouter();
const catalogStore = useCatalogStore();

const selectedSort = ref('인기순');
const selectedPageSize = ref(20);
const selectedTypeSlug = ref('all');
const priceRange = ref({ min: 0, max: 0 });
const priceInputs = ref({ min: '0', max: '0' });
const filterState = ref(createEmptyFilterState());
const openGroups = ref(createDefaultOpenGroups());

const currentCategory = computed(() => catalogStore.getCategoryBySlug(route.params.categorySlug));
const currentCards = computed(() => currentCategory.value.cards ?? []);
const selectedCategoryCard = computed(() =>
  currentCards.value.find((item) => item.slug === selectedTypeSlug.value) ?? null,
);
const currentHeading = computed(() => selectedCategoryCard.value?.label ?? currentCategory.value.label);
const categoryTabItems = computed(() => [{ slug: 'all', label: '전체' }, ...currentCards.value]);
const categoryProducts = computed(() => catalogStore.getCatalogProductsByCategory(currentCategory.value.slug));
const visibleCategoryProducts = computed(() => {
  if (selectedTypeSlug.value === 'all') {
    return categoryProducts.value;
  }

  return categoryProducts.value.filter((product) => product.typeSlug === selectedTypeSlug.value);
});

const defaultPrice = computed(() => {
  const prices = visibleCategoryProducts.value
    .map((product) => Number(product.price))
    .filter((price) => Number.isFinite(price));

  if (!prices.length) {
    return { min: 0, max: 0 };
  }

  return {
    min: 0,
    max: Math.max(...prices),
  };
});

const categoryFilterFields = computed(() => getFilterFieldIds(currentCategory.value.slug, selectedTypeSlug.value));
const priceStep = computed(() => {
  const prices = visibleCategoryProducts.value
    .map((product) => Number(product.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  if (!prices.length) {
    return 100;
  }

  return prices.every((price) => price % 100 === 0) ? 100 : 1;
});

const filterGroups = computed(() => {
  return categoryFilterFields.value
    .map((groupId) => {
      const options = getFilterOptions(visibleCategoryProducts.value, groupId);

      if (!options.length) {
        return null;
      }

      return {
        id: groupId,
        title: FILTER_TITLES[groupId],
        options,
      };
    })
    .filter(Boolean);
});

const isPriceChanged = computed(() => (
  priceRange.value.min !== defaultPrice.value.min || priceRange.value.max !== defaultPrice.value.max
));

const activeFilterCount = computed(() => {
  const optionCount = Object.values(filterState.value).reduce((sum, items) => sum + items.length, 0);
  return optionCount + (isPriceChanged.value ? 1 : 0);
});

const filteredProducts = computed(() => {
  const result = visibleCategoryProducts.value.filter((product) => {
    const matchesDynamicFilters = categoryFilterFields.value.every((groupId) =>
      matchesArrayFilter(filterState.value[groupId], getProductFilterValue(product, groupId)));

    return (
      product.price >= priceRange.value.min
      && product.price <= priceRange.value.max
      && matchesDynamicFilters
    );
  });

  switch (selectedSort.value) {
    case '낮은가격순':
      result.sort((a, b) => a.price - b.price);
      break;
    case '높은가격순':
      result.sort((a, b) => b.price - a.price);
      break;
    case '리뷰많은순':
      result.sort((a, b) => Number(b.reviews ?? 0) - Number(a.reviews ?? 0));
      break;
    case '할인율순':
      result.sort((a, b) => Number(b.discountRate ?? 0) - Number(a.discountRate ?? 0));
      break;
    default:
      result.sort((a, b) => (
        (Number(b.reviews ?? 0) * Number(b.rating ?? 0))
        - (Number(a.reviews ?? 0) * Number(a.rating ?? 0))
      ));
      break;
  }

  return result;
});

const displayedProducts = computed(() => filteredProducts.value.slice(0, selectedPageSize.value));
const priceMinLabel = computed(() => formatPrice(priceRange.value.min));
const priceMaxLabel = computed(() => formatPrice(priceRange.value.max));
const minPricePercent = computed(() => {
  const range = defaultPrice.value.max - defaultPrice.value.min;
  return range > 0 ? (((priceRange.value.min - defaultPrice.value.min) / range) * 100) : 0;
});
const maxPricePercent = computed(() => {
  const range = defaultPrice.value.max - defaultPrice.value.min;
  return range > 0 ? (((priceRange.value.max - defaultPrice.value.min) / range) * 100) : 100;
});
const priceTrackStyle = computed(() => ({
  '--min-percent': `${minPricePercent.value}%`,
  '--max-percent': `${maxPricePercent.value}%`,
}));
const priceFilterResetKey = computed(
  () => `${currentCategory.value.slug}:${selectedTypeSlug.value}:${defaultPrice.value.max}`,
);

function normalizeTypeSlug(type, categorySlug = currentCategory.value.slug) {
  if (typeof type !== 'string') {
    return 'all';
  }

  const cards = catalogStore.getCategoryBySlug(categorySlug)?.cards ?? [];
  return cards.some((item) => item.slug === type) ? type : 'all';
}

function goToCategory(typeSlug = 'all') {
  router.push({
    path: buildProductCategoryPath(currentCategory.value.slug),
    query: typeSlug && typeSlug !== 'all' ? { type: typeSlug } : {},
  });
}

function toggleGroup(groupId) {
  openGroups.value[groupId] = !openGroups.value[groupId];
}

function toggleFilter(groupId, option) {
  const current = filterState.value[groupId];

  if (current.includes(option)) {
    filterState.value[groupId] = current.filter((item) => item !== option);
    return;
  }

  filterState.value[groupId] = [...current, option];
}

function resetFilters() {
  priceRange.value = { ...defaultPrice.value };
  syncPriceInputs();
  filterState.value = createEmptyFilterState();
  openGroups.value = createDefaultOpenGroups();
}

function matchesArrayFilter(selectedItems, valueOrList) {
  if (!selectedItems.length) {
    return true;
  }

  if (Array.isArray(valueOrList)) {
    return selectedItems.every((item) => valueOrList.includes(item));
  }

  return selectedItems.includes(valueOrList);
}

function normalizePriceValue(value, fallback) {
  const number = Number(String(value).replace(/[^\d]/g, ''));

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(defaultPrice.value.max, Math.max(defaultPrice.value.min, number));
}

function clampPriceRange(changedSide) {
  priceRange.value.min = normalizePriceValue(priceRange.value.min, defaultPrice.value.min);
  priceRange.value.max = normalizePriceValue(priceRange.value.max, defaultPrice.value.max);

  if (changedSide === 'min' && priceRange.value.min > priceRange.value.max) {
    priceRange.value.max = priceRange.value.min;
  }

  if (changedSide === 'max' && priceRange.value.max < priceRange.value.min) {
    priceRange.value.min = priceRange.value.max;
  }
}

function handlePriceInput(changedSide) {
  priceRange.value[changedSide] = normalizePriceValue(
    priceInputs.value[changedSide],
    defaultPrice.value[changedSide],
  );
  clampPriceRange(changedSide);
  syncPriceInputs();
}

function handlePriceRangeInput(changedSide) {
  clampPriceRange(changedSide);
  syncPriceInputs();
}

function formatPrice(price) {
  return `${Number(price).toLocaleString('ko-KR')}원`;
}

function formatPriceInputValue(price) {
  return Number(price).toLocaleString('ko-KR');
}

function syncPriceInputs() {
  priceInputs.value = {
    min: formatPriceInputValue(priceRange.value.min),
    max: formatPriceInputValue(priceRange.value.max),
  };
}

watch(
  () => defaultPrice.value,
  (nextPrice) => {
    priceRange.value = { ...nextPrice };
    syncPriceInputs();
  },
  { immediate: true, deep: true },
);

watch(
  () => [route.params.categorySlug, route.query.type],
  ([categorySlug, type]) => {
    const resolvedCategory = resolveCategoryRoute(categorySlug);
    const normalizedType = normalizeTypeSlug(type, resolvedCategory.slug);

    if (categorySlug !== resolvedCategory.slug || (type && normalizedType === 'all')) {
      router.replace({
        path: buildProductCategoryPath(resolvedCategory.slug),
        query: normalizedType !== 'all' ? { type: normalizedType } : {},
      });
      return;
    }

    selectedTypeSlug.value = normalizedType;
    resetFilters();
  },
  { immediate: true },
);
</script>

<template>
  <SiteChrome>
    <main class="hs-category-main">
      <div class="hs-category-shell">
        <nav class="hs-breadcrumb" aria-label="breadcrumb">
          <RouterLink to="/" class="hs-breadcrumb__home" aria-label="홈으로 이동">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 10.5L12 4L20 10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 9.8V19H17V9.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
          <span>〉</span>
          <RouterLink :to="buildProductCategoryPath(currentCategory.slug)">{{ currentCategory.label }}</RouterLink>
          <template v-if="selectedCategoryCard">
            <span>〉</span>
            <span>{{ selectedCategoryCard.label }}</span>
          </template>
        </nav>

        <section class="hs-category-hero">
          <h1>{{ currentHeading }}</h1>
        </section>

        <section class="hs-category-tabs" :aria-label="`${currentCategory.label} 세부 분류`">
          <button
            v-for="item in categoryTabItems"
            :key="item.slug"
            class="hs-category-tab"
            :class="{ 'is-active': selectedTypeSlug === item.slug }"
            type="button"
            @click="goToCategory(item.slug)"
          >
            {{ item.label }}
          </button>
        </section>

        <div class="hs-category-layout">
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
                        @input="priceInputs.min = $event.target.value; handlePriceInput('min')"
                        @blur="handlePriceInput('min')"
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
                        @input="priceInputs.max = $event.target.value; handlePriceInput('max')"
                        @blur="handlePriceInput('max')"
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
                    v-model="priceRange.min"
                    :key="`${priceFilterResetKey}-min-range`"
                    class="hs-price-filter__range hs-price-filter__range--min"
                    type="range"
                    :min="defaultPrice.min"
                    :max="defaultPrice.max"
                    :step="priceStep"
                    @input="handlePriceRangeInput('min')"
                  />
                  <input
                    v-model="priceRange.max"
                    :key="`${priceFilterResetKey}-max-range`"
                    class="hs-price-filter__range hs-price-filter__range--max"
                    type="range"
                    :min="defaultPrice.min"
                    :max="defaultPrice.max"
                    :step="priceStep"
                    @input="handlePriceRangeInput('max')"
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

          <section class="hs-product-section">
            <div class="hs-toolbar">
              <div class="hs-result-summary">
                <strong>{{ filteredProducts.length }}개 상품</strong>
                <span>{{ currentHeading }} · {{ selectedSort }}</span>
              </div>

              <div class="hs-toolbar__right">
                <select v-model="selectedSort" aria-label="정렬 기준 선택">
                  <option>인기순</option>
                  <option>낮은가격순</option>
                  <option>높은가격순</option>
                  <option>리뷰많은순</option>
                  <option>할인율순</option>
                </select>
                <select v-model="selectedPageSize" aria-label="페이지 크기 선택">
                  <option :value="20">20개씩 보기</option>
                  <option :value="40">40개씩 보기</option>
                  <option :value="60">60개씩 보기</option>
                </select>
              </div>
            </div>

            <div v-if="activeFilterCount" class="hs-active-filters">
              <span>선택한 필터</span>
              <button v-if="isPriceChanged" class="hs-active-filter-pill" type="button" @click="priceRange = { ...defaultPrice }">
                가격 · {{ priceMinLabel }} ~ {{ priceMaxLabel }}
              </button>
              <button
                v-for="group in filterGroups"
                :key="group.id"
                v-show="filterState[group.id].length"
                class="hs-active-filter-pill"
                type="button"
                @click="filterState[group.id] = []"
              >
                {{ group.title }} · {{ filterState[group.id].join(', ') }}
              </button>
            </div>

            <div class="hs-product-grid">
              <article v-for="item in displayedProducts" :key="item.id" class="hs-product-card">
                <RouterLink :to="buildProductDetailPath(item.id)" class="hs-product-card__link" :aria-label="`${item.name} 상세 페이지로 이동`" />
                <div class="hs-product-card__image-wrap">
                  <img :src="item.image" :alt="item.imageAlt ?? item.name" />
                  <span v-if="item.badge" class="hs-product-card__badge">{{ item.badge }}</span>
                  <button class="hs-product-card__wish" type="button" aria-label="찜하기" @click.stop>♡</button>
                </div>

                <div class="hs-product-card__copy">
                  <p class="hs-product-card__brand">{{ item.brand }}</p>
                  <h3>{{ item.name }}</h3>
                  <div class="hs-product-price-block">
                    <span
                      v-if="Number(item.discountRate ?? 0) > 0 && Number(item.originalPrice ?? 0) > Number(item.price ?? 0)"
                      class="hs-price__original hs-price__original--top"
                    >
                      {{ formatPrice(item.originalPrice) }}
                    </span>
                    <div class="hs-price">
                      <span v-if="item.discountRate" class="hs-price__discount">{{ item.discountRate }}%</span>
                      <strong>{{ formatPrice(item.price) }}</strong>
                    </div>
                  </div>
                  <div v-if="item.rating !== null || item.reviews !== null" class="hs-product-meta">
                    <span v-if="item.rating !== null">★ {{ item.rating }}</span>
                    <span v-if="item.reviews !== null">후기 {{ Number(item.reviews ?? 0).toLocaleString('ko-KR') }}</span>
                  </div>
                  <div v-if="item.features?.length" class="hs-product-tags">
                    <span v-for="tag in item.features" :key="tag">{{ tag }}</span>
                  </div>
                </div>
              </article>
            </div>

            <div v-if="!displayedProducts.length" class="hs-empty-state">
              선택한 조건에 맞는 상품이 없습니다.
            </div>
          </section>
        </div>
      </div>
    </main>
  </SiteChrome>
</template>

<style scoped>
.hs-category-main {
  padding: 28px 0 72px;
}

.hs-category-shell {
  width: min(1280px, calc(100% - 40px));
  margin: 0 auto;
  display: grid;
  gap: 22px;
}

.hs-breadcrumb {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #8f8f8f;
  font-size: 13px;
  line-height: 1;
}

.hs-breadcrumb a,
.hs-breadcrumb span {
  color: inherit;
  text-decoration: none;
}

.hs-breadcrumb__home {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: #8f8f8f;
}

.hs-breadcrumb__home svg {
  width: 100%;
  height: 100%;
}

.hs-category-hero {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
}

.hs-category-hero h1 {
  margin: 0;
  color: #111827;
  font-size: clamp(44px, 5vw, 56px);
  line-height: 1;
  letter-spacing: -0.04em;
}

.hs-category-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hs-category-tab {
  min-width: 104px;
  height: 44px;
  padding: 0 18px;
  border: 1px solid #d9dde3;
  background: #ffffff;
  color: #111827;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.hs-category-tab.is-active {
  border-color: #0058a3;
  background: #edf4ff;
  color: #0058a3;
}

.hs-category-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 32px;
  align-items: start;
}

.hs-filter-panel {
  display: grid;
  gap: 16px;
  padding: 18px 16px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
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
.hs-active-filters,
.hs-product-tags,
.hs-product-meta,
.hs-toolbar,
.hs-toolbar__right,
.hs-price-filter__inputs,
.hs-price-filter__summary,
.hs-price-filter__labels {
  display: flex;
  align-items: center;
}

.hs-filter-options,
.hs-active-filters,
.hs-product-tags,
.hs-product-meta,
.hs-category-tabs,
.hs-toolbar,
.hs-toolbar__right {
  flex-wrap: wrap;
}

.hs-filter-options,
.hs-active-filters,
.hs-product-tags,
.hs-product-meta,
.hs-toolbar__right {
  gap: 8px;
}

.hs-filter-chip,
.hs-active-filter-pill {
  border: 1px solid #d9dde3;
  background: #ffffff;
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
}

.hs-filter-chip.is-active,
.hs-active-filter-pill {
  border-color: #0058a3;
  background: #edf4ff;
  color: #0058a3;
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
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
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
  border: 2px solid #111827;
  background: #ffffff;
  pointer-events: auto;
  cursor: pointer;
}

.hs-price-filter__range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #111827;
  background: #ffffff;
  pointer-events: auto;
  cursor: pointer;
}

.hs-price-filter__range--min {
  z-index: 2;
}

.hs-price-filter__range--max {
  z-index: 3;
}

.hs-product-section {
  display: grid;
  gap: 18px;
}

.hs-toolbar {
  justify-content: space-between;
  gap: 16px;
}

.hs-result-summary {
  display: grid;
  gap: 4px;
}

.hs-result-summary strong {
  font-size: 18px;
}

.hs-result-summary span,
.hs-active-filters > span {
  color: #6b7280;
  font-size: 14px;
}

.hs-toolbar__right select {
  height: 42px;
  min-width: 140px;
  border-radius: 10px;
  border: 1px solid #d8dde5;
  padding: 0 14px;
  background: #ffffff;
  font: inherit;
}

.hs-product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.hs-product-card {
  position: relative;
  display: grid;
  gap: 14px;
}

.hs-product-card__link {
  position: absolute;
  inset: 0;
  display: block;
  z-index: 1;
  border-radius: 18px;
  cursor: pointer;
}

.hs-product-card__link:focus-visible {
  outline: 2px solid #0058a3;
  outline-offset: 4px;
}

.hs-product-card__image-wrap {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  background: #f5f7fa;
}

.hs-product-card__image-wrap img {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  object-position: center;
}

.hs-product-card__badge {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.82);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
}

.hs-product-card__wish {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 0;
  background: rgba(255, 255, 255, 0.92);
  cursor: pointer;
}

.hs-product-card__copy {
  position: relative;
  z-index: 0;
  display: grid;
  gap: 8px;
}

.hs-product-card__brand {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hs-product-card__copy h3 {
  margin: 0;
  color: #111827;
  font-size: 18px;
  line-height: 1.45;
}

.hs-product-price-block {
  display: grid;
  gap: 4px;
}

.hs-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.hs-price__discount {
  color: #e11d48;
  font-size: 20px;
  font-weight: 800;
}

.hs-price strong {
  font-size: 24px;
}

.hs-price__original,
.hs-product-meta,
.hs-product-tags span,
.hs-empty-state {
  color: #6b7280;
}

.hs-price__original {
  font-size: 14px;
  text-decoration: line-through;
}

.hs-price__original--top {
  display: inline-block;
  line-height: 1.2;
}

.hs-product-tags span {
  padding: 8px 10px;
  border-radius: 999px;
  background: #f5f7fa;
  font-size: 12px;
}

.hs-empty-state {
  display: grid;
  place-items: center;
  min-height: 260px;
  border: 1px dashed #cfd8e3;
  border-radius: 18px;
}

@media (max-width: 1180px) {
  .hs-product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .hs-category-main {
    padding: 20px 0 56px;
  }

  .hs-category-shell {
    width: calc(100% - 24px);
    gap: 18px;
  }

  .hs-breadcrumb {
    gap: 7px;
    font-size: 12px;
  }

  .hs-category-hero {
    padding-bottom: 14px;
  }

  .hs-category-hero h1 {
    font-size: clamp(26px, 9vw, 38px);
    line-height: 1.02;
    letter-spacing: -0.05em;
    word-break: keep-all;
    overflow-wrap: anywhere;
  }

  .hs-category-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 2px;
  }

  .hs-category-tabs::-webkit-scrollbar {
    display: none;
  }

  .hs-category-tab {
    flex: 0 0 auto;
    min-width: max-content;
    padding: 0 16px;
    white-space: nowrap;
  }

  .hs-category-layout {
    grid-template-columns: 1fr;
    gap: 22px;
  }

  .hs-filter-panel {
    padding: 16px 14px 18px;
  }

  .hs-product-grid {
    grid-template-columns: 1fr;
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
  .hs-category-shell {
    width: calc(100% - 20px);
    gap: 16px;
  }

  .hs-category-hero h1 {
    font-size: clamp(24px, 10vw, 34px);
  }

  .hs-category-tab {
    height: 42px;
    padding: 0 14px;
    font-size: 15px;
  }

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
