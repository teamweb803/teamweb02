<script setup>
import { computed, onMounted, reactive, shallowRef, watch } from 'vue';
import { useCatalogStore } from '../../stores/catalog';
import AdminPagination from './AdminPagination.vue';
import AdminPanel from './AdminPanel.vue';
import CommonStatePanel from '../common/CommonStatePanel.vue';
import {
  createAdminProduct,
  deleteAdminProduct,
  getFallbackAdminCategories,
  getFallbackAdminProducts,
  getProductCatalog,
  updateAdminProduct,
} from '../../services/adminService';
import { getFallbackProductDetailContent } from '../../services/productService';
import {
  formatAdminCurrency,
  formatAdminDate,
  normalizeAdminProduct,
  normalizeArrayPayload,
} from '../../mappers/adminManagementMapper';
import { buildProductDetailPath } from '../../constants/routes';
import {
  calculateDiscountRate,
  removeAdminProductDraft,
  upsertAdminProductDraft,
} from '../../services/adminProductDraftService';
import {
  ADMIN_PRODUCT_BADGE_OPTIONS,
  buildProductDeliveryMessage,
  buildProductOptionSummary,
  buildProductQuickFacts,
  createEmptyProductAttributes,
  getCategorySubtypeOptions,
  getProductAttributeFieldDefinitions,
  pickProductAttributes,
} from '../../constants/productAttributeConfig';

const categories = getFallbackAdminCategories();
const catalogStore = useCatalogStore();
const products = shallowRef([]);
const isLoading = shallowRef(false);
const isSubmitting = shallowRef(false);
const searchKeyword = shallowRef('');
const currentPage = shallowRef(1);
const pageSize = 5;
const activeProductId = shallowRef('');
const selectedMainFiles = shallowRef([]);
const selectedGalleryFiles = shallowRef([]);
const selectedDimensionFiles = shallowRef([]);
const statusMessage = shallowRef('');
const deletedProductIds = shallowRef(new Set());

const formState = reactive({
  name: '',
  brand: '',
  badge: '',
  label: '',
  typeSlug: '',
  price: '',
  originalPrice: '',
  categoryId: '',
  attributes: createEmptyProductAttributes(),
  heroHook: '',
  descriptionText: '',
  highlightsText: '',
  measurementsText: '',
});

const filteredProducts = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();

  if (!keyword) {
    return products.value;
  }

  return products.value.filter((product) => {
    const haystacks = [
      product.name,
      product.brand,
      product.categoryName,
      product.categorySlug,
      product.label,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    return haystacks.some((value) => value.includes(keyword));
  });
});

const pageCount = computed(() => Math.max(Math.ceil(filteredProducts.value.length / pageSize), 1));
const pagedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredProducts.value.slice(start, start + pageSize);
});

const selectedProduct = computed(
  () => products.value.find((product) => String(product.productId) === String(activeProductId.value)) ?? null,
);
const selectedCategory = computed(
  () => categories.find((item) => String(item.backendCategoryId) === String(formState.categoryId)) ?? categories[0] ?? null,
);
const subtypeOptions = computed(() => getCategorySubtypeOptions(selectedCategory.value));
const selectedSubtypeOption = computed(
  () => subtypeOptions.value.find((option) => option.slug === formState.typeSlug) ?? subtypeOptions.value[0] ?? null,
);
const badgeOptions = computed(() => {
  const merged = [
    ...ADMIN_PRODUCT_BADGE_OPTIONS,
    ...subtypeOptions.value.map((option) => ({
      value: option.label,
      label: option.label,
    })),
  ];

  const seen = new Set();
  return merged.filter((option) => {
    if (seen.has(option.value)) {
      return false;
    }

    seen.add(option.value);
    return true;
  });
});
const visibleAttributeFields = computed(() => getProductAttributeFieldDefinitions(
  selectedCategory.value?.slug ?? '',
  formState.typeSlug || 'all',
));
const formModeLabel = computed(() => (activeProductId.value ? '상품 수정' : '상품 등록'));
const priceValue = computed(() => Number(formState.price ?? 0));
const originalPriceValue = computed(() => Number(formState.originalPrice ?? 0));
const discountRatePreview = computed(() => calculateDiscountRate(priceValue.value, originalPriceValue.value));
const existingGalleryCount = computed(() => {
  if (!selectedProduct.value?.detailDraft?.galleryImages?.length) {
    return 0;
  }

  return selectedProduct.value.detailDraft.galleryImages.length;
});
const hasExistingDimensionImage = computed(() => Boolean(selectedProduct.value?.detailDraft?.dimensionImage));
const previewQuickFacts = computed(() => buildProductQuickFacts(buildPreviewProduct()).slice(0, 4));
const previewOptionCopy = computed(() => buildProductOptionSummary(buildPreviewProduct()));
const previewDeliveryCopy = computed(() => buildProductDeliveryMessage(buildPreviewProduct()));

