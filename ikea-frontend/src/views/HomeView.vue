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
  showScrollTopButton,
  scrollToSection,
  scrollToTop,
} = useHomeScrollBehavior();

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

      <Transition name="home-scroll-top">
        <button
          v-if="showScrollTopButton"
          class="hs-scroll-top"
          type="button"
          aria-label="페이지 맨 위로 이동"
          @click="scrollToTop"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 17V7" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
            <path d="M7.5 11.5L12 7L16.5 11.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </Transition>
    </main>
  </SiteChrome>
</template>

<style scoped>
.hs-main {
  display: grid;
  gap: 72px;
  padding: 0 0 92px;
}

.hs-scroll-top {
  position: fixed;
  right: 32px;
  bottom: 34px;
  z-index: 14;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: 1px solid #d7dde5;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: #111111;
  box-shadow: 0 14px 28px rgba(17, 24, 39, 0.1);
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.hs-scroll-top svg {
  width: 28px;
  height: 28px;
}

.home-scroll-top-enter-active,
.home-scroll-top-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.home-scroll-top-enter-from,
.home-scroll-top-leave-to {
  opacity: 0;
  transform: translateY(14px);
}

@media (max-width: 1180px) {
  .hs-main {
    gap: 56px;
  }
}

@media (max-width: 720px) {
  .hs-scroll-top {
    right: 18px;
    bottom: 22px;
    width: 52px;
    height: 52px;
  }
}
</style>
