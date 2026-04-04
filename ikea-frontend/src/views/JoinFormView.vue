<script setup>
import { computed, reactive, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import SiteChrome from '../components/layout/SiteChrome.vue';
import { ROUTE_PATHS } from '../constants/routes';
import { joinMember } from '../services/memberService';
import { resolveJoinErrorMessage } from '../utils/apiErrorMessage';

const router = useRouter();
const joinForm = reactive({
  loginId: '',
  name: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  zoneCode: '',
  addressMain: '',
  addressDetail: '',
});
const joinStatus = shallowRef('');
const joinStatusTone = shallowRef('neutral');
const joinSubmitting = shallowRef(false);
const joinStatusClass = computed(() => ({
  'signup-info-status--error': joinStatusTone.value === 'error',
  'signup-info-status--neutral': joinStatusTone.value !== 'error',
}));

function normalizePhoneNumber(value = '') {
  return String(value ?? '').replace(/[^\d]/g, '').slice(0, 11);
}

function validateJoinForm() {
  const normalizedLoginId = joinForm.loginId.trim();
  const normalizedName = joinForm.name.trim();
  const normalizedEmail = joinForm.email.trim();
  const normalizedPhoneNumber = normalizePhoneNumber(joinForm.phoneNumber);

  if (
    !normalizedLoginId
    || !normalizedName
    || !normalizedEmail
    || !normalizedPhoneNumber
    || !joinForm.password
    || !joinForm.confirmPassword
  ) {
    return '필수 항목을 모두 입력해 주세요.';
  }

  if (normalizedLoginId.length < 4 || normalizedLoginId.length > 20) {
    return '아이디는 4자 이상 20자 이하로 입력해 주세요.';
  }

  if (joinForm.password.length < 4 || joinForm.password.length > 20) {
    return '비밀번호는 4자 이상 20자 이하로 입력해 주세요.';
  }

  if (joinForm.password !== joinForm.confirmPassword) {
    return '비밀번호와 비밀번호 확인이 일치하지 않습니다.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return '올바른 이메일 형식으로 입력해 주세요.';
  }

  if (!/^01[016789]\d{7,8}$/.test(normalizedPhoneNumber)) {
    return '휴대전화번호는 01012341234 형식으로 입력해 주세요.';
  }

  return '';
}

async function submitJoin() {
  const validationMessage = validateJoinForm();

  if (validationMessage) {
    joinStatusTone.value = 'error';
    joinStatus.value = validationMessage;
    return;
  }

  joinSubmitting.value = true;
  joinStatus.value = '';
  joinStatusTone.value = 'neutral';

  try {
    await joinMember({
      loginId: joinForm.loginId.trim(),
      password: joinForm.password,
      confirmPassword: joinForm.confirmPassword,
      name: joinForm.name.trim(),
      email: joinForm.email.trim(),
      phoneNumber: normalizePhoneNumber(joinForm.phoneNumber),
      zoneCode: joinForm.zoneCode.trim(),
      addressMain: joinForm.addressMain.trim(),
      addressDetail: joinForm.addressDetail.trim(),
    });

    router.push({
      path: ROUTE_PATHS.memberJoinComplete,
      query: {
        name: joinForm.name.trim(),
        loginId: joinForm.loginId.trim(),
      },
    });
  } catch (error) {
    joinStatusTone.value = 'error';
    joinStatus.value = resolveJoinErrorMessage(error);
  } finally {
    joinSubmitting.value = false;
  }
}
</script>

<template>
  <SiteChrome>
    <main class="signup-info-page">
      <div class="signup-info-page__inner">
        <div class="signup-info-breadcrumb">
          <RouterLink to="/" class="signup-info-breadcrumb__home" aria-label="홈으로 이동">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 10.5L12 4L20 10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 9.8V19H17V9.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
          <span>></span>
          <span>회원가입</span>
          <span>></span>
          <span>정보입력</span>
        </div>

        <div class="signup-info-stepbar" aria-label="회원가입 단계">
          <div class="signup-info-stepbar__item">STEP 1. 약관 안내</div>
          <div class="signup-info-stepbar__item signup-info-stepbar__item--active">STEP 2. 정보입력</div>
          <div class="signup-info-stepbar__item">STEP 3. 가입완료</div>
        </div>

        <section class="signup-info-formwrap">
          <h1>회원정보 입력</h1>

          <form class="signup-info-form" @submit.prevent="submitJoin">
            <label class="signup-info-field">
              <span>로그인 아이디<em>*</em></span>
              <input
                v-model.trim="joinForm.loginId"
                type="text"
                placeholder="4~20자 아이디 입력"
                autocomplete="username"
              />
            </label>

            <label class="signup-info-field">
              <span>이름<em>*</em></span>
              <input
                v-model.trim="joinForm.name"
                type="text"
                placeholder="이름 입력"
                autocomplete="name"
              />
            </label>

            <label class="signup-info-field">
              <span>이메일<em>*</em></span>
              <input
                v-model.trim="joinForm.email"
                type="email"
                placeholder="example@homio.com"
                autocomplete="email"
              />
            </label>

            <label class="signup-info-field">
              <span>휴대전화번호<em>*</em></span>
              <input
                v-model="joinForm.phoneNumber"
                type="text"
                inputmode="numeric"
                placeholder="'-' 없이 숫자만 입력"
                autocomplete="tel"
              />
            </label>

            <label class="signup-info-field">
              <span>비밀번호<em>*</em></span>
              <input
                v-model="joinForm.password"
                type="password"
                placeholder="4~20자 비밀번호 입력"
                autocomplete="new-password"
              />
            </label>

            <label class="signup-info-field">
              <span>비밀번호 확인<em>*</em></span>
              <input
                v-model="joinForm.confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력"
                autocomplete="new-password"
              />
            </label>

            <div class="signup-info-field signup-info-field--group">
              <span>기본주소 <i>(선택)</i></span>
              <input
                v-model.trim="joinForm.zoneCode"
                type="text"
                placeholder="우편번호"
                autocomplete="postal-code"
              />
              <input
                v-model.trim="joinForm.addressMain"
                type="text"
                placeholder="기본 주소 입력"
                autocomplete="street-address"
              />
              <input
                v-model.trim="joinForm.addressDetail"
                type="text"
                placeholder="상세 주소 입력"
                autocomplete="address-line2"
              />
            </div>

            <p v-if="joinStatus" class="signup-info-status" :class="joinStatusClass">{{ joinStatus }}</p>

            <button class="signup-info-submit" type="submit" :disabled="joinSubmitting">
              {{ joinSubmitting ? '가입 진행 중...' : '가입 완료' }}
            </button>
          </form>
        </section>
      </div>
    </main>
  </SiteChrome>
</template>

<style scoped>
.signup-info-page {
  background: #ffffff;
}

.signup-info-page__inner {
  width: min(1280px, calc(100% - 40px));
  margin: 0 auto;
  padding: 34px 0 92px;
}

.signup-info-breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #8f8f8f;
  font-size: 13px;
  line-height: 1;
}

