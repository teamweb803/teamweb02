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
  qnaRows: {
    type: Array,
    default: () => [],
  },
  paymentChart: {
    type: Object,
    required: true,
  },
  reviewRows: {
    type: Array,
    default: () => [],
  },
  salesChart: {
    type: Object,
    required: true,
  },
  statusChart: {
    type: Object,
    required: true,
  },
  stockRows: {
    type: Array,
    default: () => [],
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
  watchProducts: {
    type: Array,
    default: () => [],
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

    <div class="admin-overview-section__grid">
      <AdminPanel title="재고 주의 상품">
        <div class="admin-overview-section__stock-list">
          <article
            v-for="item in stockRows"
            :key="item.id"
            class="admin-overview-section__stock-row"
          >
            <div class="admin-overview-section__copy">
              <strong>{{ item.title }}</strong>
              <span>{{ item.categoryName }}</span>
            </div>
            <b :class="`is-${item.stockState}`">{{ item.stockLabel }}</b>
          </article>
        </div>
      </AdminPanel>

      <AdminPanel title="주목 상품">
        <div class="admin-overview-section__watch-list">
          <RouterLink
            v-for="item in watchProducts.slice(0, 4)"
            :key="item.id"
            :to="item.to"
            class="admin-overview-section__watch-row"
          >
            <img :src="item.image" :alt="item.title" />
            <div class="admin-overview-section__copy">
              <span>{{ item.brand }}</span>
              <strong>{{ item.title }}</strong>
            </div>
          </RouterLink>
        </div>
      </AdminPanel>
    </div>

    <div class="admin-overview-section__grid">
      <AdminPanel title="최근 문의">
        <div class="admin-overview-section__simple-list">
          <article v-for="item in qnaRows.slice(0, 5)" :key="item.id" class="admin-overview-section__simple-row">
            <div class="admin-overview-section__copy">
              <strong>{{ item.title }}</strong>
              <span>{{ item.status }}</span>
            </div>
            <b>{{ item.date }}</b>
          </article>
        </div>
      </AdminPanel>

      <AdminPanel title="최근 리뷰">
        <div class="admin-overview-section__simple-list">
          <article v-for="item in reviewRows.slice(0, 5)" :key="item.id" class="admin-overview-section__simple-row">
            <div class="admin-overview-section__copy">
              <strong>{{ item.productName }}</strong>
              <span>{{ item.rating }}</span>
            </div>
            <b>{{ item.date }}</b>
          </article>
        </div>
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

.admin-overview-section__simple-list,
.admin-overview-section__watch-list,
.admin-overview-section__stock-list {
  display: grid;
}

.admin-overview-section__simple-row,
.admin-overview-section__watch-row,
.admin-overview-section__stock-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #efefef;
}

.admin-overview-section__watch-row {
  grid-template-columns: 76px minmax(0, 1fr);
  color: inherit;
  text-decoration: none;
}

.admin-overview-section__watch-row img {
  width: 76px;
  height: 76px;
  object-fit: cover;
  border: 1px solid #efefef;
  background: #f8f8f8;
}

.admin-overview-section__copy {
  min-width: 0;
}

.admin-overview-section__copy span {
  display: block;
  color: #777777;
  font-size: 13px;
}

.admin-overview-section__copy strong {
  display: block;
  margin-top: 6px;
  color: #111111;
  font-size: 15px;
  line-height: 1.45;
}

.admin-overview-section__stock-row b,
.admin-overview-section__simple-row b {
  color: #111111;
  font-size: 14px;
  font-weight: 700;
}

.admin-overview-section__stock-row b.is-critical {
  color: #cf4a4a;
}

.admin-overview-section__stock-row b.is-warning {
  color: #c87a12;
}

.admin-overview-section__stock-row b.is-stable {
  color: #28663f;
}

@media (max-width: 900px) {
  .admin-overview-section__metrics,
  .admin-overview-section__grid {
    grid-template-columns: 1fr;
  }
}
</style>
