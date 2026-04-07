<script setup>
defineProps({
  formState: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update-field']);

function updateField(field, value) {
  emit('update-field', { field, value });
}
</script>

<template>
  <section class="admin-products-manager__section">
    <header class="admin-products-manager__section-head">
      <h3>상세 콘텐츠</h3>
    </header>

    <div class="admin-products-manager__form-grid">
      <label class="admin-products-manager__field-row">
        <span>상단 소개</span>
        <div class="admin-products-manager__field-control">
          <textarea :value="formState.heroHook" rows="3" @input="updateField('heroHook', $event.target.value)" />
        </div>
      </label>

      <label class="admin-products-manager__field-row">
        <span>상세 설명</span>
        <div class="admin-products-manager__field-control">
          <textarea
            :value="formState.descriptionText"
            rows="6"
            placeholder="한 줄에 한 문단씩 입력"
            @input="updateField('descriptionText', $event.target.value)"
          />
        </div>
      </label>

      <label class="admin-products-manager__field-row">
        <span>핵심 포인트</span>
        <div class="admin-products-manager__field-control">
          <textarea
            :value="formState.highlightsText"
            rows="5"
            placeholder="한 줄에 한 항목씩 입력"
            @input="updateField('highlightsText', $event.target.value)"
          />
        </div>
      </label>

      <label class="admin-products-manager__field-row">
        <span>치수 정보</span>
        <div class="admin-products-manager__field-control">
          <textarea
            :value="formState.measurementsText"
            rows="5"
            placeholder="예: 폭: 140 cm"
            @input="updateField('measurementsText', $event.target.value)"
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

.admin-products-manager__field-control {
  display: grid;
  gap: 8px;
}

.admin-products-manager__field-control textarea {
  width: 100%;
  min-height: 140px;
  padding: 12px 14px;
  border: 1px solid var(--border-default);
  background: var(--surface-strong);
  font: inherit;
  resize: vertical;
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
