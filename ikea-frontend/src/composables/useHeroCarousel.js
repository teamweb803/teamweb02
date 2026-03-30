import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue';

export function useHeroCarousel(slides) {
  const currentSlide = shallowRef(0);
  const trackIndex = shallowRef(slides.value.length > 1 ? 1 : 0);
  const isTrackTransitionEnabled = shallowRef(slides.value.length > 1);

  let heroIntervalId;

  const activeHeroSlide = computed(() => slides.value[currentSlide.value] ?? slides.value[0]);
  const displaySlides = computed(() => {
    if (slides.value.length <= 1) {
      return slides.value;
    }

    return [
      slides.value[slides.value.length - 1],
      ...slides.value,
      slides.value[0],
    ];
  });
  const trackStyle = computed(() => ({
    transform: `translate3d(-${trackIndex.value * 100}%, 0, 0)`,
    transition: isTrackTransitionEnabled.value
      ? 'transform 0.72s cubic-bezier(0.22, 1, 0.36, 1)'
      : 'none',
  }));
  const heroCurrentLabel = computed(() => String(currentSlide.value + 1).padStart(2, '0'));
  const heroTotalLabel = computed(() => String(slides.value.length).padStart(2, '0'));

  function moveTo(logicalIndex, nextTrackIndex) {
    if (!slides.value.length) {
      return;
    }

    isTrackTransitionEnabled.value = slides.value.length > 1;
    currentSlide.value = logicalIndex;
    trackIndex.value = nextTrackIndex;
  }

  function nextSlide() {
    if (slides.value.length <= 1) {
      return;
    }

    moveTo(
      (currentSlide.value + 1) % slides.value.length,
      trackIndex.value + 1,
    );
  }

  function previousSlide() {
    if (slides.value.length <= 1) {
      return;
    }

    moveTo(
      (currentSlide.value - 1 + slides.value.length) % slides.value.length,
      trackIndex.value - 1,
    );
  }

  function selectSlide(index) {
    if (index === currentSlide.value || !slides.value.length) {
      return;
    }

    if (slides.value.length <= 1) {
      currentSlide.value = index;
      trackIndex.value = 0;
      return;
    }

    if (currentSlide.value === slides.value.length - 1 && index === 0) {
      nextSlide();
      return;
    }

    if (currentSlide.value === 0 && index === slides.value.length - 1) {
      previousSlide();
      return;
    }

    moveTo(index, index + 1);
  }

  function handleTrackTransitionEnd() {
    if (slides.value.length <= 1) {
      return;
    }

    if (trackIndex.value === 0) {
      isTrackTransitionEnabled.value = false;
      trackIndex.value = slides.value.length;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          isTrackTransitionEnabled.value = true;
        });
      });
      return;
    }

    if (trackIndex.value === slides.value.length + 1) {
      isTrackTransitionEnabled.value = false;
      trackIndex.value = 1;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          isTrackTransitionEnabled.value = true;
        });
      });
    }
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
    activeHeroSlide,
    currentSlide,
    displaySlides,
    handleTrackTransitionEnd,
    heroCurrentLabel,
    heroTotalLabel,
    nextSlide,
    previousSlide,
    selectSlide,
    startAutoSlide,
    stopAutoSlide,
    trackStyle,
  };
}
