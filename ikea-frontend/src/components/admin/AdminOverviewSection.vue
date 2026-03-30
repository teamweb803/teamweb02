<script setup>
import AdminBreakdownBars from './AdminBreakdownBars.vue';
import AdminCompletionCard from './AdminCompletionCard.vue';
import AdminDonutChart from './AdminDonutChart.vue';
import AdminLineChart from './AdminLineChart.vue';
import AdminMetricCard from './AdminMetricCard.vue';
import AdminPanel from './AdminPanel.vue';
import AdminSegmentedBarChart from './AdminSegmentedBarChart.vue';

defineProps({
  categoryChart: {
    type: Object,
    required: true,
  },
  paymentChart: {
    type: Object,
    required: true,
  },
  salesChart: {
    type: Object,
    required: true,
  },
  statusChart: {
    type: Object,
    required: true,
  },
  summaryCards: {
    type: Array,
    default: () => [],
  },
  supportChart: {
    type: Object,
    required: true,
  },
  trendChart: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <section class="admin-overview-section">
    <div class="admin-overview-section__metrics">
      <AdminMetricCard
        v-for="card in summaryCards"
        :key="card.id"
        :label="card.label"
        :value="card.value"
      />
    </div>

    <div class="admin-overview-section__grid admin-overview-section__grid--donuts">
      <AdminPanel title="주문 추이">
        <AdminLineChart :chart="trendChart" />
      </AdminPanel>

      <AdminPanel title="매출 추이">
        <AdminLineChart :chart="salesChart" />
      </AdminPanel>
    </div>

    <div class="admin-overview-section__grid admin-overview-section__grid--charts">
      <AdminPanel title="카테고리 비중">
        <AdminDonutChart
          :chart="categoryChart"
          :legend-rows="Math.max((categoryChart.segments ?? []).length, (statusChart.segments ?? []).length)"
        />
      </AdminPanel>

      <AdminPanel title="주문 상태">
        <AdminSegmentedBarChart :chart="statusChart" />
      </AdminPanel>
    </div>

    <div class="admin-overview-section__grid admin-overview-section__grid--mixed">
      <AdminPanel title="결제 수단 비중">
        <AdminBreakdownBars :chart="paymentChart" />
      </AdminPanel>

      <AdminPanel title="문의 처리 현황">
        <AdminCompletionCard :chart="supportChart" />
      </AdminPanel>
    </div>
  </section>
</template>

<style scoped>
.admin-overview-section {
  display: grid;
  gap: 24px;
}

.admin-overview-section__metrics,
.admin-overview-section__grid {
  display: grid;
  gap: 18px;
}

.admin-overview-section__metrics {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.admin-overview-section__grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.admin-overview-section__grid--donuts {
  align-items: stretch;
}

.admin-overview-section__grid--donuts :deep(.admin-panel) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.admin-overview-section__grid--donuts :deep(.admin-panel__body) {
  display: flex;
  flex: 1;
  align-items: center;
}

.admin-overview-section__grid--donuts :deep(.admin-panel__body > *) {
  width: 100%;
}

.admin-overview-section__grid--mixed {
  align-items: stretch;
}

.admin-overview-section__grid--mixed :deep(.admin-panel) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.admin-overview-section__grid--mixed :deep(.admin-panel__body) {
  display: flex;
  flex: 1;
}

.admin-overview-section__grid--mixed :deep(.admin-panel__body > *) {
  width: 100%;
}

@media (max-width: 900px) {
  .admin-overview-section__metrics,
  .admin-overview-section__grid {
    grid-template-columns: 1fr;
  }
}
</style>
