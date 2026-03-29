import { defineStore } from 'pinia';
import {
  getCategoryList,
  getFallbackCategoryList,
} from '../services/categoryService';
import {
  getFallbackProductDetailContent,
  getFallbackProductDetailSeed,
  getFallbackProductList,
  getProductList,
} from '../services/productService';
import {
  buildCategoryRouteMap,
  normalizeCategoryCollection,
  normalizeProductCollection,
} from '../mappers/catalogMapper';

const fallbackCategories = getFallbackCategoryList();
const fallbackProducts = getFallbackProductList();

const DEFAULT_FALLBACK_CATEGORY = fallbackCategories[0] ?? {
  slug: 'sofa',
  backendCategoryId: '20128',
  label: '소파',
};

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    categories: normalizeCategoryCollection(fallbackCategories),
    products: normalizeProductCollection(fallbackProducts),
    categoriesLoadedFromApi: false,
    productsLoadedFromApi: false,
  }),
  getters: {
    backendCategories(state) {
      return state.categories;
    },
    catalogProducts(state) {
      return state.products;
    },
    defaultCategory(state) {
      return state.categories[0] ?? DEFAULT_FALLBACK_CATEGORY;
    },
    categoryRouteMap(state) {
      return buildCategoryRouteMap(state.categories);
    },
  },
  actions: {
    getCategoryBySlug(categorySlug) {
      return (
        this.categories.find((category) => category.slug === String(categorySlug ?? '').trim())
        ?? this.defaultCategory
      );
    },
    getCategoryById(categoryId) {
      return (
        this.categories.find((category) => String(category.id) === String(categoryId ?? '').trim())
        ?? null
      );
    },
    getCategoryCards(categorySlug) {
      return this.getCategoryBySlug(categorySlug)?.cards ?? [];
    },
    getCatalogProductsByCategory(categorySlug) {
      const resolvedCategory = this.getCategoryBySlug(categorySlug);
      return this.products.filter((product) => product.categorySlug === resolvedCategory.slug);
    },
    getCatalogProductsByType(categorySlug, typeSlug) {
      if (!typeSlug || typeSlug === 'all') {
        return this.getCatalogProductsByCategory(categorySlug);
      }

      const resolvedCategory = this.getCategoryBySlug(categorySlug);
      return this.products.filter(
        (product) => product.categorySlug === resolvedCategory.slug && product.typeSlug === typeSlug,
      );
    },
    findProductById(productId) {
      return this.products.find((product) => String(product.id) === String(productId ?? '').trim()) ?? null;
    },
    getDefaultCatalogProduct() {
      return this.products[0] ?? null;
    },
    getProductDetailSeed(productId) {
      return getFallbackProductDetailSeed(productId);
    },
    getProductDetailContent(product) {
      return getFallbackProductDetailContent(product);
    },
    async loadCategories() {
      try {
        const response = await getCategoryList();
        this.categories = normalizeCategoryCollection(response, fallbackCategories);
        this.categoriesLoadedFromApi = true;
      } catch {
        this.categories = normalizeCategoryCollection(fallbackCategories);
        this.categoriesLoadedFromApi = false;
      }
    },
    async loadProducts() {
      try {
        const response = await getProductList();
        this.products = normalizeProductCollection(response, fallbackProducts);
        this.productsLoadedFromApi = true;
      } catch {
        this.products = normalizeProductCollection(fallbackProducts);
        this.productsLoadedFromApi = false;
      }
    },
  },
});
