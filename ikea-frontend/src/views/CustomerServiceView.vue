<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import SiteChrome from '../components/layout/SiteChrome.vue';
import {
  buildCustomerServiceNoticeDetailPath,
  ROUTE_PATHS,
} from '../constants/routes';

const route = useRoute();
const noticeKeyword = ref('');
const activeFaqCategory = ref('전체');
const openFaqIds = ref(['faq-1']);
const qnaKeyword = ref('');
const noticePage = ref(1);
const qnaPage = ref(1);
const BOARD_PAGE_SIZE = 6;

const sidebarLinks = [
  {
    id: 'faq',
    label: 'FAQ',
    to: ROUTE_PATHS.customerServiceFaq,
    routeNames: ['customer-service-faq'],
  },
  {
    id: 'qna',
    label: 'QnA',
    to: ROUTE_PATHS.customerServiceQna,
    routeNames: ['customer-service-qna'],
  },
  {
    id: 'notice',
    label: '공지사항',
    to: ROUTE_PATHS.customerServiceNotice,
    routeNames: ['customer-service-notice', 'customer-service-notice-detail'],
  },
];

const noticeRows = [
  { id: 6247, badge: '공지', title: '[당첨자 발표] 26년 02월 HOMiO 베스트 후기 이벤트 당첨자 발표', date: '2026.02.26' },
  { id: 6246, badge: '공지', title: '[공지] HOMiO 배송 일정 안내 화면 개편 예정', date: '2026.02.24' },
  { id: 6245, badge: '공지', title: '[공지] HOMiO 주문 시스템 점검 안내', date: '2026.02.20' },
  { id: 6244, badge: '', title: '비회원 주문조회 기능 점검 안내', date: '2026.02.18' },
  { id: 6243, badge: '', title: '배송/설치 일정 확인 페이지 개편 안내', date: '2026.02.14' },
  { id: 6242, badge: '', title: '고객센터 QnA 응답 절차 안내', date: '2026.02.10' },
  { id: 6241, badge: '', title: '주문 취소 정책 안내', date: '2026.02.06' },
  { id: 6240, badge: '', title: '매장 수령 서비스 운영 시간 변경 안내', date: '2026.02.03' },
  { id: 6239, badge: '', title: '신규 회원가입 혜택 적용 기준 안내', date: '2026.01.29' },
  { id: 6238, badge: '', title: '교환/반품 접수 절차 안내', date: '2026.01.24' },
  { id: 6237, badge: '', title: '일부 배송 권역 운영 일정 안내', date: '2026.01.19' },
  { id: 6236, badge: '', title: '비회원 결제 확인 절차 안내', date: '2026.01.14' },
];

const faqCategories = ['전체', '회원/정보관리', '상품', '주문/결제', '배송/배송일', '취소/환불'];

const faqRows = [
  {
    id: 'faq-1',
    category: '주문/결제',
    question: '비회원도 주문/배송 조회가 가능한가요?',
    answer:
      '네, 가능합니다. 비회원 주문조회 화면에서 이름과 주문번호 또는 휴대폰번호를 입력하면 최근 주문 내역을 확인할 수 있습니다.',
  },
  {
    id: 'faq-2',
    category: '배송/배송일',
    question: '배송 예정일은 어디에서 확인할 수 있나요?',
    answer:
      '장바구니 및 주문서 작성 단계에서 배송 예정일을 확인할 수 있으며, 주문 완료 후에는 마이페이지에서도 다시 확인할 수 있습니다.',
  },
  {
    id: 'faq-3',
    category: '취소/환불',
    question: '결제 완료 후 주문 취소는 어떻게 하나요?',
    answer:
      '상품 준비 전 상태에서는 주문 상세 또는 고객센터를 통해 취소 접수가 가능합니다. 설치 상품은 진행 단계에 따라 취소 가능 여부가 달라질 수 있습니다.',
  },
  {
    id: 'faq-4',
    category: '상품',
    question: '상품 상세페이지의 색상과 실제 제품 색상이 다른가요?',
    answer:
      '모니터 및 모바일 기기 환경에 따라 색상 차이가 있을 수 있습니다. 상세페이지의 소재와 색상 안내를 함께 확인해 주세요.',
  },
];

const qnaRows = [
  { id: 1, title: '배송 일정 문의', status: '답변완료', date: '2026.03.25' },
  { id: 2, title: '교환 가능 여부 문의', status: '접수완료', date: '2026.03.21' },
  { id: 3, title: '비회원 주문 조회 문의', status: '답변완료', date: '2026.03.18' },
  { id: 4, title: '배송비/설치비 확인 문의', status: '답변완료', date: '2026.03.15' },
  { id: 5, title: '주소 변경 가능 여부 문의', status: '접수완료', date: '2026.03.12' },
  { id: 6, title: '주문 취소 처리 상태 문의', status: '답변완료', date: '2026.03.09' },
  { id: 7, title: '교환 접수 서류 문의', status: '답변완료', date: '2026.03.06' },
  { id: 8, title: '포인트 적립 누락 문의', status: '접수완료', date: '2026.03.02' },
];

