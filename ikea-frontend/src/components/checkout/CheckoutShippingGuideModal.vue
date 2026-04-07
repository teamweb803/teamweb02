<script setup>
defineProps({
  body: {
    type: String,
    default: '',
  },
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '배송 안내',
  },
});

const emit = defineEmits(['close']);
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="checkout-modal-overlay" @click.self="emit('close')">
      <section class="checkout-modal" role="dialog" aria-modal="true" aria-label="배송 안내">
        <button class="checkout-modal__close" type="button" aria-label="닫기" @click="emit('close')">×</button>
        <h2>{{ title }}</h2>
        <div class="checkout-modal__divider"></div>
        <p>{{ body }}</p>
        <ul>
          <li>배송 일정과 추가 비용은 주문서작성 단계에서 주소와 설치 환경을 기준으로 다시 계산됩니다.</li>
          <li>상품과 현장 조건에 따라 결제 단계에서 확정되지 않은 추가 비용이 배송 연락 또는 현장 확인 과정에서 별도 안내될 수 있습니다.</li>
          <li>대형 가구와 설치 상품은 현장 진입 동선, 사다리차 여부, 추가 인력 필요 여부에 따라 추가금이 발생할 수 있습니다.</li>
        </ul>
        <button class="checkout-modal__confirm" type="button" @click="emit('close')">확인</button>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.checkout-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(0, 0, 0, 0.58);
  display: grid;
  place-items: center;
}

.checkout-modal {
  position: relative;
  width: min(530px, calc(100vw - 48px));
  background: #ffffff;
  padding: 26px 32px 30px;
  box-sizing: border-box;
}

.checkout-modal h2 {
  margin: 0;
  color: #111111;
  font-size: 24px;
  letter-spacing: -0.04em;
}

.checkout-modal__close {
  position: absolute;
  top: 18px;
  right: 22px;
  border: 0;
  background: transparent;
  color: #111111;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}

.checkout-modal__divider {
  height: 2px;
  margin: 18px 0;
  background: #111111;
}

.checkout-modal p,
.checkout-modal li {
  margin: 0;
  color: #777777;
  font-size: 13px;
  line-height: 1.65;
}

.checkout-modal ul {
  margin: 18px 0 24px;
  padding-left: 18px;
  display: grid;
  gap: 10px;
}

.checkout-modal__confirm {
  width: 100%;
  max-width: 265px;
  height: 48px;
  margin: 0 auto;
  display: block;
  border: 0;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
</style>
