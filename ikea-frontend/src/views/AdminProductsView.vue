<script setup>
import AdminProductsManager from '../components/admin/AdminProductsManager.vue';
import AdminShell from '../components/admin/AdminShell.vue';
</script>

<template>
  <AdminShell title="상품 관리" description="등록 · 수정 · 삭제">
    <AdminProductsManager />
  </AdminShell>
</template>
