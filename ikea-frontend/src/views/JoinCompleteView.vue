<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SiteChrome from '../components/layout/SiteChrome.vue';
import { ROUTE_PATHS } from '../constants/routes';

const route = useRoute();
const router = useRouter();
const joinedName = computed(() => String(route.query.name ?? route.query.loginId ?? 'HOMiO 회원').trim() || 'HOMiO 회원');

function goLogin() {
  const loginId = String(route.query.loginId ?? '').trim();

  router.push({
    path: ROUTE_PATHS.memberLogin,
    query: loginId ? { loginId } : undefined,
  });
}
</script>

<template>
  <SiteChrome>
    <main class="signup-complete-page">
      <div class="signup-complete-page__inner">
        <div class="signup-complete-breadcrumb">
          <RouterLink to="/" class="signup-complete-breadcrumb__home" aria-label="홈으로 이동">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 10.5L12 4L20 10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 9.8V19H17V9.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
          <span>></span>
          <span>회원가입</span>
          <span>></span>
          <span>가입완료</span>
        </div>

        <div class="signup-complete-stepbar" aria-label="회원가입 단계">
          <div class="signup-complete-stepbar__item">STEP 1. 약관안내</div>
          <div class="signup-complete-stepbar__item">STEP 2. 정보입력</div>
          <div class="signup-complete-stepbar__item signup-complete-stepbar__item--active">STEP 3. 가입완료</div>
        </div>

        <section class="signup-complete-card" aria-labelledby="signup-complete-title">
          <h1 id="signup-complete-title">가입 완료</h1>
          <p class="signup-complete-name"><strong>{{ joinedName }}</strong> 님의 회원가입이 완료되었습니다.</p>
          <p class="signup-complete-desc">로그인 후 장바구니, 주문 조회, 마이페이지를 바로 이용할 수 있습니다.</p>
          <button class="signup-complete-button" type="button" @click="goLogin">로그인 하러가기</button>
        </section>
      </div>
    </main>
  </SiteChrome>
</template>

<style scoped>
.signup-complete-page {
  background: #ffffff;
}

.signup-complete-page__inner {
  width: min(1280px, calc(100% - 40px));
  margin: 0 auto;
  min-height: 820px;
  padding: 34px 0 96px;
}

.signup-complete-breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #8f8f8f;
  font-size: 13px;
  line-height: 1;
}

.signup-complete-breadcrumb__home {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: #8f8f8f;
}

.signup-complete-breadcrumb__home svg {
  width: 100%;
  height: 100%;
}

.signup-complete-stepbar {
  margin-top: 38px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid #dcdcdc;
}

.signup-complete-stepbar__item {
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

.signup-complete-stepbar__item:last-child {
  border-right: 0;
}

.signup-complete-stepbar__item--active {
  background: #0d0d0d;
  color: #ffffff;
  font-weight: 700;
}

.signup-complete-card {
  max-width: 720px;
  margin: 74px auto 0;
  padding-top: 52px;
  text-align: center;
}

.signup-complete-card h1 {
  margin: 0;
  color: #111111;
  font-size: 68px;
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.05em;
}

.signup-complete-name {
  margin: 36px 0 0;
  color: #111111;
  font-size: 22px;
  line-height: 1.55;
  font-weight: 500;
}

.signup-complete-name strong {
  font-weight: 800;
}

.signup-complete-desc {
  margin: 20px 0 0;
  color: #4a4a4a;
  font-size: 18px;
  line-height: 1.8;
}

.signup-complete-button {
  width: 320px;
  height: 58px;
  margin-top: 52px;
  border: 0;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  font-size: 20px;
  line-height: 1;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 900px) {
  .signup-complete-page__inner {
    width: min(100%, calc(100% - 32px));
    min-height: 0;
    padding: 40px 0 72px;
  }

  .signup-complete-stepbar {
    grid-template-columns: 1fr;
  }

  .signup-complete-stepbar__item {
    border-right: 0;
    border-bottom: 1px solid #dcdcdc;
  }

  .signup-complete-stepbar__item:last-child {
    border-bottom: 0;
  }

  .signup-complete-card {
    padding-top: 24px;
  }

  .signup-complete-card h1 {
    font-size: 42px;
  }

  .signup-complete-name {
    margin-top: 32px;
    font-size: 18px;
  }

  .signup-complete-desc {
    margin-top: 28px;
    font-size: 17px;
    line-height: 1.65;
    word-break: keep-all;
  }

  .signup-complete-button {
    width: 100%;
    max-width: 360px;
    height: 60px;
    margin-top: 50px;
    font-size: 22px;
  }
}
</style>
