<script setup>
import AppConfirmDialog from './components/common/AppConfirmDialog.vue';
import AppToastLayer from './components/common/AppToastLayer.vue';
import WishlistLoginPromptDialog from './components/common/WishlistLoginPromptDialog.vue';
import WishlistToastLayer from './components/common/WishlistToastLayer.vue';
import GlobalScrollTopButton from './components/layout/GlobalScrollTopButton.vue';
</script>

<template>
  <router-view />
  <GlobalScrollTopButton />
  <AppToastLayer />
  <WishlistToastLayer />
  <WishlistLoginPromptDialog />
  <AppConfirmDialog />
</template>
