<script setup>
import CommonStatePanel from '../common/CommonStatePanel.vue';

defineProps({
  profile: {
    type: Object,
    required: true,
  },
  statusMessage: {
    type: String,
    default: '',
  },
  profileStateTone: {
    type: String,
    default: 'neutral',
  },
  profileStateTitle: {
    type: String,
    default: '',
  },
  profileStateDescription: {
    type: String,
    default: '',
  },
  summaryCards: {
    type: Array,
    required: true,
  },
  quickLinks: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <section id="overview" class="my-section">
    <div class="my-overview">
      <article class="my-overview__account my-overview__account--full">
        <div class="my-overview__account-row">
          <span>회원명</span>
          <strong>{{ profile.memberName }}</strong>
        </div>
        <div class="my-overview__account-row">
          <span>로그인 계정</span>
          <strong>{{ profile.loginId }}</strong>
        </div>
        <div class="my-overview__account-row">
          <span>회원 등급</span>
          <strong>{{ profile.membershipLabel }}</strong>
        </div>
        <div class="my-overview__account-row">
          <span>회원 구분</span>
          <strong>{{ profile.role }}</strong>
        </div>
        <div class="my-overview__account-row">
          <span>기본 배송지</span>
          <strong>{{ profile.address }}</strong>
        </div>
        <div class="my-overview__account-row">
          <span>연락처</span>
          <strong>{{ profile.phone }}</strong>
        </div>
      </article>
    </div>

    <CommonStatePanel
      v-if="statusMessage"
      class="my-overview__status"
      :tone="profileStateTone"
      :title="profileStateTitle"
      :description="profileStateDescription"
      layout="boxed"
      align="left"
      compact
    />

    <div class="my-summary-grid" aria-label="마이페이지 요약">
      <article v-for="card in summaryCards" :key="card.id" class="my-summary-card">
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
      </article>
    </div>

    <div class="my-shortcut-grid">
      <RouterLink v-for="link in quickLinks" :key="link.id" :to="link.to" class="my-shortcut-card">
        <strong>{{ link.label }}</strong>
        <span>바로가기</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.my-section {
  margin-top: 40px;
}

.my-overview {
  border-top: 1px solid var(--border-strong);
  border-bottom: 1px solid var(--border-soft);
}

.my-overview__account {
  padding: 24px 0;
  padding-inline: 0;
}

.my-overview__status {
  margin: 14px 0 0;
  color: var(--accent);
  font-size: 14px;
  line-height: 1.6;
}

.my-overview__account--full {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 48px;
}

.my-overview__account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 52px;
  border-bottom: 1px solid var(--border-muted);
}

.my-overview__account-row:last-child {
  border-bottom: 0;
}

.my-overview__account-row span {
  color: var(--text-muted-strong);
  font-size: 14px;
}

.my-overview__account-row strong {
  color: var(--text-strong);
  font-size: 15px;
  text-align: right;
}

.my-summary-grid,
.my-shortcut-grid {
  display: grid;
  gap: 44px;
}

.my-summary-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 20px;
}

.my-summary-card {
  padding: 20px 18px;
  border: 1px solid var(--border-soft);
  background: var(--surface-strong);
}

.my-summary-card span {
  display: block;
  color: var(--text-muted);
  font-size: 13px;
}

.my-summary-card strong {
  display: block;
  margin-top: 10px;
  color: var(--text-strong);
  font-size: 28px;
  line-height: 1.1;
}

.my-shortcut-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 20px;
}

.my-shortcut-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  min-height: 78px;
  padding: 18px 20px;
  border: 1px solid var(--border-default);
  background: var(--surface-strong);
  color: var(--text-strong);
  text-decoration: none;
}

.my-shortcut-card strong {
  font-size: 17px;
  line-height: 1.3;
}

.my-shortcut-card span {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  height: 40px;
  padding: 0 16px;
  border-radius: var(--radius-pill);
  background: var(--text-strong);
  color: var(--surface-strong);
  font-size: 13px;
  font-weight: 700;
}

@media (max-width: 1080px) {
  .my-summary-grid,
  .my-shortcut-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .my-overview {
    border-bottom: 1px solid var(--border-soft);
  }

  .my-overview__account--full {
    grid-template-columns: 1fr;
    column-gap: 0;
  }
}

@media (max-width: 720px) {
  .my-summary-grid,
  .my-shortcut-grid {
    grid-template-columns: 1fr;
  }

  .my-shortcut-card {
    grid-template-columns: 1fr;
  }
}
</style>
