<script setup>
import { computed, onMounted, reactive, shallowRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ROUTE_PATHS } from '../../constants/routes';
import { createCustomerSupportQna } from '../../services/customerSupportService';
import { getQnaDetail, updateQnaQuestion } from '../../services/qnaService';
import { useAccountStore } from '../../stores/account';
import { detectSensitiveQnaContent } from '../../utils/qnaPrivacy';
import { hasAuthenticatedSession } from '../../utils/accessControl';
import { resolveAdminActionErrorMessage } from '../../utils/apiErrorMessage';

const route = useRoute();
const router = useRouter();
const accountStore = useAccountStore();

const isSubmitting = shallowRef(false);
const isLoading = shallowRef(false);
const statusMessage = shallowRef('');
const initialFormState = shallowRef(null);
const questionTypes = ['배송', '주문/결제', '교환/반품', '상품', '기타'];

const form = reactive({
  type: questionTypes[0],
  title: '',
  content: '',
});

const privacyMessage = computed(() => detectSensitiveQnaContent([form.title, form.content]));
const editingQnaId = computed(() => String(route.query.editId ?? '').trim());
const isEditMode = computed(() => Boolean(editingQnaId.value));
const submitButtonLabel = computed(() => {
  if (isSubmitting.value) {
    return isEditMode.value ? '수정 중...' : '등록 중...';
  }

  return isEditMode.value ? '수정하기' : '등록하기';
});

function parseQuestionTitle(value = '') {
  const normalizedTitle = String(value ?? '').trim();
  const matched = normalizedTitle.match(/^\[(.+?)\]\s*(.*)$/);

  if (!matched) {
    return {
      type: questionTypes[0],
      title: normalizedTitle,
    };
  }

  const [, typeCandidate, titleCandidate] = matched;
  return {
    type: questionTypes.includes(typeCandidate) ? typeCandidate : questionTypes[0],
    title: String(titleCandidate ?? '').trim() || normalizedTitle,
  };
}

function buildSubmitTitle() {
  const title = String(form.title ?? '').trim();
  const type = String(form.type ?? '').trim();

  if (!type) {
    return title;
  }

  return `[${type}] ${title}`;
}

function resetForm() {
  const nextState = initialFormState.value ?? {
    type: questionTypes[0],
    title: '',
    content: '',
  };

  form.type = nextState.type;
  form.title = nextState.title;
  form.content = nextState.content;
  statusMessage.value = '';
}

async function hydrateEditForm() {
  if (!isEditMode.value) {
    initialFormState.value = {
      type: questionTypes[0],
      title: '',
      content: '',
    };
    resetForm();
    return;
  }

  if (!hasAuthenticatedSession(accountStore)) {
    statusMessage.value = '로그인 후 수정할 수 있습니다.';
    return;
  }

  isLoading.value = true;
  statusMessage.value = '';

  try {
    const payload = await getQnaDetail(editingQnaId.value);
    const question = payload?.question ?? payload?.data?.question ?? payload ?? {};
    const parsedTitle = parseQuestionTitle(question.title);

    initialFormState.value = {
      type: parsedTitle.type,
      title: parsedTitle.title,
      content: String(question.content ?? '').trim(),
    };
    resetForm();
  } catch (error) {
    statusMessage.value = resolveAdminActionErrorMessage(error, '내역을 불러오지 못했습니다.');
  } finally {
    isLoading.value = false;
  }
}

async function submitQna() {
  if (isLoading.value) {
    return;
  }

  if (!form.title.trim() || !form.content.trim()) {
    statusMessage.value = '제목과 내용을 모두 입력해 주세요.';
    return;
  }

  if (privacyMessage.value) {
    statusMessage.value = privacyMessage.value;
    return;
  }

  isSubmitting.value = true;
  statusMessage.value = '';

  try {
    if (isEditMode.value) {
      await updateQnaQuestion(Number(editingQnaId.value), {
        title: buildSubmitTitle(),
        content: form.content,
      });
      await router.push({
        path: ROUTE_PATHS.customerServiceQna,
        query: { updated: '1' },
      });
      return;
    }

    await createCustomerSupportQna({
      title: buildSubmitTitle(),
      content: form.content,
    });

    await router.push({
      path: ROUTE_PATHS.customerServiceQna,
      query: { submitted: '1' },
    });
  } catch (error) {
    statusMessage.value = resolveAdminActionErrorMessage(
      error,
      isEditMode.value ? '내역을 수정하지 못했습니다.' : '등록하지 못했습니다.',
    );
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(() => {
  accountStore.hydrate();
  void hydrateEditForm();
});

watch(
  () => editingQnaId.value,
  () => {
    accountStore.hydrate();
    void hydrateEditForm();
  },
);
</script>

<template>
  <section class="cs-write">
    <form class="cs-write__form" @submit.prevent="submitQna">
      <div class="cs-write__row">
        <label for="cs-qna-type">유형</label>
        <select id="cs-qna-type" v-model="form.type" :disabled="isLoading">
          <option v-for="type in questionTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>

      <div class="cs-write__row">
        <label for="cs-qna-title">제목</label>
        <input
          id="cs-qna-title"
          v-model.trim="form.title"
          type="text"
          maxlength="80"
          placeholder="제목을 입력해 주세요."
          :disabled="isLoading"
        />
      </div>

      <div class="cs-write__row cs-write__row--textarea">
        <label for="cs-qna-content">내용</label>
        <textarea
          id="cs-qna-content"
          v-model.trim="form.content"
          rows="8"
          placeholder="주문 정보와 상황을 자세히 입력해 주세요."
          :disabled="isLoading"
        />
      </div>

      <p v-if="isLoading" class="cs-write__status">내역을 불러오고 있습니다.</p>
      <p v-else-if="privacyMessage" class="cs-write__status cs-write__status--error">{{ privacyMessage }}</p>
      <p v-else-if="statusMessage" class="cs-write__status">{{ statusMessage }}</p>

      <div class="cs-write__actions">
        <button type="button" class="cs-write__secondary" :disabled="isLoading" @click="resetForm">입력 초기화</button>
        <button type="submit" class="cs-write__primary" :disabled="isLoading || isSubmitting || Boolean(privacyMessage)">
          {{ submitButtonLabel }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.cs-write {
  display: grid;
  gap: 22px;
}

.cs-write__status {
  margin: 0;
  color: #666666;
  font-size: 14px;
  line-height: 1.7;
}

.cs-write__status--error {
  color: #c62828;
}

.cs-write__form {
  display: grid;
  gap: 14px;
}

.cs-write__row {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 20px;
  align-items: center;
}

.cs-write__row--textarea {
  align-items: start;
}

.cs-write__row label {
  color: #555555;
  font-size: 14px;
  font-weight: 600;
}

.cs-write__row input,
.cs-write__row select,
.cs-write__row textarea {
  width: 100%;
  min-height: 48px;
  padding: 12px 14px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  font: inherit;
  box-sizing: border-box;
}

.cs-write__row textarea {
  resize: vertical;
}

.cs-write__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cs-write__primary,
.cs-write__secondary {
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  color: #111111;
  font-size: 14px;
  cursor: pointer;
}

.cs-write__primary {
  border-color: #111111;
  background: #111111;
  color: #ffffff;
}

.cs-write__primary:disabled {
  cursor: default;
  opacity: 0.45;
}

@media (max-width: 720px) {
  .cs-write__row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .cs-write__actions {
    flex-direction: column;
  }
}
</style>
