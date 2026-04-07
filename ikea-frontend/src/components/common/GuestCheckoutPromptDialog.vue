<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'guest-order', 'member-order']);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="guest-checkout-dialog__overlay"
      @click.self="emit('close')"
    >
      <section
        class="guest-checkout-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-checkout-dialog-title"
      >
        <button
          class="guest-checkout-dialog__close"
          type="button"
          aria-label="팝업 닫기"
          @click="emit('close')"
        >
          ×
        </button>

        <h2 id="guest-checkout-dialog-title">로그인 안내</h2>
        <p>회원 혜택을 받고 주문하시겠습니까?</p>
        <ul>
          <li>회원 전용 쿠폰, 포인트</li>
        </ul>

        <div class="guest-checkout-dialog__actions">
          <button
            class="guest-checkout-dialog__button guest-checkout-dialog__button--secondary"
            type="button"
            @click="emit('guest-order')"
          >
            비회원 주문하기
          </button>
          <button
            class="guest-checkout-dialog__button guest-checkout-dialog__button--primary"
            type="button"
            @click="emit('member-order')"
          >
            회원으로 주문하기
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.guest-checkout-dialog__overlay {
  position: fixed;
  inset: 0;
  z-index: 140;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(17, 24, 39, 0.62);
}

.guest-checkout-dialog {
  position: relative;
  width: min(400px, calc(100vw - 48px));
  padding: 36px 28px 40px;
  background: #ffffff;
  box-sizing: border-box;
}

.guest-checkout-dialog__close {
  position: absolute;
  top: 18px;
  right: 22px;
  border: 0;
  background: transparent;
  color: #111111;
  font-size: 34px;
  line-height: 1;
  cursor: pointer;
}

.guest-checkout-dialog h2 {
  margin: 0;
  text-align: center;
  color: #111111;
  font-size: 22px;
  line-height: 1.25;
  letter-spacing: -0.04em;
}

.guest-checkout-dialog p {
  margin: 30px 0 0;
  color: #222222;
  font-size: 16px;
  line-height: 1.7;
  white-space: pre-line;
}

.guest-checkout-dialog ul {
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
  color: #222222;
  font-size: 16px;
  line-height: 1.7;
}

.guest-checkout-dialog li::before {
  content: '- ';
}

.guest-checkout-dialog__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 30px;
}

.guest-checkout-dialog__button {
  min-height: 50px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.guest-checkout-dialog__button--secondary {
  border: 1px solid #111111;
  background: #ffffff;
  color: #111111;
}

.guest-checkout-dialog__button--primary {
  border: 1px solid #111111;
  background: #111111;
  color: #ffffff;
}

@media (max-width: 640px) {
  .guest-checkout-dialog {
    padding: 32px 20px 24px;
  }

  .guest-checkout-dialog p,
  .guest-checkout-dialog ul {
    font-size: 15px;
  }

  .guest-checkout-dialog__actions {
    grid-template-columns: 1fr;
  }
}
</style>