const currentSection = computed(() => {
  const matched = sidebarLinks.find((link) => link.routeNames.includes(route.name));
  return matched?.id ?? 'notice';
});

const currentLabel = computed(() => {
  const matched = sidebarLinks.find((link) => link.id === currentSection.value);
  return matched?.label ?? '공지사항';
});

const filteredNotices = computed(() => {
  const keyword = noticeKeyword.value.trim();
  if (!keyword) {
    return noticeRows;
  }

  return noticeRows.filter((row) => row.title.includes(keyword));
});

const noticeTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredNotices.value.length / BOARD_PAGE_SIZE)),
);

const pagedNotices = computed(() => {
  const start = (noticePage.value - 1) * BOARD_PAGE_SIZE;
  return filteredNotices.value.slice(start, start + BOARD_PAGE_SIZE);
});

const filteredFaqRows = computed(() => {
  if (activeFaqCategory.value === '전체') {
    return faqRows;
  }

  return faqRows.filter((row) => row.category === activeFaqCategory.value);
});

const filteredQnaRows = computed(() => {
  const keyword = qnaKeyword.value.trim();
  if (!keyword) {
    return qnaRows;
  }

  return qnaRows.filter((row) => row.title.includes(keyword));
});

const qnaTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredQnaRows.value.length / BOARD_PAGE_SIZE)),
);

const pagedQnaRows = computed(() => {
  const start = (qnaPage.value - 1) * BOARD_PAGE_SIZE;
  return filteredQnaRows.value.slice(start, start + BOARD_PAGE_SIZE);
});

function toggleFaq(id) {
  openFaqIds.value = openFaqIds.value.includes(id)
    ? openFaqIds.value.filter((item) => item !== id)
    : [...openFaqIds.value, id];
}

function selectFaqCategory(category) {
  activeFaqCategory.value = category;
}

function changeNoticePage(page) {
  noticePage.value = page;
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

function changeQnaPage(page) {
  qnaPage.value = page;
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

watch(noticeKeyword, () => {
  noticePage.value = 1;
});

watch(qnaKeyword, () => {
  qnaPage.value = 1;
});
</script>

<template>
  <SiteChrome>
    <main class="cs-page">
      <div class="cs-page__inner">
        <div class="cs-breadcrumb">
          <RouterLink to="/" class="cs-breadcrumb__home" aria-label="홈으로 이동">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 10.5L12 4L20 10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 9.8V19H17V9.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
          <span>〉</span>
          <span>고객센터</span>
          <span>〉</span>
          <span>{{ currentLabel }}</span>
        </div>

        <section class="cs-layout">
          <aside class="cs-sidebar">
            <h1>고객센터</h1>
            <nav class="cs-sidebar__nav">
              <RouterLink
                v-for="link in sidebarLinks"
                :key="link.id"
                :to="link.to"
                class="cs-sidebar__link"
                :class="{ 'is-active': currentSection === link.id }"
              >
                {{ link.label }}
              </RouterLink>
            </nav>
          </aside>

          <section class="cs-content">
            <header class="cs-content__header">
              <h2>{{ currentLabel }}</h2>
            </header>

            <template v-if="currentSection === 'notice'">
              <div class="cs-toolbar">
                <div class="cs-search">
                  <input v-model="noticeKeyword" type="text" placeholder="공지사항 검색" />
                  <button type="button">검색</button>
                </div>
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
                    <strong>
                      {{ row.title }}
                    </strong>
                    <span>{{ row.date }}</span>
                  </RouterLink>
                </div>
                <div v-else class="cs-board__empty">검색 결과가 없습니다.</div>
              </div>

              <div class="cs-pagination">
                <button type="button" aria-label="이전 페이지" :disabled="noticePage === 1" @click="changeNoticePage(Math.max(1, noticePage - 1))">〈</button>
                <button
                  v-for="page in noticeTotalPages"
                  :key="`notice-${page}`"
                  type="button"
                  :class="{ 'is-active': noticePage === page }"
                  @click="changeNoticePage(page)"
                >
                  {{ page }}
                </button>
                <button type="button" aria-label="다음 페이지" :disabled="noticePage === noticeTotalPages" @click="changeNoticePage(Math.min(noticeTotalPages, noticePage + 1))">〉</button>
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
              <div class="cs-qna-actions">
                <div class="cs-qna-actions__buttons">
                  <button type="button">문의 작성</button>
                  <button type="button">비회원 주문조회</button>
                </div>
              </div>

              <div class="cs-toolbar cs-toolbar--qna">
                <div class="cs-search">
                  <input v-model="qnaKeyword" type="text" placeholder="문의 검색" />
                  <button type="button">검색</button>
                </div>
              </div>

              <div class="cs-board">
                <div class="cs-board__head cs-board__head--qna">
                  <span>번호</span>
                  <span>문의 제목</span>
                  <span>답변상태</span>
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
                <button type="button" aria-label="이전 페이지" :disabled="qnaPage === 1" @click="changeQnaPage(Math.max(1, qnaPage - 1))">〈</button>
                <button
                  v-for="page in qnaTotalPages"
                  :key="`qna-${page}`"
                  type="button"
                  :class="{ 'is-active': qnaPage === page }"
                  @click="changeQnaPage(page)"
                >
                  {{ page }}
                </button>
                <button type="button" aria-label="다음 페이지" :disabled="qnaPage === qnaTotalPages" @click="changeQnaPage(Math.min(qnaTotalPages, qnaPage + 1))">〉</button>
              </div>
            </template>
          </section>
        </section>
      </div>
    </main>
  </SiteChrome>
</template>

<style scoped>
.cs-page {
  background: #ffffff;
}

.cs-page__inner {
  width: min(1280px, calc(100% - 40px));
  margin: 0 auto;
  padding: 28px 0 96px;
}

.cs-breadcrumb {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #8f8f8f;
  font-size: 13px;
  line-height: 1;
}

.cs-breadcrumb__home {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: #8f8f8f;
}

.cs-breadcrumb__home svg {
  width: 100%;
  height: 100%;
}

.cs-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 64px;
  margin-top: 40px;
}

.cs-sidebar h1 {
  margin: 0 0 28px;
  font-size: 36px;
  line-height: 1.2;
  font-weight: 700;
  color: #111111;
}

.cs-sidebar__nav {
  display: grid;
  border-top: 2px solid #111111;
}

.cs-sidebar__link {
  display: flex;
  align-items: center;
  min-height: 56px;
  border-bottom: 1px solid #e6e6e6;
  color: #222222;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
}

.cs-sidebar__link.is-active {
  color: #111111;
  font-weight: 700;
}

.cs-content {
  min-width: 0;
}

.cs-content__header {
  padding-bottom: 18px;
  border-bottom: 2px solid #111111;
}

.cs-content__header h2 {
  margin: 0;
  font-size: 32px;
  line-height: 1.2;
  font-weight: 700;
  color: #111111;
}

.cs-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 24px 0 16px;
}

