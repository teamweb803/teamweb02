<script setup>
import AdminOverviewSection from '../components/admin/AdminOverviewSection.vue';
import AdminShell from '../components/admin/AdminShell.vue';
import { useAdminDashboard } from '../composables/useAdminDashboard';

const { dashboard } = useAdminDashboard();
</script>

<template>
  <AdminShell title="대시보드" description="주요 지표와 운영 상태를 한눈에 확인합니다.">
    <AdminOverviewSection
      :category-chart="dashboard.categoryChart"
      :payment-chart="dashboard.paymentChart"
      :qna-rows="dashboard.qnaRows"
      :review-rows="dashboard.reviewRows"
      :sales-chart="dashboard.salesChart"
      :status-chart="dashboard.statusChart"
      :stock-rows="dashboard.stockRows"
      :summary-cards="dashboard.summaryCards"
      :support-chart="dashboard.supportChart"
      :trend-chart="dashboard.trendChart"
      :watch-products="dashboard.watchProducts"
    />
  </AdminShell>
</template>
