<script setup>
import { storeToRefs } from 'pinia';
import { useWishlistStore } from '../../stores/wishlist';

const wishlistStore = useWishlistStore();
const { toastMessage, toastOpen, toastTone } = storeToRefs(wishlistStore);
</script>

<template>
  <Teleport to="body">
    <Transition name="wishlist-toast">
      <div v-if="toastOpen" class="wishlist-toast-layer" aria-live="polite" aria-atomic="true">
        <article class="wishlist-toast-layer__item" :class="`wishlist-toast-layer__item--${toastTone}`">
          <p>{{ toastMessage }}</p>
        </article>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.wishlist-toast-layer {
  position: fixed;
  right: 20px;
  bottom: 28px;
  left: 20px;
  z-index: 181;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.wishlist-toast-layer__item {
  min-width: 240px;
  max-width: min(360px, calc(100vw - 40px));
  padding: 14px 18px;
  border: 1px solid rgba(17, 17, 17, 0.12);
  background: rgba(17, 17, 17, 0.92);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
  color: #ffffff;
  text-align: center;
}

.wishlist-toast-layer__item--removed {
  background: rgba(35, 35, 35, 0.92);
}

.wishlist-toast-layer__item p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.wishlist-toast-enter-active,
.wishlist-toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.wishlist-toast-enter-from,
.wishlist-toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 640px) {
  .wishlist-toast-layer {
    right: 14px;
    bottom: 20px;
    left: 14px;
  }

  .wishlist-toast-layer__item {
    width: 100%;
    max-width: none;
  }
}
</style>
