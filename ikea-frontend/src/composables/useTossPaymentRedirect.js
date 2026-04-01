import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  cancelPendingPaymentFlow,
  confirmPendingTossPayment,
  getPendingPayment,
} from './useCommerceCart';
import { ROUTE_PATHS } from '../constants/routes';

function normalizeIdentifier(value) {
  return String(value ?? '').trim();
}

function normalizeNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

export function useTossPaymentRedirect(status = 'success') {
  const route = useRoute();
  const router = useRouter();

  const tone = ref(status === 'success' ? 'loading' : 'error');
  const title = ref('');
  const description = ref('');
  const orderNumber = ref('');
  const actions = ref([]);

  function setViewState(nextTone, nextTitle, nextDescription, nextActions = []) {
    tone.value = nextTone;
    title.value = nextTitle;
    description.value = nextDescription;
    actions.value = nextActions;
  }

  function buildDefaultActions(isRetryVisible = false, isGuestOrder = false) {
    const nextActions = [];

    if (isRetryVisible) {
      nextActions.push({
        label: '다시 확인하기',
        to: route.fullPath,
        variant: 'primary',
      });
    }

    nextActions.push({
      label: isGuestOrder ? '장바구니로 이동' : '마이페이지로 이동',
      to: isGuestOrder ? ROUTE_PATHS.cart : ROUTE_PATHS.memberMyPage,
      variant: isRetryVisible ? 'secondary' : 'primary',
    });
    nextActions.push({
      label: '홈으로 가기',
      to: ROUTE_PATHS.home,
      variant: 'secondary',
    });

    return nextActions;
  }

  onMounted(async () => {
    const pendingPayment = getPendingPayment();
    const isGuestOrder = Boolean(pendingPayment?.orderSnapshot?.isGuestOrder);

    orderNumber.value = normalizeIdentifier(
      pendingPayment?.orderNumber ?? route.query.orderId ?? route.query.orderNumber,
    );

    if (status === 'success') {
      const paymentKey = normalizeIdentifier(route.query.paymentKey);
      const amount = normalizeNumber(
        route.query.amount ?? pendingPayment?.amount ?? pendingPayment?.orderSnapshot?.finalTotal,
        0,
      );
      const resolvedOrderNumber = normalizeIdentifier(
        route.query.orderId ?? route.query.orderNumber ?? pendingPayment?.orderNumber,
      );

      if (!paymentKey || !resolvedOrderNumber || amount <= 0) {
        setViewState(
          'error',
          '토스페이 승인 정보를 찾지 못했습니다.',
          '결제 승인을 다시 확인해 주세요. 문제가 계속되면 주문 상태를 먼저 확인하는 편이 안전합니다.',
          buildDefaultActions(false, isGuestOrder),
        );
        return;
      }

      setViewState(
        'loading',
        '토스페이 결제를 확인하고 있습니다.',
        '승인 결과를 확인한 뒤 주문 완료 화면으로 이동합니다.',
      );

      try {
        const completedOrder = await confirmPendingTossPayment({
          paymentKey,
          orderNo: resolvedOrderNumber,
          amount,
        });

        await router.replace({
          path: ROUTE_PATHS.orderComplete,
          query: {
            orderNumber: completedOrder.orderNumber,
            orderType: completedOrder.isGuestOrder ? 'guest' : 'member',
          },
        });
      } catch (error) {
        setViewState(
          'error',
          '토스페이 결제를 완료하지 못했습니다.',
          error?.message ?? '결제 승인 처리 중 문제가 생겼습니다. 주문 상태를 다시 확인해 주세요.',
          buildDefaultActions(true, isGuestOrder),
        );
      }

      return;
    }

    await cancelPendingPaymentFlow();
    setViewState(
      'error',
      '토스페이 결제를 완료하지 못했습니다.',
      normalizeIdentifier(route.query.message)
        || '결제 승인 과정에서 문제가 생겨 주문을 마치지 못했습니다. 결제 수단과 주문 정보를 다시 확인해 주세요.',
      buildDefaultActions(false, isGuestOrder),
    );
  });

  const hasOrderNumber = computed(() => Boolean(orderNumber.value));

  return {
    actions,
    description,
    hasOrderNumber,
    orderNumber,
    title,
    tone,
  };
}
