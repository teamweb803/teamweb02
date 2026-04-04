<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import CommonStatePanel from '../components/common/CommonStatePanel.vue';
import SiteChrome from '../components/layout/SiteChrome.vue';
import {
  buildCustomerServiceNoticeDetailPath,
  ROUTE_PATHS,
} from '../constants/routes';
import {
  getCustomerNoticeDetail,
  getCustomerNoticeRows,
} from '../services/noticeService';

const route = useRoute();

const sidebarLinks = [
  { id: 'faq', label: 'FAQ', to: ROUTE_PATHS.customerServiceFaq },
  { id: 'qna', label: 'QnA', to: ROUTE_PATHS.customerServiceQna },
  { id: 'notice', label: '공지사항', to: ROUTE_PATHS.customerServiceNotice },
];

const noticeRows = ref([]);
const noticeDetail = ref(null);
const isNoticeLoading = ref(false);
const noticeLoadError = ref('');

const rawNoticeDetails = {
  1: {
    id: 1,
    title: '[당첨자 발표] 26년 02월 HOMiO 베스트 후기 이벤트 당첨자 발표',
    date: '2026-02-26 11:20:00',
    lines: [
      '2월 HOMiO 후기 이벤트 당첨자를 안내드립니다.',
      '당첨 고객께는 등록하신 연락처를 통해 순차적으로 개별 안내가 진행됩니다.',
      '배송 및 지급 일정은 내부 확인 후 별도로 전달드릴 예정입니다.',
    ],
    previousId: null,
    nextId: 2,
  },
  2: {
    id: 2,
    title: '[공지] HOMiO 배송 일정 안내 화면 개편 예정',
    date: '2026-02-24 09:30:00',
    lines: [
      '배송 일정 안내 화면이 더 간결한 구조로 개편될 예정입니다.',
      '장바구니와 주문서작성 단계에서 확인되는 배송 정보는 기존과 동일하게 제공됩니다.',
      '개편 일정은 서비스 점검 없이 순차 반영됩니다.',
    ],
    previousId: 1,
    nextId: 3,
  },
  3: {
    id: 3,
    title: '[공지] HOMiO 주문 시스템 점검 안내',
    date: '2026-02-20 10:47:33',
    lines: [
      '주문 및 결제 안정화를 위한 시스템 점검이 예정되어 있습니다.',
      '일정 : 2026년 2월 24일 00:00 ~ 07:00',
      '점검 시간 동안 주문 및 결제 서비스 이용이 일시 제한될 수 있습니다.',
      '이용에 불편을 드려 죄송합니다.',
    ],
    previousId: 2,
    nextId: 4,
  },
  4: {
    id: 4,
    title: '비회원 주문조회 기능 점검 안내',
    date: '2026-02-18 14:10:00',
    lines: [
      '비회원 주문조회 기능 안정화를 위한 점검이 진행될 예정입니다.',
      '점검 시간 동안 일부 화면이 지연될 수 있으며, 완료 후 정상 이용이 가능합니다.',
    ],
    previousId: 3,
    nextId: 5,
  },
  5: {
    id: 5,
    title: '배송/설치 일정 확인 페이지 개편 안내',
    date: '2026-02-14 09:40:00',
    lines: [
      '배송 및 설치 일정 확인 화면이 더 간결한 구조로 정리될 예정입니다.',
      '주문별 배송 안내 내용과 일정 표시는 기존과 동일하게 유지됩니다.',
    ],
    previousId: 4,
    nextId: 6,
  },
  6: {
    id: 6,
    title: '고객센터 QnA 응답 절차 안내',
    date: '2026-02-10 13:20:00',
    lines: [
      'QnA 문의는 접수 순서대로 확인 후 답변이 등록됩니다.',
      '주문, 배송, 교환 관련 문의는 주문번호를 함께 남겨주시면 더 빠르게 확인할 수 있습니다.',
    ],
    previousId: 5,
    nextId: 7,
  },
  7: {
    id: 7,
    title: '주문 취소 정책 안내',
    date: '2026-02-06 11:10:00',
    lines: [
      '결제 완료 후 상품 준비 단계 전까지는 주문 취소 접수가 가능합니다.',
      '설치 상품은 진행 상태에 따라 취소 가능 여부가 달라질 수 있습니다.',
    ],
    previousId: 6,
    nextId: 8,
  },
  8: {
    id: 8,
    title: '매장 수령 서비스 운영 시간 변경 안내',
    date: '2026-02-03 10:00:00',
    lines: [
      '매장 수령 서비스 운영 시간이 일부 지점에서 조정됩니다.',
      '상세 운영 시간은 주문 완료 후 안내 메시지에서 다시 확인하실 수 있습니다.',
    ],
    previousId: 7,
    nextId: 9,
  },
  9: {
    id: 9,
    title: '신규 회원가입 혜택 적용 기준 안내',
    date: '2026-01-29 15:40:00',
    lines: [
      '신규 회원 혜택은 가입 완료 후 첫 주문 시 자동 적용됩니다.',
      '이벤트별 적용 기간과 조건은 프로모션 페이지에서 다시 확인하실 수 있습니다.',
    ],
    previousId: 8,
    nextId: 10,
  },
  10: {
    id: 10,
    title: '교환/반품 접수 절차 안내',
    date: '2026-01-24 14:15:00',
    lines: [
      '교환 및 반품 접수는 주문 상세 또는 고객센터를 통해 진행할 수 있습니다.',
      '상품 상태에 따라 추가 확인이 필요할 수 있습니다.',
    ],
    previousId: 9,
    nextId: 11,
  },
  11: {
    id: 11,
    title: '일부 배송 권역 운영 일정 안내',
    date: '2026-01-19 10:25:00',
    lines: [
      '일부 배송 권역은 지역 일정에 따라 운영 시간이 달라질 수 있습니다.',
      '장바구니와 주문서작성 단계에서 노출되는 배송 안내를 우선 확인해 주세요.',
    ],
    previousId: 10,
    nextId: 12,
  },
  12: {
    id: 12,
    title: '비회원 결제 확인 절차 안내',
    date: '2026-01-14 09:10:00',
    lines: [
      '비회원 결제 건은 주문번호 또는 휴대폰번호를 통해 확인할 수 있습니다.',
      '결제 상태 확인이 지연될 경우 고객센터로 문의해 주세요.',
    ],
    previousId: 11,
    nextId: 13,
  },
  13: {
    id: 13,
    title: '설치 서비스 운영 기준 안내',
    date: '2026-01-10 10:20:00',
    lines: [
      '설치가 필요한 상품은 주문 시 선택한 일정과 지역 여건에 따라 진행됩니다.',
      '상품 특성상 현장 확인이 필요한 경우 설치 일정이 별도로 조정될 수 있습니다.',
    ],
    previousId: 12,
    nextId: 14,
  },
  14: {
    id: 14,
    title: '무통장입금 확인 일정 안내',
    date: '2026-01-07 09:30:00',
    lines: [
      '무통장입금 주문은 입금 확인 후 순차적으로 주문 상태에 반영됩니다.',
      '입금자명 또는 금액이 일치하지 않는 경우 확인이 지연될 수 있습니다.',
    ],
    previousId: 13,
    nextId: 15,
  },
  15: {
    id: 15,
    title: '일부 지역 배송 가능 일정 변경 안내',
    date: '2026-01-03 14:00:00',
    lines: [
      '일부 권역은 물류 운영 일정에 따라 배송 가능일이 달라질 수 있습니다.',
      '정확한 일정은 장바구니와 주문서 단계에서 다시 확인해 주세요.',
    ],
    previousId: 14,
    nextId: 16,
  },
  16: {
    id: 16,
    title: '연휴 기간 고객센터 운영 시간 안내',
    date: '2025-12-29 11:15:00',
    lines: [
      '연휴 기간에는 고객센터 상담 및 답변 등록 시간이 일부 조정됩니다.',
      'QnA와 공지사항을 통해 순차적으로 운영 일정을 안내드릴 예정입니다.',
    ],
    previousId: 15,
    nextId: 17,
  },
  17: {
    id: 17,
    title: '리뷰 작성 이벤트 운영 안내',
    date: '2025-12-24 13:20:00',
    lines: [
      '구매 후 리뷰를 작성하면 진행 중인 후기 이벤트 대상에 포함될 수 있습니다.',
      '이벤트 적용 여부와 지급 일정은 별도 공지사항을 통해 안내됩니다.',
    ],
    previousId: 16,
    nextId: 18,
  },
  18: {
    id: 18,
    title: '배송비 정책 일부 조정 안내',
    date: '2025-12-18 09:40:00',
    lines: [
      '일부 상품군은 배송 방식과 지역에 따라 배송비 기준이 조정될 수 있습니다.',
      '실제 적용되는 배송비는 장바구니 및 주문서 화면에서 확인 가능합니다.',
    ],
    previousId: 17,
    nextId: 19,
  },
  19: {
    id: 19,
    title: '회원정보 보호 정책 점검 안내',
    date: '2025-12-11 10:05:00',
    lines: [
      '회원정보 보호 강화를 위한 내부 점검이 진행될 예정입니다.',
      '점검 중에도 로그인과 주문 내역 확인은 정상적으로 이용할 수 있습니다.',
    ],
    previousId: 18,
    nextId: 20,
  },
  20: {
    id: 20,
    title: '상품 상세페이지 정보 정비 안내',
    date: '2025-12-05 15:10:00',
    lines: [
      '상품 상세페이지의 치수, 색상, 구성 정보가 순차적으로 정비될 예정입니다.',
      '일부 상품은 업데이트 시점에 따라 상세 정보 노출 순서가 달라질 수 있습니다.',
    ],
    previousId: 19,
    nextId: null,
  },
};

