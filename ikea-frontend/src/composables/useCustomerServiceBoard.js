import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  CUSTOMER_SERVICE_FAQ_CATEGORIES,
  CUSTOMER_SERVICE_FAQ_ROWS,
  CUSTOMER_SERVICE_NOTICE_ROWS,
} from '../constants/customerServiceContent';
import { resolveCustomerServiceSection } from '../constants/customerServiceNavigation';
import { getCustomerSupportQnaRows } from '../services/customerSupportService';

const BOARD_PAGE_SIZE = 6;

export function useCustomerServiceBoard() {
  const route = useRoute();
  const noticeKeyword = ref('');
  const activeFaqCategory = ref(CUSTOMER_SERVICE_FAQ_CATEGORIES[0]);
  const openFaqIds = ref(['faq-1']);
  const qnaKeyword = ref('');
  const noticePage = ref(1);
  const qnaPage = ref(1);

  const currentSection = computed(() => resolveCustomerServiceSection(route.name));
  const qnaRows = computed(() => getCustomerSupportQnaRows());
  const qnaSubmitted = computed(
    () => currentSection.value === 'qna' && route.query.submitted === '1',
  );

  const filteredNotices = computed(() => {
    const keyword = noticeKeyword.value.trim();
    if (!keyword) {
      return CUSTOMER_SERVICE_NOTICE_ROWS;
    }

    return CUSTOMER_SERVICE_NOTICE_ROWS.filter((row) => row.title.includes(keyword));
  });

  const noticeTotalPages = computed(() =>
    Math.max(1, Math.ceil(filteredNotices.value.length / BOARD_PAGE_SIZE)),
  );

  const pagedNotices = computed(() => {
    const start = (noticePage.value - 1) * BOARD_PAGE_SIZE;
    return filteredNotices.value.slice(start, start + BOARD_PAGE_SIZE);
  });

  const filteredFaqRows = computed(() => {
    if (activeFaqCategory.value === CUSTOMER_SERVICE_FAQ_CATEGORIES[0]) {
      return CUSTOMER_SERVICE_FAQ_ROWS;
    }

    return CUSTOMER_SERVICE_FAQ_ROWS.filter((row) => row.category === activeFaqCategory.value);
  });

  const filteredQnaRows = computed(() => {
    const keyword = qnaKeyword.value.trim();
    if (!keyword) {
      return qnaRows.value;
    }

    return qnaRows.value.filter((row) => row.title.includes(keyword));
  });

  const qnaTotalPages = computed(() =>
    Math.max(1, Math.ceil(filteredQnaRows.value.length / BOARD_PAGE_SIZE)),
  );

  const pagedQnaRows = computed(() => {
    const start = (qnaPage.value - 1) * BOARD_PAGE_SIZE;
    return filteredQnaRows.value.slice(start, start + BOARD_PAGE_SIZE);
  });

  function selectFaqCategory(category) {
    activeFaqCategory.value = category;
  }

  function toggleFaq(id) {
    openFaqIds.value = openFaqIds.value.includes(id)
      ? openFaqIds.value.filter((item) => item !== id)
      : [...openFaqIds.value, id];
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

  watch(currentSection, () => {
    noticePage.value = 1;
    qnaPage.value = 1;
  });

  return {
    activeFaqCategory,
    changeNoticePage,
    changeQnaPage,
    currentSection,
    faqCategories: CUSTOMER_SERVICE_FAQ_CATEGORIES,
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
  };
}
