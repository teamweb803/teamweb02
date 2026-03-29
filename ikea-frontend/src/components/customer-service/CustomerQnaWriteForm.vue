<script setup>
import { reactive, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { ROUTE_PATHS } from '../../constants/routes';
import { createCustomerSupportQna } from '../../services/customerSupportService';

const router = useRouter();
const isSubmitting = shallowRef(false);
const statusMessage = shallowRef('');

const form = reactive({
  type: '배송',
  writer: '',
  email: '',
  phoneNumber: '',
  title: '',
  content: '',
  agreed: false,
});

function resetForm() {
  form.type = '배송';
  form.writer = '';
  form.email = '';
  form.phoneNumber = '';
  form.title = '';
  form.content = '';
  form.agreed = false;
  statusMessage.value = '';
}

async function submitQna() {
  if (!form.writer.trim() || !form.phoneNumber.trim() || !form.title.trim() || !form.content.trim()) {
    statusMessage.value = '이름, 연락처, 제목, 문의 내용을 모두 입력해 주세요.';
    return;
  }

  if (!form.agreed) {
    statusMessage.value = '개인정보 수집 및 이용 안내에 동의해 주세요.';
    return;
  }

  isSubmitting.value = true;

  try {
    createCustomerSupportQna(form);
    router.push({
      path: ROUTE_PATHS.customerServiceQna,
      query: { submitted: '1' },
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <section class="cs-write">
    <div class="cs-write__intro">
      <p>배송, 주문, 교환, 상품 문의를 남기시면 접수 상태부터 답변 완료까지 한 곳에서 확인할 수 있습니다.</p>
    </div>

    <form class="cs-write__form" @submit.prevent="submitQna">
      <div class="cs-write__row">
        <label for="cs-qna-type">문의 유형</label>
        <select id="cs-qna-type" v-model="form.type">
          <option value="배송">배송</option>
          <option value="주문/결제">주문/결제</option>
          <option value="교환/반품">교환/반품</option>
          <option value="상품">상품</option>
          <option value="기타">기타</option>
        </select>
      </div>

      <div class="cs-write__row">
        <label for="cs-qna-writer">이름</label>
        <input id="cs-qna-writer" v-model.trim="form.writer" type="text" maxlength="30" />
      </div>

      <div class="cs-write__row">
        <label for="cs-qna-email">이메일</label>
        <input id="cs-qna-email" v-model.trim="form.email" type="email" maxlength="60" />
      </div>

      <div class="cs-write__row">
        <label for="cs-qna-phone">연락처</label>
        <input id="cs-qna-phone" v-model.trim="form.phoneNumber" type="text" maxlength="20" placeholder="010-0000-0000" />
      </div>

      <div class="cs-write__row">
        <label for="cs-qna-title">제목</label>
        <input id="cs-qna-title" v-model.trim="form.title" type="text" maxlength="80" />
      </div>

      <div class="cs-write__row cs-write__row--textarea">
        <label for="cs-qna-content">문의 내용</label>
        <textarea id="cs-qna-content" v-model.trim="form.content" rows="8" />
      </div>

      <label class="cs-write__agree">
        <input v-model="form.agreed" type="checkbox" />
        <span>문의 답변을 위한 개인정보 수집 및 이용 안내에 동의합니다.</span>
      </label>

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

.cs-write__agree {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #444444;
  font-size: 14px;
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
