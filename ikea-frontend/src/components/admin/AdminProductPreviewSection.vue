<script setup>
defineProps({
  previewQuickFacts: {
    type: Array,
    required: true,
  },
  previewOptionCopy: {
    type: String,
    default: '',
  },
  previewDeliveryCopy: {
    type: String,
    required: true,
  },
});
</script>

<template>
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
  border: 1px solid var(--border-soft);
  background: var(--surface-strong);
}

.admin-products-manager__preview-facts span,
.admin-products-manager__preview-copy span {
  display: block;
  color: var(--text-muted);
  font-size: 13px;
}

.admin-products-manager__preview-facts strong,
.admin-products-manager__preview-copy strong {
  display: block;
  margin-top: 10px;
  color: var(--text-strong);
  font-size: 20px;
  line-height: 1.35;
}

.admin-products-manager__preview-copy {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 1180px) {
  .admin-products-manager__preview-facts,
  .admin-products-manager__preview-copy {
    grid-template-columns: 1fr;
  }
}
</style>
