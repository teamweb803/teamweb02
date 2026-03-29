import httpRequester from '../libs/httpRequester';
import { getFallbackCatalogCategories } from './catalogFallbackService';

export function getCategoryList() {
  return httpRequester.get('/category');
}

export function searchCategoryByName(name) {
  return httpRequester.get('/category/search', {
    params: { name },
  });
}

export function getFallbackCategoryList() {
  return getFallbackCatalogCategories();
}
