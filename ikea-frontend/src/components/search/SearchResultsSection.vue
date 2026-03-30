<script setup>
import { useRouter } from 'vue-router';
import { buildProductDetailPath } from '../../constants/routes';
import { resolveStorefrontAvailability } from '../../services/storefrontStockService';
import HomeProductCard from '../home/HomeProductCard.vue';

const props = defineProps({
  keyword: {
    type: String,
    default: '',
  },
  results: {
    type: Array,
    default: () => [],
  },
});

const router = useRouter();

function mapSearchCard(product) {
  const availability = resolveStorefrontAvailability(product);

  const discountRate = product.originalPrice && product.originalPrice > product.price
    ? `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%`
    : '';

  return {
    productId: product.id,
    image: product.image,
    title: product.name,
    brand: product.brand || product.categoryLabel,
    badge: product.badge,
    isSoldOut: availability.isSoldOut,
    metaText: [product.categoryLabel, product.label].filter(Boolean).join(' · '),
    price: `${Number(product.price ?? 0).toLocaleString('ko-KR')}원`,
    originalPrice: product.originalPrice
      ? `${Number(product.originalPrice).toLocaleString('ko-KR')}원`
      : '',
    discount: discountRate,
  };
}

function openProduct(product) {
  router.push(buildProductDetailPath(product.id));
}
</script>

<template>
  <section class="search-results">
    <header class="search-results__header">
      <div>
        <p class="search-results__eyebrow">SEARCH</p>
        <h1>검색 결과</h1>
        <p class="search-results__copy">
          <template v-if="keyword">
            "{{ keyword }}"에 대한 결과 {{ results.length }}개를 찾았습니다.
          </template>
          <template v-else>
            찾고 싶은 상품명을 입력해 보세요.
          </template>
        </p>
      </div>
    </header>

    <div v-if="results.length" class="search-results__grid">
      <HomeProductCard
        v-for="product in results"
        :key="product.id"
        :item="mapSearchCard(product)"
        @activate="openProduct(product)"
      />
    </div>

    <section v-else class="search-results__empty">
      <strong>일치하는 상품이 없습니다.</strong>
      <p>브랜드명, 상품명, 카테고리명으로 다시 검색해 보세요.</p>
    </section>
  </section>
</template>

<style scoped>
.search-results {
  display: grid;
  gap: 28px;
}

.search-results__header {
  padding-bottom: 18px;
  border-bottom: 2px solid #111111;
}

.search-results__eyebrow {
  margin: 0 0 10px;
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.search-results__header h1,
.search-results__empty strong {
  margin: 0;
  color: #111111;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.search-results__header h1 {
  font-size: 36px;
  line-height: 1.15;
}

.search-results__copy,
.search-results__empty p {
  margin: 10px 0 0;
  color: #666666;
  font-size: 15px;
  line-height: 1.7;
}

.search-results__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.search-results__empty {
  display: grid;
  gap: 8px;
  padding: 28px;
  border: 1px solid #e6e6e6;
  background: #fafafa;
}

.search-results__empty strong {
  font-size: 22px;
}

@media (max-width: 1024px) {
  .search-results__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .search-results__header h1 {
    font-size: 30px;
  }

  .search-results__grid {
    grid-template-columns: 1fr;
  }
}
</style>
