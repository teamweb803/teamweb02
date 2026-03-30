<script setup>
import { computed, shallowRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import HomeCategorySection from '../components/home/HomeCategorySection.vue';
import HomeEditorialSection from '../components/home/HomeEditorialSection.vue';
import HomeHeroSection from '../components/home/HomeHeroSection.vue';
import HomePickSection from '../components/home/HomePickSection.vue';
import HomeProductGridSection from '../components/home/HomeProductGridSection.vue';
import HomeShortcutStrip from '../components/home/HomeShortcutStrip.vue';
import SiteChrome from '../components/layout/SiteChrome.vue';
import { useHeroCarousel } from '../composables/useHeroCarousel';
import { useHomeScrollBehavior } from '../composables/useHomeScrollBehavior';
import {
  buildProductCategoryPath,
  buildProductDetailPath,
} from '../constants/routes';
import { decorateStorefrontItems } from '../services/storefrontStockService';
import { useHomeStore } from '../stores/home';

const router = useRouter();
const homeStore = useHomeStore();
const {
  categoryDealCollections,
  categoryDealFilters,
  curatedSpotlight,
  heroSlides,
  newItemCollections,
  newItemFilters,
  pickSection,
  topShortcutBoxes,
  weeklyDeals,
} = storeToRefs(homeStore);

const activeCategoryDealKey = shallowRef(categoryDealFilters.value[0]?.id ?? 'sofa');
const activeNewItemKey = shallowRef(newItemFilters.value[0]?.id ?? 'sofa');

const {
  currentSlide,
  displaySlides,
  heroCurrentLabel,
  heroTotalLabel,
  handleTrackTransitionEnd,
  nextSlide,
  previousSlide,
  selectSlide,
  startAutoSlide,
  stopAutoSlide,
  trackStyle,
} = useHeroCarousel(heroSlides);
const {
  scrollToSection,
} = useHomeScrollBehavior({ trackVisibility: false });

const activeCategoryDealBanner = computed(
  () => categoryDealCollections.value[activeCategoryDealKey.value]?.banner ?? null,
);
const decoratedWeeklyDeals = computed(() => decorateStorefrontItems(weeklyDeals.value));
const visibleCategoryDeals = computed(
  () => decorateStorefrontItems(categoryDealCollections.value[activeCategoryDealKey.value]?.items ?? []),
);
const visibleNewItems = computed(
  () => decorateStorefrontItems(newItemCollections.value[activeNewItemKey.value] ?? []),
);
const decoratedSpotlight = computed(() => ({
  ...(curatedSpotlight.value ?? {}),
  items: decorateStorefrontItems(curatedSpotlight.value?.items ?? []),
}));
const decoratedPickSection = computed(() => ({
  ...pickSection.value,
  items: decorateStorefrontItems(pickSection.value?.items ?? []),
}));

function handleShortcutClick(item) {
  if (item.anchorId) {
    scrollToSection(item.anchorId);
    return;
  }

  if (item.categorySlug) {
    router.push(buildProductCategoryPath(item.categorySlug));
  }
}

function handleHeroSlideClick(slide) {
  if (slide?.categorySlug) {
    router.push(buildProductCategoryPath(slide.categorySlug));
  }
}

function handleProductCardClick(item) {
  if (item?.productId) {
    router.push(buildProductDetailPath(item.productId));
    return;
  }

  if (item?.categorySlug) {
    router.push(buildProductCategoryPath(item.categorySlug));
  }
}

function handleCategoryDealFilterChange(filterId) {
  activeCategoryDealKey.value = filterId;
}

function handleNewItemFilterChange(filterId) {
  activeNewItemKey.value = filterId;
}

function handleFeaturedClick(featured) {
  if (featured?.categorySlug) {
    router.push(buildProductCategoryPath(featured.categorySlug));
  }
}

function handleSectionMoreClick(target) {
  if (target === 'weekly') {
    router.push(buildProductCategoryPath('sofa'));
    return;
  }

  if (target === 'category') {
    router.push(buildProductCategoryPath(activeCategoryDealKey.value));
    return;
  }

  if (target === 'new') {
    router.push(buildProductCategoryPath(activeNewItemKey.value));
  }
}
</script>

<template>
  <SiteChrome>
    <main class="hs-main">
      <HomeHeroSection
        :slides="heroSlides"
        :current-slide="currentSlide"
        :display-slides="displaySlides"
        :hero-current-label="heroCurrentLabel"
        :hero-total-label="heroTotalLabel"
        :track-style="trackStyle"
        @activate="handleHeroSlideClick"
        @next="nextSlide"
        @pause="stopAutoSlide"
        @previous="previousSlide"
        @resume="startAutoSlide"
        @select-slide="selectSlide"
        @track-transition-end="handleTrackTransitionEnd"
      />

      <HomeShortcutStrip :items="topShortcutBoxes" @activate="handleShortcutClick" />

      <HomeProductGridSection
        id="weekly-picks"
        title="이번 주 추천 상품"
        subtitle="지금 바로 두고 싶은 상품을 먼저 골라보세요."
        :items="decoratedWeeklyDeals"
        more-target="weekly"
        @more-click="handleSectionMoreClick"
        @product-activate="handleProductCardClick"
      />

      <HomeEditorialSection
        :spotlight="decoratedSpotlight"
        @featured-activate="handleFeaturedClick"
        @product-activate="handleProductCardClick"
      />

      <HomeCategorySection
        id="category-focus"
        title="카테고리별 인기상품"
        subtitle="카테고리를 바꿔가며 자주 보는 상품을 확인해 보세요."
        :filters="categoryDealFilters"
        :active-filter-id="activeCategoryDealKey"
        :banner="activeCategoryDealBanner"
        :items="visibleCategoryDeals"
        more-target="category"
        @banner-activate="handleFeaturedClick(activeCategoryDealBanner)"
        @filter-change="handleCategoryDealFilterChange"
        @more-click="handleSectionMoreClick"
        @product-activate="handleProductCardClick"
      />

      <HomeProductGridSection
        id="new-arrivals"
        title="카테고리 둘러보기"
        subtitle="카테고리별 주요 상품을 빠르게 비교할 수 있도록 정리했습니다."
        :items="visibleNewItems"
        :filters="newItemFilters"
        :active-filter-id="activeNewItemKey"
        more-target="new"
        badge-variant="yellow"
        @filter-change="handleNewItemFilterChange"
        @more-click="handleSectionMoreClick"
        @product-activate="handleProductCardClick"
      />

      <HomePickSection
        :title="pickSection.title"
        :items="decoratedPickSection.items"
        @product-activate="handleProductCardClick"
      />
    </main>
  </SiteChrome>
</template>

<style scoped>
.hs-main {
  display: grid;
  gap: 72px;
  padding: 0 0 92px;
}

@media (max-width: 1180px) {
  .hs-main {
    gap: 56px;
  }
}
</style>
