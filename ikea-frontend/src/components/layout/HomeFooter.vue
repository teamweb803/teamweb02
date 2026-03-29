<script setup>
import { storeToRefs } from 'pinia';
import { useHomeStore } from '../../stores/home';

const homeStore = useHomeStore();
const {
  footerInfoLines,
  footerLinks,
  footerNotice,
  footerSupportCards,
} = storeToRefs(homeStore);
</script>

<template>
  <footer class="hs-footer">
    <div class="hs-footer__inner">
      <div class="hs-footer__top">
        <nav class="hs-footer__links">
          <a v-for="link in footerLinks" :key="link" href="/" @click.prevent>{{ link }}</a>
        </nav>
        <button class="hs-footer__family" type="button">
          <span>FAMILY SITE</span>
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M7 10L12 15L17 10"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <section class="hs-footer__service">
        <div class="hs-footer__service-grid">
          <div class="hs-footer__brand">
            <img class="hs-footer__brand-logo" src="/logo.png" alt="HOMiO" />
            <strong>고객센터 이용안내</strong>
            <p>평일 09:00 - 18:00, 토요일 09:00 - 13:00</p>
            <p>(일요일 및 공휴일 휴무)</p>
          </div>

          <article
            v-for="card in footerSupportCards"
            :key="card.title"
            class="hs-support-inline"
          >
            <div class="hs-support-inline__head">
              <strong>{{ card.title }}</strong>
              <span>|</span>
            </div>
            <p>{{ card.description }}</p>
            <b>{{ card.phone }}</b>
            <button type="button">{{ card.cta }}</button>
          </article>

          <div class="hs-footer__qr">
            <div class="hs-footer__qr-box">QR</div>
            <span>QR 보기</span>
          </div>
        </div>
      </section>

      <section class="hs-footer__company">
        <div class="hs-footer__company-lines">
          <p v-for="line in footerInfoLines" :key="line">{{ line }}</p>
        </div>
        <a href="/" @click.prevent>매장 위치보기</a>
      </section>

      <p class="hs-footer__escrow">
        KEB하나은행 구매안전서비스(채무지급보증) 서비스 가입사실 확인
      </p>
      <p class="hs-footer__copy">(C) HOMiO. All rights reserved.</p>
      <p v-if="footerNotice" class="hs-footer__notice">{{ footerNotice }}</p>
    </div>
  </footer>
</template>

<style scoped>
.hs-footer {
  border-top: 1px solid var(--hs-line, #e5e7eb);
  background: var(--hs-soft, #f5f7fa);
  padding: 18px 0 22px;
}

.hs-footer__inner {
  width: min(1280px, calc(100% - 40px));
  margin: 0 auto;
  display: grid;
  gap: 14px;
}

.hs-footer__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.hs-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hs-footer__links a,
.hs-footer__company a {
  color: var(--hs-ink, #111827);
  font-size: 13px;
}

.hs-footer__family {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #d8dde5;
  background: #ffffff;
  color: var(--hs-ink, #111827);
  cursor: pointer;
  font-size: 13px;
}

.hs-footer__family svg {
  width: 18px;
  height: 18px;
}

.hs-footer__service-grid {
  display: grid;
  grid-template-columns: minmax(220px, 1.1fr) repeat(2, minmax(180px, 1fr)) 108px;
  gap: 14px;
  align-items: start;
}

.hs-footer__brand {
  display: grid;
  gap: 4px;
  align-content: start;
}

.hs-footer__brand-logo {
  width: 148px;
  height: auto;
}

.hs-footer__brand strong,
.hs-support-inline__head strong {
  font-size: 16px;
  color: var(--hs-ink, #111827);
}

.hs-footer__brand p,
.hs-support-inline p,
.hs-footer__company p,
.hs-footer__escrow,
.hs-footer__copy,
.hs-footer__notice {
  margin: 0;
  color: var(--hs-muted, #6b7280);
  font-size: 13px;
  line-height: 1.45;
}

.hs-support-inline {
  display: grid;
  gap: 6px;
  align-content: start;
}

.hs-support-inline__head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hs-support-inline b {
  color: var(--hs-ink, #111827);
  font-size: 15px;
  font-weight: 600;
}

.hs-support-inline button {
  width: fit-content;
  min-height: 36px;
  padding: 0 16px;
  border: 1px solid #d8dde5;
  background: #ffffff;
  color: var(--hs-ink, #111827);
  cursor: pointer;
  font-size: 13px;
}

.hs-footer__qr {
  display: grid;
  justify-items: center;
  gap: 6px;
}

.hs-footer__qr-box {
  width: 92px;
  height: 92px;
  border: 1px solid #d8dde5;
  background:
    linear-gradient(90deg, #111111 10px, transparent 10px) 0 0 / 28px 28px,
    linear-gradient(#111111 10px, transparent 10px) 0 0 / 28px 28px,
    linear-gradient(90deg, transparent 18px, #111111 18px) 0 0 / 28px 28px,
    linear-gradient(transparent 18px, #111111 18px) 0 0 / 28px 28px,
    #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #111111;
  font-size: 15px;
  font-weight: 700;
}

.hs-footer__company {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding-top: 8px;
  border-top: 1px solid #e4e8ef;
}

.hs-footer__company-lines {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
}

.hs-footer__company-lines p {
  position: relative;
  padding-right: 14px;
}

.hs-footer__company-lines p::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 0;
  width: 1px;
  height: 12px;
  background: #d8dde5;
  transform: translateY(-50%);
}

.hs-footer__company-lines p:last-child::after {
  display: none;
}

.hs-footer__escrow,
.hs-footer__copy,
.hs-footer__notice {
  font-size: 12px;
}

@media (max-width: 1180px) {
  .hs-footer__service-grid {
    grid-template-columns: 1fr;
  }

  .hs-footer__company {
    display: grid;
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .hs-footer__inner {
    width: calc(100% - 24px);
  }

  .hs-footer__top {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
