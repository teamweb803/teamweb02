import { defineStore } from 'pinia';
import {
  getCategoryList,
  getFallbackCategoryList,
} from '../services/categoryService';
import {
  getFallbackProductDetailContent,
  getFallbackProductDetailSeed,
  getFallbackProductList,
  getProductDetail,
  getProductList,
} from '../services/productService';
import { syncCategoryRouteMap } from '../constants/routes';
import { primeStorefrontInventory } from '../services/storefrontStockService';
import {
  buildCategoryRouteMap,
  normalizeCategoryCollection,
  normalizeCatalogProduct,
  normalizeProductCollection,
} from '../mappers/catalogMapper';

const fallbackCategories = getFallbackCategoryList();

const DEFAULT_FALLBACK_CATEGORY = fallbackCategories[0] ?? {
  slug: 'sofa',
  backendCategoryId: '20128',
  label: '소파',
};

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    categories: normalizeCategoryCollection(fallbackCategories),
    products: normalizeProductCollection(getFallbackProductList()),
    productDetailsById: {},
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
      const normalizedProductId = String(productId ?? '').trim();

      return this.productDetailsById[normalizedProductId]
        ?? this.products.find((product) => String(product.id) === normalizedProductId)
        ?? null;
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
    async loadProductDetail(productId, { force = false } = {}) {
      const normalizedProductId = String(productId ?? '').trim();

      if (!normalizedProductId) {
        return null;
      }

      if (!force && this.productDetailsById[normalizedProductId]) {
        return this.productDetailsById[normalizedProductId];
      }

      const baseProduct = this.products.find((product) => String(product.id) === normalizedProductId) ?? null;
      const response = await getProductDetail(normalizedProductId);
      const source = response?.data ?? response ?? {};
      const normalizedProduct = normalizeCatalogProduct({
        ...baseProduct,
        ...source,
        id: source.id ?? source.productId ?? baseProduct?.id ?? normalizedProductId,
        productId: source.productId ?? source.id ?? baseProduct?.productId ?? normalizedProductId,
      });

      this.productDetailsById = {
        ...this.productDetailsById,
        [normalizedProductId]: normalizedProduct,
      };

      const productIndex = this.products.findIndex((product) => String(product.id) === normalizedProductId);

      if (productIndex >= 0) {
        const nextProducts = [...this.products];
        nextProducts.splice(productIndex, 1, normalizedProduct);
        this.products = nextProducts;
      } else {
        this.products = normalizeProductCollection([
          normalizedProduct,
          ...this.products,
        ]);
      }

      return normalizedProduct;
    },
    async loadCategories() {
      try {
        const response = await getCategoryList();
        this.categories = normalizeCategoryCollection(response, fallbackCategories);
        this.categoriesLoadedFromApi = true;
        syncCategoryRouteMap(this.categories);
      } catch {
        this.categories = normalizeCategoryCollection(fallbackCategories);
        this.categoriesLoadedFromApi = false;
      }
    },
    async loadProducts() {
      try {
        const response = await getProductList();
        this.products = normalizeProductCollection(response, getFallbackProductList());
        this.productsLoadedFromApi = true;
        void primeStorefrontInventory(this.products).catch(() => {});
      } catch {
        this.products = normalizeProductCollection(getFallbackProductList());
        this.productsLoadedFromApi = false;
      }
    },
    async ensureCatalogLoaded({ force = false } = {}) {
      const tasks = [];

      if (force || !this.categoriesLoadedFromApi) {
        tasks.push(this.loadCategories());
      }

      if (force || !this.productsLoadedFromApi) {
        tasks.push(this.loadProducts());
      }

      if (tasks.length) {
        await Promise.all(tasks);
      }
    },
  },
});
