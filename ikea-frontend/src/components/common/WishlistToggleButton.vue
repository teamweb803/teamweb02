<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'card',
  },
  label: {
    type: String,
    default: '찜',
  },
});

const emit = defineEmits(['toggle']);
</script>

<template>
  <button
    class="wishlist-toggle-button"
    :class="[`wishlist-toggle-button--${variant}`, { 'is-active': active }]"
    type="button"
    :aria-pressed="active"
    :aria-label="active ? `${label} 해제` : `${label} 추가`"
    @click.stop="emit('toggle')"
  >
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20.6L10.5 19.24C5.16 14.42 2 11.57 2 8.08C2 5.23 4.24 3 7.08 3C8.68 3 10.21 3.74 11.2 4.89L12 5.83L12.8 4.89C13.79 3.74 15.32 3 16.92 3C19.76 3 22 5.23 22 8.08C22 11.57 18.84 14.42 13.5 19.24L12 20.6Z"
        :fill="active ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>

<style scoped>
.wishlist-toggle-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0;
  border: 1px solid #d7dbe2;
  background: rgba(255, 255, 255, 0.96);
  color: #a3a3a3;
  cursor: pointer;
}

.wishlist-toggle-button--card {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.wishlist-toggle-button--panel {
  width: 56px;
  height: 56px;
  border-radius: 50%;
}

.wishlist-toggle-button.is-active {
  color: #111111;
}

.wishlist-toggle-button:hover {
  transform: none !important;
}

.wishlist-toggle-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.wishlist-toggle-button svg {
  width: 22px;
  height: 22px;
}
</style>
