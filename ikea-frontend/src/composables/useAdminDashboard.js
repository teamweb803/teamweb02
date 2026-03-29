import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '../stores/account';
import { useAdminDashboardStore } from '../stores/adminDashboard';

export function useAdminDashboard() {
  const adminDashboardStore = useAdminDashboardStore();
  const accountStore = useAccountStore();
  const {
    dashboard,
    isDashboardLoading,
  } = storeToRefs(adminDashboardStore);
  const {
    memberName,
    loginId,
  } = storeToRefs(accountStore);

  const operatorLabel = computed(
    () => memberName.value || loginId.value || '운영 담당자',
  );

  onMounted(() => {
    if (!adminDashboardStore.loaded && !adminDashboardStore.isDashboardLoading) {
      adminDashboardStore.loadDashboard();
    }
  });

  function removeMember(memberId) {
    adminDashboardStore.removeMember(memberId);
  }

  return {
    dashboard,
    isDashboardLoading,
    operatorLabel,
    removeMember,
  };
}
