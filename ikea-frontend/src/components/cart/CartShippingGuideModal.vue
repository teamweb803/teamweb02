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
    <div v-if="open" class="cart-modal-overlay" @click.self="emit('close')">
      <section class="cart-modal" role="dialog" aria-modal="true" aria-label="배송 안내">
        <button class="cart-modal__close" type="button" aria-label="닫기" @click="emit('close')">×</button>
        <h2>{{ title }}</h2>
        <div class="cart-modal__divider"></div>
        <p>{{ body }}</p>
        <ul>
          <li>배송 일정과 추가 비용은 주문서작성 단계에서 주소와 설치 환경을 기준으로 다시 계산됩니다.</li>
          <li>대형 가구와 설치 상품은 현장 여건에 따라 추가 안내가 발생할 수 있습니다.</li>
        </ul>
        <button class="cart-modal__confirm" type="button" @click="emit('close')">확인</button>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.cart-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(17, 24, 39, 0.45);
}

.cart-modal {
  position: relative;
  width: min(520px, 100%);
  padding: 28px;
  background: #ffffff;
  border: 1px solid #d9e2ec;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
  display: grid;
  gap: 18px;
}

.cart-modal h2 {
  margin: 0;
  font-size: 24px;
  line-height: 1.3;
  letter-spacing: -0.03em;
}

.cart-modal p,
.cart-modal li {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.7;
}

.cart-modal ul {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
}

.cart-modal__divider {
  height: 1px;
  background: #e5e7eb;
}

.cart-modal__close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: #6b7280;
  font-size: 26px;
  cursor: pointer;
}

.cart-modal__confirm {
  min-height: 46px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  border: 1px solid #111827;
  background: #111827;
  color: #ffffff;
}
</style>
