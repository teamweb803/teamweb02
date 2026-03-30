<script setup>
import { useHomeScrollBehavior } from '../../composables/useHomeScrollBehavior';

const {
  showScrollTopButton,
  scrollToTop,
} = useHomeScrollBehavior({ threshold: 140 });
</script>

<template>
  <Transition name="global-scroll-top">
    <button
      v-if="showScrollTopButton"
      class="global-scroll-top"
      type="button"
      aria-label="페이지 맨 위로 이동"
      @click="scrollToTop"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 17V7" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
        <path d="M7.5 11.5L12 7L16.5 11.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.global-scroll-top {
  position: fixed;
  right: 32px;
  bottom: 34px;
  z-index: 32;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: 1px solid #d7dde5;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: #111111;
  box-shadow: 0 14px 28px rgba(17, 24, 39, 0.1);
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.global-scroll-top svg {
  width: 28px;
  height: 28px;
}

.global-scroll-top-enter-active,
.global-scroll-top-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.global-scroll-top-enter-from,
.global-scroll-top-leave-to {
  opacity: 0;
  transform: translateY(14px);
}

@media (max-width: 720px) {
  .global-scroll-top {
    right: 18px;
    bottom: 22px;
    width: 52px;
    height: 52px;
  }
}
</style>