const noticeDetails = Object.fromEntries(
  Object.values(rawNoticeDetails).map((notice) => {
    const mappedId = 21 - Number(notice.id);

    return [
      mappedId,
      {
        ...notice,
        id: mappedId,
        previousId: notice.previousId == null ? null : 21 - Number(notice.previousId),
        nextId: notice.nextId == null ? null : 21 - Number(notice.nextId),
      },
    ];
  }),
);

const fallbackNotice = computed(() => noticeDetails[route.params.noticeId] ?? noticeDetails[18]);
const currentNotice = computed(() => noticeDetail.value ?? fallbackNotice.value);
const noticeLines = computed(() => {
  if (Array.isArray(currentNotice.value?.lines) && currentNotice.value.lines.length) {
    return currentNotice.value.lines;
  }

  const content = String(currentNotice.value?.content ?? '').trim();
  return content ? [content] : [];
});
const currentNoticeIndex = computed(() => noticeRows.value.findIndex(
  (row) => String(row.id) === String(currentNotice.value?.id ?? route.params.noticeId ?? ''),
));
const previousNotice = computed(() => {
  if (currentNoticeIndex.value <= 0) {
    return noticeDetails[currentNotice.value?.previousId] ?? null;
  }

  return noticeRows.value[currentNoticeIndex.value - 1] ?? null;
});
const nextNotice = computed(() => {
  if (currentNoticeIndex.value < 0 || currentNoticeIndex.value >= noticeRows.value.length - 1) {
    return noticeDetails[currentNotice.value?.nextId] ?? null;
  }

  return noticeRows.value[currentNoticeIndex.value + 1] ?? null;
});

