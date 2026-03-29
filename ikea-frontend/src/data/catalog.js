import rawCatalog from './ikeaCatalog.json';

export const backendCategories = rawCatalog.categories ?? [];
export const catalogProducts = rawCatalog.products ?? [];
export const productDetailContentMap = rawCatalog.detailContent ?? {};

const categoryBySlug = new Map(backendCategories.map((category) => [category.slug, category]));
const categoryById = new Map(backendCategories.map((category) => [category.id, category]));
const productById = new Map(catalogProducts.map((product) => [String(product.id), product]));

export const CATEGORY_ROUTE_MAP = Object.fromEntries(
  backendCategories.map((category) => [
    category.slug,
    {
      slug: category.slug,
      backendCategoryId: category.backendCategoryId,
      label: category.label,
    },
  ]),
);

export const DEFAULT_CATEGORY = backendCategories[0] ?? {
  slug: 'sofa',
  backendCategoryId: '20128',
  label: '소파',
};

export function getCategoryBySlug(categorySlug) {
  return categoryBySlug.get(String(categorySlug ?? '').trim()) ?? DEFAULT_CATEGORY;
}

export function getCategoryById(categoryId) {
  return categoryById.get(String(categoryId ?? '').trim()) ?? null;
}

export function getCategoryCards(categorySlug) {
  return getCategoryBySlug(categorySlug)?.cards ?? [];
}

export function getCatalogProductsByCategory(categorySlug) {
  const resolvedCategory = getCategoryBySlug(categorySlug);
  return catalogProducts.filter((product) => product.categorySlug === resolvedCategory.slug);
}

export function getCatalogProductsByType(categorySlug, typeSlug) {
  if (!typeSlug || typeSlug === 'all') {
    return getCatalogProductsByCategory(categorySlug);
  }

  const resolvedCategory = getCategoryBySlug(categorySlug);
  return catalogProducts.filter(
    (product) => product.categorySlug === resolvedCategory.slug && product.typeSlug === typeSlug,
  );
}

export function findCatalogProductById(productId) {
  return productById.get(String(productId ?? '').trim()) ?? null;
}

export function getDefaultCatalogProduct() {
  return catalogProducts[0] ?? null;
}

export function getProductDetailSeed(productId) {
  return productDetailContentMap[String(productId ?? '').trim()] ?? null;
}