function splitMultilineText(value) {
  return String(value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatMultilineText(lines = []) {
  return lines
    .map((line) => String(line ?? '').trim())
    .filter(Boolean)
    .join('\n');
}

function parseMeasurementsText(value) {
  return String(value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.includes(':') ? ':' : (line.includes('|') ? '|' : '');

      if (!separator) {
        return null;
      }

      const [label, ...rest] = line.split(separator);
      const resolvedValue = rest.join(separator).trim();

      if (!label.trim() || !resolvedValue) {
        return null;
      }

      return {
        label: label.trim(),
        value: resolvedValue,
      };
    })
    .filter(Boolean);
}

function formatMeasurementsText(measurements = []) {
  return measurements
    .filter((item) => item?.label && item?.value)
    .map((item) => `${item.label}: ${item.value}`)
    .join('\n');
}

function replaceAttributeValues(nextValues = {}) {
  Object.keys(formState.attributes).forEach((fieldId) => {
    formState.attributes[fieldId] = nextValues[fieldId] ?? '';
  });
}

function pruneAttributeValues() {
  const preserved = { ...formState.attributes };
  const nextValues = createEmptyProductAttributes();

  visibleAttributeFields.value.forEach((field) => {
    nextValues[field.id] = preserved[field.id] ?? '';
  });

  replaceAttributeValues(nextValues);
}

function readEditableAttributes(product, categorySlug, typeSlug = 'all') {
  return {
    ...createEmptyProductAttributes(),
    ...pickProductAttributes(product, categorySlug, typeSlug),
  };
}

function resetFileSelections() {
  selectedMainFiles.value = [];
  selectedGalleryFiles.value = [];
  selectedDimensionFiles.value = [];
}

function resolveDetailDraft(product) {
  const fallbackContent = getFallbackProductDetailContent(product) ?? {};
  const draft = product.detailDraft ?? {};

  return {
    heroHook: draft.heroHook ?? fallbackContent.heroHook ?? product.description ?? '',
    descriptionText: formatMultilineText(draft.description ?? fallbackContent.description ?? []),
    highlightsText: formatMultilineText(draft.highlights ?? fallbackContent.highlights ?? []),
    measurementsText: formatMeasurementsText(draft.measurements ?? fallbackContent.measurements ?? []),
    galleryImages:
      draft.galleryImages
      ?? fallbackContent.galleryImages
      ?? [product.image, product.altImage].filter(Boolean),
    dimensionImage: draft.dimensionImage ?? fallbackContent.dimensionImage ?? '',
  };
}

function syncSubtypeSelection() {
  if (!subtypeOptions.value.length) {
    formState.typeSlug = '';
    formState.label = selectedCategory.value?.label ?? '';
    return;
  }

  const matchedOption = subtypeOptions.value.find((option) => option.slug === formState.typeSlug)
    ?? subtypeOptions.value[0];

  formState.typeSlug = matchedOption.slug;
  formState.label = matchedOption.label;
}

function clearFormFields() {
  activeProductId.value = '';
  formState.name = '';
  formState.brand = 'HOMiO';
  formState.badge = '';
  formState.label = '';
  formState.typeSlug = '';
  formState.price = '';
  formState.originalPrice = '';
  formState.categoryId = categories[0]?.backendCategoryId ? String(categories[0].backendCategoryId) : '';
  replaceAttributeValues();
  formState.heroHook = '';
  formState.descriptionText = '';
  formState.highlightsText = '';
  formState.measurementsText = '';
  resetFileSelections();
  syncSubtypeSelection();
}

function beginCreateMode({ clearStatus = true } = {}) {
  clearFormFields();

  if (clearStatus) {
    statusMessage.value = '';
  }
}

function beginEditMode(product) {
  const normalizedProduct = normalizeAdminProduct(product, categories);
  const detailDraft = resolveDetailDraft(normalizedProduct);

  activeProductId.value = normalizedProduct.productId;
  formState.name = normalizedProduct.name;
  formState.brand = normalizedProduct.brand || 'HOMiO';
  formState.badge = normalizedProduct.badge ?? '';
  formState.price = normalizedProduct.price ? String(normalizedProduct.price) : '';
  formState.originalPrice = normalizedProduct.originalPrice ? String(normalizedProduct.originalPrice) : '';
  formState.categoryId = String(
    normalizedProduct.categoryId || selectedCategory.value?.backendCategoryId || categories[0]?.backendCategoryId || '',
  );
  formState.typeSlug = normalizedProduct.typeSlug || '';
  syncSubtypeSelection();
  replaceAttributeValues(
    readEditableAttributes(
      normalizedProduct,
      selectedCategory.value?.slug ?? normalizedProduct.categorySlug ?? '',
      formState.typeSlug || 'all',
    ),
  );
  formState.heroHook = detailDraft.heroHook;
  formState.descriptionText = detailDraft.descriptionText;
  formState.highlightsText = detailDraft.highlightsText;
  formState.measurementsText = detailDraft.measurementsText;
  resetFileSelections();
  statusMessage.value = '';
}

function applyProducts(items) {
  const normalizedItems = items
    .map((item) => normalizeAdminProduct(item, categories))
    .filter((item) => item.productId)
    .filter((item) => !deletedProductIds.value.has(String(item.productId)));

  products.value = normalizedItems;

  if (activeProductId.value) {
    const hasActiveProduct = normalizedItems.some((item) => item.productId === activeProductId.value);

    if (!hasActiveProduct) {
      beginCreateMode({ clearStatus: false });
    }
  }
}

async function loadProducts() {
  isLoading.value = true;

  try {
    const payload = await getProductCatalog();
    applyProducts(normalizeArrayPayload(payload, getFallbackAdminProducts()));
  } catch {
    applyProducts(getFallbackAdminProducts());
  } finally {
    isLoading.value = false;
  }
}

function handleMainFileChange(event) {
  selectedMainFiles.value = [...(event.target.files ?? [])];
}

function handleGalleryFileChange(event) {
  selectedGalleryFiles.value = [...(event.target.files ?? [])];
}

function handleDimensionFileChange(event) {
  selectedDimensionFiles.value = [...(event.target.files ?? [])];
}

function buildPreviewProduct() {
  const attributeValues = Object.fromEntries(
    visibleAttributeFields.value
      .map((field) => [field.id, String(formState.attributes[field.id] ?? '').trim()])
      .filter(([, value]) => value),
  );

  return {
    id: activeProductId.value || '',
    productId: activeProductId.value || '',
    categorySlug: selectedCategory.value?.slug ?? '',
    categoryLabel: selectedCategory.value?.label ?? '',
    label: selectedSubtypeOption.value?.label ?? formState.label,
    typeSlug: formState.typeSlug || 'all',
    badge: formState.badge,
    attributes: attributeValues,
    ...attributeValues,
  };
}

function createLocalProductId() {
  const digits = String(Date.now()).slice(-7);
  return `9${digits}`;
}

function buildFeatureTags(subtypeLabel, attributeValues) {
  return Array.from(
    new Set([
      subtypeLabel,
      attributeValues.color,
      attributeValues.material,
      attributeValues.size,
      attributeValues.firmness,
      attributeValues.function,
      attributeValues.warmth,
      attributeValues.seatCount,
      attributeValues.shape,
      attributeValues.installation,
      attributeValues.configuration,
      attributeValues.use,
    ].filter(Boolean)),
  ).slice(0, 3);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    if (!(file instanceof File)) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

async function resolveImageSource(files, fallback = '') {
  if (!files.length) {
    return fallback;
  }

  return readFileAsDataUrl(files[0]);
}

async function resolveImageGallery(files, fallback = []) {
  if (!files.length) {
    return fallback;
  }

  const images = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
  return images.filter(Boolean);
}

async function buildDetailDraft(existingProduct = selectedProduct.value) {
  const existingDetail = resolveDetailDraft(existingProduct ?? {});
  const heroHook = formState.heroHook.trim();
  const description = splitMultilineText(formState.descriptionText);
  const highlights = splitMultilineText(formState.highlightsText);
  const measurements = parseMeasurementsText(formState.measurementsText);
  const fallbackGallery = existingDetail.galleryImages ?? [existingProduct?.image, existingProduct?.altImage].filter(Boolean);

  const mainImage = await resolveImageSource(
    selectedMainFiles.value,
    existingProduct?.image ?? fallbackGallery[0] ?? '',
  );
  const galleryImages = await resolveImageGallery(
    selectedGalleryFiles.value,
    fallbackGallery,
  );
  const dimensionImage = await resolveImageSource(
    selectedDimensionFiles.value,
    existingDetail.dimensionImage ?? '',
  );

  return {
    heroHook,
    description,
    highlights,
    measurements,
    galleryImages: galleryImages.length ? galleryImages : [mainImage].filter(Boolean),
    dimensionImage,
  };
}

async function buildCatalogProductDraft(existingProduct = selectedProduct.value) {
  const selectedCategoryValue = selectedCategory.value ?? categories[0];
  const subtypeOption = selectedSubtypeOption.value;
  const productId = existingProduct?.productId ?? activeProductId.value ?? createLocalProductId();
  const detailDraft = await buildDetailDraft(existingProduct);
  const attributeValues = Object.fromEntries(
    visibleAttributeFields.value
      .map((field) => [field.id, String(formState.attributes[field.id] ?? '').trim()])
      .filter(([, value]) => value),
  );
  const typeLabel = subtypeOption?.label ?? formState.label;
  const image = detailDraft.galleryImages[0] ?? existingProduct?.image ?? '';
  const altImage = detailDraft.galleryImages[1] ?? existingProduct?.altImage ?? image;

  return {
    ...existingProduct,
    id: String(productId),
    productId: String(productId),
    name: formState.name.trim(),
    brand: formState.brand.trim() || 'HOMiO',
    badge: formState.badge,
    label: typeLabel,
    typeSlug: subtypeOption?.slug ?? formState.typeSlug,
    price: Number(formState.price || 0),
    originalPrice: formState.originalPrice ? Number(formState.originalPrice) : null,
    discountRate: calculateDiscountRate(formState.price, formState.originalPrice),
    categoryId: String(selectedCategoryValue?.backendCategoryId ?? formState.categoryId),
    categoryName: selectedCategoryValue?.label ?? '',
    categoryLabel: selectedCategoryValue?.label ?? '',
    categorySlug: selectedCategoryValue?.slug ?? '',
    image,
    altImage,
    imgPath: image,
    description: detailDraft.heroHook,
    features: buildFeatureTags(typeLabel, attributeValues),
    createdAt: existingProduct?.createdAt ?? new Date().toISOString(),
    reviews: existingProduct?.reviews ?? 0,
    rating: existingProduct?.rating ?? 0,
    attributes: attributeValues,
    color: attributeValues.color ?? '',
    material: attributeValues.material ?? '',
    size: attributeValues.size ?? '',
    firmness: attributeValues.firmness ?? '',
    function: attributeValues.function ?? '',
    warmth: attributeValues.warmth ?? '',
    seatCount: attributeValues.seatCount ?? '',
    shape: attributeValues.shape ?? '',
    installation: attributeValues.installation ?? '',
    configuration: attributeValues.configuration ?? '',
    use: attributeValues.use ?? '',
    detailDraft,
  };
}

async function submitProduct() {
  if (!formState.name.trim() || !formState.categoryId || !formState.typeSlug || !Number(formState.price)) {
    statusMessage.value = '상품명, 카테고리, 대표 분류, 가격을 확인해 주세요.';
    return;
  }

  isSubmitting.value = true;

  const draftProduct = await buildCatalogProductDraft(selectedProduct.value);
  const payload = {
    name: draftProduct.name,
    price: draftProduct.price,
    categoryId: draftProduct.categoryId,
    files: [
      ...selectedMainFiles.value,
      ...selectedGalleryFiles.value,
      ...selectedDimensionFiles.value,
    ],
  };

  deletedProductIds.value.delete(String(draftProduct.productId));

  try {
    if (activeProductId.value) {
      await updateAdminProduct(activeProductId.value, payload);
      statusMessage.value = '상품 정보를 수정했습니다.';
    } else {
      await createAdminProduct(payload);
      statusMessage.value = '새 상품을 등록했습니다.';
    }
  } catch {
    statusMessage.value = '서버 연결 전 단계라 현재 내용은 프론트에서 먼저 반영됩니다.';
  } finally {
    upsertAdminProductDraft(draftProduct);
    catalogStore.refreshFromFallbackProducts();
    applyProducts(getFallbackAdminProducts());
    isSubmitting.value = false;
    beginCreateMode({ clearStatus: false });
  }
}

async function removeProduct(product) {
  const confirmed = window.confirm(`"${product.name}" 상품을 삭제할까요?`);

  if (!confirmed) {
    return;
  }

  try {
    await deleteAdminProduct(product.productId);
    statusMessage.value = '상품을 삭제했습니다.';
  } catch {
    statusMessage.value = '서버 연결 전 단계라 현재 세션과 로컬 초안에서 먼저 숨깁니다.';
  } finally {
    deletedProductIds.value = new Set([
      ...deletedProductIds.value,
      String(product.productId),
    ]);
    removeAdminProductDraft(product.productId, { markDeleted: true });
    catalogStore.refreshFromFallbackProducts();
    applyProducts(getFallbackAdminProducts());

    if (activeProductId.value === product.productId) {
      beginCreateMode({ clearStatus: false });
    }
  }
}

watch(
  () => selectedCategory.value?.slug,
  () => {
    syncSubtypeSelection();
    pruneAttributeValues();
  },
);

watch(
  () => formState.typeSlug,
  () => {
    if (selectedSubtypeOption.value) {
      formState.label = selectedSubtypeOption.value.label;
    }
    pruneAttributeValues();
  },
);

watch(searchKeyword, () => {
  currentPage.value = 1;
});

watch(
  () => filteredProducts.value.length,
  () => {
    if (currentPage.value > pageCount.value) {
      currentPage.value = pageCount.value;
    }
  },
);

onMounted(async () => {
  await loadProducts();
  beginCreateMode();
});
</script>

<template>
  <section class="admin-products-manager">
    <AdminPanel title="상품 목록" description="등록된 상품을 확인하고 수정하거나 삭제합니다.">
      <template #action>
        <input
          v-model="searchKeyword"
          type="text"
          class="admin-products-manager__search"
          placeholder="상품명, 브랜드, 대표 분류 검색"
        />
      </template>

      <div class="admin-products-manager__table">
        <div class="admin-products-manager__head">
          <span>상품</span>
          <span>대표 분류</span>
          <span>가격</span>
          <span>할인</span>
          <span>등록일</span>
          <span>관리</span>
        </div>

        <article
          v-for="product in pagedProducts"
          :key="product.productId"
          class="admin-products-manager__row"
          :class="{ 'is-active': activeProductId === product.productId }"
        >
          <div class="admin-products-manager__product">
            <img :src="product.image" :alt="product.name" />
            <div>
              <strong>{{ product.name }}</strong>
              <span>{{ product.brand }} · {{ product.categoryName }}</span>
            </div>
          </div>
          <span>{{ product.label || '-' }}</span>
          <strong>{{ formatAdminCurrency(product.price) }}</strong>
          <span>{{ product.discountRate ? `${product.discountRate}%` : '-' }}</span>
          <span>{{ formatAdminDate(product.createdAt) }}</span>
          <div class="admin-products-manager__row-actions">
            <button type="button" @click="beginEditMode(product)">수정</button>
            <RouterLink :to="buildProductDetailPath(product.productId)">미리보기</RouterLink>
            <button type="button" @click="removeProduct(product)">삭제</button>
          </div>
        </article>

        <CommonStatePanel
          v-if="!pagedProducts.length"
          :tone="isLoading ? 'loading' : 'neutral'"
          :title="isLoading ? '상품 목록을 불러오는 중입니다.' : '표시할 상품이 없습니다.'"
          compact
        />
      </div>

      <AdminPagination v-model:current-page="currentPage" :page-count="pageCount" />
    </AdminPanel>

    <AdminPanel :title="formModeLabel" description="상품 페이지와 상세 페이지에 바로 반영될 기준값을 입력합니다.">
      <template v-if="activeProductId" #action>
        <button type="button" class="admin-products-manager__primary" @click="beginCreateMode">
          새 상품 작성
        </button>
      </template>

      <form class="admin-products-manager__form" @submit.prevent="submitProduct">
        <section class="admin-products-manager__section">
          <header class="admin-products-manager__section-head">
            <h3>기본 정보</h3>
          </header>

          <div class="admin-products-manager__form-grid">
            <label class="admin-products-manager__field-row">
              <span>상품명</span>
              <div class="admin-products-manager__field-control">
                <input v-model.trim="formState.name" type="text" maxlength="80" />
              </div>
            </label>

            <label class="admin-products-manager__field-row">
              <span>브랜드</span>
              <div class="admin-products-manager__field-control">
                <input v-model.trim="formState.brand" type="text" maxlength="30" />
              </div>
            </label>

            <label class="admin-products-manager__field-row">
              <span>가격</span>
              <div class="admin-products-manager__field-control">
                <input v-model.number="formState.price" type="number" min="0" step="100" />
              </div>
            </label>

            <label class="admin-products-manager__field-row">
              <span>정가</span>
              <div class="admin-products-manager__field-control">
                <input v-model.number="formState.originalPrice" type="number" min="0" step="100" />
              </div>
            </label>

            <div class="admin-products-manager__field-row admin-products-manager__field-row--note">
              <span>할인 계산</span>
              <div class="admin-products-manager__field-control">
                <div class="admin-products-manager__discount-preview">
                  <strong v-if="discountRatePreview">할인율 {{ discountRatePreview }}%</strong>
                  <strong v-else>할인 적용 없음</strong>
                  <p>
                    {{
                      discountRatePreview
                        ? '정가가 가격보다 높아 할인중 필터에 자동 반영됩니다.'
                        : '정가가 가격보다 높을 때만 할인중으로 처리됩니다.'
                    }}
                  </p>
                </div>
              </div>
            </div>

            <label class="admin-products-manager__field-row">
              <span>카테고리</span>
              <div class="admin-products-manager__field-control">
                <select v-model="formState.categoryId">
                  <option
                    v-for="category in categories"
                    :key="category.backendCategoryId"
                    :value="String(category.backendCategoryId)"
                  >
                    {{ category.label }}
                  </option>
                </select>
              </div>
            </label>

            <label class="admin-products-manager__field-row">
              <span>대표 분류</span>
              <div class="admin-products-manager__field-control">
                <select v-model="formState.typeSlug">
                  <option
                    v-for="option in subtypeOptions"
                    :key="option.slug"
                    :value="option.slug"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </label>

            <label class="admin-products-manager__field-row">
              <span>배지</span>
              <div class="admin-products-manager__field-control">
                <select v-model="formState.badge">
                  <option
                    v-for="option in badgeOptions"
                    :key="option.value || 'none'"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </label>

            <label
              v-for="field in visibleAttributeFields"
              :key="field.id"
              class="admin-products-manager__field-row"
            >
              <span>{{ field.label }}</span>
              <div class="admin-products-manager__field-control">
                <input
                  v-model.trim="formState.attributes[field.id]"
                  type="text"
                  :placeholder="field.placeholder"
                />
              </div>
            </label>
          </div>
        </section>

        <section class="admin-products-manager__section">
          <header class="admin-products-manager__section-head">
            <h3>상세 콘텐츠</h3>
          </header>

          <div class="admin-products-manager__form-grid">
            <label class="admin-products-manager__field-row">
              <span>상단 소개</span>
              <div class="admin-products-manager__field-control">
                <textarea v-model.trim="formState.heroHook" rows="3" />
              </div>
            </label>

            <label class="admin-products-manager__field-row">
              <span>상세 설명</span>
              <div class="admin-products-manager__field-control">
                <textarea
                  v-model.trim="formState.descriptionText"
                  rows="6"
                  placeholder="한 줄에 한 문단씩 입력"
                />
              </div>
            </label>

            <label class="admin-products-manager__field-row">
              <span>핵심 포인트</span>
              <div class="admin-products-manager__field-control">
                <textarea
                  v-model.trim="formState.highlightsText"
                  rows="5"
                  placeholder="한 줄에 한 항목씩 입력"
                />
              </div>
            </label>

            <label class="admin-products-manager__field-row">
              <span>치수 정보</span>
              <div class="admin-products-manager__field-control">
                <textarea
                  v-model.trim="formState.measurementsText"
                  rows="5"
                  placeholder="예: 폭: 140 cm"
                />
              </div>
            </label>
          </div>
        </section>

        <section class="admin-products-manager__section">
          <header class="admin-products-manager__section-head">
            <h3>이미지 자료</h3>
          </header>

          <div class="admin-products-manager__form-grid">
            <label class="admin-products-manager__field-row">
              <span>대표 이미지</span>
              <div class="admin-products-manager__field-control">
                <input type="file" accept="image/*" @change="handleMainFileChange" />
                <small>{{ selectedMainFiles[0]?.name || selectedProduct?.image || '선택된 파일 없음' }}</small>
              </div>
            </label>

            <label class="admin-products-manager__field-row">
              <span>갤러리 이미지</span>
              <div class="admin-products-manager__field-control">
                <input type="file" accept="image/*" multiple @change="handleGalleryFileChange" />
                <small>
                  {{
                    selectedGalleryFiles.length
                      ? `${selectedGalleryFiles.length}개 선택`
                      : existingGalleryCount
                        ? `기존 ${existingGalleryCount}개 사용`
                        : '선택된 파일 없음'
                  }}
                </small>
              </div>
            </label>

            <label class="admin-products-manager__field-row">
              <span>치수 이미지</span>
              <div class="admin-products-manager__field-control">
                <input type="file" accept="image/*" @change="handleDimensionFileChange" />
                <small>
                  {{
                    selectedDimensionFiles[0]?.name
                      || (hasExistingDimensionImage ? '기존 이미지 사용' : '선택된 파일 없음')
                  }}
                </small>
              </div>
            </label>
          </div>
        </section>

        <section class="admin-products-manager__section">
          <header class="admin-products-manager__section-head">
            <h3>상세 상단 미리보기</h3>
          </header>

          <div class="admin-products-manager__preview">
            <div class="admin-products-manager__preview-facts">
              <article v-for="fact in previewQuickFacts" :key="fact.label">
                <span>{{ fact.label }}</span>
                <strong>{{ fact.value }}</strong>
              </article>
            </div>

            <div class="admin-products-manager__preview-copy">
              <article>
                <span>구매 옵션 문구</span>
                <strong>{{ previewOptionCopy || '-' }}</strong>
              </article>
              <article>
                <span>배송 문구</span>
                <strong>{{ previewDeliveryCopy }}</strong>
              </article>
            </div>
          </div>
        </section>

        <div class="admin-products-manager__form-actions">
          <button type="button" class="admin-products-manager__secondary" @click="beginCreateMode">
            입력 초기화
          </button>
          <button type="submit" class="admin-products-manager__primary" :disabled="isSubmitting">
            {{ isSubmitting ? '저장 중...' : activeProductId ? '상품 수정' : '상품 등록' }}
          </button>
        </div>

        <p v-if="statusMessage" class="admin-products-manager__status">{{ statusMessage }}</p>
      </form>
    </AdminPanel>
  </section>
</template>

<style scoped>
.admin-products-manager {
  display: grid;
  gap: 40px;
}

.admin-products-manager__search {
  width: 320px;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
}

.admin-products-manager__table {
  border-bottom: 1px solid #ededed;
}

.admin-products-manager__head,
.admin-products-manager__row {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) 160px 130px 90px 120px 190px;
  gap: 16px;
  align-items: center;
}

.admin-products-manager__head {
  padding: 0 0 14px;
  color: #666666;
  font-size: 13px;
}

.admin-products-manager__row {
  padding: 16px 0;
  border-top: 1px solid #efefef;
}

.admin-products-manager__row.is-active {
  background: #f7f9fb;
}

.admin-products-manager__product {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.admin-products-manager__product img {
  width: 76px;
  height: 76px;
  border: 1px solid #ececec;
  object-fit: cover;
  background: #f7f9fb;
}

.admin-products-manager__product strong {
  display: block;
  color: #111111;
  font-size: 15px;
  line-height: 1.4;
}

.admin-products-manager__product span {
  display: block;
  margin-top: 6px;
  color: #777777;
  font-size: 13px;
}

.admin-products-manager__row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.admin-products-manager__row-actions > button:first-child {
  order: 1;
}

.admin-products-manager__row-actions > button:last-child {
  order: 2;
}

.admin-products-manager__row-actions > a,
.admin-products-manager__preview-link {
  order: 3;
}

.admin-products-manager__row-actions button,
.admin-products-manager__row-actions a,
.admin-products-manager__primary,
.admin-products-manager__secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  color: #111111;
  text-decoration: none;
  cursor: pointer;
}

.admin-products-manager__primary {
  border-color: #111111;
  background: #111111;
  color: #ffffff;
}

.admin-products-manager__form {
  display: grid;
  gap: 24px;
}

.admin-products-manager__section {
  display: grid;
  gap: 16px;
}

.admin-products-manager__section-head {
  padding-bottom: 14px;
  border-bottom: 1px solid #ececec;
}

.admin-products-manager__section-head h3 {
  margin: 0;
  color: #111111;
  font-size: 20px;
  line-height: 1.3;
}

.admin-products-manager__form-grid {
  display: grid;
  gap: 14px;
}

.admin-products-manager__field-row {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.admin-products-manager__field-row:has(input[type='file']) {
  align-items: center;
}

.admin-products-manager__field-row:has(input[type='file']) > span {
  padding-top: 0;
  align-self: center;
}

.admin-products-manager__field-row > span {
  padding-top: 12px;
  color: #555555;
  font-size: 14px;
  line-height: 1.6;
}

.admin-products-manager__field-row--note > span {
  padding-top: 2px;
}

.admin-products-manager__field-control {
  display: grid;
  gap: 8px;
}

.admin-products-manager__field-control:has(input[type='file']) {
  min-height: 72px;
  align-content: center;
  align-items: center;
}

.admin-products-manager__field-control input,
.admin-products-manager__field-control select,
.admin-products-manager__field-control textarea {
  width: 100%;
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  font: inherit;
}

.admin-products-manager__field-control input[type='file'] {
  display: block;
  min-height: 46px;
  padding-top: 10px;
  padding-bottom: 10px;
}

.admin-products-manager__field-control textarea {
  min-height: 140px;
  padding: 12px 14px;
  resize: vertical;
}

.admin-products-manager__field-control small,
.admin-products-manager__status {
  color: #666666;
  font-size: 13px;
  line-height: 1.6;
}

.admin-products-manager__discount-preview {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid #e6e6e6;
  background: #f8fafc;
}

.admin-products-manager__discount-preview strong {
  color: #111111;
  font-size: 15px;
}

.admin-products-manager__discount-preview p {
  margin: 0;
  color: #666666;
  font-size: 13px;
  line-height: 1.6;
}

.admin-products-manager__preview {
  display: grid;
  gap: 18px;
}

.admin-products-manager__preview-facts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.admin-products-manager__preview-facts article,
.admin-products-manager__preview-copy article {
  padding: 18px;
  border: 1px solid #e6e6e6;
  background: #ffffff;
}

.admin-products-manager__preview-facts span,
.admin-products-manager__preview-copy span {
  display: block;
  color: #777777;
  font-size: 13px;
}

.admin-products-manager__preview-facts strong,
.admin-products-manager__preview-copy strong {
  display: block;
  margin-top: 10px;
  color: #111111;
  font-size: 20px;
  line-height: 1.35;
}

.admin-products-manager__preview-copy {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.admin-products-manager__form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.admin-products-manager__empty {
  padding-top: 16px;
  color: #666666;
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 1180px) {
  .admin-products-manager__head,
  .admin-products-manager__row,
  .admin-products-manager__preview-facts,
  .admin-products-manager__preview-copy {
    grid-template-columns: 1fr;
  }

  .admin-products-manager__head {
    display: none;
  }
}

@media (max-width: 860px) {
  .admin-products-manager__field-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .admin-products-manager__field-row > span {
    padding-top: 0;
  }
}

@media (max-width: 720px) {
  .admin-products-manager__search {
    width: 100%;
  }

  .admin-products-manager__form-actions {
    flex-direction: column;
  }

  .admin-products-manager__form-actions button {
    width: 100%;
  }
}
</style>
