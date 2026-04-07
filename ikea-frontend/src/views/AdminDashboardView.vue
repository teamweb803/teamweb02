<script setup>
import CommonStatePanel from '../components/common/CommonStatePanel.vue';
import AdminOverviewSection from '../components/admin/AdminOverviewSection.vue';
import AdminShell from '../components/admin/AdminShell.vue';
import { useAdminDashboard } from '../composables/useAdminDashboard';

const { dashboard, loadErrorMessage } = useAdminDashboard();
</script>

<template>
  <AdminShell title="대시보드" description="주요 지표와 운영 상태를 한눈에 확인합니다.">
    <CommonStatePanel
      v-if="loadErrorMessage"
      tone="error"
      title="대시보드 일부 데이터를 불러오지 못했습니다."
      :description="loadErrorMessage"
      align="left"
      layout="boxed"
    />
    <AdminOverviewSection
      :category-chart="dashboard.categoryChart"
      :payment-chart="dashboard.paymentChart"
      :sales-chart="dashboard.salesChart"
      :status-chart="dashboard.statusChart"
      :summary-cards="dashboard.summaryCards"
      :support-chart="dashboard.supportChart"
      :trend-chart="dashboard.trendChart"
    />
  </AdminShell>
</template>
