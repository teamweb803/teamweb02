<script setup>
import { computed } from 'vue';
import LegalDocumentShell from '../components/legal/LegalDocumentShell.vue';
import {
  LEGAL_DOCUMENTS,
  LEGAL_NAV_ITEMS,
} from '../data/legalDocuments';

const props = defineProps({
  documentId: {
    type: String,
    required: true,
  },
});

const currentDocument = computed(
  () => LEGAL_DOCUMENTS[props.documentId] ?? LEGAL_DOCUMENTS.terms,
);
</script>

<template>
  <LegalDocumentShell
    :current-id="currentDocument.id"
    :document="currentDocument"
    :nav-items="LEGAL_NAV_ITEMS"
  />
</template>
