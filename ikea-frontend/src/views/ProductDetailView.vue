<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SiteChrome from '../components/layout/SiteChrome.vue';
import ProductDimensionDiagram from '../components/product/ProductDimensionDiagram.vue';
import { useProductGallery } from '../composables/useProductGallery';
import {
  buildProductDeliveryMessage,
  buildProductOptionSummary,
} from '../constants/productAttributeConfig';
import {
  ROUTE_PATHS,
  buildProductCategoryPath,
  buildProductDetailPath,
} from '../constants/routes';
import { storeToRefs } from 'pinia';
import { useCartStore } from '../stores/cart';
import { useCatalogStore } from '../stores/catalog';
import {
  decorateStorefrontItems,
  resolveStorefrontAvailability,
} from '../services/storefrontStockService';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const catalogStore = useCatalogStore();
const { products: catalogProducts } = storeToRefs(catalogStore);

const quantity = ref(1);

const currentProduct = computed(() => (
  catalogStore.findProductById(route.params.productId) ?? catalogStore.getDefaultCatalogProduct()
));

const detailContent = computed(() => catalogStore.getProductDetailContent(currentProduct.value));

const {
  galleryImages,
  imageStyle,
  isZoomed,
  selectedImage,
  selectedIndex,
  selectImage,
  toggleZoom,
  updateZoomOrigin,
  zoomLabel,
  zoomSymbol,
} = useProductGallery(computed(() => detailContent.value.galleryImages));

const ratingLabel = computed(() => {
  const rating = currentProduct.value.rating;
  return typeof rating === 'number' ? rating.toFixed(1) : '-';
});

const reviewCountLabel = computed(() => (
  Number(currentProduct.value.reviews ?? 0).toLocaleString('ko-KR')
));

const totalPrice = computed(() => currentProduct.value.price * quantity.value);

const summaryFacts = computed(() => {
  const facts = detailContent.value.quickFacts ?? [];
  return facts.slice(0, 4);
});

const descriptionParagraphs = computed(() => detailContent.value.description ?? []);
const highlightItems = computed(() => detailContent.value.highlights ?? []);
const measurementItems = computed(() => detailContent.value.measurements ?? []);
const reviewHighlights = computed(() => detailContent.value.reviewHighlights ?? []);
const dimensionImage = computed(() => detailContent.value.dimensionImage ?? '');
const shouldUseDimensionImage = computed(() => Boolean(detailContent.value.useDimensionImage && dimensionImage.value));

const deliveryMessage = computed(() => buildProductDeliveryMessage(currentProduct.value));
const purchaseOptionCopy = computed(() => buildProductOptionSummary(currentProduct.value));
const availability = computed(() => resolveStorefrontAvailability(currentProduct.value));
const isSoldOut = computed(() => availability.value.isSoldOut);
const soldOutMessage = computed(() => availability.value.stockMessage);

const relatedProducts = computed(() => {
  const currentId = currentProduct.value.id;
  const sameType = catalogProducts.value.filter((product) => (
    product.id !== currentId
    && product.categorySlug === currentProduct.value.categorySlug
    && product.typeSlug === currentProduct.value.typeSlug
  ));
  const sameCategory = catalogProducts.value.filter((product) => (
    product.id !== currentId
    && product.categorySlug === currentProduct.value.categorySlug
    && product.typeSlug !== currentProduct.value.typeSlug
  ));
  const others = catalogProducts.value.filter((product) => (
    product.id !== currentId && product.categorySlug !== currentProduct.value.categorySlug
  ));

  return decorateStorefrontItems([...sameType, ...sameCategory, ...others].slice(0, 4));
});

const sectionTabs = [
  { id: 'description', label: '제품 설명' },
  { id: 'dimensions', label: '치수' },
  { id: 'reviews', label: '고객 리뷰' },
];

watch(
  () => currentProduct.value.id,
  () => {
    quantity.value = 1;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  },
  { immediate: true },
);

function formatPrice(value) {
  return `${Number(value ?? 0).toLocaleString('ko-KR')}원`;
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value -= 1;
  }
}

function increaseQuantity() {
  if (isSoldOut.value) {
    return;
  }

  quantity.value += 1;
}

function syncCurrentProductToCart() {
  if (isSoldOut.value) {
    return null;
  }

  return cartStore.addCartItem(currentProduct.value?.id, {
    quantity: quantity.value,
  });
}

function goToCart() {
  const cartItem = syncCurrentProductToCart();

  if (!cartItem) {
    return;
  }

  router.push(ROUTE_PATHS.cart);
}

function goToCheckout() {
  if (isSoldOut.value) {
    return;
  }

  const cartItem = syncCurrentProductToCart();

  router.push({
    path: ROUTE_PATHS.orderCheckout,
    query: {
      mode: 'single',
      itemId: cartItem?.productId ?? String(currentProduct.value?.id ?? ''),
    },
  });
}

