<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import SiteChrome from '../components/layout/SiteChrome.vue';
import { ROUTE_PATHS } from '../constants/routes';

const agreeAge = ref(false);
const agreeService = ref(false);
const agreeLocation = ref(false);
const agreeEventPrivacy = ref(false);
const agreeEventReceive = ref(false);
const router = useRouter();

const allChecked = computed({
  get() {
    return (
      agreeAge.value &&
      agreeService.value &&
      agreeLocation.value &&
      agreeEventPrivacy.value &&
      agreeEventReceive.value
    );
  },
  set(value) {
    agreeAge.value = value;
    agreeService.value = value;
    agreeLocation.value = value;
    agreeEventPrivacy.value = value;
    agreeEventReceive.value = value;
  },
});

const canSubmit = computed(() => agreeAge.value && agreeService.value);

watch(agreeEventPrivacy, (value) => {
  if (!value) agreeEventReceive.value = false;
});
</script>

<template>
  <SiteChrome>
    <main class="signup-page">
      <div class="signup-page__inner">
        <div class="signup-breadcrumb">
          <RouterLink to="/" class="signup-breadcrumb__home" aria-label="홈으로 이동">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 10.5L12 4L20 10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 9.8V19H17V9.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
          <span>〉</span>
          <span>회원가입</span>
          <span>〉</span>
          <span>약관안내</span>
        </div>

        <div class="signup-stepbar" aria-label="회원가입 단계">
          <div class="signup-stepbar__item signup-stepbar__item--active">STEP 1. 약관안내</div>
          <div class="signup-stepbar__item">STEP 2. 정보입력</div>
          <div class="signup-stepbar__item">STEP 3. 가입완료</div>
        </div>

        <section class="signup-consent">
          <h1>HOMiO 서비스 이용약관에 동의해주세요.</h1>

          <label class="signup-check signup-check--all">
            <input v-model="allChecked" type="checkbox" />
            <span>전체동의</span>
          </label>
          <p class="signup-intro">
            HOMiO 서비스 이용약관, 개인정보 수집 및 이용, 위치정보 이용약관(선택), 마케팅 수신(선택)에 모두 동의합니다.<br />
            선택항목 동의를 거부하셔도 서비스 이용이 가능합니다.
          </p>

          <div class="signup-divider"></div>

          <div class="signup-list">
            <div class="signup-row signup-row--solo">
              <label class="signup-check">
                <input v-model="agreeAge" type="checkbox" />
                <span>만 14세 이상입니다. <em>(필수)</em></span>
              </label>
            </div>

            <div class="signup-row">
              <label class="signup-check">
                <input v-model="agreeService" type="checkbox" />
                <span>HOMiO 서비스 이용약관 동의 <em>(필수)</em></span>
              </label>
              <span class="signup-view-note">전문 준비 중</span>
            </div>

            <div class="signup-row">
              <label class="signup-check">
                <input v-model="agreeLocation" type="checkbox" />
                <span>위치정보 수집 및 이용 동의 <i>(선택)</i></span>
              </label>
              <span class="signup-view-note">전문 준비 중</span>
            </div>
          </div>

          <p class="signup-inline-note">
            약관 전문 연결은 아직 준비 중이며, 필수 동의 항목은 다음 단계에서도 다시 확인할 수 있습니다.
          </p>

          <div class="signup-divider signup-divider--section"></div>

          <p class="signup-section-title">이벤트 · 혜택 정보 개인정보 수집 이용 및 수신 동의</p>

          <div class="signup-row">
            <label class="signup-check">
              <input v-model="agreeEventPrivacy" type="checkbox" />
              <span>이벤트 · 혜택정보 개인정보 수집 및 이용 동의 <i>(선택)</i></span>
            </label>
            <span class="signup-view-note">전문 준비 중</span>
          </div>

          <div class="signup-row signup-row--disabled">
            <label class="signup-check">
              <input v-model="agreeEventReceive" type="checkbox" :disabled="!agreeEventPrivacy" />
              <span>이벤트 · 혜택 정보 수신 동의 <i>(선택)</i></span>
            </label>
          </div>
          <p class="signup-subnote">
            이벤트·혜택 정보 수신에 동의하셔야 혜택 정보를 받을 수 있습니다. 단, 상품 구매정보는 수신동의 여부에 관계없이<br />
            발송됩니다.
          </p>

          <button class="signup-submit" :class="{ 'is-enabled': canSubmit }" type="button" @click="canSubmit && router.push(ROUTE_PATHS.memberJoinForm)">
            동의하고 가입하기
          </button>
        </section>
      </div>
    </main>
  </SiteChrome>
