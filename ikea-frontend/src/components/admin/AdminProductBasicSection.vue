<script setup>
defineProps({
  formState: {
    type: Object,
    required: true,
  },
  categories: {
    type: Array,
    required: true,
  },
  subtypeOptions: {
    type: Array,
    required: true,
  },
  badgeOptions: {
    type: Array,
    required: true,
  },
  visibleAttributeFields: {
    type: Array,
    required: true,
  },
  discountRatePreview: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['update-field', 'update-attribute']);

function updateField(field, value) {
  emit('update-field', { field, value });
}

function updateNumberField(field, value) {
  emit('update-field', {
    field,
    value: value === '' ? '' : Number(value),
  });
}

function updateAttribute(fieldId, value) {
  emit('update-attribute', { fieldId, value });
}
</script>

<template>
  <section class="admin-products-manager__section">
    <header class="admin-products-manager__section-head">
      <h3>기본 정보</h3>
    </header>

    <div class="admin-products-manager__form-grid">
      <label class="admin-products-manager__field-row">
        <span>상품명</span>
        <div class="admin-products-manager__field-control">
          <input :value="formState.name" type="text" maxlength="80" @input="updateField('name', $event.target.value)" />
        </div>
      </label>

      <label class="admin-products-manager__field-row">
        <span>브랜드</span>
        <div class="admin-products-manager__field-control">
          <input :value="formState.brand" type="text" maxlength="30" @input="updateField('brand', $event.target.value)" />
        </div>
      </label>

      <label class="admin-products-manager__field-row">
        <span>가격</span>
        <div class="admin-products-manager__field-control">
          <input :value="formState.price" type="number" min="0" step="100" @input="updateNumberField('price', $event.target.value)" />
        </div>
      </label>

      <label class="admin-products-manager__field-row">
        <span>정가</span>
        <div class="admin-products-manager__field-control">
          <input :value="formState.originalPrice" type="number" min="0" step="100" @input="updateNumberField('originalPrice', $event.target.value)" />
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
          <select :value="formState.categoryId" @change="updateField('categoryId', $event.target.value)">
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
          <select :value="formState.typeSlug" @change="updateField('typeSlug', $event.target.value)">
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
          <select :value="formState.badge" @change="updateField('badge', $event.target.value)">
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
            :value="formState.attributes[field.id]"
            type="text"
            :placeholder="field.placeholder"
            @input="updateAttribute(field.id, $event.target.value)"
          />
        </div>
      </label>
    </div>
  </section>
</template>

<style scoped>
.admin-products-manager__section {
  display: grid;
  gap: 16px;
}

.admin-products-manager__section-head {
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-subtle);
}

.admin-products-manager__section-head h3 {
  margin: 0;
  color: var(--text-strong);
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

.admin-products-manager__field-row > span {
  padding-top: 12px;
  color: var(--text-secondary);
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

.admin-products-manager__field-control input,
.admin-products-manager__field-control select {
  width: 100%;
  min-height: var(--control-height);
  padding: 0 14px;
  border: 1px solid var(--border-default);
  background: var(--surface-strong);
  font: inherit;
}

.admin-products-manager__discount-preview {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid var(--border-soft);
  background: var(--surface-muted);
}

.admin-products-manager__discount-preview strong {
  color: var(--text-strong);
  font-size: 15px;
}

.admin-products-manager__discount-preview p {
  margin: 0;
  color: var(--text-muted-strong);
  font-size: 13px;
  line-height: 1.6;
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
</style>
