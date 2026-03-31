import {
  backendCategories as fallbackCategories,
  catalogProducts as fallbackProducts,
} from '../data/catalog';

function cloneArray(items = []) {
  return items.map((item) => ({ ...item }));
}

function normalizeLookupValue(value) {
  return String(value ?? '').trim().toLowerCase();
}

const fallbackCategoryByBackendId = new Map(
  fallbackCategories.map((category) => [normalizeLookupValue(category.backendCategoryId), category]),
);

const fallbackCategoryByLabel = new Map(
  fallbackCategories.map((category) => [normalizeLookupValue(category.label), category]),
);

const fallbackCategoryBySlug = new Map(
  fallbackCategories.map((category) => [normalizeLookupValue(category.slug), category]),
);

const fallbackProductById = new Map(
  fallbackProducts.map((product) => [normalizeLookupValue(product.id ?? product.productId), product]),
);

const fallbackProductByName = new Map(
  fallbackProducts.map((product) => [normalizeLookupValue(product.name), product]),
);

function resolveFallbackCategory(category = {}) {
  return (
    fallbackCategoryByBackendId.get(normalizeLookupValue(category.backendCategoryId ?? category.id))
    ?? fallbackCategoryByLabel.get(normalizeLookupValue(category.label ?? category.categoryName ?? category.name))
    ?? fallbackCategoryBySlug.get(normalizeLookupValue(category.slug))
    ?? null
  );
}

function normalizeCatalogCategory(category = {}) {
  const fallbackCategory = resolveFallbackCategory(category);
  const backendCategoryId = String(
    category.backendCategoryId ?? category.id ?? fallbackCategory?.backendCategoryId ?? '',
  ).trim();
  const label = category.label ?? category.categoryName ?? category.name ?? fallbackCategory?.label ?? '';
  const cards = Array.isArray(category.cards) ? category.cards : fallbackCategory?.cards ?? [];

  return {
    ...fallbackCategory,
    ...category,
    id: String(fallbackCategory?.id ?? category.id ?? backendCategoryId),
    backendCategoryId,
    slug: category.slug ?? fallbackCategory?.slug ?? backendCategoryId.toLowerCase(),
    label,
    name: category.name ?? fallbackCategory?.name ?? label,
    cards: cloneArray(cards),
  };
}

function resolveFallbackProduct(product = {}) {
  return (
    fallbackProductById.get(normalizeLookupValue(product.productId ?? product.id))
    ?? fallbackProductByName.get(normalizeLookupValue(product.name))
    ?? null
  );
}

function resolveProductCategory(product = {}, fallbackProduct = null) {
  const candidates = [
    product.categorySlug,
    fallbackProduct?.categorySlug,
    product.backendCategoryId,
    product.categoryId,
    product.categoryName,
    product.categoryLabel,
  ];

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeLookupValue(candidate);

    if (!normalizedCandidate) {
      continue;
    }

    const matchedCategory = fallbackCategoryBySlug.get(normalizedCandidate)
      ?? fallbackCategoryByBackendId.get(normalizedCandidate)
      ?? fallbackCategoryByLabel.get(normalizedCandidate);

    if (matchedCategory) {
      return matchedCategory;
    }
  }

  return null;
}

function normalizeCatalogProduct(product = {}) {
  const fallbackProduct = resolveFallbackProduct(product);
  const resolvedCategory = resolveProductCategory(product, fallbackProduct);
  const price = Number(product.price ?? fallbackProduct?.price ?? 0);
  const originalPrice = product.originalPrice
    ? Number(product.originalPrice)
    : fallbackProduct?.originalPrice
      ? Number(fallbackProduct.originalPrice)
      : null;
  const providedDiscountRate = Number(product.discountRate ?? fallbackProduct?.discountRate ?? 0);
  const calculatedDiscountRate = (
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0
  );
  const id = String(product.id ?? product.productId ?? fallbackProduct?.id ?? fallbackProduct?.productId ?? '');
  const productId = String(product.productId ?? product.id ?? fallbackProduct?.productId ?? fallbackProduct?.id ?? '');
  const image = product.image ?? product.imgPath ?? fallbackProduct?.image ?? fallbackProduct?.imgPath ?? '';
  const categoryLabel = product.categoryLabel
    ?? product.categoryName
    ?? fallbackProduct?.categoryLabel
    ?? resolvedCategory?.label
    ?? '';
  const categorySlug = product.categorySlug ?? fallbackProduct?.categorySlug ?? resolvedCategory?.slug ?? '';

  return {
    ...fallbackProduct,
    ...product,
    id,
    productId,
    price,
    originalPrice,
    discountRate: providedDiscountRate > 0 ? providedDiscountRate : calculatedDiscountRate,
    image,
    imgPath: product.imgPath ?? product.image ?? fallbackProduct?.imgPath ?? fallbackProduct?.image ?? '',
    imageAlt: product.imageAlt ?? fallbackProduct?.imageAlt ?? product.name ?? fallbackProduct?.name ?? '',
    altImage: product.altImage ?? fallbackProduct?.altImage ?? '',
    categorySlug,
    categoryLabel,
    categoryName: product.categoryName ?? categoryLabel,
    backendCategoryId: String(
      product.backendCategoryId ?? product.categoryId ?? resolvedCategory?.backendCategoryId ?? '',
    ).trim(),
    label: product.label ?? fallbackProduct?.label ?? categoryLabel,
    badge: product.badge ?? fallbackProduct?.badge ?? '',
    brand: product.brand ?? fallbackProduct?.brand ?? 'HOMiO',
    description: product.description ?? fallbackProduct?.description ?? '',
    typeSlug: product.typeSlug ?? fallbackProduct?.typeSlug ?? 'all',
    features: Array.isArray(product.features) ? product.features : fallbackProduct?.features ?? [],
    reviews: Number(product.reviews ?? fallbackProduct?.reviews ?? 0),
    rating: Number(product.rating ?? fallbackProduct?.rating ?? 0),
  };
}

export function normalizeCategoryCollection(payload, fallback = []) {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.content)
        ? payload.content
        : Array.isArray(payload?.items)
          ? payload.items
          : null;

  const rows = source?.length ? source : fallback;
  return rows.map((item) => normalizeCatalogCategory(item));
}

export function normalizeProductCollection(payload, fallback = []) {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.content)
        ? payload.content
        : Array.isArray(payload?.items)
          ? payload.items
          : null;

  const rows = source?.length ? cloneArray(source) : cloneArray(fallback);
  return rows.map((item) => normalizeCatalogProduct(item));
}

export function buildCategoryRouteMap(categories = []) {
  return Object.fromEntries(
    categories.map((category) => [
      category.slug,
      {
        slug: category.slug,
        backendCategoryId: category.backendCategoryId,
        label: category.label,
      },
    ]),
  );
}
