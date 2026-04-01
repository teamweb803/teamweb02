<script setup>
import { computed, onMounted, reactive, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { ROUTE_PATHS } from '../../constants/routes';
import { createCustomerSupportQna } from '../../services/customerSupportService';
import { useAccountStore } from '../../stores/account';
import { buildGuestQnaLookupQuery } from '../../utils/guestQnaLookup';
import { detectSensitiveQnaContent } from '../../utils/qnaPrivacy';
import { hasAuthenticatedSession } from '../../utils/accessControl';

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const router = useRouter();
const accountStore = useAccountStore();
const isSubmitting = shallowRef(false);
const statusMessage = shallowRef('');
const questionTypes = ['배송', '주문/결제', '교환/반품', '상품', '기타'];

const form = reactive({
  type: questionTypes[0],
  writer: '',
  email: '',
  phoneNumber: '',
  title: '',
  content: '',
});

const privacyMessage = computed(() => detectSensitiveQnaContent([form.title, form.content]));
const isGuestWriter = computed(() => !hasAuthenticatedSession(accountStore));

function resetForm() {
  form.type = questionTypes[0];
  form.writer = accountStore.memberName || '';
  form.email = accountStore.email || '';
  form.phoneNumber = accountStore.phoneNumber || '';
  form.title = '';
  form.content = '';
  statusMessage.value = '';
}

function buildSubmitTitle() {
  const title = String(form.title ?? '').trim();
  const type = String(form.type ?? '').trim();

  if (!type) {
    return title;
  }

  return `[${type}] ${title}`;
}

function normalizePhoneNumber(value) {
  return String(value ?? '').replace(/\D+/g, '').slice(0, 11);
}

function validateContactFields() {
  const email = String(form.email ?? '').trim();
  const phoneNumber = normalizePhoneNumber(form.phoneNumber);

  if (!email) {
    return '이메일 주소를 입력해 주세요.';
  }

  if (!EMAIL_PATTERN.test(email)) {
    return '올바른 이메일 주소를 입력해 주세요.';
  }

  if (!phoneNumber) {
    return '휴대전화번호를 입력해 주세요.';
  }

  if (!/^\d{10,11}$/.test(phoneNumber)) {
    return '휴대전화번호는 10~11자리 숫자로 입력해 주세요.';
  }

  return '';
}

async function submitQna() {
  if (!form.writer.trim() || !form.title.trim() || !form.content.trim()) {
    statusMessage.value = '작성자, 제목, 문의 내용을 모두 입력해 주세요.';
    return;
  }

  const contactValidationMessage = validateContactFields();

  if (contactValidationMessage) {
    statusMessage.value = contactValidationMessage;
    return;
  }

  if (privacyMessage.value) {
    statusMessage.value = privacyMessage.value;
    return;
  }

  isSubmitting.value = true;
  statusMessage.value = '';

  try {
    await createCustomerSupportQna({
      writer: form.writer,
      title: buildSubmitTitle(),
      content: form.content,
      email: form.email,
      phoneNumber: form.phoneNumber,
      isGuest: isGuestWriter.value,
    });

    if (isGuestWriter.value) {
      router.push({
        path: ROUTE_PATHS.customerServiceQnaLookup,
        query: {
          submitted: '1',
          ...buildGuestQnaLookupQuery({
            writer: form.writer,
            inquiryType: 'email',
            email: form.email,
          }),
        },
      });
      return;
    }

    router.push({
      path: ROUTE_PATHS.customerServiceQna,
      query: { submitted: '1' },
    });
  } catch (error) {
    statusMessage.value = error?.message ?? '문의를 등록하지 못했습니다.';
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(() => {
  accountStore.hydrate();
  resetForm();
});
</script>

<template>
  <section class="cs-write">
    <div class="cs-write__intro">
      <p>
        답변 안내를 위해 이메일 주소와 휴대전화번호를 함께 입력해 주세요. 제목과 문의 내용에는 추가 개인정보를
        적지 않는 방식으로 유지합니다.
      </p>
    </div>

    <form class="cs-write__form" @submit.prevent="submitQna">
      <div class="cs-write__row">
        <label for="cs-qna-type">문의 유형</label>
        <select id="cs-qna-type" v-model="form.type">
          <option v-for="type in questionTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>

      <div class="cs-write__row">
        <label for="cs-qna-writer">작성자</label>
        <input
          id="cs-qna-writer"
          v-model.trim="form.writer"
          type="text"
          maxlength="30"
          placeholder="이름 또는 닉네임"
        />
      </div>

      <div class="cs-write__row">
        <label for="cs-qna-email">이메일 주소</label>
        <input
          id="cs-qna-email"
          v-model.trim="form.email"
          type="email"
          maxlength="80"
          placeholder="name@example.com"
        />
      </div>

      <div class="cs-write__row">
        <label for="cs-qna-phone">휴대전화번호</label>
        <input
          id="cs-qna-phone"
          v-model.trim="form.phoneNumber"
          type="text"
          maxlength="20"
          placeholder="010-0000-0000"
        />
      </div>

      <div class="cs-write__row">
        <label for="cs-qna-title">제목</label>
        <input
          id="cs-qna-title"
          v-model.trim="form.title"
          type="text"
          maxlength="80"
          placeholder="문의 제목을 입력해 주세요."
        />
      </div>

      <div class="cs-write__row cs-write__row--textarea">
        <label for="cs-qna-content">문의 내용</label>
        <textarea
          id="cs-qna-content"
          v-model.trim="form.content"
          rows="8"
          placeholder="주문 정보와 상황을 설명해 주세요."
        />
      </div>

      <p v-if="privacyMessage" class="cs-write__status cs-write__status--error">{{ privacyMessage }}</p>
      <p v-else-if="statusMessage" class="cs-write__status">{{ statusMessage }}</p>

      <div class="cs-write__actions">
        <button type="button" class="cs-write__secondary" @click="resetForm">입력 초기화</button>
        <button type="submit" class="cs-write__primary" :disabled="isSubmitting || Boolean(privacyMessage)">
          {{ isSubmitting ? '등록 중..' : '문의 등록' }}
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

.cs-write__intro {
  padding: 16px 18px;
  border: 1px solid #e6e6e6;
  background: #fafafa;
}

.cs-write__intro p,
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
