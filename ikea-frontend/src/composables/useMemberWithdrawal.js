import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ROUTE_PATHS } from '../constants/routes';
import { deleteCurrentMember } from '../services/memberService';
import { getMyOrders } from '../services/orderService';
import { getMyPayments } from '../services/paymentService';
import { useAccountStore } from '../stores/account';
import { useMyPageStore } from '../stores/myPage';
import { resolveMemberActionErrorMessage } from '../utils/apiErrorMessage';
import { useFeedback } from './useFeedback';

const BLOCKED_ORDER_STATUSES = new Set(['PENDING', 'PAID', 'ORDERED', 'DELIVERING']);
const BLOCKED_PAYMENT_STATUSES = new Set(['OK']);

const WITHDRAWAL_GUIDE_ITEMS = [
  '진행 중인 주문이 있으면 탈퇴할 수 없습니다.',
  '취소되지 않은 결제가 있으면 탈퇴할 수 없습니다.',
];

function unwrapArrayPayload(payload) {
  const source = payload?.data ?? payload;

  if (Array.isArray(source)) {
    return source;
  }

  if (Array.isArray(source?.content)) {
    return source.content;
  }

  if (Array.isArray(source?.items)) {
    return source.items;
  }

  return [];
}

function normalizeIdentifier(value) {
  return String(value ?? '').trim().toUpperCase();
}

function countBlockedOrders(orders = []) {
  return orders.filter((order) => (
    BLOCKED_ORDER_STATUSES.has(normalizeIdentifier(order?.orderStatus ?? order?.status))
  )).length;
}

function countBlockedPayments(payments = []) {
  return payments.filter((payment) => (
    BLOCKED_PAYMENT_STATUSES.has(normalizeIdentifier(payment?.paymentStatus ?? payment?.status))
  )).length;
}

function buildBlockedReason(blockedOrderCount, blockedPaymentCount) {
  if (blockedOrderCount > 0 && blockedPaymentCount > 0) {
    return `진행 중인 주문 ${blockedOrderCount}건과 취소되지 않은 결제 ${blockedPaymentCount}건이 있어 탈퇴할 수 없습니다.`;
  }

  if (blockedOrderCount > 0) {
    return `진행 중인 주문 ${blockedOrderCount}건이 있어 탈퇴할 수 없습니다.`;
  }

  if (blockedPaymentCount > 0) {
    return `취소되지 않은 결제 ${blockedPaymentCount}건이 있어 탈퇴할 수 없습니다.`;
  }

  return '';
}

export function useMemberWithdrawal() {
  const router = useRouter();
  const accountStore = useAccountStore();
  const myPageStore = useMyPageStore();
  const { requestConfirm, showError, showSuccess } = useFeedback();
  const isSubmitting = ref(false);
  const withdrawalHintMessage = ref('진행 중인 주문 및 결제 여부는 탈퇴 시점에 다시 확인됩니다.');
  const withdrawalHintTone = ref('neutral');
  const canWithdraw = computed(() => Boolean(accountStore.accessToken));

  async function refreshWithdrawalEligibility() {
    accountStore.hydrate();

    if (!accountStore.accessToken) {
      withdrawalHintMessage.value = '회원 탈퇴는 로그인 상태에서만 진행할 수 있습니다.';
      withdrawalHintTone.value = 'neutral';
      return {
        blockedReason: '',
        blockedOrderCount: 0,
        blockedPaymentCount: 0,
      };
    }

    const [ordersResult, paymentsResult] = await Promise.allSettled([
      getMyOrders(),
      getMyPayments(),
    ]);
    const blockedOrderCount = ordersResult.status === 'fulfilled'
      ? countBlockedOrders(unwrapArrayPayload(ordersResult.value))
      : 0;
    const blockedPaymentCount = paymentsResult.status === 'fulfilled'
      ? countBlockedPayments(unwrapArrayPayload(paymentsResult.value))
      : 0;
    const blockedReason = buildBlockedReason(blockedOrderCount, blockedPaymentCount);

    if (blockedReason) {
      withdrawalHintMessage.value = blockedReason;
      withdrawalHintTone.value = 'warning';
      return {
        blockedReason,
        blockedOrderCount,
        blockedPaymentCount,
      };
    }

    if (ordersResult.status === 'fulfilled' && paymentsResult.status === 'fulfilled') {
      withdrawalHintMessage.value = '현재 확인된 진행 중 주문과 취소되지 않은 결제는 없습니다.';
      withdrawalHintTone.value = 'success';
      return {
        blockedReason: '',
        blockedOrderCount,
        blockedPaymentCount,
      };
    }

    withdrawalHintMessage.value = '진행 중인 주문 및 결제 여부는 탈퇴 시점에 다시 확인됩니다.';
    withdrawalHintTone.value = 'neutral';

    return {
      blockedReason: '',
      blockedOrderCount,
      blockedPaymentCount,
    };
  }

  async function submitWithdrawal() {
    if (isSubmitting.value) {
      return false;
    }

    accountStore.hydrate();

    if (!accountStore.accessToken) {
      showError('로그인 후 다시 시도해 주세요.');
      return false;
    }

    isSubmitting.value = true;

    try {
      const { blockedReason } = await refreshWithdrawalEligibility();

      if (blockedReason) {
        showError(blockedReason);
        return false;
      }

      const confirmed = await requestConfirm({
        title: '회원 탈퇴',
        message: [
          '탈퇴 처리 후에는 현재 계정으로 다시 로그인할 수 없습니다.',
          '',
          '진행 중인 주문 또는 취소되지 않은 결제가 있으면 탈퇴가 제한됩니다.',
          '',
          '정말 탈퇴하시겠습니까?',
        ].join('\n'),
        confirmLabel: '탈퇴',
      });

      if (!confirmed) {
        return false;
      }

      await deleteCurrentMember();
      accountStore.clearAuth();
      myPageStore.$reset();
      showSuccess('회원 탈퇴가 처리되었습니다. 홈으로 이동합니다.');
      await router.replace(ROUTE_PATHS.home);
      return true;
    } catch (error) {
      const message = resolveMemberActionErrorMessage(
        error,
        '회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      );

      withdrawalHintMessage.value = message;
      withdrawalHintTone.value = 'warning';
      showError(message);
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  onMounted(() => {
    void refreshWithdrawalEligibility().catch(() => {});
  });

  return {
    canWithdraw,
    isSubmitting: computed(() => isSubmitting.value),
    withdrawalGuideItems: WITHDRAWAL_GUIDE_ITEMS,
    withdrawalHintMessage: computed(() => withdrawalHintMessage.value),
    withdrawalHintTone: computed(() => withdrawalHintTone.value),
    refreshWithdrawalEligibility,
    submitWithdrawal,
  };
}
