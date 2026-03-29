<script setup>
import { computed, onMounted, shallowRef, watch } from 'vue';
import AdminPagination from './AdminPagination.vue';
import AdminPanel from './AdminPanel.vue';
import {
  getAdminReviews,
  getFallbackAdminReviewItems,
  removeAdminReview,
} from '../../services/adminService';
import {
  formatAdminDateTime,
  normalizeAdminReview,
  normalizeArrayPayload,
} from '../../mappers/adminManagementMapper';
import { createFallbackReviews } from '../../mappers/adminDashboardMapper';

const reviews = shallowRef([]);
const searchKeyword = shallowRef('');
const statusMessage = shallowRef('');
const isLoading = shallowRef(false);
const currentPage = shallowRef(1);
const pageSize = 5;

const filteredReviews = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();

  if (!keyword) {
    return reviews.value;
  }

  return reviews.value.filter((review) => {
    const haystacks = [
      review.productName,
      review.memberName,
      review.content,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    return haystacks.some((value) => value.includes(keyword));
  });
});

const pageCount = computed(() => Math.max(Math.ceil(filteredReviews.value.length / pageSize), 1));
const pagedReviews = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredReviews.value.slice(start, start + pageSize);
});

function applyReviews(items) {
  reviews.value = items
    .map((item) => normalizeAdminReview(item))
    .filter((item) => item.reviewId);
}

async function loadReviews() {
  isLoading.value = true;

  try {
    const payload = await getAdminReviews();
    applyReviews(normalizeArrayPayload(payload, createFallbackReviews(getFallbackAdminReviewItems())));
  } catch {
    applyReviews(createFallbackReviews(getFallbackAdminReviewItems()));
  } finally {
    isLoading.value = false;
  }
}

async function removeReviewItem(review) {
  const confirmed = window.confirm('리뷰를 삭제할까요?');
  if (!confirmed) {
    return;
  }

  try {
    await removeAdminReview(review.reviewId);
    statusMessage.value = '리뷰를 삭제했습니다.';
  } catch {
    statusMessage.value = '서버 연결 전 단계라 목록에서만 먼저 제거했습니다.';
  }

  reviews.value = reviews.value.filter((item) => item.reviewId !== review.reviewId);
}

watch(searchKeyword, () => {
  currentPage.value = 1;
});

watch(
  () => filteredReviews.value.length,
  () => {
    if (currentPage.value > pageCount.value) {
      currentPage.value = pageCount.value;
    }
  },
);

onMounted(loadReviews);
</script>

<template>
  <section class="admin-reviews-manager">
    <AdminPanel title="리뷰 목록" description="부적절한 리뷰를 검토하고 필요 시 즉시 삭제합니다.">
      <template #action>
        <input
          v-model="searchKeyword"
          type="text"
          class="admin-reviews-manager__search"
          placeholder="상품명, 작성자, 내용 검색"
        />
      </template>

      <div class="admin-reviews-manager__table">
        <div class="admin-reviews-manager__head">
          <span>상품</span>
          <span>작성자</span>
          <span>내용</span>
          <span>평점</span>
          <span>작성시각</span>
          <span>관리</span>
        </div>

        <article
          v-for="review in pagedReviews"
          :key="review.reviewId"
          class="admin-reviews-manager__row"
        >
          <strong>{{ review.productName }}</strong>
          <span>{{ review.memberName }}</span>
          <p>{{ review.content }}</p>
          <span>{{ review.rating }}점</span>
          <span>{{ formatAdminDateTime(review.createdAt) }}</span>
          <button type="button" @click="removeReviewItem(review)">삭제</button>
        </article>

        <div v-if="!filteredReviews.length" class="admin-reviews-manager__empty">
          {{ isLoading ? '리뷰 목록을 불러오는 중입니다.' : '표시할 리뷰가 없습니다.' }}
        </div>
      </div>

      <AdminPagination v-model:current-page="currentPage" :page-count="pageCount" />

      <p v-if="statusMessage" class="admin-reviews-manager__status">{{ statusMessage }}</p>
    </AdminPanel>
  </section>
</template>

<style scoped>
.admin-reviews-manager__search {
  width: 280px;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
}

.admin-reviews-manager__table {
  border-bottom: 1px solid #ededed;
}

.admin-reviews-manager__head,
.admin-reviews-manager__row {
  display: grid;
  grid-template-columns: 180px 120px minmax(0, 1fr) 70px 160px 90px;
  gap: 16px;
  align-items: center;
}

.admin-reviews-manager__head {
  padding: 0 0 14px;
  color: #666666;
  font-size: 13px;
}

.admin-reviews-manager__row {
  padding: 16px 0;
  border-top: 1px solid #efefef;
}

.admin-reviews-manager__row p {
  margin: 0;
  color: #333333;
  font-size: 14px;
  line-height: 1.6;
}

.admin-reviews-manager__row button {
  min-height: 40px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  cursor: pointer;
}

.admin-reviews-manager__status,
.admin-reviews-manager__empty {
  margin-top: 16px;
  color: #666666;
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .admin-reviews-manager__head,
  .admin-reviews-manager__row {
    grid-template-columns: 1fr;
  }

  .admin-reviews-manager__head {
    display: none;
  }
}

@media (max-width: 720px) {
  .admin-reviews-manager__search {
    width: 100%;
  }
}
</style>
