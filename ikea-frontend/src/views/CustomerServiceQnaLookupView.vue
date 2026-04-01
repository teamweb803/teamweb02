<script setup>
import CustomerServiceShell from '../components/customer-service/CustomerServiceShell.vue';
import GuestQnaLookupPanel from '../components/customer-service/GuestQnaLookupPanel.vue';
</script>

<template>
  <CustomerServiceShell title="비회원 문의 조회" current-section="qna">
    <GuestQnaLookupPanel />
  </CustomerServiceShell>
</template>
