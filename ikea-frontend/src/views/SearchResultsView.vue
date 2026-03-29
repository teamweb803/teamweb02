<script setup>
import SiteChrome from '../components/layout/SiteChrome.vue';
import SearchResultsSection from '../components/search/SearchResultsSection.vue';
import { useProductSearch } from '../composables/useProductSearch';

const { keyword, searchResults } = useProductSearch();
</script>

<template>
  <SiteChrome>
    <main class="search-page">
      <div class="search-page__inner">
        <SearchResultsSection :keyword="keyword" :results="searchResults" />
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
