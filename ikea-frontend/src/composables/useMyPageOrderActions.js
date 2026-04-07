import { shallowRef } from 'vue';
import { canCancelOrder, canCancelPayment } from '../constants/orderStatus';
import { cancelMemberOrder } from '../services/orderService';
import { cancelPayment } from '../services/paymentService';
import { useFeedback } from './useFeedback';
import { useMyPageStore } from '../stores/myPage';
import { resolveOrderActionErrorMessage } from '../utils/apiErrorMessage';

const DEFAULT_PAYMENT_CANCEL_REASON = '사용자 요청으로 결제를 취소했습니다.';

function createOrderActionKey(order = {}) {
  return [order.orderId, order.orderItemId ?? order.id]
    .map((value) => String(value ?? '').trim())
    .join(':');
}

function resolveOrderActionType(order = {}) {
  if (canCancelOrder(order.statusCode ?? order.status)) {
    return 'order';
  }

  if (canCancelPayment(order.statusCode ?? order.status)) {
    return 'payment';
  }

  return '';
}

function buildConfirmOptions(order = {}, actionType = '') {
  const orderNumber = String(order.orderNumber ?? '').trim();

  if (actionType === 'payment') {
    return {
      title: '결제 취소',
      message: [
        orderNumber ? `${orderNumber} 결제를 취소할까요?` : '결제를 취소할까요?',
        '',
        '취소가 완료되면 주문 상태도 함께 변경됩니다.',
      ].join('\n'),
      confirmLabel: '결제 취소',
    };
  }

  return {
    title: '주문 취소',
    message: [
      orderNumber ? `${orderNumber} 주문을 취소할까요?` : '주문을 취소할까요?',
      '',
      '결제 대기 상태에서만 주문 취소가 가능합니다.',
    ].join('\n'),
    confirmLabel: '주문 취소',
  };
}

export function useMyPageOrderActions() {
  const myPageStore = useMyPageStore();
  const { requestConfirm } = useFeedback();
  const statusMessage = shallowRef('');
  const statusTone = shallowRef('neutral');
  const submittingOrderKey = shallowRef('');
  const isSubmitting = shallowRef(false);

  function clearStatus() {
    statusMessage.value = '';
    statusTone.value = 'neutral';
  }

  function shouldShowAction(order) {
    return Boolean(resolveOrderActionType(order));
  }

  function isActionPending(order) {
    return isSubmitting.value && submittingOrderKey.value === createOrderActionKey(order);
  }

  function getActionLabel(order) {
    const actionType = resolveOrderActionType(order);

    if (!actionType) {
      return '';
    }

    if (isActionPending(order)) {
      return '처리 중';
    }

    return actionType === 'payment' ? '결제 취소' : '주문 취소';
  }

  async function requestAction(order) {
    const actionType = resolveOrderActionType(order);

    if (!actionType || isSubmitting.value) {
      return false;
    }

    const confirmed = await requestConfirm(buildConfirmOptions(order, actionType));

    if (!confirmed) {
      return false;
    }

    isSubmitting.value = true;
    submittingOrderKey.value = createOrderActionKey(order);
    clearStatus();

    try {
      if (actionType === 'payment') {
        await cancelPayment(Number(order.orderId), DEFAULT_PAYMENT_CANCEL_REASON);
        statusMessage.value = '결제를 취소했습니다.';
      } else {
        await cancelMemberOrder(Number(order.orderId));
        statusMessage.value = '주문을 취소했습니다.';
      }

      statusTone.value = 'success';
      await myPageStore.loadProfile();
      return true;
    } catch (error) {
      statusMessage.value = resolveOrderActionErrorMessage(
        error,
        actionType === 'payment' ? '결제 취소' : '주문 취소',
        actionType === 'payment' ? '결제 취소에 실패했습니다.' : '주문 취소에 실패했습니다.',
      );
      statusTone.value = 'error';
      return false;
    } finally {
      isSubmitting.value = false;
      submittingOrderKey.value = '';
    }
  }

  return {
    clearStatus,
    getActionLabel,
    isActionPending,
    requestAction,
    shouldShowAction,
    statusMessage,
    statusTone,
  };
}