.signup-info-breadcrumb__home {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: #8f8f8f;
}

.signup-info-breadcrumb__home svg {
  width: 100%;
  height: 100%;
}

.signup-info-stepbar {
  margin-top: 38px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid #dcdcdc;
}

.signup-info-stepbar__item {
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #dcdcdc;
  background: #ffffff;
  color: #111111;
  font-size: 15px;
  font-weight: 500;
}

.signup-info-stepbar__item:last-child {
  border-right: 0;
}

.signup-info-stepbar__item--active {
  background: #0d0d0d;
  color: #ffffff;
  font-weight: 700;
}

.signup-info-formwrap {
  max-width: 520px;
  margin: 58px auto 0;
}

.signup-info-formwrap h1 {
  margin: 0;
  text-align: center;
  color: #111111;
  font-size: 26px;
  line-height: 1.35;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.signup-info-form {
  margin-top: 48px;
}

.signup-info-field {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.signup-info-field > span {
  color: #111111;
  font-size: 17px;
  line-height: 1.5;
  font-weight: 700;
}

.signup-info-field em {
  margin-left: 2px;
  font-style: normal;
  color: #ff4e45;
}

.signup-info-field i {
  font-style: normal;
  font-weight: 400;
}

.signup-info-field input {
  width: 100%;
  height: 56px;
  padding: 0 14px;
  border: 1px solid #e2e2e2;
  background: #ffffff;
  color: #111111;
  font-size: 15px;
  box-sizing: border-box;
  outline: none;
}

.signup-info-field input::placeholder {
  color: #bdbdbd;
}

.signup-info-field input:focus {
  border-color: #111111;
}

.signup-info-field--group {
  margin-bottom: 38px;
}

.signup-info-status {
  margin: 16px 0 0;
  text-align: center;
  font-size: 14px;
  line-height: 1.6;
}

.signup-info-status--neutral {
  color: #555555;
}

.signup-info-status--error {
  color: #c62828;
}

.signup-info-submit {
  width: 100%;
  height: 54px;
  margin-top: 34px;
  border: 0;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
}

.signup-info-submit:disabled {
  background: #b5b5b5;
  cursor: default;
}

@media (max-width: 900px) {
  .signup-info-stepbar {
    grid-template-columns: 1fr;
  }

  .signup-info-stepbar__item {
    border-right: 0;
    border-bottom: 1px solid #dcdcdc;
  }

  .signup-info-stepbar__item:last-child {
    border-bottom: 0;
  }
}

@media (max-width: 640px) {
  .signup-info-page__inner {
    width: min(100%, calc(100% - 24px));
    padding-bottom: 72px;
  }

  .signup-info-formwrap {
    margin-top: 40px;
  }

  .signup-info-formwrap h1 {
    font-size: 22px;
  }

  .signup-info-subtitle {
    font-size: 14px;
  }

  .signup-info-field > span {
    font-size: 16px;
  }

  .signup-info-field input,
  .signup-info-address-row button {
    height: 52px;
  }

  .signup-info-address-row {
    grid-template-columns: 1fr;
  }

  .signup-info-submit {
    font-size: 18px;
  }
}
</style>
