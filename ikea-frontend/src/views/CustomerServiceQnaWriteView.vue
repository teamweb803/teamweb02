<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import CustomerQnaWriteForm from '../components/customer-service/CustomerQnaWriteForm.vue';
import CustomerServiceShell from '../components/customer-service/CustomerServiceShell.vue';

const route = useRoute();
const pageTitle = computed(() => (route.query.editId ? 'QnA 수정' : 'QnA 작성'));
</script>

<template>
  <CustomerServiceShell :title="pageTitle" current-section="qna">
    <CustomerQnaWriteForm />
  </CustomerServiceShell>
</template>
