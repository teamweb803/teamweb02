<script setup>
import AdminInventoryManager from '../components/admin/AdminInventoryManager.vue';
import AdminShell from '../components/admin/AdminShell.vue';
</script>

<template>
  <AdminShell title="재고 관리" description="상품별 현재 재고와 안전 재고를 한 번에 관리합니다.">
    <AdminInventoryManager />
  </AdminShell>
</template>
