<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import CustomerServiceShell from '../components/customer-service/CustomerServiceShell.vue';
import { useCustomerServiceBoard } from '../composables/useCustomerServiceBoard';
import {
  ROUTE_PATHS,
  buildCustomerServiceNoticeDetailPath,
} from '../constants/routes';

const router = useRouter();
const {
  activeFaqCategory,
  changeNoticePage,
  changeQnaPage,
  currentSection,
  faqCategories,
  filteredFaqRows,
  noticeKeyword,
  noticeTotalPages,
  openFaqIds,
  pagedNotices,
  pagedQnaRows,
  qnaKeyword,
  qnaSubmitted,
  qnaTotalPages,
  selectFaqCategory,
  toggleFaq,
} = useCustomerServiceBoard();

const pageTitle = computed(() => {
  if (currentSection.value === 'faq') {
    return 'FAQ';
  }

  if (currentSection.value === 'qna') {
    return 'QnA';
  }

  return '공지사항';
});

function openQnaWrite() {
  router.push(ROUTE_PATHS.customerServiceQnaWrite);
}

function openGuestOrderLookup() {
  router.push(ROUTE_PATHS.guestOrderLookup);
}
</script>

<template>
  <CustomerServiceShell :title="pageTitle" :current-section="currentSection">
    <template v-if="currentSection === 'notice'">
      <div class="cs-toolbar">
        <div class="cs-search">
          <input v-model="noticeKeyword" type="text" placeholder="공지사항 검색" />
        </div>
        <p class="cs-toolbar__hint">입력하면 바로 결과가 반영됩니다.</p>
      </div>

      <div class="cs-board">
        <div class="cs-board__head">
          <span>번호</span>
          <span>제목</span>
          <span>등록일</span>
        </div>
        <div v-if="pagedNotices.length" class="cs-board__body">
          <RouterLink
            v-for="row in pagedNotices"
            :key="row.id"
            :to="buildCustomerServiceNoticeDetailPath(row.id)"
            class="cs-board__row"
          >
            <span>{{ row.badge || row.id }}</span>
            <strong>{{ row.title }}</strong>
            <span>{{ row.date }}</span>
          </RouterLink>
        </div>
        <div v-else class="cs-board__empty">검색 결과가 없습니다.</div>
      </div>

      <div class="cs-pagination">
        <button type="button" aria-label="처음 페이지" @click="changeNoticePage(1)">«</button>
        <button
          v-for="page in noticeTotalPages"
          :key="`notice-${page}`"
          type="button"
          @click="changeNoticePage(page)"
        >
          {{ page }}
        </button>
      </div>
    </template>

    <template v-else-if="currentSection === 'faq'">
      <div class="cs-faq-filter">
        <button
          v-for="category in faqCategories"
          :key="category"
          type="button"
          :class="{ 'is-active': activeFaqCategory === category }"
          @click="selectFaqCategory(category)"
        >
          {{ category }}
        </button>
      </div>

      <div class="cs-faq-list">
        <article v-for="faq in filteredFaqRows" :key="faq.id" class="cs-faq-item">
          <button class="cs-faq-item__question" type="button" @click="toggleFaq(faq.id)">
            <span>{{ faq.category }}</span>
            <strong>{{ faq.question }}</strong>
            <b>{{ openFaqIds.includes(faq.id) ? '−' : '+' }}</b>
          </button>
          <div v-if="openFaqIds.includes(faq.id)" class="cs-faq-item__answer">
            {{ faq.answer }}
          </div>
        </article>
      </div>
    </template>

    <template v-else>
      <div v-if="qnaSubmitted" class="cs-feedback">
        문의가 접수되었습니다. 답변이 등록되면 고객센터 QnA 목록에서 확인할 수 있습니다.
      </div>

      <div class="cs-qna-actions">
        <div class="cs-qna-actions__buttons">
          <button type="button" @click="openQnaWrite">문의 작성</button>
          <button type="button" @click="openGuestOrderLookup">비회원 주문조회</button>
        </div>
      </div>

      <div class="cs-toolbar cs-toolbar--qna">
        <div class="cs-search">
          <input v-model="qnaKeyword" type="text" placeholder="문의 검색" />
        </div>
        <p class="cs-toolbar__hint">입력하면 바로 결과가 반영됩니다.</p>
      </div>

      <div class="cs-board">
        <div class="cs-board__head cs-board__head--qna">
          <span>번호</span>
          <span>문의 제목</span>
          <span>답변 상태</span>
          <span>등록일</span>
        </div>
        <div v-if="pagedQnaRows.length" class="cs-board__body">
          <div v-for="row in pagedQnaRows" :key="row.id" class="cs-board__row cs-board__row--qna">
            <span>{{ row.id }}</span>
            <strong>{{ row.title }}</strong>
            <span>{{ row.status }}</span>
            <span>{{ row.date }}</span>
          </div>
        </div>
        <div v-else class="cs-board__empty">검색 결과가 없습니다.</div>
      </div>

      <div class="cs-pagination">
        <button type="button" aria-label="처음 페이지" @click="changeQnaPage(1)">«</button>
        <button
          v-for="page in qnaTotalPages"
          :key="`qna-${page}`"
          type="button"
          @click="changeQnaPage(page)"
        >
          {{ page }}
        </button>
      </div>
    </template>
  </CustomerServiceShell>