</template>

<style scoped>
.signup-page {
  background: #ffffff;
}

.signup-page__inner {
  width: min(1280px, calc(100% - 40px));
  margin: 0 auto;
  padding: 34px 0 92px;
}

.signup-breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #8f8f8f;
  font-size: 13px;
  line-height: 1;
}

.signup-breadcrumb__home {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: #8f8f8f;
}

.signup-breadcrumb__home svg {
  width: 100%;
  height: 100%;
}

.signup-stepbar {
  margin-top: 44px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid #dcdcdc;
}

.signup-stepbar__item {
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

.signup-stepbar__item:last-child {
  border-right: 0;
}

.signup-stepbar__item--active {
  background: #0d0d0d;
  color: #ffffff;
  font-weight: 700;
}

.signup-consent {
  width: 100%;
  max-width: 520px;
  margin: 66px auto 0;
}

.signup-consent h1 {
  margin: 0 0 42px;
  text-align: center;
  color: #111111;
  font-size: 26px;
  line-height: 1.35;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.signup-check {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  line-height: 1.6;
  color: #111111;
}

.signup-check input {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: #0f0f0f;
}

.signup-check input:disabled {
  accent-color: #d7d7d7;
}

.signup-check span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.signup-check em {
  font-style: normal;
  color: #ff4e45;
}

.signup-check i {
  font-style: normal;
  color: #666666;
}

.signup-check--all {
  font-weight: 700;
}

.signup-intro {
  margin: 12px 0 0 28px;
  font-size: 12px;
  line-height: 1.7;
  color: #7b7b7b;
}

.signup-divider {
  margin: 28px 0 20px;
  border-top: 1px solid #151515;
}

.signup-divider--section {
  margin: 26px 0 26px;
  border-top-color: #e3e3e3;
}

.signup-list {
  display: grid;
  gap: 18px;
}

.signup-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.signup-row--solo {
  margin-bottom: 14px;
}

.signup-row--disabled {
  opacity: 0.42;
}

.signup-view-note {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid #d9d9d9;
  background: #fafafa;
  color: #666666;
  font-size: 13px;
}

.signup-inline-note {
  margin: 14px 0 0 28px;
  color: #7b7b7b;
  font-size: 12px;
  line-height: 1.7;
}

.signup-section-title {
  margin: 0 0 22px;
  font-size: 14px;
  line-height: 1.5;
  color: #222222;
  font-weight: 500;
}

.signup-subnote {
  margin: 8px 0 0 28px;
  font-size: 12px;
  line-height: 1.7;
  color: #7b7b7b;
}

.signup-submit {
  width: 100%;
  height: 54px;
  margin-top: 58px;
  border: 0;
  border-radius: 999px;
  background: #f2f2f2;
  color: #b8b8b8;
  font-size: 20px;
  font-weight: 700;
  cursor: default;
}

.signup-submit.is-enabled {
  background: #111111;
  color: #ffffff;
  cursor: pointer;
}

@media (max-width: 900px) {
  .signup-stepbar {
    grid-template-columns: 1fr;
  }

  .signup-stepbar__item {
    border-right: 0;
    border-bottom: 1px solid #dcdcdc;
  }

  .signup-stepbar__item:last-child {
    border-bottom: 0;
  }
}

@media (max-width: 640px) {
  .signup-page__inner {
    width: min(100%, calc(100% - 24px));
    padding-bottom: 72px;
  }

  .signup-consent {
    max-width: none;
    margin-top: 40px;
  }

  .signup-consent h1 {
    font-size: 22px;
    text-align: left;
  }

  .signup-row {
    align-items: flex-start;
  }

  .signup-submit {
    font-size: 18px;
  }
}
</style>
