<script setup>
import SiteChrome from '../layout/SiteChrome.vue';

defineProps({
  currentId: {
    type: String,
    required: true,
  },
  document: {
    type: Object,
    required: true,
  },
  navItems: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <SiteChrome>
    <main class="legal-shell">
      <div class="legal-shell__inner">
        <div class="legal-shell__breadcrumb">
          <RouterLink to="/" class="legal-shell__breadcrumb-home" aria-label="홈으로 이동">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 10.5L12 4L20 10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 9.8V19H17V9.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
          <span>/</span>
          <span>정책안내</span>
          <span>/</span>
          <span>{{ document.title }}</span>
        </div>

        <section class="legal-shell__layout">
          <aside class="legal-shell__sidebar">
            <h1>정책안내</h1>
            <nav class="legal-shell__nav">
              <RouterLink
                v-for="item in navItems"
                :key="item.id"
                :to="item.to"
                class="legal-shell__link"
                :class="{ 'is-active': currentId === item.id }"
              >
                {{ item.label }}
              </RouterLink>
            </nav>
          </aside>

          <section class="legal-shell__content">
            <header class="legal-shell__header">
              <div class="legal-shell__copy">
                <p class="legal-shell__eyebrow">{{ document.eyebrow }}</p>
                <h2>{{ document.title }}</h2>
                <p class="legal-shell__summary">{{ document.summary }}</p>
              </div>

              <dl class="legal-shell__meta">
                <div>
                  <dt>최종 수정일</dt>
                  <dd>{{ document.updatedAt }}</dd>
                </div>
                <div>
                  <dt>시행일</dt>
                  <dd>{{ document.effectiveDate }}</dd>
                </div>
              </dl>
            </header>

            <section class="legal-highlight">
              <h3>주요 안내</h3>
              <ul class="legal-highlight__list">
                <li v-for="highlight in document.highlights" :key="highlight">{{ highlight }}</li>
              </ul>
            </section>

            <section class="legal-body">
              <article
                v-for="(section, index) in document.sections"
                :key="section.id"
                class="legal-section"
              >
                <div class="legal-section__head">
                  <span>{{ String(index + 1).padStart(2, '0') }}</span>
                  <h3>{{ section.title }}</h3>
                </div>

                <div class="legal-section__body">
                  <p v-for="paragraph in section.paragraphs ?? []" :key="paragraph">
                    {{ paragraph }}
                  </p>

                  <ul v-if="section.bullets?.length" class="legal-section__list">
                    <li v-for="bullet in section.bullets" :key="bullet">{{ bullet }}</li>
                  </ul>

                  <dl v-if="section.entries?.length" class="legal-section__grid">
                    <div v-for="entry in section.entries" :key="entry.label" class="legal-section__grid-item">
                      <dt>{{ entry.label }}</dt>
                      <dd>{{ entry.value }}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            </section>
          </section>
        </section>
      </div>
    </main>
  </SiteChrome>
</template>

<style scoped>
.legal-shell {
  background: #ffffff;
}

.legal-shell__inner {
  width: min(1280px, calc(100% - 40px));
  margin: 0 auto;
  padding: 28px 0 96px;
}

.legal-shell__breadcrumb {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #8f8f8f;
  font-size: 13px;
  line-height: 1;
}

.legal-shell__breadcrumb-home {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: #8f8f8f;
}

.legal-shell__breadcrumb-home svg {
  width: 100%;
  height: 100%;
}

.legal-shell__layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 64px;
  margin-top: 40px;
}

.legal-shell__sidebar h1 {
  margin: 0 0 28px;
  color: #111111;
  font-size: 36px;
  line-height: 1.2;
  font-weight: 700;
}

.legal-shell__nav {
  display: grid;
  border-top: 2px solid #111111;
}

.legal-shell__link {
  display: flex;
  align-items: center;
  min-height: 56px;
  border-bottom: 1px solid #e6e6e6;
  color: #222222;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
}

.legal-shell__link.is-active {
  color: #111111;
  font-weight: 700;
}

.legal-shell__content {
  min-width: 0;
  display: grid;
  gap: 24px;
}

.legal-shell__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #111111;
}

.legal-shell__eyebrow {
  margin: 0 0 10px;
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.legal-shell__copy h2 {
  margin: 0;
  color: #111111;
  font-size: 32px;
  line-height: 1.2;
  font-weight: 700;
}

.legal-shell__summary {
  margin: 14px 0 0;
  color: #555555;
  font-size: 15px;
  line-height: 1.8;
}

.legal-shell__meta {
  display: grid;
  gap: 12px;
  min-width: 220px;
  margin: 0;
  padding: 18px 20px;
  background: #f7f9fb;
}

.legal-shell__meta div {
  display: grid;
  gap: 4px;
}

.legal-shell__meta dt {
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
}

.legal-shell__meta dd {
  margin: 0;
  color: #111111;
  font-size: 14px;
  font-weight: 600;
}

.legal-highlight {
  padding: 22px 24px;
  border: 1px solid #e6ebf2;
  background: #fbfcfe;
}

.legal-highlight h3 {
  margin: 0 0 14px;
  color: #111111;
  font-size: 18px;
  font-weight: 700;
}

.legal-highlight__list,
.legal-section__list {
  margin: 0;
  padding-left: 18px;
  color: #444444;
}

.legal-highlight__list {
  display: grid;
  gap: 8px;
}

.legal-body {
  display: grid;
  gap: 18px;
}

.legal-section {
  border: 1px solid #e6e6e6;
  background: #ffffff;
}

.legal-section__head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 22px;
  border-bottom: 1px solid #eceff3;
}

.legal-section__head span {
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.legal-section__head h3 {
  margin: 0;
  color: #111111;
  font-size: 20px;
  line-height: 1.4;
}

.legal-section__body {
  display: grid;
  gap: 14px;
  padding: 20px 22px 24px;
}

.legal-section__body p,
.legal-section__list li {
  margin: 0;
  color: #444444;
  font-size: 15px;
  line-height: 1.8;
}

.legal-section__grid {
  display: grid;
  gap: 12px;
  margin: 0;
}

.legal-section__grid-item {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 16px;
  padding: 14px 16px;
  background: #f9fafb;
}

.legal-section__grid-item dt {
  color: #111111;
  font-size: 14px;
  font-weight: 700;
}

.legal-section__grid-item dd {
  margin: 0;
  color: #555555;
  font-size: 14px;
  line-height: 1.7;
}

@media (max-width: 960px) {
  .legal-shell__layout {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .legal-shell__sidebar h1 {
    font-size: 28px;
  }

  .legal-shell__header {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .legal-shell__inner {
    width: calc(100% - 28px);
    padding: 24px 0 72px;
  }

  .legal-shell__copy h2 {
    font-size: 26px;
  }

  .legal-section__grid-item {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
