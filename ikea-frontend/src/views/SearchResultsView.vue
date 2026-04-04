<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SiteChrome from '../components/layout/SiteChrome.vue';
import SearchResultsSection from '../components/search/SearchResultsSection.vue';
import { useProductSearch } from '../composables/useProductSearch';
import { buildProductDetailPath } from '../constants/routes';
import { useWishlistStore } from '../stores/wishlist';

const route = useRoute();
const router = useRouter();
const wishlistStore = useWishlistStore();
const {
  didSearchFail,
  hasResolvedSearch,
  isSearching,
  keyword,
  retrySearch,
  searchResults,
} = useProductSearch();

onMounted(() => {
  wishlistStore.ensureHydrated();
});

function openProduct(product) {
  router.push(buildProductDetailPath(product.id));
}

function isProductWishlisted(productId) {
  return wishlistStore.isProductWishlisted(productId);
}

function toggleProductWishlist(product) {
  wishlistStore.toggleProduct(product, {
    redirectPath: route.fullPath,
  });
}
</script>

<template>
  <SiteChrome>
    <main class="search-page">
      <div class="search-page__inner">
        <SearchResultsSection
          :keyword="keyword"
          :is-searching="isSearching"
          :did-search-fail="didSearchFail"
          :has-resolved-search="hasResolvedSearch"
          :results="searchResults"
          :is-product-wishlisted="isProductWishlisted"
          @product-activate="openProduct"
          @retry-search="retrySearch"
          @toggle-wishlist="toggleProductWishlist"
        />
      </div>
    </main>
  </SiteChrome>
</template>

<style scoped>
.search-page {
  background: #ffffff;
}

.search-page__inner {
  width: min(1280px, calc(100% - 40px));
  margin: 0 auto;
  padding: 30px 0 96px;
}

@media (max-width: 720px) {
  .search-page__inner {
    width: calc(100% - 28px);
    padding: 24px 0 72px;
  }
}
</style>