.cs-search {
  display: flex;
  width: min(420px, 100%);
}

.cs-search input {
  flex: 1;
  height: 44px;
  border: 1px solid #d9d9d9;
  border-right: 0;
  padding: 0 14px;
  font-size: 14px;
  color: #111111;
  box-sizing: border-box;
}

.cs-search button,
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
  gap: 8px;
  padding: 0 16px 0 8px;
  font-size: 15px;
  font-weight: 500;
  text-align: left;
}

.cs-board__row strong em {
  flex: 0 0 auto;
  font-style: normal;
  color: #0b57a4;
  font-weight: 700;
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

.cs-pagination button:disabled {
  opacity: 0.38;
  cursor: default;
}

.cs-pagination button.is-active {
  border-color: #111111;
  background: #111111;
  color: #ffffff;
}

.cs-faq-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 24px 0 20px;
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
  padding: 0 12px;
  text-align: left;
  font-size: 15px;
  font-weight: 500;
  color: #111111;
}

.cs-faq-item__answer {
  padding: 22px 24px 24px 172px;
  background: #fafafa;
  color: #555555;
  font-size: 14px;
  line-height: 1.8;
}

.cs-qna-actions {
  display: flex;
  justify-content: flex-end;
  padding: 24px 0 8px;
}

.cs-qna-actions__buttons {
  display: flex;
  gap: 10px;
}

.cs-board__head--qna,
.cs-board__row--qna {
  grid-template-columns: 80px minmax(0, 1fr) 120px 140px;
}

@media (max-width: 960px) {
  .cs-layout {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .cs-sidebar h1 {
    font-size: 28px;
  }

  .cs-content__header h2 {
    font-size: 26px;
  }
}

@media (max-width: 720px) {
  .cs-page__inner {
    width: calc(100% - 28px);
    padding: 24px 0 72px;
  }

  .cs-board__head,
  .cs-board__row,
  .cs-board__head--qna,
  .cs-board__row--qna {
    grid-template-columns: 72px minmax(0, 1fr) 110px;
  }

  .cs-board__head--qna span:nth-child(3),
  .cs-board__row--qna span:nth-child(3) {
    display: none;
  }

  .cs-faq-item__question {
    grid-template-columns: 110px minmax(0, 1fr) 36px;
  }

  .cs-faq-item__answer {
    padding: 18px 18px 20px;
  }

  .cs-qna-actions {
    justify-content: flex-start;
  }
}
</style>
