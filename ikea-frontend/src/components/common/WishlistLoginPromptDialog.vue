<script setup>
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { ROUTE_PATHS } from '../../constants/routes';
import { useWishlistStore } from '../../stores/wishlist';

const router = useRouter();
const wishlistStore = useWishlistStore();
const { loginPromptOpen, loginPromptRedirectPath } = storeToRefs(wishlistStore);

function closeDialog() {
  wishlistStore.closeLoginPrompt();
}

function moveToLogin() {
  const redirectPath = String(loginPromptRedirectPath.value ?? '').startsWith('/')
    ? loginPromptRedirectPath.value
    : ROUTE_PATHS.home;

  wishlistStore.closeLoginPrompt();
  router.push({
    path: ROUTE_PATHS.memberLogin,
    query: {
      reason: 'auth-required',
      redirect: redirectPath,
    },
  });
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="loginPromptOpen"
      class="wishlist-login-dialog__overlay"
      @click.self="closeDialog"
    >
      <section
        class="wishlist-login-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wishlist-login-dialog-title"
      >
        <button
          class="wishlist-login-dialog__close"
          type="button"
          aria-label="팝업 닫기"
          @click="closeDialog"
        >
          ×
        </button>

        <h2 id="wishlist-login-dialog-title">
          로그인 후 이용 가능합니다.<br />
          로그인 하시겠습니까?
        </h2>

        <div class="wishlist-login-dialog__actions">
          <button
            class="wishlist-login-dialog__button wishlist-login-dialog__button--secondary"
            type="button"
            @click="closeDialog"
          >
            취소
          </button>
          <button
            class="wishlist-login-dialog__button wishlist-login-dialog__button--primary"
            type="button"
            @click="moveToLogin"
          >
            로그인
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.wishlist-login-dialog__overlay {
  position: fixed;
  inset: 0;
  z-index: 180;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(17, 24, 39, 0.56);
}

.wishlist-login-dialog {
  position: relative;
  width: min(468px, calc(100vw - 48px));
  padding: 54px 48px 42px;
  background: #ffffff;
  box-sizing: border-box;
}

.wishlist-login-dialog__close {
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

.wishlist-login-dialog h2 {
  margin: 0;
  text-align: center;
  color: #111111;
  font-size: 18px;
  line-height: 1.65;
  font-weight: 500;
  letter-spacing: -0.03em;
}

.wishlist-login-dialog__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 34px;
}

.wishlist-login-dialog__button {
  min-height: 50px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.wishlist-login-dialog__button--secondary {
  border: 1px solid #111111;
  background: #ffffff;
  color: #111111;
}

.wishlist-login-dialog__button--primary {
  border: 1px solid #111111;
  background: #111111;
  color: #ffffff;
}

@media (max-width: 640px) {
  .wishlist-login-dialog {
    padding: 48px 24px 28px;
  }

  .wishlist-login-dialog__actions {
    grid-template-columns: 1fr;
  }
}
</style>
