import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { normalizeProductCollection } from '../mappers/catalogMapper';
import { searchProducts } from '../services/productService';
import { useCatalogStore } from '../stores/catalog';

function normalizeKeyword(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function useProductSearch() {
  const route = useRoute();
  const catalogStore = useCatalogStore();
  const { catalogProducts } = storeToRefs(catalogStore);
  const remoteResults = ref(null);
  const isSearching = ref(false);
  const didSearchFail = ref(false);
  const hasResolvedSearch = ref(false);

  const keyword = computed(() => String(route.query.q ?? '').trim());
  const normalizedKeyword = computed(() => normalizeKeyword(keyword.value));
  const localSearchResults = computed(() => {
    if (!normalizedKeyword.value) {
      return [];
    }

    return catalogProducts.value.filter((product) => {
      const haystacks = [
        product.name,
        product.brand,
        product.categoryLabel,
        product.label,
        product.description,
        product.color,
        product.material,
      ]
        .filter(Boolean)
        .map((value) => normalizeKeyword(value));

      return haystacks.some((value) => value.includes(normalizedKeyword.value));
    });
  });

  const searchResults = computed(() => {
    if (!normalizedKeyword.value) {
      return [];
    }

    if (Array.isArray(remoteResults.value) && remoteResults.value.length) {
      return remoteResults.value;
    }

    if (isSearching.value && localSearchResults.value.length) {
      return localSearchResults.value;
    }

    if (didSearchFail.value) {
      return localSearchResults.value;
    }

    if (
      hasResolvedSearch.value
      && Array.isArray(remoteResults.value)
      && !remoteResults.value.length
      && localSearchResults.value.length
    ) {
      return localSearchResults.value;
    }

    return Array.isArray(remoteResults.value) ? remoteResults.value : [];
  });

  let requestSequence = 0;

  async function runSearchForKeyword(nextKeyword, currentRequest) {
    if (!nextKeyword) {
      remoteResults.value = [];
      didSearchFail.value = false;
      hasResolvedSearch.value = false;
      isSearching.value = false;
      return;
    }

    remoteResults.value = null;
    isSearching.value = true;
    didSearchFail.value = false;
    hasResolvedSearch.value = false;

    void catalogStore.ensureCatalogLoaded();

    try {
      const response = await searchProducts(nextKeyword);

      if (currentRequest !== requestSequence) {
        return;
      }

      remoteResults.value = normalizeProductCollection(response, []);
    } catch {
      if (currentRequest !== requestSequence) {
        return;
      }

      remoteResults.value = [];
      didSearchFail.value = true;
    } finally {
      if (currentRequest === requestSequence) {
        hasResolvedSearch.value = true;
        isSearching.value = false;
      }
    }
  }

  async function retrySearch() {
    requestSequence += 1;
    const currentRequest = requestSequence;
    await runSearchForKeyword(normalizedKeyword.value, currentRequest);
  }

  watch(
    normalizedKeyword,
    async (nextKeyword) => {
      requestSequence += 1;
      const currentRequest = requestSequence;
      await runSearchForKeyword(nextKeyword, currentRequest);
    },
    { immediate: true },
  );

  return {
    didSearchFail,
    hasResolvedSearch,
    isSearching,
    keyword,
    retrySearch,
    searchResults,
  };
}
