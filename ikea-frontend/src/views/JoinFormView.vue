<script setup>
import { useRouter } from 'vue-router';
import SiteChrome from '../components/layout/SiteChrome.vue';
import { ROUTE_PATHS } from '../constants/routes';

const router = useRouter();

const goSignupComplete = () => {
  router.push(ROUTE_PATHS.memberJoinComplete);
};
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
          <span>〉</span>
          <span>회원가입</span>
          <span>〉</span>
          <span>정보입력</span>
        </div>

        <div class="signup-info-stepbar" aria-label="회원가입 단계">
          <div class="signup-info-stepbar__item">STEP 1. 약관안내</div>
          <div class="signup-info-stepbar__item signup-info-stepbar__item--active">STEP 2. 정보입력</div>
          <div class="signup-info-stepbar__item">STEP 3. 가입완료</div>
        </div>

        <section class="signup-info-formwrap">
          <h1>회원정보 입력</h1>
          <p class="signup-info-subtitle">로그인에 사용할 기본 정보를 입력해 주세요.</p>

          <form class="signup-info-form" @submit.prevent>
            <label class="signup-info-field">
              <span>아이디(이메일)<em>*</em></span>
              <input type="text" placeholder="아이디(이메일) 입력" />
            </label>

            <label class="signup-info-field">
              <span>비밀번호<em>*</em></span>
              <input type="password" placeholder="8-15자 이내의 영문, 숫자, 특수문자의 조합으로 입력" />
            </label>

            <label class="signup-info-field">
              <span>비밀번호 확인<em>*</em></span>
              <input type="password" placeholder="비밀번호 확인" />
            </label>

            <div class="signup-info-field signup-info-field--group">
              <span>기본주소 <i>(선택)</i></span>
              <div class="signup-info-address-row">
                <input type="text" placeholder="우편번호" />
                <button type="button">우편번호 찾기</button>
              </div>
              <input type="text" placeholder="주소 입력" />
              <input type="text" placeholder="상세 주소" />
            </div>

            <div class="signup-info-note">입력한 정보는 회원가입과 주문 조회에 필요한 기본 항목으로만 사용됩니다.</div>

            <button class="signup-info-submit" type="button" @click="goSignupComplete">가입완료하기</button>
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

.signup-info-subtitle {
  margin: 12px 0 0;
  text-align: center;
  color: #333333;
  font-size: 15px;
  line-height: 1.6;
}

.signup-info-form {
  margin-top: 48px;
}

.signup-info-field {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 36px;
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

.signup-info-field--group {
  margin-bottom: 38px;
}

.signup-info-address-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px;
  gap: 8px;
}

.signup-info-address-row button {
  height: 56px;
  border: 1px solid #d7d7d7;
  background: #ffffff;
  color: #111111;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.signup-info-note {
  margin-top: 8px;
  padding-top: 34px;
  border-top: 1px solid #ebebeb;
  text-align: center;
  color: #888888;
  font-size: 12px;
  line-height: 1.7;
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
