<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'confirm']);
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="checkout-modal-overlay" @click.self="emit('close')">
      <section class="checkout-modal" role="dialog" aria-modal="true" aria-label="설치 안내">
        <button class="checkout-modal__close" type="button" aria-label="닫기" @click="emit('close')">×</button>
        <h2>필수 설치 공간 및 현장 추가비용 안내</h2>
        <div class="checkout-modal__divider"></div>
        <p>설치 상품은 엘리베이터, 진입 가능 여부, 계단 폭, 현장 여건에 따라 추가 운반비가 달라질 수 있으며, 결제 단계에서 모두 확정되기 어려울 수 있습니다.</p>
        <ul>
          <li>현장 구조와 진입 동선에 따라 결제 단계에서 예상하지 못한 추가 운반비가 현장에서 별도 안내될 수 있습니다.</li>
          <li>현장 상황에 따라 사다리차, 추가 인력, 분해 및 재조립 비용이 발생할 수 있습니다.</li>
          <li>설치 전 안내된 조건과 실제 현장 상황이 다르면 배송 일정이 조정될 수 있습니다.</li>
          <li>필수 안내를 확인한 뒤에만 설치 상품 주문을 진행해 주세요.</li>
        </ul>
        <button class="checkout-modal__confirm" type="button" @click="emit('confirm')">확인</button>
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
