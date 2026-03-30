<script setup>
import { computed, onMounted, reactive, shallowRef, watch } from 'vue';
import { storeToRefs } from 'pinia';
import AdminPagination from './AdminPagination.vue';
import AdminPanel from './AdminPanel.vue';
import CommonStatePanel from '../common/CommonStatePanel.vue';
import {
  createAdminNotice,
  deleteAdminNotice,
  getAdminNoticeDetail,
  getAdminNoticeList,
  getFallbackAdminNotices,
  updateAdminNotice,
} from '../../services/adminService';
import {
  formatAdminDateTime,
  normalizeAdminNotice,
  normalizeArrayPayload,
  normalizeObjectPayload,
} from '../../mappers/adminManagementMapper';
import { useAccountStore } from '../../stores/account';

const accountStore = useAccountStore();
const { memberName, loginId } = storeToRefs(accountStore);

const notices = shallowRef([]);
const selectedNoticeId = shallowRef('');
const selectedFiles = shallowRef([]);
const statusMessage = shallowRef('');
const isLoading = shallowRef(false);
const isSubmitting = shallowRef(false);
const currentPage = shallowRef(1);
const pageSize = 5;

const formState = reactive({
  title: '',
  writer: '',
  content: '',
});

const selectedNotice = computed(
  () => notices.value.find((notice) => notice.noticeId === selectedNoticeId.value) ?? null,
);
const formModeLabel = computed(() => (selectedNoticeId.value ? '공지 수정' : '공지 등록'));
const showCreateShortcut = computed(() => Boolean(selectedNoticeId.value));
const submitButtonLabel = computed(() => {
  if (isSubmitting.value) {
    return '처리 중..';
  }

  return selectedNoticeId.value ? '수정 저장' : '공지 등록';
});
const pageCount = computed(() => Math.max(Math.ceil(notices.value.length / pageSize), 1));
const pagedNotices = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return notices.value.slice(start, start + pageSize);
});

function resolveOperatorName() {
  return memberName.value || loginId.value || '운영자';
}

function clearFormFields() {
  selectedNoticeId.value = '';
  formState.title = '';
  formState.writer = resolveOperatorName();
  formState.content = '';
  selectedFiles.value = [];
}

function beginCreateMode({ clearStatus = true } = {}) {
  clearFormFields();

  if (clearStatus) {
    statusMessage.value = '';
  }
}

async function beginEditMode(notice) {
  statusMessage.value = '';

  try {
    const payload = await getAdminNoticeDetail(notice.noticeId);
    const detailedNotice = normalizeAdminNotice(normalizeObjectPayload(payload, notice));
    selectedNoticeId.value = detailedNotice.noticeId;
    formState.title = detailedNotice.title;
    formState.writer = detailedNotice.writer || resolveOperatorName();
    formState.content = detailedNotice.content;
  } catch {
    selectedNoticeId.value = notice.noticeId;
    formState.title = notice.title;
    formState.writer = notice.writer || resolveOperatorName();
    formState.content = notice.content;
  } finally {
    selectedFiles.value = [];
  }
}

function applyNotices(items) {
  notices.value = items
    .map((item) => normalizeAdminNotice(item))
    .filter((item) => item.noticeId);
}

async function loadNotices() {
  isLoading.value = true;

  try {
    const payload = await getAdminNoticeList();
    applyNotices(normalizeArrayPayload(payload, getFallbackAdminNotices()));
  } catch {
    applyNotices(getFallbackAdminNotices());
  } finally {
    isLoading.value = false;
  }
}

function handleFileChange(event) {
  selectedFiles.value = [...(event.target.files ?? [])];
}

async function submitNotice() {
  if (!formState.title.trim() || !formState.content.trim()) {
    statusMessage.value = '제목과 내용을 모두 입력해 주세요.';
    return;
  }

  isSubmitting.value = true;

  const payload = {
    title: formState.title.trim(),
    writer: formState.writer.trim() || resolveOperatorName(),
    content: formState.content.trim(),
    files: selectedFiles.value,
  };

  const optimisticNotice = normalizeAdminNotice({
    noticeId: selectedNoticeId.value || `local-${Date.now()}`,
    title: payload.title,
    writer: payload.writer,
    content: payload.content,
    createdAt: selectedNotice.value?.createdAt ?? new Date().toISOString(),
  });

  try {
    if (selectedNoticeId.value) {
      await updateAdminNotice(selectedNoticeId.value, payload);
      notices.value = notices.value.map((notice) => (
        notice.noticeId === selectedNoticeId.value ? optimisticNotice : notice
      ));
      statusMessage.value = '공지 내용을 수정했습니다.';
    } else {
      await createAdminNotice(payload);
      notices.value = [optimisticNotice, ...notices.value];
      statusMessage.value = '새 공지를 등록했습니다.';
    }
  } catch {
    if (selectedNoticeId.value) {
      notices.value = notices.value.map((notice) => (
        notice.noticeId === selectedNoticeId.value ? optimisticNotice : notice
      ));
    } else {
      notices.value = [optimisticNotice, ...notices.value];
    }

    statusMessage.value = '서버 연결이 어려워 화면에서만 먼저 반영했습니다.';
  } finally {
    isSubmitting.value = false;
    beginCreateMode({ clearStatus: false });
  }
}

