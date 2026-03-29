function cloneArray(items = []) {
  return items.map((item) => ({ ...item }));
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

  return source?.length ? cloneArray(source) : cloneArray(fallback);
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
