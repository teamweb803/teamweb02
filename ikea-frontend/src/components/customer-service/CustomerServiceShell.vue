<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SiteChrome from '../layout/SiteChrome.vue';
import {
  CUSTOMER_SERVICE_NAV_ITEMS,
  resolveCustomerServiceSection,
} from '../../constants/customerServiceNavigation';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  currentSection: {
    type: String,
    default: '',
  },
});

const route = useRoute();
const activeSection = computed(
  () => props.currentSection || resolveCustomerServiceSection(route.name),
);
</script>

<template>
  <SiteChrome>
    <main class="cs-shell">
      <div class="cs-shell__inner">
        <div class="cs-shell__breadcrumb">
          <RouterLink to="/" class="cs-shell__breadcrumb-home" aria-label="홈으로 이동">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 10.5L12 4L20 10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 9.8V19H17V9.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
          <span>/</span>
          <span>고객센터</span>
          <span>/</span>
          <span>{{ title }}</span>
        </div>

        <section class="cs-shell__layout">
          <aside class="cs-shell__sidebar">
            <h1>고객센터</h1>
            <nav class="cs-shell__nav">
              <RouterLink
                v-for="item in CUSTOMER_SERVICE_NAV_ITEMS"
                :key="item.id"
                :to="item.to"
                class="cs-shell__link"
                :class="{ 'is-active': activeSection === item.id }"
              >
                {{ item.label }}
              </RouterLink>
            </nav>
          </aside>

          <section class="cs-shell__content">
            <header class="cs-shell__header">
              <div class="cs-shell__copy">
                <h2>{{ title }}</h2>
              </div>
              <div v-if="$slots.action" class="cs-shell__action">
                <slot name="action" />
              </div>
            </header>

            <div class="cs-shell__body">
              <slot />
            </div>
          </section>
        </section>
      </div>
    </main>
  </SiteChrome>
</template>

<style scoped>
.cs-shell {
  background: #ffffff;
}

.cs-shell__inner {
  width: min(1280px, calc(100% - 40px));
  margin: 0 auto;
  padding: 28px 0 96px;
}

.cs-shell__breadcrumb {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #8f8f8f;
  font-size: 13px;
  line-height: 1;
}

.cs-shell__breadcrumb-home {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: #8f8f8f;
}

.cs-shell__breadcrumb-home svg {
  width: 100%;
  height: 100%;
}

.cs-shell__layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 64px;
  margin-top: 40px;
}

.cs-shell__sidebar h1 {
  margin: 0 0 28px;
  font-size: 36px;
  line-height: 1.2;
  font-weight: 700;
  color: #111111;
}

.cs-shell__nav {
  display: grid;
  border-top: 2px solid #111111;
}

.cs-shell__link {
  display: flex;
  align-items: center;
  min-height: 56px;
  border-bottom: 1px solid #e6e6e6;
  color: #222222;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
}

.cs-shell__link.is-active {
  color: #111111;
  font-weight: 700;
}

.cs-shell__content {
  min-width: 0;
}

.cs-shell__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 18px;
  border-bottom: 2px solid #111111;
}

.cs-shell__copy h2 {
  margin: 0;
  font-size: 32px;
  line-height: 1.2;
  font-weight: 700;
  color: #111111;
}

.cs-shell__body {
  padding-top: 24px;
}

@media (max-width: 960px) {
  .cs-shell__layout {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .cs-shell__sidebar h1 {
    font-size: 28px;
  }

  .cs-shell__copy h2 {
    font-size: 26px;
  }
}

@media (max-width: 720px) {
  .cs-shell__inner {
    width: calc(100% - 28px);
    padding: 24px 0 72px;
  }

  .cs-shell__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
