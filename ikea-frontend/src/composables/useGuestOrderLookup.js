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
  const statusMessage = shallowRef('');
  const searchedOrders = shallowRef([]);
  const isSubmitting = shallowRef(false);

  const canSubmit = computed(() => {
    if (!form.buyerName.trim()) {
      return false;
    }

    if (form.inquiryType === 'order') {
      return Boolean(form.orderNumber.trim());
    }

    return Boolean(form.phoneNumber.trim());
  });

  function hydrateFromRouteQuery(query) {
    form.buyerName = String(query.name ?? '').trim();
    form.inquiryType = query.mode === 'phone' ? 'phone' : 'order';
    form.orderNumber = String(query.orderNumber ?? '').trim();
    form.phoneNumber = String(query.phoneNumber ?? '').trim();
  }

  async function submitLookup() {
    if (!canSubmit.value || isSubmitting.value) {
      return;
    }

    isSubmitting.value = true;
    statusMessage.value = '';

    try {
      searchedOrders.value = await lookupGuestOrders({
        buyerName: form.buyerName,
        orderNumber: form.inquiryType === 'order' ? form.orderNumber : '',
        phoneNumber: form.inquiryType === 'phone' ? form.phoneNumber : '',
      });

      statusMessage.value = searchedOrders.value.length
        ? `${searchedOrders.value.length}건의 주문을 찾았습니다.`
        : '일치하는 주문이 없습니다.';
    } catch (error) {
      searchedOrders.value = [];
      statusMessage.value = error?.message ?? '비회원 주문 정보를 불러오지 못했습니다.';
    } finally {
      isSubmitting.value = false;
    }
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
    },
  );

  return {
    canSubmit,
    form,
    isSubmitting,
    searchedOrders,
    statusMessage,
    submitLookup,
  };
}