</template>

<style scoped>
.cs-toolbar {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 0 16px;
}

.cs-search {
  display: flex;
  width: min(420px, 100%);
}

.cs-search input {
  flex: 1;
  height: 44px;
  border: 1px solid #d9d9d9;
  padding: 0 14px;
  font-size: 14px;
  color: #111111;
  box-sizing: border-box;
}

.cs-toolbar__hint {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
}

.cs-qna-actions__buttons button {
  height: 44px;
  padding: 0 18px;
  border: 1px solid #111111;
  background: #111111;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.cs-feedback {
  margin-bottom: 20px;
  padding: 14px 16px;
  border: 1px solid #dce7f8;
  background: #f5f9ff;
  color: #264a86;
  font-size: 14px;
  line-height: 1.7;
}

.cs-board {
  border-top: 1px solid #111111;
}

.cs-board__head,
.cs-board__row {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr) 140px;
  align-items: center;
}

.cs-board__head {
  min-height: 52px;
  border-bottom: 1px solid #e6e6e6;
  color: #555555;
  font-size: 14px;
  font-weight: 600;
}

.cs-board__head span,
.cs-board__row span {
  display: flex;
  justify-content: center;
}

.cs-board__row {
  width: 100%;
  min-height: 62px;
  border-bottom: 1px solid #efefef;
  background: transparent;
  color: #111111;
  text-decoration: none;
}

.cs-board__row strong {
  min-width: 0;
  display: flex;
  align-items: center;
  padding: 0 16px 0 8px;
  font-size: 15px;
  font-weight: 500;
  text-align: left;
}

.cs-board__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  border-bottom: 1px solid #efefef;
  color: #777777;
  font-size: 15px;
}

.cs-pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding-top: 28px;
}

.cs-pagination button {
  width: 34px;
  height: 34px;
  border: 1px solid #dddddd;
  background: #ffffff;
  color: #444444;
  font-size: 14px;
  cursor: pointer;
}

.cs-faq-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-bottom: 20px;
}

.cs-faq-filter button {
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  color: #444444;
  font-size: 14px;
  cursor: pointer;
}

.cs-faq-filter button.is-active {
  border-color: #111111;
  color: #111111;
  font-weight: 700;
}

.cs-faq-list {
  border-top: 1px solid #111111;
}

.cs-faq-item {
  border-bottom: 1px solid #efefef;
}

.cs-faq-item__question {
  width: 100%;
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr) 44px;
  align-items: center;
  min-height: 70px;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.cs-faq-item__question span,
.cs-faq-item__question b {
  display: flex;
  justify-content: center;
  color: #555555;
  font-size: 14px;
  font-weight: 600;
}

.cs-faq-item__question strong {
  min-width: 0;
  padding: 0 18px 0 0;
  text-align: left;
  color: #111111;
  font-size: 15px;
  line-height: 1.6;
}

.cs-faq-item__answer {
  padding: 0 24px 22px 178px;
  color: #666666;
  font-size: 14px;
  line-height: 1.75;
}

.cs-qna-actions {
  display: flex;
  justify-content: flex-end;
  padding-bottom: 16px;
}

.cs-qna-actions__buttons {
  display: flex;
  gap: 10px;
}

.cs-board__head--qna,
.cs-board__row--qna {
  grid-template-columns: 90px minmax(0, 1fr) 140px 140px;
}

@media (max-width: 960px) {
  .cs-board__head,
  .cs-board__row,
  .cs-board__head--qna,
  .cs-board__row--qna,
  .cs-faq-item__question {
    grid-template-columns: 1fr;
  }

  .cs-board__head {
    display: none;
  }

  .cs-board__row,
  .cs-board__row--qna {
    gap: 6px;
    padding: 16px 0;
  }

  .cs-board__row span,
  .cs-board__row--qna span {
    justify-content: flex-start;
    font-size: 13px;
    color: #666666;
  }

  .cs-faq-item__question {
    justify-items: start;
    gap: 8px;
    padding: 18px 0;
  }

  .cs-faq-item__question span,
  .cs-faq-item__question b {
    justify-content: flex-start;
  }

  .cs-faq-item__answer {
    padding: 0 0 18px;
  }
}

@media (max-width: 720px) {
  .cs-search,
  .cs-qna-actions__buttons {
    width: 100%;
  }

  .cs-qna-actions__buttons {
    display: grid;
    gap: 10px;
  }
}
</style>
