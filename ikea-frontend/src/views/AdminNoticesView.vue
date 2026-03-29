<script setup>
import AdminNoticesManager from '../components/admin/AdminNoticesManager.vue';
import AdminShell from '../components/admin/AdminShell.vue';
</script>

<template>
  <AdminShell
    title="공지 관리"
    description="등록 · 수정 · 삭제"
  >
    <AdminNoticesManager />
  </AdminShell>
</template>
