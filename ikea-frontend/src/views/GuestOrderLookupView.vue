<script setup>
import CustomerServiceShell from '../components/customer-service/CustomerServiceShell.vue';
import GuestOrderLookupPanel from '../components/customer-service/GuestOrderLookupPanel.vue';
</script>

<template>
  <CustomerServiceShell title="비회원 주문조회" current-section="qna">
    <GuestOrderLookupPanel />
  </CustomerServiceShell>
</template>
