import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  cancelPendingPaymentFlow,
  confirmPendingKakaoPayment,
  getPendingPayment,
} from './useCommerceCart';
import { ROUTE_PATHS } from '../constants/routes';

function normalizeIdentifier(value) {
  return String(value ?? '').trim();
}

export function useKakaoPaymentRedirect(status = 'success') {
  const route = useRoute();
  const router = useRouter();

  const tone = ref(status === 'success' ? 'loading' : status === 'fail' ? 'error' : 'neutral');
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

  function buildDefaultActions(isRetryVisible = false) {
    const pendingPayment = getPendingPayment();
    const isGuestOrder = Boolean(pendingPayment?.orderSnapshot?.isGuestOrder);
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
    orderNumber.value = normalizeIdentifier(
      pendingPayment?.orderNumber ?? route.query.orderNumber,
    );

    if (status === 'success') {
      const pgToken = normalizeIdentifier(route.query.pg_token);

      if (!pgToken) {
        setViewState(
          'error',
          '카카오페이 승인 정보를 찾지 못했습니다.',
          '결제 승인을 다시 확인해 주세요. 문제가 계속되면 마이페이지 주문내역에서 상태를 먼저 확인하는 편이 안전합니다.',
          buildDefaultActions(false),
        );
        return;
      }

      setViewState(
        'loading',
        '카카오페이 결제를 확인하고 있습니다.',
        '승인 결과를 확인한 뒤 주문 완료 화면으로 이동합니다.',
      );

      try {
        const completedOrder = await confirmPendingKakaoPayment(pgToken);

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
          '카카오페이 결제를 완료하지 못했습니다.',
          error?.message ?? '결제 승인 처리 중 문제가 생겼습니다. 주문 상태를 다시 확인해 주세요.',
          buildDefaultActions(true),
        );
      }

      return;
    }

    await cancelPendingPaymentFlow();

    if (status === 'cancel') {
      setViewState(
        'neutral',
        '카카오페이 결제를 취소했습니다.',
        '주문은 취소 처리했고, 결제는 진행되지 않았습니다. 장바구니와 주문 정보를 다시 확인한 뒤 결제를 다시 진행해 주세요.',
        buildDefaultActions(false),
      );
      return;
    }

    setViewState(
      'error',
      '카카오페이 결제를 완료하지 못했습니다.',
      '결제 승인 과정에서 문제가 생겨 주문을 취소했습니다. 장바구니와 결제 수단을 다시 확인해 주세요.',
      buildDefaultActions(false),
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
