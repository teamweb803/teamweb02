<script setup>
import CommonStatePanel from '../components/common/CommonStatePanel.vue';
import SiteChrome from '../components/layout/SiteChrome.vue';
import { useTossPaymentRedirect } from '../composables/useTossPaymentRedirect';

const props = defineProps({
  status: {
    type: String,
    default: 'success',
  },
});

const {
  actions,
  description,
  hasOrderNumber,
  orderNumber,
  title,
  tone,
} = useTossPaymentRedirect(props.status);
</script>

<template>
  <SiteChrome>
    <main class="toss-payment-page">
      <div class="toss-payment-page__inner">
        <CommonStatePanel
          :title="title || '토스페이 상태를 확인하고 있습니다.'"
          :description="description"
          :tone="tone"
          layout="boxed"
          compact
        >
          <template #actions>
            <RouterLink
              v-for="action in actions"
              :key="action.label"
              :to="action.to"
              class="toss-payment-page__action"
              :class="action.variant === 'primary'
                ? 'toss-payment-page__action--primary'
                : 'toss-payment-page__action--secondary'"
            >
              {{ action.label }}
            </RouterLink>
          </template>
        </CommonStatePanel>

        <section v-if="hasOrderNumber" class="toss-payment-page__order-box">
          <span>주문번호</span>
          <strong>{{ orderNumber }}</strong>
        </section>
      </div>
    </main>
  </SiteChrome>
</template>

<style scoped>
.toss-payment-page {
  padding: 48px 0 88px;
  background: #ffffff;
}

.toss-payment-page__inner {
  width: min(720px, calc(100% - 40px));
  margin: 0 auto;
  display: grid;
  gap: 18px;
}

.toss-payment-page__action {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
}

.toss-payment-page__action--primary {
  background: #111827;
  color: #ffffff;
}

.toss-payment-page__action--secondary {
  border: 1px solid #d5d8dd;
  background: #ffffff;
  color: #555555;
}

.toss-payment-page__order-box {
  padding: 18px 20px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  display: grid;
  gap: 8px;
}

.toss-payment-page__order-box span {
  color: #6b7280;
  font-size: 13px;
}

.toss-payment-page__order-box strong {
  color: #111111;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
</style>
