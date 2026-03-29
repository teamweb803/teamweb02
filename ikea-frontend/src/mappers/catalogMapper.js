function cloneArray(items = []) {
  return items.map((item) => ({ ...item }));
}

function normalizeCatalogProduct(product = {}) {
  const price = Number(product.price ?? 0);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;
  const providedDiscountRate = Number(product.discountRate ?? 0);
  const calculatedDiscountRate = (
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0
  );

  return {
    ...product,
    id: String(product.id ?? product.productId ?? ''),
    productId: String(product.productId ?? product.id ?? ''),
    price,
    originalPrice,
    discountRate: providedDiscountRate > 0 ? providedDiscountRate : calculatedDiscountRate,
    reviews: Number(product.reviews ?? 0),
    rating: Number(product.rating ?? 0),
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

  return source?.length ? cloneArray(source) : cloneArray(fallback);
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
