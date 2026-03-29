<script setup>
import CustomerQnaWriteForm from '../components/customer-service/CustomerQnaWriteForm.vue';
import CustomerServiceShell from '../components/customer-service/CustomerServiceShell.vue';
</script>

<template>
  <CustomerServiceShell title="QnA 작성" current-section="qna">
    <CustomerQnaWriteForm />
  </CustomerServiceShell>
</template>
