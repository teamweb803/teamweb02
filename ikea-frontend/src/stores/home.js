import { defineStore } from 'pinia';
import { normalizeProductCollection } from '../mappers/catalogMapper';
import { getBestProducts, getNewProducts } from '../services/productService';
import { getHomeContent } from '../services/homeService';

export const useHomeStore = defineStore('home', {
  state: () => ({
    ...getHomeContent(),
    remoteBestProducts: [],
    remoteNewProducts: [],
    remoteBestProductsLoaded: false,
    remoteNewProductsLoaded: false,
  }),
  actions: {
    async loadRemoteBestProducts({ force = false } = {}) {
      if (!force && this.remoteBestProductsLoaded) {
        return this.remoteBestProducts;
      }

      try {
        const response = await getBestProducts();
        this.remoteBestProducts = normalizeProductCollection(response, []);
        this.remoteBestProductsLoaded = true;
      } catch {
        this.remoteBestProducts = [];
        this.remoteBestProductsLoaded = false;
      }

      return this.remoteBestProducts;
    },
    async loadRemoteNewProducts({ force = false } = {}) {
      if (!force && this.remoteNewProductsLoaded) {
        return this.remoteNewProducts;
      }

      try {
        const response = await getNewProducts();
        this.remoteNewProducts = normalizeProductCollection(response, []);
        this.remoteNewProductsLoaded = true;
      } catch {
        this.remoteNewProducts = [];
        this.remoteNewProductsLoaded = false;
      }

      return this.remoteNewProducts;
    },
    async loadRemoteHomeProducts(options = {}) {
      await Promise.all([
        this.loadRemoteBestProducts(options),
        this.loadRemoteNewProducts(options),
      ]);
    },
  },
});
