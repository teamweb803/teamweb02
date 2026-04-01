<script setup>
import { storeToRefs } from 'pinia';
import { useFeedbackStore } from '../../stores/feedback';

const feedbackStore = useFeedbackStore();
const { toasts } = storeToRefs(feedbackStore);

function dismissToast(toastId) {
  feedbackStore.dismissToast(toastId);
}
</script>

<template>
  <Teleport to="body">
    <div v-if="toasts.length" class="app-toast-layer" aria-live="polite" aria-atomic="true">
      <article
        v-for="toast in toasts"
        :key="toast.id"
        class="app-toast-layer__item"
        :class="`app-toast-layer__item--${toast.tone}`"
      >
        <p>{{ toast.message }}</p>
        <button type="button" aria-label="닫기" @click="dismissToast(toast.id)">×</button>
      </article>
    </div>
  </Teleport>
</template>

<style scoped>
.app-toast-layer {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 220;
  display: grid;
  gap: 10px;
  width: min(360px, calc(100vw - 28px));
}

.app-toast-layer__item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  padding: 14px 16px;
  border: 1px solid #d8dde5;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
}

.app-toast-layer__item--info {
  border-color: #d6e5f4;
}

.app-toast-layer__item--success {
  border-color: #cfe5d6;
  background: #f7fcf8;
}

.app-toast-layer__item--error {
  border-color: #f0d4d4;
  background: #fff8f8;
}

.app-toast-layer__item p {
  margin: 0;
  color: #111827;
  font-size: 14px;
  line-height: 1.6;
}

.app-toast-layer__item button {
  border: 0;
  background: transparent;
  color: #6b7280;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

@media (max-width: 640px) {
  .app-toast-layer {
    top: auto;
    right: 14px;
    bottom: 18px;
    left: 14px;
    width: auto;
  }
}
</style>