function scrollToSection(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function goToProduct(productId) {
  router.push(buildProductDetailPath(productId));
}
</script>

<template>
  <SiteChrome>
    <main class="detail-page">
      <div class="detail-page__inner">
        <nav class="detail-breadcrumb" aria-label="breadcrumb">
          <RouterLink to="/" class="detail-breadcrumb__home" aria-label="홈으로 이동">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 10.5L12 4L20 10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 9.8V19H17V9.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
          <span>〉</span>
          <RouterLink :to="buildProductCategoryPath(currentProduct.categorySlug)">{{ currentProduct.categoryLabel }}</RouterLink>
          <span>〉</span>
          <span>{{ currentProduct.label }}</span>
        </nav>

        <section class="detail-hero">
          <div class="detail-gallery">
            <div
              class="detail-gallery__stage"
              :class="{ 'is-zoomed': isZoomed }"
              @click="toggleZoom"
              @mousemove="updateZoomOrigin"
            >
              <img
                :src="selectedImage"
                :alt="currentProduct.imageAlt ?? currentProduct.name"
                :style="imageStyle"
              />
              <span class="detail-gallery__badge">{{ currentProduct.badge }}</span>
              <span class="detail-gallery__caption">{{ currentProduct.label }} 대표</span>
              <span class="detail-gallery__zoom">
                <strong>{{ zoomSymbol }}</strong>
                {{ zoomLabel }}
              </span>
            </div>

            <div class="detail-gallery__thumbs" aria-label="상품 이미지 썸네일">
              <button
                v-for="(image, index) in galleryImages"
                :key="image"
                class="detail-gallery__thumb"
                :class="{ 'is-active': selectedIndex === index }"
                type="button"
                @click.stop="selectImage(index)"
              >
                <img :src="image" :alt="`${currentProduct.name} 이미지 ${index + 1}`" />
              </button>
            </div>
          </div>

        <section class="detail-summary">
            <p class="detail-summary__brand">{{ currentProduct.brand }}</p>
            <h1>{{ currentProduct.name }}</h1>

            <div class="detail-summary__rating">
              <strong>{{ ratingLabel }}</strong>
              <span>리뷰 {{ reviewCountLabel }}개</span>
            </div>

            <div class="detail-summary__price">
              <strong>{{ formatPrice(currentProduct.price) }}</strong>
            </div>

            <p v-if="isSoldOut" class="detail-summary__soldout">
              {{ soldOutMessage }}
            </p>

            <p class="detail-summary__hook">{{ detailContent.heroHook }}</p>

            <div class="detail-summary__delivery">
              <span>배송정보</span>
              <p>{{ deliveryMessage }}</p>
            </div>

            <div class="detail-summary__benefits">
              <span>카드 무이자 혜택</span>
              <span>추가 적립금 혜택</span>
            </div>

            <div class="detail-summary__facts">
              <article v-for="fact in summaryFacts" :key="fact.label">
                <span>{{ fact.label }}</span>
                <strong>{{ fact.value }}</strong>
              </article>
            </div>
          </section>

          <aside class="detail-purchase-panel">
            <div class="detail-purchase-panel__option">
              <span>선택 옵션</span>
              <strong>{{ purchaseOptionCopy }}</strong>
            </div>

            <div class="detail-purchase-panel__option">
              <span>배송 일정</span>
              <strong>주문서작성 단계에서 확인</strong>
            </div>

            <div class="detail-purchase-panel__meta">
              <strong>예상 배송비 0원</strong>
              <span>혜택은 결제 단계에서 확인</span>
            </div>

            <section class="detail-purchase-panel__card">
              <strong class="detail-purchase-panel__title">{{ currentProduct.name }}</strong>
              <p>{{ purchaseOptionCopy }}</p>

              <div class="detail-purchase-panel__line">
                <div class="detail-purchase-panel__qty">
                  <button type="button" :disabled="isSoldOut" @click="decreaseQuantity">-</button>
                  <span>{{ quantity }}</span>
                  <button type="button" :disabled="isSoldOut" @click="increaseQuantity">+</button>
                </div>
                <strong>{{ formatPrice(totalPrice) }}</strong>
              </div>
            </section>

            <div class="detail-purchase-panel__total">
              <span>총 구매가</span>
              <strong>{{ formatPrice(totalPrice) }}</strong>
            </div>

            <div class="detail-purchase-panel__actions">
              <button class="detail-purchase-panel__cart" type="button" :disabled="isSoldOut" @click="goToCart">
                {{ isSoldOut ? '품절' : '장바구니' }}
              </button>
              <button class="detail-purchase-panel__buy" type="button" :disabled="isSoldOut" @click="goToCheckout">
                {{ isSoldOut ? '품절' : '바로구매' }}
              </button>
            </div>
          </aside>
        </section>

        <nav class="detail-section-nav" aria-label="상세 정보 이동">
          <button
            v-for="tab in sectionTabs"
            :key="tab.id"
            type="button"
            @click="scrollToSection(tab.id)"
          >
            {{ tab.label }}
          </button>
        </nav>

        <section id="description" class="detail-section detail-section--lined">
          <div class="detail-section__head">
            <h2>제품 설명</h2>
            <p>현재 사이트의 상세 구성에 맞춰 핵심 설명만 정리했습니다.</p>
          </div>

          <div class="detail-section__content detail-section__content--split">
            <article class="detail-copy-card">
              <p v-for="paragraph in descriptionParagraphs" :key="paragraph">
                {{ paragraph }}
              </p>
            </article>

            <aside class="detail-note-card">
              <strong>이 상품의 핵심 포인트</strong>
              <ul>
                <li v-for="item in highlightItems" :key="item">{{ item }}</li>
              </ul>
            </aside>
          </div>
        </section>

        <section id="dimensions" class="detail-section detail-section--lined">
          <div class="detail-section__head">
            <h2>치수</h2>
            <p>배치 전에 확인할 수 있도록 주요 치수를 한 번에 볼 수 있게 정리했습니다.</p>
          </div>

            <div class="detail-section__content detail-section__content--split detail-section__content--measure">
            <div class="detail-dimension-panel">
              <div v-if="shouldUseDimensionImage" class="detail-dimension-panel__image-box">
                <img
                  class="detail-dimension-panel__image"
                  :src="dimensionImage"
                  :alt="`${currentProduct.name} 치수 이미지`"
                />
              </div>
              <ProductDimensionDiagram
                v-else
                :measurements="measurementItems"
              />
              <p class="detail-dimension-panel__caption">{{ detailContent.dimensionCaption }}</p>
            </div>

            <div class="detail-measure-list">
              <article
                v-for="item in measurementItems"
                :key="item.label"
                class="detail-measure-list__item"
              >
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </article>
            </div>
          </div>
        </section>

        <section id="reviews" class="detail-section detail-section--lined">
          <div class="detail-section__head">
            <h2>고객 리뷰</h2>
            <p>대표 리뷰 흐름만 먼저 정리해 두고, 실제 후기 데이터는 이후 연동을 고려했습니다.</p>
          </div>

          <div class="detail-review-summary">
            <div class="detail-review-summary__score">
              <strong>{{ ratingLabel }}</strong>
              <span>평균 평점</span>
            </div>
            <div class="detail-review-summary__copy">
              <strong>리뷰 {{ reviewCountLabel }}개 기준 요약</strong>
              <p>{{ detailContent.reviewIntro }}</p>
            </div>
          </div>

          <div class="detail-review-grid">
            <article
              v-for="review in reviewHighlights"
              :key="review.title"
              class="detail-review-card"
            >
              <div class="detail-review-card__head">
                <strong>{{ review.title }}</strong>
                <span v-if="review.rating">★ {{ review.rating.toFixed(1) }}</span>
              </div>
              <p>{{ review.body }}</p>
              <small>{{ review.meta }}</small>
            </article>
          </div>
        </section>

        <section v-if="relatedProducts.length" class="detail-related detail-section--lined">
          <div class="detail-section__head">
            <h2>다른 사람들이 함께 본 상품</h2>
            <p>현재 {{ currentProduct.categoryLabel }} 카탈로그 안에서 자연스럽게 이어질 수 있는 상품을 먼저 연결했습니다.</p>
          </div>

          <div class="detail-related__grid">
            <article
              v-for="item in relatedProducts"
              :key="item.id"
              class="detail-related-card"
              :class="{ 'is-soldout': item.isSoldOut }"
            >
              <button
                class="detail-related-card__link"
                type="button"
                @click="goToProduct(item.id)"
                :aria-label="`${item.name} 상세 페이지로 이동`"
              />
              <div class="detail-related-card__image">
                <img :src="item.image" :alt="item.imageAlt ?? item.name" />
                <span
                  class="detail-related-card__badge"
                  :class="{ 'detail-related-card__badge--soldout': item.isSoldOut }"
                >
                  {{ item.isSoldOut ? '품절' : item.badge }}
                </span>
              </div>
              <div class="detail-related-card__copy">
                <p>{{ item.brand }}</p>
                <h3>{{ item.name }}</h3>
                <strong>{{ formatPrice(item.price) }}</strong>
                <p v-if="item.isSoldOut" class="detail-related-card__stock">
                  품절 · 상세 페이지에서 재입고 여부를 확인해 주세요.
                </p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  </SiteChrome>
</template>
