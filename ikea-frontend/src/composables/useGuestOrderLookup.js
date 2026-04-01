import { computed, reactive, shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import { lookupGuestOrders } from '../services/customerSupportService';
import {
  resolveGuestLookupMode,
  validateGuestOrderLookupForm,
} from '../utils/guestOrderLookup';

export function useGuestOrderLookup() {
  const route = useRoute();
  const form = reactive({
    buyerName: '',
    inquiryType: 'order',
    orderNumber: '',
    phoneNumber: '',
  });
  const resultMessage = shallowRef('');
  const resultTone = shallowRef('neutral');
  const searchedOrders = shallowRef([]);
  const isSubmitting = shallowRef(false);
  const isHydratingFromQuery = shallowRef(false);

  const validationMessage = computed(() => validateGuestOrderLookupForm(form, { allowPartial: true }));
  const statusMessage = computed(() => validationMessage.value || resultMessage.value);
  const statusTone = computed(() => (validationMessage.value ? 'error' : resultTone.value));
  const canSubmit = computed(() => {
    const mode = resolveGuestLookupMode(form.inquiryType);
    const activeValue = mode === 'order'
      ? String(form.orderNumber ?? '').trim()
      : String(form.phoneNumber ?? '').trim();

    return Boolean(String(form.buyerName ?? '').trim() && activeValue && !validationMessage.value);
  });

  function hydrateFromRouteQuery(query) {
    isHydratingFromQuery.value = true;
    form.buyerName = String(query.name ?? '').trim();
    form.inquiryType = resolveGuestLookupMode(query.mode);
    form.orderNumber = String(query.orderNumber ?? '').trim();
    form.phoneNumber = String(query.phoneNumber ?? '').trim();
    resultMessage.value = '';
    resultTone.value = 'neutral';
    searchedOrders.value = [];
    isHydratingFromQuery.value = false;
  }

  async function submitLookup() {
    if (isSubmitting.value) {
      return;
    }

    if (validationMessage.value) {
      resultMessage.value = '';
      resultTone.value = 'error';
      searchedOrders.value = [];
      return;
    }

    if (!canSubmit.value) {
      return;
    }

    isSubmitting.value = true;
    resultMessage.value = '';
    resultTone.value = 'neutral';

    try {
      searchedOrders.value = await lookupGuestOrders({
        buyerName: String(form.buyerName ?? '').trim(),
        orderNumber: String(form.orderNumber ?? '').trim(),
        phoneNumber: String(form.phoneNumber ?? '').trim(),
      });
      resultTone.value = searchedOrders.value.length ? 'success' : 'neutral';
      resultMessage.value = searchedOrders.value.length
        ? `${searchedOrders.value.length}건의 주문을 찾았습니다.`
        : '입력한 정보와 일치하는 주문이 없습니다. 이름과 주문번호 또는 휴대전화번호를 다시 확인해 주세요.';
    } catch (error) {
      searchedOrders.value = [];
      resultTone.value = 'error';
      resultMessage.value = error?.message ?? '비회원 주문 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
    } finally {
      isSubmitting.value = false;
    }
  }

  watch(
    () => route.query,
    (query) => {
      hydrateFromRouteQuery(query);

      if (canSubmit.value) {
        void submitLookup();
      }
    },
    { immediate: true },
  );

  watch(
    () => [form.buyerName, form.inquiryType, form.orderNumber, form.phoneNumber],
    () => {
      if (isHydratingFromQuery.value) {
        return;
      }

      searchedOrders.value = [];
      resultMessage.value = '';
      resultTone.value = 'neutral';
    },
    { flush: 'sync' },
  );

  return {
    canSubmit,
    form,
    isSubmitting,
    searchedOrders,
    statusMessage,
    statusTone,
    submitLookup,
  };
}
