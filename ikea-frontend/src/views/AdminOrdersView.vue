<script setup>
import AdminOrdersManager from '../components/admin/AdminOrdersManager.vue';
import AdminShell from '../components/admin/AdminShell.vue';
</script>

<template>
  <AdminShell
    title="주문 관리"
    description="상태 변경"
  >
    <AdminOrdersManager />
  </AdminShell>
</template>
