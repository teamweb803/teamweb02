import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useCatalogStore } from '../stores/catalog';

function normalizeKeyword(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function useProductSearch() {
  const route = useRoute();
  const catalogStore = useCatalogStore();
  const { catalogProducts } = storeToRefs(catalogStore);

  const keyword = computed(() => String(route.query.q ?? '').trim());
  const normalizedKeyword = computed(() => normalizeKeyword(keyword.value));

  const searchResults = computed(() => {
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

  onMounted(() => {
    catalogStore.loadProducts();
  });

  return {
    keyword,
    searchResults,
  };
}
