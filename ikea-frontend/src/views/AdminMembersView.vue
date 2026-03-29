<script setup>
import AdminMembersManager from '../components/admin/AdminMembersManager.vue';
import AdminShell from '../components/admin/AdminShell.vue';
</script>

<template>
  <AdminShell
    title="회원 관리"
    description="검색 · 상세 · 권한"
  >
    <AdminMembersManager />
  </AdminShell>
</template>