async function loadNoticeDetailData() {
  const noticeId = String(route.params.noticeId ?? '').trim();

  if (!noticeId) {
    noticeDetail.value = null;
    noticeLoadError.value = '공지사항을 찾을 수 없습니다.';
    return;
  }

  isNoticeLoading.value = true;
  noticeLoadError.value = '';

  const [detailResult, listResult] = await Promise.allSettled([
    getCustomerNoticeDetail(noticeId),
    getCustomerNoticeRows(),
  ]);

  if (listResult.status === 'fulfilled') {
    noticeRows.value = listResult.value;
  }

  if (detailResult.status === 'fulfilled') {
    noticeDetail.value = detailResult.value;
  } else {
    noticeDetail.value = null;
    noticeLoadError.value = detailResult.reason?.message ?? '공지사항을 불러오지 못했습니다.';
  }

  isNoticeLoading.value = false;
}

onMounted(() => {
  void loadNoticeDetailData();
});

watch(
  () => route.params.noticeId,
  () => {
    void loadNoticeDetailData();
  },
);
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
          <span>공지사항</span>
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
                :class="{ 'is-active': link.id === 'notice' }"
              >
                {{ link.label }}
              </RouterLink>
            </nav>
          </aside>

          <section class="cs-content">
            <header class="cs-content__header">
              <h2>공지사항</h2>
            </header>

            <CommonStatePanel
              v-if="noticeLoadError"
              tone="error"
              title="최신 공지 데이터를 확인할 수 없습니다."
              :description="noticeLoadError"
              align="left"
              compact
            />

            <article class="notice-detail">
              <div class="notice-detail__head">
                <strong>{{ currentNotice.title }}</strong>
                <span>{{ currentNotice.date }}</span>
              </div>

              <div class="notice-detail__body">
                <p v-for="line in noticeLines" :key="line">{{ line }}</p>
              </div>

              <div class="notice-detail__nav">
                <div class="notice-detail__nav-row">
                  <span>이전글</span>
                  <RouterLink v-if="previousNotice" :to="buildCustomerServiceNoticeDetailPath(previousNotice.id)">
                    {{ previousNotice.title }}
                  </RouterLink>
                  <b v-else>이전글이 없습니다.</b>
                </div>
                <div class="notice-detail__nav-row">
                  <span>다음글</span>
                  <RouterLink v-if="nextNotice" :to="buildCustomerServiceNoticeDetailPath(nextNotice.id)">
                    {{ nextNotice.title }}
                  </RouterLink>
                  <b v-else>다음글이 없습니다.</b>
                </div>
              </div>

              <div class="notice-detail__actions">
                <RouterLink :to="ROUTE_PATHS.customerServiceNotice" class="notice-detail__list-button">
                  목록
                </RouterLink>
              </div>
            </article>
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

