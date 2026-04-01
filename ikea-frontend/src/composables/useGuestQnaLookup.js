import { computed, reactive, shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import { lookupGuestCustomerSupportQnaRows } from '../services/customerSupportService';
import {
  buildGuestQnaLookupQuery,
  resolveGuestQnaLookupMode,
  validateGuestQnaLookupForm,
} from '../utils/guestQnaLookup';

export function useGuestQnaLookup() {
  const route = useRoute();
  const form = reactive({
    writer: '',
    inquiryType: 'email',
    email: '',
    phoneNumber: '',
  });
  const resultMessage = shallowRef('');
  const resultTone = shallowRef('neutral');
  const searchedQnas = shallowRef([]);
  const isSubmitting = shallowRef(false);
  const isHydratingFromQuery = shallowRef(false);

  const validationMessage = computed(() => validateGuestQnaLookupForm(form, { allowPartial: true }));
  const statusMessage = computed(() => validationMessage.value || resultMessage.value);
  const statusTone = computed(() => (validationMessage.value ? 'error' : resultTone.value));
  const canSubmit = computed(() => {
    const mode = resolveGuestQnaLookupMode(form.inquiryType);
    const activeValue = mode === 'email'
      ? String(form.email ?? '').trim()
      : String(form.phoneNumber ?? '').trim();

    return Boolean(String(form.writer ?? '').trim() && activeValue && !validationMessage.value);
  });

  function hydrateFromRouteQuery(query) {
    isHydratingFromQuery.value = true;
    form.writer = String(query.name ?? '').trim();
    form.inquiryType = resolveGuestQnaLookupMode(query.mode);
    form.email = String(query.email ?? '').trim();
    form.phoneNumber = String(query.phoneNumber ?? '').trim();
    searchedQnas.value = [];
    resultTone.value = query.submitted === '1' ? 'success' : 'neutral';
    resultMessage.value = query.submitted === '1'
      ? '문의가 접수되었습니다. 아래 정보로 등록 내역을 바로 확인할 수 있습니다.'
      : '';
    isHydratingFromQuery.value = false;
  }

  async function submitLookup(options = {}) {
    const { preserveSubmittedMessage = false } = options;

    if (isSubmitting.value) {
      return;
    }

    if (validationMessage.value) {
      searchedQnas.value = [];
      resultTone.value = 'error';
      resultMessage.value = '';
      return;
    }

    if (!canSubmit.value) {
      return;
    }

    isSubmitting.value = true;
    resultMessage.value = '';
    resultTone.value = 'neutral';

    try {
      searchedQnas.value = await lookupGuestCustomerSupportQnaRows(buildGuestQnaLookupQuery(form));
      resultTone.value = searchedQnas.value.length ? 'success' : 'neutral';
      resultMessage.value = searchedQnas.value.length
        ? preserveSubmittedMessage
          ? `문의가 접수되었습니다. ${searchedQnas.value.length}건의 문의를 찾았습니다.`
          : `${searchedQnas.value.length}건의 문의를 찾았습니다.`
        : '입력한 정보와 일치하는 문의가 없습니다. 이름과 이메일 또는 휴대전화번호를 다시 확인해 주세요.';
    } catch (error) {
      searchedQnas.value = [];
      resultTone.value = 'error';
      resultMessage.value = error?.message ?? '비회원 문의 내역을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
    } finally {
      isSubmitting.value = false;
    }
  }

  watch(
    () => route.query,
    (query) => {
      hydrateFromRouteQuery(query);

      if (canSubmit.value) {
        void submitLookup({
          preserveSubmittedMessage: query.submitted === '1',
        });
      }
    },
    { immediate: true },
  );

  watch(
    () => [form.writer, form.inquiryType, form.email, form.phoneNumber],
    () => {
      if (isHydratingFromQuery.value) {
        return;
      }

      searchedQnas.value = [];
      resultMessage.value = '';
      resultTone.value = 'neutral';
    },
    { flush: 'sync' },
  );

  return {
    canSubmit,
    form,
    isSubmitting,
    searchedQnas,
    statusMessage,
    statusTone,
    submitLookup,
  };
}
