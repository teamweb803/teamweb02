import { computed, onMounted, reactive, shallowRef, watch } from 'vue';
import {
  adjustAdminInventoryItem,
  getAdminInventoryItems,
  updateAdminInventorySafeStock,
} from '../services/adminInventoryService';

const STOCK_STATUS_OPTIONS = [
  { value: 'ALL', label: '전체' },
  { value: 'STABLE', label: '안정' },
  { value: 'WARNING', label: '주의' },
  { value: 'SOLDOUT', label: '품절' },
];

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
  const stockStatusFilter = shallowRef('ALL');
  const adjustmentStatusMessage = shallowRef('');
  const safeStockStatusMessage = shallowRef('');
  const adjustmentForm = reactive({
    type: 'increase',
    quantity: 1,
  });
  const safeStockForm = reactive({
    safeStock: 0,
  });

  const stockStatusCounts = computed(() => STOCK_STATUS_OPTIONS.map((option) => ({
    ...option,
    count: option.value === 'ALL'
      ? inventoryItems.value.length
      : inventoryItems.value.filter((item) => {
        const stateKey = resolveStockStateKey(item).toUpperCase();
        return stateKey === option.value;
      }).length,
  })));

  const filteredItems = computed(() => {
    const keyword = String(searchKeyword.value ?? '').trim().toLowerCase();

    return inventoryItems.value.filter((item) => {
      if (stockStatusFilter.value !== 'ALL') {
        const stateKey = resolveStockStateKey(item).toUpperCase();

        if (stateKey !== stockStatusFilter.value) {
          return false;
        }
      }

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
    adjustmentStatusMessage.value = '';
    safeStockStatusMessage.value = '';
  }

  function submitAdjustment() {
    if (!selectedItem.value) {
      return;
    }

    const normalizedQuantity = Number(adjustmentForm.quantity);
    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1) {
      adjustmentStatusMessage.value = '조정 수량은 1 이상의 정수로 입력해 주세요.';
      return;
    }

    const targetName = selectedItem.value.name;
    inventoryItems.value = adjustAdminInventoryItem(selectedItem.value.productId, {
      type: adjustmentForm.type,
      quantity: normalizedQuantity,
    });

    adjustmentStatusMessage.value = `${targetName} 재고를 ${normalizedQuantity}개 ${
      adjustmentForm.type === 'increase' ? '추가' : '차감'
    }했습니다.`;
    safeStockStatusMessage.value = '';
    adjustmentForm.quantity = 1;
  }

  function submitSafeStockUpdate() {
    if (!selectedItem.value) {
      return;
    }

    const normalizedSafeStock = Number(safeStockForm.safeStock);
    if (!Number.isInteger(normalizedSafeStock) || normalizedSafeStock < 0) {
      safeStockStatusMessage.value = '안전재고는 0 이상의 정수로 입력해 주세요.';
      return;
    }

    const targetName = selectedItem.value.name;
    inventoryItems.value = updateAdminInventorySafeStock(selectedItem.value.productId, {
      safeStock: normalizedSafeStock,
    });

    safeStockStatusMessage.value = `${targetName} 안전재고를 ${normalizedSafeStock}개로 저장했습니다.`;
    adjustmentStatusMessage.value = '';
  }

  watch(filteredItems, (items) => {
    if (!items.find((item) => item.productId === selectedProductId.value)) {
      selectedProductId.value = items[0]?.productId ?? '';
    }
  });

  watch(selectedProductId, () => {
    adjustmentStatusMessage.value = '';
    safeStockStatusMessage.value = '';
  });

  watch(
    selectedItem,
    (item) => {
      safeStockForm.safeStock = Number(item?.safeStock ?? 0);
    },
    { immediate: true },
  );

  onMounted(loadInventoryItems);

  return {
    adjustmentStatusMessage,
    adjustmentForm,
    filteredItems,
    resolveStockStateKey,
    resolveStockStateLabel,
    safeStockForm,
    safeStockStatusMessage,
    searchKeyword,
    selectedItem,
    selectedProductId,
    selectItem,
    stockStatusCounts,
    stockStatusFilter,
    submitAdjustment,
    submitSafeStockUpdate,
    summary,
  };
}
