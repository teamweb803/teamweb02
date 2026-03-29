import { computed, reactive, shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import { lookupGuestOrders } from '../services/customerSupportService';

export function useGuestOrderLookup() {
  const route = useRoute();
  const form = reactive({
    buyerName: '',
    inquiryType: 'order',
    orderNumber: '',
    phoneNumber: '',
  });
  const isPhoneVerified = shallowRef(false);
  const statusMessage = shallowRef('');
  const searchedOrders = shallowRef([]);

  const canSubmit = computed(() => {
    if (!form.buyerName.trim()) {
      return false;
    }

    if (form.inquiryType === 'order') {
      return Boolean(form.orderNumber.trim());
    }

    return Boolean(form.phoneNumber.trim() && isPhoneVerified.value);
  });

  function hydrateFromRouteQuery(query) {
    form.buyerName = String(query.name ?? '').trim();
    form.inquiryType = query.mode === 'phone' ? 'phone' : 'order';
    form.orderNumber = String(query.orderNumber ?? '').trim();
    form.phoneNumber = String(query.phoneNumber ?? '').trim();
    isPhoneVerified.value = form.inquiryType === 'phone' && Boolean(form.phoneNumber);
  }

  function resetVerification() {
    isPhoneVerified.value = false;
  }

  function verifyPhoneNumber() {
    if (!form.phoneNumber.trim()) {
      statusMessage.value = '연락처를 먼저 입력해 주세요.';
      return;
    }

    isPhoneVerified.value = true;
    statusMessage.value = '프론트 기준 본인 확인이 완료되었습니다.';
  }

  function submitLookup() {
    searchedOrders.value = lookupGuestOrders({
      buyerName: form.buyerName,
      orderNumber: form.inquiryType === 'order' ? form.orderNumber : '',
      phoneNumber: form.inquiryType === 'phone' ? form.phoneNumber : '',
    });

    statusMessage.value = searchedOrders.value.length
      ? `${searchedOrders.value.length}건의 주문을 찾았습니다.`
      : '일치하는 주문이 없습니다.';
  }

  hydrateFromRouteQuery(route.query);

  watch(
    () => route.query,
    (query) => {
      hydrateFromRouteQuery(query);
    },
  );

  watch(
    () => form.inquiryType,
    () => {
      statusMessage.value = '';
      searchedOrders.value = [];
      if (form.inquiryType === 'order') {
        isPhoneVerified.value = false;
      }
    },
  );

  return {
    canSubmit,
    form,
    isPhoneVerified,
    resetVerification,
    searchedOrders,
    statusMessage,
    submitLookup,
    verifyPhoneNumber,
  };
}
