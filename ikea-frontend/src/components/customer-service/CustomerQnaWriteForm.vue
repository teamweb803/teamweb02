<script setup>
import { onMounted, reactive, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { ROUTE_PATHS } from '../../constants/routes';
import { createCustomerSupportQna } from '../../services/customerSupportService';
import { useAccountStore } from '../../stores/account';

const router = useRouter();
const accountStore = useAccountStore();
const isSubmitting = shallowRef(false);
const statusMessage = shallowRef('');
const questionTypes = ['배송', '주문/결제', '교환/반품', '상품', '기타'];

const form = reactive({
  type: questionTypes[0],
  writer: '',
  title: '',
  content: '',
});

function resetForm() {
  form.type = questionTypes[0];
  form.writer = accountStore.memberName || '';
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

async function submitQna() {
  if (!form.writer.trim() || !form.title.trim() || !form.content.trim()) {
    statusMessage.value = '작성자, 제목, 문의 내용을 모두 입력해 주세요.';
    return;
  }

  isSubmitting.value = true;
  statusMessage.value = '';

  try {
    await createCustomerSupportQna({
      writer: form.writer,
      title: buildSubmitTitle(),
      content: form.content,
    });

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
      <p>회원과 비회원 모두 문의를 작성할 수 있습니다. 공개 목록에 노출될 수 있으니 이메일, 휴대폰 번호, 상세 주소 같은 개인정보는 작성하지 마세요.</p>
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
        <label for="cs-qna-title">제목</label>
        <input
          id="cs-qna-title"
          v-model.trim="form.title"
          type="text"
          maxlength="80"
          placeholder="문의 제목을 입력해 주세요"
        />
      </div>

      <div class="cs-write__row cs-write__row--textarea">
        <label for="cs-qna-content">문의 내용</label>
        <textarea
          id="cs-qna-content"
          v-model.trim="form.content"
          rows="8"
          placeholder="주문 정보나 상황을 설명해 주세요"
        />
      </div>

      <p v-if="statusMessage" class="cs-write__status">{{ statusMessage }}</p>

      <div class="cs-write__actions">
        <button type="button" class="cs-write__secondary" @click="resetForm">입력 초기화</button>
        <button type="submit" class="cs-write__primary" :disabled="isSubmitting">
          {{ isSubmitting ? '등록 중...' : '문의 등록' }}
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
