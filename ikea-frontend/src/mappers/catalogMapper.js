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
  const cards = Array.isArray(category.cards) && category.cards.length
    ? category.cards
    : cloneArray(fallbackCategory?.cards ?? []);

  return {
    ...category,
    id: String(category.id ?? fallbackCategory?.id ?? backendCategoryId),
    backendCategoryId,
    slug: category.slug ?? fallbackCategory?.slug ?? backendCategoryId.toLowerCase(),
    label,
    name: category.name ?? category.categoryName ?? fallbackCategory?.name ?? label,
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

export function normalizeCatalogProduct(product = {}) {
  const fallbackProduct = resolveFallbackProduct(product);
  const resolvedCategory = resolveProductCategory(product, fallbackProduct);
  const price = Number(product.price ?? 0);
  const originalPrice = product.originalPrice != null
    ? Number(product.originalPrice)
    : null;
  const providedDiscountRate = Number(product.discountRate ?? 0);
  const calculatedDiscountRate = (
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0
  );
  const id = String(product.id ?? product.productId ?? fallbackProduct?.id ?? fallbackProduct?.productId ?? '');
  const productId = String(product.productId ?? product.id ?? fallbackProduct?.productId ?? fallbackProduct?.id ?? '');
  const resolvedImage = product.image ?? product.imgPath ?? '';
  const categoryLabel = product.categoryLabel
    ?? product.categoryName
    ?? resolvedCategory?.label
    ?? '';
  const categorySlug = product.categorySlug ?? fallbackProduct?.categorySlug ?? resolvedCategory?.slug ?? '';
  const reviews = Number(product.reviews ?? product.reviewCount ?? 0);
  const rating = Number(product.rating ?? product.reviewAverage ?? 0);

  return {
    ...product,
    id,
    productId,
    price,
    originalPrice,
    discountRate: providedDiscountRate > 0 ? providedDiscountRate : calculatedDiscountRate,
    image: resolvedImage,
    imgPath: product.imgPath ?? product.image ?? '',
    imageAlt: product.imageAlt ?? product.name ?? fallbackProduct?.name ?? '',
    altImage: product.altImage ?? fallbackProduct?.altImage ?? '',
    categorySlug,
    categoryLabel,
    categoryName: product.categoryName ?? categoryLabel,
    backendCategoryId: String(
      product.backendCategoryId ?? product.categoryId ?? resolvedCategory?.backendCategoryId ?? '',
    ).trim(),
    label: product.label ?? categoryLabel,
    badge: product.badge ?? '',
    brand: product.brand ?? 'HOMiO',
    description: product.description ?? '',
    typeSlug: product.typeSlug ?? 'all',
    features: Array.isArray(product.features) ? product.features : [],
    reviews,
    rating,
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

