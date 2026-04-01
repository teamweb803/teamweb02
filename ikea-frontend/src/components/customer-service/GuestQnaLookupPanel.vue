<script setup>
import { computed } from 'vue';
import { useGuestQnaLookup } from '../../composables/useGuestQnaLookup';
import CustomerQnaThreadList from './CustomerQnaThreadList.vue';

const {
  canSubmit,
  form,
  isSubmitting,
  searchedQnas,
  statusMessage,
  statusTone,
  submitLookup,
} = useGuestQnaLookup();

const statusClass = computed(() => ({
  'guest-qna__status--error': statusTone.value === 'error',
  'guest-qna__status--success': statusTone.value === 'success',
}));
</script>

<template>
  <section class="guest-qna">
    <div class="guest-qna__intro">
      <p>이름과 이메일 또는 휴대전화번호를 입력하면 비회원 문의 상태와 답변을 확인할 수 있습니다.</p>
    </div>

    <form class="guest-qna__form" @submit.prevent="submitLookup">
      <div class="guest-qna__row">
        <label for="guest-qna-name">이름</label>
        <input id="guest-qna-name" v-model.trim="form.writer" type="text" maxlength="30" />
      </div>

      <div class="guest-qna__row">
        <span>조회 방식</span>
        <div class="guest-qna__radios">
          <label>
            <input v-model="form.inquiryType" type="radio" value="email" />
            <span>이메일 주소</span>
          </label>
          <label>
            <input v-model="form.inquiryType" type="radio" value="phone" />
            <span>휴대전화번호</span>
          </label>
        </div>
      </div>

      <div v-if="form.inquiryType === 'email'" class="guest-qna__row">
        <label for="guest-qna-email">이메일 주소</label>
        <input
          id="guest-qna-email"
          v-model.trim="form.email"
          type="email"
          maxlength="80"
          placeholder="name@example.com"
        />
      </div>

      <div v-else class="guest-qna__row">
        <label for="guest-qna-phone">휴대전화번호</label>
        <input
          id="guest-qna-phone"
          v-model.trim="form.phoneNumber"
          type="text"
          maxlength="20"
          placeholder="010-0000-0000"
        />
      </div>

      <p v-if="statusMessage" class="guest-qna__status" :class="statusClass">{{ statusMessage }}</p>

      <div class="guest-qna__actions">
        <button type="submit" class="guest-qna__primary" :disabled="!canSubmit || isSubmitting">
          {{ isSubmitting ? '조회 중..' : '조회' }}
        </button>
      </div>
    </form>

    <section class="guest-qna__result">
      <header>
        <h3>조회 결과</h3>
      </header>

      <CustomerQnaThreadList
        :items="searchedQnas"
        empty-title="조회된 문의가 없습니다."
        empty-description="이름과 이메일 또는 휴대전화번호를 다시 확인해 주세요."
      />
    </section>
  </section>
</template>

<style scoped>
.guest-qna {
  display: grid;
  gap: 22px;
}

.guest-qna__intro,
.guest-qna__result {
  border: 1px solid #e6e6e6;
  background: #ffffff;
}

.guest-qna__intro {
  padding: 16px 18px;
  background: #fafafa;
}

.guest-qna__intro p,
.guest-qna__status {
  margin: 0;
  color: #666666;
  font-size: 14px;
  line-height: 1.7;
}

.guest-qna__form {
  display: grid;
  gap: 14px;
}

.guest-qna__row {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 20px;
  align-items: center;
}

.guest-qna__row > label,
.guest-qna__row > span {
  color: #555555;
  font-size: 14px;
  font-weight: 600;
}

.guest-qna__row input {
  width: 100%;
  height: 48px;
  min-height: 48px;
  padding: 12px 14px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  font: inherit;
  box-sizing: border-box;
}

.guest-qna__radios {
  display: flex;
  align-items: center;
  gap: 14px;
}

.guest-qna__radios label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #444444;
}

.guest-qna__radios input {
  width: 16px;
  height: 16px;
  margin: 0;
}

.guest-qna__status--error {
  color: #c62828;
}

.guest-qna__status--success {
  color: #0f6b3b;
}

.guest-qna__actions {
  display: flex;
  justify-content: flex-end;
}

.guest-qna__primary {
  height: 48px;
  min-height: 48px;
  padding: 0 18px;
  border: 1px solid #111111;
  background: #111111;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
}

.guest-qna__primary:disabled {
  cursor: default;
  opacity: 0.45;
}

.guest-qna__result {
  display: grid;
  gap: 16px;
  padding: 18px;
}

.guest-qna__result h3 {
  margin: 0;
  color: #111111;
  font-size: 18px;
}

@media (max-width: 720px) {
  .guest-qna__row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .guest-qna__radios,
  .guest-qna__actions {
    align-items: stretch;
    justify-content: stretch;
    flex-direction: column;
  }
}
</style>
