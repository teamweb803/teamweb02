<script setup>
defineProps({
  group: {
    type: Object,
    required: true,
  },
  formatPrice: {
    type: Function,
    required: true,
  },
  updateQuantity: {
    type: Function,
    required: true,
  },
  removeItem: {
    type: Function,
    required: true,
  },
  goToCheckout: {
    type: Function,
    required: true,
  },
  openShippingGuide: {
    type: Function,
    required: true,
  },
});
</script>

<template>
  <table class="cart-group-table">
    <colgroup>
      <col style="width: 56px" />
      <col style="width: 136px" />
      <col />
      <col style="width: 132px" />
      <col style="width: 160px" />
      <col style="width: 188px" />
      <col style="width: 124px" />
    </colgroup>
    <tbody>
      <tr
        v-for="entry in group.items"
        :key="entry.key"
        class="cart-item-row"
        :class="{ 'is-soldout': entry.item.isSoldOut }"
      >
        <td class="cart-item__select-cell">
          <div class="cart-item__select">
            <label class="cart-check">
              <input v-model="entry.item.selected" type="checkbox" :disabled="entry.item.isSoldOut" />
            </label>
          </div>
        </td>

        <td class="cart-item__thumb-cell">
          <RouterLink :to="entry.item.detailPath" class="cart-item__thumb-link">
            <img :src="entry.item.image" :alt="entry.item.name" />
          </RouterLink>
        </td>

        <td class="cart-item__copy-cell">
          <div class="cart-item__copy">
            <div class="cart-item__brand-line">
              <strong>{{ entry.item.brand }}</strong>
              <span>{{ entry.item.seller }}</span>
            </div>

            <h2>
              <RouterLink :to="entry.item.detailPath" class="cart-item__title-link">
                {{ entry.item.name }}
              </RouterLink>
            </h2>

            <p>{{ entry.item.option }}</p>
            <p v-if="entry.item.isSoldOut" class="cart-item__soldout">
              품절 상품입니다. 재입고 전까지 주문할 수 없습니다.
            </p>
          </div>
        </td>

        <td class="cart-item__qty-cell">
          <div class="cart-item__qty">
            <div class="qty-stepper">
              <button
                type="button"
                aria-label="수량 감소"
                :disabled="entry.item.isSoldOut"
                @click="updateQuantity(entry.item.id, -1)"
              >
                -
              </button>
              <span>{{ entry.item.quantity }}</span>
              <button
                type="button"
                aria-label="수량 증가"
                :disabled="entry.item.isSoldOut"
                @click="updateQuantity(entry.item.id, 1)"
              >
                +
              </button>
            </div>
          </div>
        </td>

        <td class="cart-item__price-cell">
          <div class="cart-item__price">
            <strong>{{ formatPrice(entry.item.price * entry.item.quantity) }}</strong>
            <span v-if="(entry.item.originalPrice ?? entry.item.price) > entry.item.price">
              {{ formatPrice((entry.item.originalPrice ?? entry.item.price) * entry.item.quantity) }}
            </span>
          </div>
        </td>

        <td
          v-if="!entry.skipShippingCell"
          class="cart-item__shipping-cell"
          :class="{ 'is-merged': entry.showMergedShippingInfo }"
          :rowspan="entry.showMergedShippingInfo ? entry.mergedShippingRowSpan : 1"
        >
          <div v-if="entry.showShippingInfo || entry.showMergedShippingInfo" class="cart-item__shipping">
            <button
              class="cart-shipping-trigger"
              type="button"
              @click="openShippingGuide(entry.deliveryGuide.modalTitle, entry.deliveryGuide.modalBody)"
            >
              {{ entry.deliveryGuide.shippingText }}
            </button>
            <p>{{ entry.deliveryGuide.shippingSubText }}</p>
          </div>
        </td>

        <td class="cart-item__actions-cell">
          <div class="cart-item__actions">
            <button
              class="cart-item__order-btn"
              type="button"
              :disabled="entry.item.isSoldOut"
              @click="goToCheckout('single', entry.item.productId)"
            >
              {{ entry.item.isSoldOut ? '품절' : '바로주문' }}
            </button>
            <button class="cart-item__remove-btn" type="button" @click="removeItem(entry.item.id)">
              삭제
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.cart-group-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.cart-group-table td {
  padding: 24px 0;
  border-bottom: 1px solid #eceff3;
  vertical-align: middle;
  background: #ffffff;
}

.cart-item-row.is-soldout td {
  background: linear-gradient(90deg, rgba(248, 250, 252, 0.8), rgba(255, 255, 255, 0));
}

.cart-item__select-cell,
.cart-item__qty-cell,
.cart-item__price-cell,
.cart-item__shipping-cell,
.cart-item__actions-cell {
  text-align: center;
}

.cart-item__select,
.cart-item__qty,
.cart-item__price,
.cart-item__actions {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 12px;
}

.cart-item__thumb-link {
  display: block;
}

.cart-item__thumb-link img {
  display: block;
  width: 128px;
  height: 128px;
  object-fit: contain;
  background: #ffffff;
}

.cart-item__copy {
  display: grid;
  gap: 10px;
  padding-right: 20px;
}

.cart-item__brand-line {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6b7280;
  font-size: 13px;
}

.cart-item__brand-line strong {
  color: #111827;
}

.cart-item__copy h2 {
  margin: 0;
}

.cart-item__title-link {
  color: #111827;
  font-size: 18px;
  line-height: 1.45;
}

.cart-item__copy p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.cart-item__soldout {
  color: #b42318;
  font-weight: 700;
}

.qty-stepper {
  display: inline-grid;
  grid-template-columns: 36px 44px 36px;
  align-items: center;
  height: 38px;
  border: 1px solid #d8dde5;
  background: #ffffff;
}

.qty-stepper button {
  border: 0;
  background: #ffffff;
  height: 100%;
  color: #111111;
  font-size: 18px;
  cursor: pointer;
}

.qty-stepper button:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: default;
}

.qty-stepper span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  border-left: 1px solid #d8dde5;
  border-right: 1px solid #d8dde5;
}

.cart-item__price strong {
  font-size: 24px;
  line-height: 1.2;
  letter-spacing: -0.04em;
  color: #111111;
}

.cart-item__price span {
  color: #9ca3af;
  font-size: 13px;
  text-decoration: line-through;
}

.cart-item__shipping-cell {
  padding: 0;
  vertical-align: middle;
}

.cart-item__shipping-cell.is-merged {
  vertical-align: middle;
}

.cart-item__shipping {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 100%;
  text-align: center;
}

.cart-shipping-trigger {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: #0058a3;
  font-size: 16px;
  font-weight: 700;
}

.cart-item__shipping p {
  margin: 0;
  color: #6b7280;
  white-space: pre-line;
  font-size: 13px;
  line-height: 1.55;
}

.cart-item__actions {
  justify-items: stretch;
}

.cart-item__order-btn {
  width: 100%;
  min-height: 46px;
  border-radius: 999px;
  border: 1px solid #111827;
  background: #111827;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.cart-item__order-btn:disabled {
  border-color: #d8dde5;
  background: #eef1f4;
  color: #8a93a0;
  cursor: default;
}

.cart-item__remove-btn {
  border: 0;
  background: transparent;
  color: #4b5563;
  cursor: pointer;
}

.cart-check input {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: #111111;
}
</style>
