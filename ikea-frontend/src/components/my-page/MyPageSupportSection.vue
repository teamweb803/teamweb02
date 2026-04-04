<script setup>
defineEmits(['withdraw']);

defineProps({
  accountHighlights: {
    type: Array,
    required: true,
  },
  profile: {
    type: Object,
    required: true,
  },
  supportCards: {
    type: Array,
    required: true,
  },
  withdrawalGuideItems: {
    type: Array,
    required: true,
  },
  withdrawalHintMessage: {
    type: String,
    default: '',
  },
  withdrawalHintTone: {
    type: String,
    default: 'neutral',
  },
  canWithdraw: {
    type: Boolean,
    default: false,
  },
  isWithdrawalSubmitting: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <section id="support" class="my-section">
    <div class="my-panel-grid my-panel-grid--support">
      <section class="my-panel">
        <header class="my-panel__head">
          <strong>회원 정보</strong>
        </header>
        <div class="my-account-board">
          <article class="my-account-row">
            <span>{{ accountHighlights[0].label }}</span>
            <strong>{{ profile.loginId }}</strong>
          </article>
          <article class="my-account-row">
            <span>{{ accountHighlights[1].label }}</span>
            <strong>{{ profile.address }}</strong>
          </article>
          <article class="my-account-row">
            <span>{{ accountHighlights[2].label }}</span>
            <strong>{{ profile.phone }}</strong>
          </article>
        </div>
      </section>

      <section class="my-panel">
        <header class="my-panel__head">
          <strong>고객센터 바로가기</strong>
        </header>
        <div class="my-support-board">
          <RouterLink v-for="item in supportCards" :key="item.id" :to="item.to" class="my-support-row">
            <strong>{{ item.title }}</strong>
            <span>{{ item.actionLabel }}</span>
          </RouterLink>
        </div>
      </section>

      <section class="my-panel my-panel--withdrawal">
        <header class="my-panel__head">
          <strong>회원 탈퇴</strong>
        </header>
        <div class="my-withdrawal-board">
          <div class="my-withdrawal-copy">
            <p class="my-withdrawal-copy__lead">
              탈퇴 처리 후에는 현재 계정으로 다시 로그인할 수 없습니다.
            </p>
            <ul class="my-withdrawal-copy__list">
              <li v-for="item in withdrawalGuideItems" :key="item">
                {{ item }}
              </li>
            </ul>
            <p
              v-if="withdrawalHintMessage"
              class="my-withdrawal-copy__hint"
              :class="`is-${withdrawalHintTone}`"
            >
              {{ withdrawalHintMessage }}
            </p>
          </div>

          <button
            type="button"
            class="my-withdrawal-button"
            :disabled="!canWithdraw || isWithdrawalSubmitting"
            @click="$emit('withdraw')"
          >
            {{ isWithdrawalSubmitting ? '탈퇴 처리 중...' : '회원 탈퇴' }}
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.my-section {
  margin-top: 40px;
}

.my-panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 44px;
  align-items: start;
}

.my-panel {
  border-top: 1px solid var(--border-strong);
  min-width: 0;
}

.my-panel__head {
  padding: 18px 0 16px;
  border-bottom: 1px solid var(--border-soft);
}

.my-panel__head strong {
  display: block;
  color: var(--text-strong);
  font-size: 20px;
}

.my-support-board,
.my-account-board {
  display: grid;
}

.my-account-board {
  grid-auto-rows: minmax(74px, auto);
  border-bottom: 1px solid var(--border-muted);
}

.my-account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 52px;
  border-bottom: 1px solid var(--border-muted);
}

.my-account-row:last-child {
  border-bottom: 0;
}

.my-account-row span {
  color: var(--text-muted-strong);
  font-size: 14px;
}

.my-account-row strong {
  color: var(--text-strong);
  font-size: 15px;
  text-align: right;
}

.my-support-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
  min-height: 74px;
  border-bottom: 1px solid var(--border-muted);
  color: var(--text-strong);
  text-decoration: none;
}

.my-support-row:last-child {
  border-bottom: 0;
}

.my-support-row strong {
  display: block;
  color: var(--text-strong);
  font-size: 16px;
}

.my-support-row span {
  color: var(--text-strong);
  font-size: 13px;
  font-weight: 700;
}

.my-panel-grid--support {
  gap: 52px;
}

.my-panel--withdrawal {
  grid-column: 1 / -1;
}

.my-withdrawal-board {
  display: flex;
  justify-content: space-between;
  gap: 32px;
  padding: 18px 0 0;
}

.my-withdrawal-copy {
  min-width: 0;
}

.my-withdrawal-copy__lead,
.my-withdrawal-copy__hint {
  margin: 0;
  color: var(--text-muted-strong);
  font-size: 14px;
  line-height: 1.7;
}

.my-withdrawal-copy__list {
  margin: 14px 0 0;
  padding-left: 18px;
  color: var(--text-muted-strong);
  font-size: 14px;
  line-height: 1.8;
}

.my-withdrawal-copy__hint {
  margin-top: 16px;
}

.my-withdrawal-copy__hint.is-warning {
  color: #9d2f2f;
}

.my-withdrawal-copy__hint.is-success {
  color: #1f5f3b;
}

.my-withdrawal-button {
  min-width: 156px;
  height: 44px;
  padding: 0 18px;
  border: 1px solid #111111;
  background: #ffffff;
  color: #111111;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.my-withdrawal-button:disabled {
  border-color: #d0d0d0;
  color: #8a8a8a;
  cursor: default;
}

@media (max-width: 1080px) {
  .my-panel-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .my-panel-grid {
    grid-template-columns: 1fr;
  }

  .my-support-row {
    grid-template-columns: 1fr;
  }

  .my-withdrawal-board {
    display: grid;
  }

  .my-withdrawal-button {
    width: 100%;
  }
}
</style>
