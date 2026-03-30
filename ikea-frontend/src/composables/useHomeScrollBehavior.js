import {
  onBeforeUnmount,
  onMounted,
  shallowRef,
} from 'vue';

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useHomeScrollBehavior({ threshold = 520 } = {}) {
  const showScrollTopButton = shallowRef(false);
  let scrollAnimationFrameId;

  function resolveSectionScrollOffset() {
    const shellElement = document.querySelector('.ikea-shell');
    const headerElement = document.querySelector('.hs-header');
    const stickyOffsetValue = shellElement
      ? Number.parseFloat(getComputedStyle(shellElement).getPropertyValue('--hs-sticky-offset'))
      : Number.NaN;

    if (Number.isFinite(stickyOffsetValue)) {
      return stickyOffsetValue;
    }

    return (headerElement?.offsetHeight ?? 0) + 22;
  }

  function updateScrollTopButtonVisibility() {
    showScrollTopButton.value = window.scrollY > threshold;
  }

  function stopScrollAnimation() {
    if (scrollAnimationFrameId) {
      window.cancelAnimationFrame(scrollAnimationFrameId);
      scrollAnimationFrameId = undefined;
    }
  }

  function animateWindowScroll(targetTop, { duration = 680 } = {}) {
    const nextTop = Math.max(targetTop, 0);

    if (prefersReducedMotion()) {
      window.scrollTo({
        top: nextTop,
        left: 0,
        behavior: 'auto',
      });
      return;
    }

    stopScrollAnimation();

    const startTop = window.scrollY;
    const distance = nextTop - startTop;

    if (Math.abs(distance) < 1) {
      window.scrollTo({
        top: nextTop,
        left: 0,
        behavior: 'auto',
      });
      return;
    }

    const startedAt = window.performance.now();

    function step(timestamp) {
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      const easedProgress = 1 - ((1 - progress) ** 4);

      window.scrollTo({
        top: startTop + (distance * easedProgress),
        left: 0,
        behavior: 'auto',
      });

      if (progress < 1) {
        scrollAnimationFrameId = window.requestAnimationFrame(step);
        return;
      }

      scrollAnimationFrameId = undefined;
    }

    scrollAnimationFrameId = window.requestAnimationFrame(step);
  }

  function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);

    if (!target) {
      return;
    }

    const nextTop = target.getBoundingClientRect().top + window.scrollY - resolveSectionScrollOffset();
    animateWindowScroll(nextTop);
  }

  function scrollToTop() {
    animateWindowScroll(0);
  }

  onMounted(() => {
    updateScrollTopButtonVisibility();
    window.addEventListener('scroll', updateScrollTopButtonVisibility, { passive: true });
  });

  onBeforeUnmount(() => {
    stopScrollAnimation();
    window.removeEventListener('scroll', updateScrollTopButtonVisibility);
  });

  return {
    showScrollTopButton,
    scrollToSection,
    scrollToTop,
  };
}
