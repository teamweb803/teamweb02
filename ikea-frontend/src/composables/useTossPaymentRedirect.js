import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  cancelPendingPaymentFlow,
  confirmPendingTossPayment,
  getPendingPayment,
} from './useCommerceCart';
import { ROUTE_PATHS } from '../constants/routes';
import { useAccountStore } from '../stores/account';
import { resolvePaymentApprovalErrorMessage } from '../utils/apiErrorMessage';
import { buildGuestOrderLookupQuery } from '../utils/guestOrderLookup';

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
  const accountStore = useAccountStore();

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

  function buildGuestLookupDestination(orderNumber = '', buyerName = '') {
    return {
      path: ROUTE_PATHS.guestOrderLookup,
      query: buildGuestOrderLookupQuery({
        inquiryType: 'order',
        buyerName,
        orderNumber,
      }),
    };
  }

  function buildDefaultActions({
    isRetryVisible = false,
    isGuestOrder = false,
    orderNumber: nextOrderNumber = '',
    buyerName = '',
  } = {}) {
    const nextActions = [];

    if (isRetryVisible) {
      nextActions.push({
        label: '다시 확인하기',
        to: route.fullPath,
        variant: 'primary',
      });
    }

    if (isGuestOrder && nextOrderNumber) {
      nextActions.push({
        label: '비회원 주문 조회',
        to: buildGuestLookupDestination(nextOrderNumber, buyerName),
        variant: isRetryVisible ? 'secondary' : 'primary',
      });
    } else {
      nextActions.push({
        label: isGuestOrder ? '장바구니로 이동' : '마이페이지로 이동',
        to: isGuestOrder ? ROUTE_PATHS.cart : ROUTE_PATHS.memberMyPage,
        variant: isRetryVisible ? 'secondary' : 'primary',
      });
    }

    nextActions.push({
      label: '홈으로 가기',
      to: ROUTE_PATHS.home,
      variant: 'secondary',
    });

    return nextActions;
  }

  function resolveGuestOrderState(paymentSnapshot = null) {
    if (paymentSnapshot?.orderSnapshot?.isGuestOrder !== undefined) {
      return Boolean(paymentSnapshot.orderSnapshot.isGuestOrder);
    }

    accountStore.hydrate();
    return !Boolean(accountStore.accessToken);
  }

  onMounted(async () => {
    accountStore.hydrate();
    const pendingPayment = getPendingPayment();
    const isGuestOrder = resolveGuestOrderState(pendingPayment);
    const guestBuyerName = normalizeIdentifier(
      pendingPayment?.orderSnapshot?.ordererName
      ?? pendingPayment?.orderSnapshot?.guestName,
    );

    orderNumber.value = normalizeIdentifier(
      pendingPayment?.orderNumber ?? route.query.orderId ?? route.query.orderNumber,
    );

    if (status === 'success') {
      const paymentKey = normalizeIdentifier(route.query.paymentKey);
      const amount = normalizeNumber(
        route.query.amount ?? pendingPayment?.amount ?? pendingPayment?.orderSnapshot?.finalTotal,
        0,
      );
      const routeOrderIdentifier = normalizeIdentifier(
        route.query.orderId ?? route.query.orderNo ?? route.query.orderNumber,
      );

      if (!pendingPayment || pendingPayment.provider !== 'tosspay') {
        setViewState(
          'error',
          '토스페이 결제 정보를 다시 확인해 주세요.',
          '현재 브라우저에서 진행 중인 토스페이 주문 정보를 찾지 못했습니다. 주문 상태를 먼저 확인한 뒤 다시 진행해 주세요.',
          buildDefaultActions({
            isGuestOrder,
            orderNumber: orderNumber.value,
            buyerName: guestBuyerName,
          }),
        );
        return;
      }

      if (!paymentKey || (!routeOrderIdentifier && !pendingPayment?.orderNumber) || amount <= 0) {
        setViewState(
          'error',
          '토스페이 승인 정보를 찾지 못했습니다.',
          '결제 승인을 다시 확인해 주세요. 문제가 계속되면 주문 상태를 먼저 확인하는 편이 안전합니다.',
          buildDefaultActions({
            isGuestOrder,
            orderNumber: orderNumber.value,
            buyerName: guestBuyerName,
          }),
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
          orderId: route.query.orderId,
          orderNo: route.query.orderNo,
          orderNumber: route.query.orderNumber,
          amount,
        });

        await router.replace({
          path: ROUTE_PATHS.orderComplete,
          query: {
            orderNumber: completedOrder.orderNumber,
            orderType: completedOrder.isGuestOrder ? 'guest' : 'member',
            ...(completedOrder.isGuestOrder
              ? {
                buyerName: normalizeIdentifier(
                  completedOrder.ordererName ?? guestBuyerName,
                ),
              }
              : {}),
          },
        });
      } catch (error) {
        setViewState(
          'error',
          '토스페이 결제를 완료하지 못했습니다.',
          resolvePaymentApprovalErrorMessage(error, '토스페이'),
          buildDefaultActions({
            isRetryVisible: true,
            isGuestOrder,
            orderNumber: orderNumber.value,
            buyerName: guestBuyerName,
          }),
        );
      }

      return;
    }

    const cancelledPayment = await cancelPendingPaymentFlow();
    const recoveryPayment = cancelledPayment ?? pendingPayment;
    const recoveryIsGuestOrder = resolveGuestOrderState(recoveryPayment);
    const recoveryBuyerName = normalizeIdentifier(
      recoveryPayment?.orderSnapshot?.ordererName
      ?? recoveryPayment?.orderSnapshot?.guestName,
    );
    const recoveryOrderNumber = normalizeIdentifier(
      recoveryPayment?.orderNumber
      ?? recoveryPayment?.orderSnapshot?.orderNumber
      ?? orderNumber.value,
    );

    setViewState(
      'error',
      '토스페이 결제를 완료하지 못했습니다.',
      normalizeIdentifier(route.query.message)
        || '결제 승인 과정에서 문제가 생겨 주문을 마치지 못했습니다. 결제 수단과 주문 정보를 다시 확인해 주세요.',
      buildDefaultActions({
        isGuestOrder: recoveryIsGuestOrder,
        orderNumber: recoveryOrderNumber,
        buyerName: recoveryBuyerName,
      }),
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