async function removeNotice(notice) {
  const confirmed = window.confirm(`"${notice.title}" 공지를 삭제할까요?`);
  if (!confirmed) {
    return;
  }

  try {
    await deleteAdminNotice(notice.noticeId);
    statusMessage.value = '공지를 삭제했습니다.';
  } catch {
    statusMessage.value = '서버 연결이 어려워 목록에서만 먼저 제거했습니다.';
  }

  notices.value = notices.value.filter((item) => item.noticeId !== notice.noticeId);

  if (selectedNoticeId.value === notice.noticeId) {
    beginCreateMode({ clearStatus: false });
  }
}

watch(
  () => notices.value.length,
  () => {
    if (currentPage.value > pageCount.value) {
      currentPage.value = pageCount.value;
    }
  },
);

onMounted(async () => {
  await loadNotices();
  beginCreateMode();
});
</script>

<template>
  <section class="admin-notices-manager">
    <AdminPanel title="공지 목록" description="고객센터 공지를 수정하거나 삭제할 수 있습니다.">
      <template v-if="showCreateShortcut" #action>
        <button type="button" class="admin-notices-manager__primary" @click="beginCreateMode">
          새 공지로 전환
        </button>
      </template>

      <div class="admin-notices-manager__table">
        <div class="admin-notices-manager__head">
          <span>제목</span>
          <span>작성자</span>
          <span>작성 시각</span>
          <span>관리</span>
        </div>

        <article
          v-for="notice in pagedNotices"
          :key="notice.noticeId"
          class="admin-notices-manager__row"
        >
          <button type="button" class="admin-notices-manager__title" @click="beginEditMode(notice)">
            {{ notice.title }}
          </button>
          <span>{{ notice.writer || '운영자' }}</span>
          <span>{{ formatAdminDateTime(notice.createdAt) }}</span>
          <div class="admin-notices-manager__actions">
            <button type="button" @click="beginEditMode(notice)">수정</button>
            <button type="button" @click="removeNotice(notice)">삭제</button>
          </div>
        </article>

        <CommonStatePanel
          v-if="!notices.length"
          :tone="isLoading ? 'loading' : 'neutral'"
          :title="isLoading ? '공지 목록을 불러오는 중입니다.' : '등록된 공지가 없습니다.'"
          compact
        />
      </div>

      <AdminPagination v-model:current-page="currentPage" :page-count="pageCount" />
    </AdminPanel>

    <AdminPanel :title="formModeLabel" description="현재 고객센터에 노출할 공지를 등록하거나 수정합니다.">
      <form class="admin-notices-manager__form" @submit.prevent="submitNotice">
        <label>
          <span>제목</span>
          <input v-model="formState.title" type="text" maxlength="80" />
        </label>

        <label>
          <span>작성자</span>
          <input v-model="formState.writer" type="text" maxlength="30" />
        </label>

        <label>
          <span>내용</span>
          <textarea v-model="formState.content" rows="10" />
        </label>

        <label>
          <span>첨부 파일</span>
          <input type="file" multiple @change="handleFileChange" />
        </label>

        <div class="admin-notices-manager__actions admin-notices-manager__actions--form">
          <button type="button" class="admin-notices-manager__secondary" @click="beginCreateMode">
            입력 초기화
          </button>
          <button type="submit" class="admin-notices-manager__primary" :disabled="isSubmitting">
            {{ submitButtonLabel }}
          </button>
        </div>

        <p v-if="statusMessage" class="admin-notices-manager__status">{{ statusMessage }}</p>
      </form>
    </AdminPanel>
  </section>
</template>

<style scoped>
.admin-notices-manager {
  display: grid;
  gap: 40px;
}

.admin-notices-manager__table {
  border-bottom: 1px solid #ededed;
}

.admin-notices-manager__head,
.admin-notices-manager__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px 160px 140px;
  gap: 16px;
  align-items: center;
}

.admin-notices-manager__head {
  padding: 0 0 14px;
  color: #666666;
  font-size: 13px;
}

.admin-notices-manager__row {
  padding: 16px 0;
  border-top: 1px solid #efefef;
}

.admin-notices-manager__title,
.admin-notices-manager__actions button,
.admin-notices-manager__primary,
.admin-notices-manager__secondary {
  border: 1px solid #d9d9d9;
  background: #ffffff;
  cursor: pointer;
}

.admin-notices-manager__title {
  width: fit-content;
  min-width: 0;
  padding: 0;
  border: 0;
  color: #111111;
  font-size: 15px;
  text-align: left;
}

.admin-notices-manager__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.admin-notices-manager__actions button,
.admin-notices-manager__primary,
.admin-notices-manager__secondary {
  min-height: 40px;
  padding: 0 16px;
}

.admin-notices-manager__primary,
.admin-notices-manager__actions button.admin-notices-manager__primary {
  border-color: #111111;
  background: #111111;
  color: #ffffff;
}

.admin-notices-manager__form {
  display: grid;
  gap: 14px;
}

.admin-notices-manager__form label {
  display: grid;
  gap: 8px;
}

.admin-notices-manager__form span {
  color: #666666;
  font-size: 13px;
}

.admin-notices-manager__form input,
.admin-notices-manager__form textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  font: inherit;
}

.admin-notices-manager__form textarea {
  resize: vertical;
}

.admin-notices-manager__actions--form {
  justify-content: flex-end;
}

.admin-notices-manager__status,
.admin-notices-manager__empty {
  margin-top: 16px;
  color: #666666;
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .admin-notices-manager__head,
  .admin-notices-manager__row {
    grid-template-columns: 1fr;
  }

  .admin-notices-manager__head {
    display: none;
  }
}

@media (max-width: 720px) {
  .admin-notices-manager__actions--form {
    justify-content: stretch;
  }

  .admin-notices-manager__actions--form button {
    flex: 1 1 100%;
  }
}
</style>