.notice-detail {
  padding-top: 24px;
}

.notice-detail__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  min-height: 74px;
  padding: 0 16px;
  border-top: 1px solid #111111;
  border-bottom: 1px solid #e6e6e6;
}

.notice-detail__head strong {
  font-size: 22px;
  line-height: 1.45;
  font-weight: 600;
  color: #111111;
}

.notice-detail__head span {
  flex: 0 0 auto;
  color: #666666;
  font-size: 14px;
}

.notice-detail__body {
  min-height: 260px;
  padding: 32px 18px 40px;
  border-bottom: 1px solid #e6e6e6;
}

.notice-detail__body p {
  margin: 0 0 16px;
  color: #333333;
  font-size: 15px;
  line-height: 1.95;
  white-space: pre-wrap;
}

.notice-detail__body p:last-child {
  margin-bottom: 0;
}

.notice-detail__nav {
  margin-top: 24px;
  border-top: 1px solid #111111;
}

.notice-detail__nav-row {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
  align-items: center;
  min-height: 54px;
  border-bottom: 1px solid #e6e6e6;
}

.notice-detail__nav-row span {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555555;
  font-size: 14px;
  font-weight: 600;
}

.notice-detail__nav-row a,
.notice-detail__nav-row b {
  padding: 0 16px;
  color: #222222;
  text-decoration: none;
  font-size: 14px;
  font-weight: 400;
}

.notice-detail__actions {
  display: flex;
  justify-content: center;
  padding-top: 32px;
}

.notice-detail__list-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  height: 48px;
  border: 1px solid #111111;
  color: #111111;
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
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

  .notice-detail__head {
    flex-direction: column;
    align-items: flex-start;
    padding: 18px 16px;
  }

  .notice-detail__head strong {
    font-size: 18px;
  }

  .notice-detail__nav-row {
    grid-template-columns: 84px minmax(0, 1fr);
  }
}
</style>
