import { defineStore } from 'pinia';

let toastSequence = 0;
let confirmResolver = null;
const toastTimers = new Map();

function createDefaultConfirmState() {
  return {
    open: false,
    title: '확인',
    message: '',
    confirmLabel: '확인',
    cancelLabel: '취소',
  };
}

export const useFeedbackStore = defineStore('feedback', {
  state: () => ({
    toasts: [],
    confirmState: createDefaultConfirmState(),
  }),
  actions: {
    showToast(message, options = {}) {
      const resolvedMessage = String(message ?? '').trim();

      if (!resolvedMessage) {
        return '';
      }

      const toast = {
        id: `feedback-toast-${Date.now()}-${++toastSequence}`,
        message: resolvedMessage,
        tone: options.tone ?? 'info',
      };
      const duration = Number(options.duration ?? 3200);

      this.toasts.push(toast);

      if (duration > 0 && typeof window !== 'undefined') {
        const timerId = window.setTimeout(() => {
          this.dismissToast(toast.id);
        }, duration);

        toastTimers.set(toast.id, timerId);
      }

      return toast.id;
    },
    showError(message, options = {}) {
      return this.showToast(message, {
        ...options,
        tone: 'error',
      });
    },
    showSuccess(message, options = {}) {
      return this.showToast(message, {
        ...options,
        tone: 'success',
      });
    },
    dismissToast(toastId) {
      if (!toastId) {
        return;
      }

      const timerId = toastTimers.get(toastId);

      if (timerId) {
        window.clearTimeout(timerId);
        toastTimers.delete(toastId);
      }

      this.toasts = this.toasts.filter((toast) => toast.id !== toastId);
    },
    requestConfirm(options = {}) {
      if (confirmResolver) {
        confirmResolver(false);
        confirmResolver = null;
      }

      this.confirmState = {
        open: true,
        title: String(options.title ?? '').trim() || '확인',
        message: String(options.message ?? '').trim(),
        confirmLabel: String(options.confirmLabel ?? '').trim() || '확인',
        cancelLabel: String(options.cancelLabel ?? '').trim() || '취소',
      };

      return new Promise((resolve) => {
        confirmResolver = resolve;
      });
    },
    confirm() {
      this.resolveConfirm(true);
    },
    cancel() {
      this.resolveConfirm(false);
    },
    resolveConfirm(result) {
      if (confirmResolver) {
        confirmResolver(result);
        confirmResolver = null;
      }

      this.confirmState = createDefaultConfirmState();
    },
  },
});
