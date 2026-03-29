import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue';

export function useHeroCarousel(slides) {
  const currentSlide = shallowRef(0);
  const slideDirection = shallowRef('next');

  let heroIntervalId;

  const activeHeroSlide = computed(() => slides.value[currentSlide.value] ?? slides.value[0]);
  const slideTransitionName = computed(() =>
    slideDirection.value === 'prev' ? 'hs-hero-slide-backward' : 'hs-hero-slide-forward',
  );
  const heroCurrentLabel = computed(() => String(currentSlide.value + 1).padStart(2, '0'));
  const heroTotalLabel = computed(() => String(slides.value.length).padStart(2, '0'));

  function changeSlide(nextIndex, direction) {
    slideDirection.value = direction;
    currentSlide.value = nextIndex;
  }

  function nextSlide() {
    changeSlide((currentSlide.value + 1) % slides.value.length, 'next');
  }

  function previousSlide() {
    changeSlide((currentSlide.value - 1 + slides.value.length) % slides.value.length, 'prev');
  }

  function selectSlide(index) {
    if (index === currentSlide.value) {
      return;
    }

    changeSlide(index, index > currentSlide.value ? 'next' : 'prev');
  }

  function stopAutoSlide() {
    if (heroIntervalId) {
      window.clearInterval(heroIntervalId);
      heroIntervalId = undefined;
    }
  }

  function startAutoSlide() {
    stopAutoSlide();

    if (slides.value.length > 1) {
      heroIntervalId = window.setInterval(nextSlide, 5000);
    }
  }

  onMounted(startAutoSlide);
  onBeforeUnmount(stopAutoSlide);

  return {
    currentSlide,
    slideDirection,
    activeHeroSlide,
    slideTransitionName,
    heroCurrentLabel,
    heroTotalLabel,
    nextSlide,
    previousSlide,
    selectSlide,
    stopAutoSlide,
    startAutoSlide,
  };
}
