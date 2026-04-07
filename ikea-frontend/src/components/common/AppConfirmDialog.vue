<script setup>
import { storeToRefs } from 'pinia';
import { useFeedbackStore } from '../../stores/feedback';

const feedbackStore = useFeedbackStore();
const { confirmState } = storeToRefs(feedbackStore);

function handleConfirm() {
  feedbackStore.confirm();
}

function handleCancel() {
  feedbackStore.cancel();
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="confirmState.open"
      class="app-confirm-dialog__overlay"
      @click.self="handleCancel"
    >
      <section
        class="app-confirm-dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="confirmState.title"
      >
        <strong>{{ confirmState.title }}</strong>
        <p>{{ confirmState.message }}</p>
        <div class="app-confirm-dialog__actions">
          <button type="button" class="app-confirm-dialog__button" @click="handleCancel">
            {{ confirmState.cancelLabel }}
          </button>
          <button
            type="button"
            class="app-confirm-dialog__button app-confirm-dialog__button--primary"
            @click="handleConfirm"
          >
            {{ confirmState.confirmLabel }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.app-confirm-dialog__overlay {
  position: fixed;
  inset: 0;
  z-index: 230;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(17, 24, 39, 0.52);
}

.app-confirm-dialog {
  width: min(420px, 100%);
  display: grid;
  gap: 16px;
  padding: 24px;
  background: #ffffff;
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.2);
}

.app-confirm-dialog strong {
  color: #111827;
  font-size: 20px;
  line-height: 1.35;
}

.app-confirm-dialog p {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-line;
}

.app-confirm-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.app-confirm-dialog__button {
  min-width: 88px;
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #111827;
  cursor: pointer;
}

.app-confirm-dialog__button--primary {
  border-color: #111827;
  background: #111827;
  color: #ffffff;
}

@media (max-width: 640px) {
  .app-confirm-dialog__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .app-confirm-dialog__button {
    width: 100%;
  }
}
</style>
