<script setup>
const props = defineProps({
  slides: {
    type: Array,
    required: true,
  },
  activeSlide: {
    type: Object,
    required: true,
  },
  currentSlide: {
    type: Number,
    required: true,
  },
  slideTransitionName: {
    type: String,
    required: true,
  },
  heroCurrentLabel: {
    type: String,
    required: true,
  },
  heroTotalLabel: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([
  'activate',
  'next',
  'pause',
  'previous',
  'resume',
  'select-slide',
]);

function handleActivate() {
  emit('activate', props.activeSlide);
}

function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleActivate();
  }
}
</script>

<template>
  <section
    class="hs-hero"
    aria-label="메인 프로모션"
    @mouseenter="emit('pause')"
    @mouseleave="emit('resume')"
  >
    <Transition :name="slideTransitionName">
      <article
        :key="activeSlide.id"
        class="hs-hero__slide hs-hero__slide--interactive"
        role="button"
        tabindex="0"
        @click="handleActivate"
        @keydown="handleKeydown"
      >
        <img
          class="hs-hero__image"
          :src="activeSlide.image"
          :alt="activeSlide.title"
          :style="{ objectPosition: activeSlide.imagePosition || 'center center' }"
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
        <div class="hs-hero__overlay">
          <p class="hs-hero__eyebrow">{{ activeSlide.eyebrow }}</p>
          <h1>{{ activeSlide.title }}</h1>
          <p class="hs-hero__description">{{ activeSlide.description }}</p>
        </div>
      </article>
    </Transition>

    <button
      class="hs-hero__nav hs-hero__nav--prev"
      type="button"
      aria-label="이전 슬라이드"
      @click="emit('previous')"
    >
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M14.5 5L8 12L14.5 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    </button>
    <button
      class="hs-hero__nav hs-hero__nav--next"
      type="button"
      aria-label="다음 슬라이드"
      @click="emit('next')"
    >
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M9.5 5L16 12L9.5 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    </button>

    <div class="hs-hero__footer">
      <div class="hs-hero__dots">
        <button
          v-for="(slide, index) in slides"
          :key="slide.id"
          class="hs-hero__dot"
          :class="{ 'is-active': index === currentSlide }"
          type="button"
          :aria-label="`${index + 1}번 슬라이드`"
          @click="emit('select-slide', index)"
        />
      </div>
      <div class="hs-hero__count">{{ heroCurrentLabel }} | {{ heroTotalLabel }}</div>
    </div>
  </section>
</template>

<style scoped>
.hs-hero {
  --hs-hero-height: clamp(560px, 42vw, 760px);
  position: relative;
  width: 100vw;
  height: var(--hs-hero-height);
  margin-left: calc(50% - 50vw);
  overflow: hidden;
}

.hs-hero__slide {
  position: absolute;
  inset: 0;
  height: 100%;
  overflow: hidden;
  background: #d9d0c3;
}

.hs-hero__slide--interactive {
  cursor: pointer;
}

.hs-hero__slide--interactive:focus-visible {
  outline: 2px solid var(--hs-blue);
  outline-offset: -2px;
}

.hs-hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hs-hero__overlay {
  position: absolute;
  top: 50%;
  left: max(calc(50vw - 640px), 28px);
  display: grid;
  align-content: start;
  gap: 10px;
  width: min(500px, calc(100vw - 64px));
  min-height: 286px;
  padding: 24px 26px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(247, 249, 251, 0.66);
  transform: translateY(-50%);
  backdrop-filter: blur(3px);
  box-shadow: 0 12px 28px rgba(17, 24, 39, 0.04);
}

.hs-hero__eyebrow {
  margin: 0;
  color: var(--hs-blue);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hs-hero__overlay h1 {
  margin: 0;
  color: var(--hs-ink);
  font-size: clamp(30px, 3.6vw, 46px);
  line-height: 1.12;
  letter-spacing: -0.04em;
}

.hs-hero__description {
  margin: 0;
  color: #374151;
  max-width: 42ch;
  font-size: 16px;
  line-height: 1.62;
}

.hs-hero__nav {
  position: absolute;
  top: 50%;
  z-index: 2;
  width: 48px;
  height: 48px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.42);
  color: #ffffff;
  transform: translateY(-50%);
  cursor: pointer;
}

.hs-hero__nav svg {
  width: 100%;
  height: 100%;
}

.hs-hero__nav--prev {
  left: max(calc(50vw - 700px), 16px);
}

.hs-hero__nav--next {
  right: max(calc(50vw - 700px), 16px);
}

.hs-hero__footer {
  position: absolute;
  right: max(calc(50vw - 640px), 28px);
  bottom: 26px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 16px;
  background: rgba(17, 24, 39, 0.52);
  color: #ffffff;
}

.hs-hero__dots {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hs-hero__dot {
  width: 10px;
  height: 10px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.4);
  padding: 0;
  cursor: pointer;
}

.hs-hero__dot.is-active {
  width: 28px;
  background: #ffffff;
}

.hs-hero__count {
  font-size: 13px;
  font-weight: 700;
}

@media (max-width: 720px) {
  .hs-hero {
    --hs-hero-height: 520px;
  }

  .hs-hero__overlay {
    right: 16px;
    left: 16px;
    max-width: none;
    min-height: 0;
    padding: 18px 16px;
  }

  .hs-hero__overlay h1 {
    font-size: 34px;
  }

  .hs-hero__footer {
    right: 12px;
    bottom: 12px;
    left: 12px;
    gap: 14px;
    padding-inline: 16px;
  }
}
</style>
