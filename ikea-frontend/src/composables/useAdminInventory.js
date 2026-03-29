import { computed, onMounted, reactive, shallowRef, watch } from 'vue';
import { adjustAdminInventoryItem, getAdminInventoryItems } from '../services/adminInventoryService';

function resolveStockStateKey(item) {
  if (item.stock <= 0) {
    return 'soldout';
  }

  if (item.stock <= item.safeStock) {
    return 'warning';
  }

  return 'stable';
}

function resolveStockStateLabel(item) {
  const stateKey = resolveStockStateKey(item);

  if (stateKey === 'soldout') {
    return '품절';
  }

  if (stateKey === 'warning') {
    return '주의';
  }

  return '안정';
}

export function useAdminInventory() {
  const inventoryItems = shallowRef([]);
  const selectedProductId = shallowRef('');
  const searchKeyword = shallowRef('');
  const statusMessage = shallowRef('');
  const adjustmentForm = reactive({
    type: 'increase',
    quantity: 1,
    note: '',
  });

  const filteredItems = computed(() => {
    const keyword = String(searchKeyword.value ?? '').trim().toLowerCase();

    return inventoryItems.value.filter((item) => {
      if (!keyword) {
        return true;
      }

      return [item.name, item.categoryName, item.sku]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase())
        .some((value) => value.includes(keyword));
    });
  });

  const selectedItem = computed(
    () => inventoryItems.value.find((item) => item.productId === selectedProductId.value) ?? null,
  );

  const summary = computed(() => {
    const soldOutCount = inventoryItems.value.filter((item) => item.stock <= 0).length;
    const cautionCount = inventoryItems.value.filter(
      (item) => item.stock > 0 && item.stock <= item.safeStock,
    ).length;
    const totalStock = inventoryItems.value.reduce(
      (sum, item) => sum + Number(item.stock ?? 0),
      0,
    );

    return {
      soldOutCount,
      cautionCount,
      totalStock,
    };
  });

  function loadInventoryItems() {
    inventoryItems.value = getAdminInventoryItems();

    if (!selectedProductId.value && inventoryItems.value[0]) {
      selectedProductId.value = inventoryItems.value[0].productId;
    }
  }

  function selectItem(productId) {
    selectedProductId.value = productId;
  }

  function submitAdjustment() {
    if (!selectedItem.value) {
      return;
    }

    const normalizedQuantity = Number(adjustmentForm.quantity);
    if (!normalizedQuantity || normalizedQuantity < 1) {
      statusMessage.value = '조정 수량은 1 이상 입력해 주세요.';
      return;
    }

    inventoryItems.value = adjustAdminInventoryItem(selectedItem.value.productId, {
      type: adjustmentForm.type,
      quantity: normalizedQuantity,
      note: adjustmentForm.note,
    });

    statusMessage.value = `${selectedItem.value.name} 재고를 ${normalizedQuantity}개 ${
      adjustmentForm.type === 'increase' ? '추가' : '차감'
    }했습니다.`;
    adjustmentForm.quantity = 1;
    adjustmentForm.note = '';
  }

  watch(filteredItems, (items) => {
    if (!items.find((item) => item.productId === selectedProductId.value) && items[0]) {
      selectedProductId.value = items[0].productId;
    }
  });

  onMounted(loadInventoryItems);

  return {
    adjustmentForm,
    filteredItems,
    resolveStockStateKey,
    resolveStockStateLabel,
    searchKeyword,
    selectedItem,
    selectedProductId,
    selectItem,
    statusMessage,
    submitAdjustment,
    summary,
  };
}
