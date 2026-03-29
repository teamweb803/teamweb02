<script setup>
import AdminReviewsManager from '../components/admin/AdminReviewsManager.vue';
import AdminShell from '../components/admin/AdminShell.vue';
</script>

<template>
  <AdminShell
    title="리뷰 관리"
    description="검토 · 삭제"
  >
    <AdminReviewsManager />
  </AdminShell>
</template>
