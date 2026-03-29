<script setup>
import { useTemplateRef } from 'vue';
import { useStickyHeaderOffset } from '../../composables/useStickyHeaderOffset';
import HomeFooter from './HomeFooter.vue';
import SiteHeader from './SiteHeader.vue';

const headerRef = useTemplateRef('headerRef');

function getHeaderElement() {
  return headerRef.value?.getHeaderElement?.() ?? null;
}

const { stickyOffset } = useStickyHeaderOffset(getHeaderElement);
</script>

<template>
  <div class="ikea-shell" :style="{ '--hs-sticky-offset': stickyOffset }">
    <SiteHeader ref="headerRef" />
    <slot />
    <HomeFooter />
  </div>
</template>

<style scoped>
.ikea-shell {
  --hs-blue: #0058a3;
  --hs-yellow: #ffdb00;
  --hs-ink: #111827;
  --hs-muted: #6b7280;
  --hs-line: #e5e7eb;
  --hs-soft: #f5f7fa;
  --hs-sticky-offset: 96px;
  min-height: 100vh;
  background: #ffffff;
  color: var(--hs-ink);
}
</style>
