import { useFeedbackStore } from '../stores/feedback';

export function useFeedback() {
  const feedbackStore = useFeedbackStore();

  const showToast = (message, options = {}) => feedbackStore.showToast(message, options);
  const showError = (message, options = {}) => feedbackStore.showError(message, options);
  const showSuccess = (message, options = {}) => feedbackStore.showSuccess(message, options);
  const requestConfirm = (options = {}) => feedbackStore.requestConfirm(options);

  return {
    showToast,
    showError,
    showSuccess,
    requestConfirm,
  };
}
