<script setup>
import { computed, reactive, watch } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Object,
    default: null,
  },
  statusMessage: {
    type: String,
    default: '',
  },
  statusTone: {
    type: String,
    default: 'neutral',
  },
});

const emit = defineEmits(['close', 'submit']);

const form = reactive({
  rating: 5,
  content: '',
});

const canSubmit = computed(() => (
  Boolean(props.order)
  && Number(form.rating) >= 1
  && Number(form.rating) <= 5
  && String(form.content ?? '').trim()
  && !props.isSubmitting
));

const statusClass = computed(() => ({
  'my-review-dialog__status--error': props.statusTone === 'error',
  'my-review-dialog__status--success': props.statusTone === 'success',
}));

function resetForm() {
  form.rating = 5;
  form.content = '';
}

function submit() {
  if (!canSubmit.value) {
    return;
  }

  emit('submit', {
    rating: Number(form.rating),
    content: String(form.content ?? '').trim(),
  });
}

watch(
  () => [props.isOpen, props.order?.id],
  ([isOpen]) => {
    if (isOpen) {
      resetForm();
    }
  },
);
</script>

<template>
  <div v-if="isOpen" class="my-review-dialog" @click.self="emit('close')">
    <section class="my-review-dialog__panel" role="dialog" aria-modal="true" aria-label="리뷰 작성">
      <header class="my-review-dialog__head">
        <h3>리뷰 작성</h3>
        <button type="button" class="my-review-dialog__close" aria-label="닫기" @click="emit('close')">×</button>
      </header>

      <div class="my-review-dialog__body">
        <div v-if="order" class="my-review-dialog__product">
          <img :src="order.image" :alt="order.title" />
          <div>
            <strong>{{ order.title }}</strong>
            <p>{{ order.option }}</p>
            <span>{{ order.date }}</span>
          </div>
        </div>

        <div class="my-review-dialog__field">
          <span>평점</span>
          <div class="my-review-dialog__rating">
            <button
              v-for="value in 5"
              :key="value"
              type="button"
              :class="{ 'is-active': Number(form.rating) === value }"
              @click="form.rating = value"
            >
              {{ value }}점
            </button>
          </div>
        </div>

        <label class="my-review-dialog__field">
          <span>리뷰 내용</span>
          <textarea
            v-model="form.content"
            maxlength="500"
            placeholder="구매한 상품에 대한 후기를 작성해 주세요."
          />
        </label>

        <div class="my-review-dialog__meta">
          <p v-if="statusMessage" class="my-review-dialog__status" :class="statusClass">{{ statusMessage }}</p>
          <span>{{ form.content.length }}/500</span>
        </div>
      </div>

      <footer class="my-review-dialog__actions">
        <button type="button" class="my-review-dialog__secondary" @click="emit('close')">취소</button>
        <button type="button" class="my-review-dialog__primary" :disabled="!canSubmit" @click="submit">
          {{ isSubmitting ? '등록 중' : '리뷰 등록' }}
        </button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.my-review-dialog {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(17, 17, 17, 0.44);
}

.my-review-dialog__panel {
  width: min(560px, 100%);
  background: #ffffff;
  border: 1px solid #e5e5e5;
}

.my-review-dialog__head,
.my-review-dialog__body,
.my-review-dialog__actions {
  padding-left: 24px;
  padding-right: 24px;
}

.my-review-dialog__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 22px;
  padding-bottom: 18px;
  border-bottom: 1px solid #e6e6e6;
}

.my-review-dialog__head h3 {
  margin: 0;
  color: #111111;
  font-size: 24px;
  font-weight: 700;
}

.my-review-dialog__close {
  border: 0;
  background: transparent;
  color: #111111;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}

.my-review-dialog__body {
  display: grid;
  gap: 20px;
  padding-top: 22px;
  padding-bottom: 18px;
}

.my-review-dialog__product {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
}

.my-review-dialog__product img {
  width: 96px;
  height: 96px;
  object-fit: cover;
  background: #f5f5f5;
}

.my-review-dialog__product strong {
  display: block;
  color: #111111;
  font-size: 18px;
  line-height: 1.45;
}

.my-review-dialog__product p,
.my-review-dialog__product span,
.my-review-dialog__meta span {
  margin: 6px 0 0;
  color: #666666;
  font-size: 13px;
  line-height: 1.6;
}

.my-review-dialog__field {
  display: grid;
  gap: 12px;
}

.my-review-dialog__field > span {
  color: #111111;
  font-size: 14px;
  font-weight: 700;
}

.my-review-dialog__rating {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.my-review-dialog__rating button {
  min-width: 68px;
  height: 40px;
  padding: 0 14px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  color: #111111;
  font-size: 13px;
}

.my-review-dialog__rating button.is-active {
  border-color: #111111;
  background: #111111;
  color: #ffffff;
}

.my-review-dialog__field textarea {
  min-height: 180px;
  resize: vertical;
  padding: 14px 16px;
  border: 1px solid #d9d9d9;
  font: inherit;
  line-height: 1.7;
  box-sizing: border-box;
}

.my-review-dialog__meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.my-review-dialog__status {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
}

.my-review-dialog__status--error {
  color: #c62828;
}

.my-review-dialog__status--success {
  color: #0f6b3b;
}

.my-review-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 0;
  padding-bottom: 24px;
}

.my-review-dialog__secondary,
.my-review-dialog__primary {
  min-width: 120px;
  height: 46px;
  padding: 0 18px;
  border: 1px solid #d9d9d9;
  font-size: 14px;
}

.my-review-dialog__secondary {
  background: #ffffff;
  color: #111111;
}

.my-review-dialog__primary {
  border-color: #111111;
  background: #111111;
  color: #ffffff;
}

.my-review-dialog__primary:disabled {
  cursor: default;
  opacity: 0.45;
}

@media (max-width: 720px) {
  .my-review-dialog {
    padding: 16px;
  }

  .my-review-dialog__head,
  .my-review-dialog__body,
  .my-review-dialog__actions {
    padding-left: 18px;
    padding-right: 18px;
  }

  .my-review-dialog__head h3 {
    font-size: 22px;
  }

  .my-review-dialog__product {
    grid-template-columns: 1fr;
  }

  .my-review-dialog__product img {
    width: 100%;
    height: 180px;
  }

  .my-review-dialog__actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .my-review-dialog__secondary,
  .my-review-dialog__primary {
    width: 100%;
  }
}
</style>
