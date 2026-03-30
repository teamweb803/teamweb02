import {
  onBeforeUnmount,
  onMounted,
  shallowRef,
} from 'vue';

const HERO_SCROLL_CURVE = {
  x1: 0.22,
  y1: 1,
  x2: 0.36,
  y2: 1,
};

function clampProgress(value) {
  return Math.min(Math.max(value, 0), 1);
}

function getBezierPoint(t, firstControlPoint, secondControlPoint) {
  const inverse = 1 - t;
  return (3 * inverse * inverse * t * firstControlPoint)
    + (3 * inverse * t * t * secondControlPoint)
    + (t * t * t);
}

function getBezierSlope(t, firstControlPoint, secondControlPoint) {
  const inverse = 1 - t;
  return (3 * inverse * inverse * firstControlPoint)
    + (6 * inverse * t * (secondControlPoint - firstControlPoint))
    + (3 * t * t * (1 - secondControlPoint));
}

function resolveBezierTime(progress, x1, x2) {
  let estimate = progress;

  for (let iteration = 0; iteration < 5; iteration += 1) {
    const currentX = getBezierPoint(estimate, x1, x2) - progress;
    const currentSlope = getBezierSlope(estimate, x1, x2);

    if (Math.abs(currentSlope) < 0.0001) {
      break;
    }

    estimate -= currentX / currentSlope;
    estimate = clampProgress(estimate);
  }

  return estimate;
}

function easeHeroScroll(progress) {
  const clampedProgress = clampProgress(progress);
  const bezierTime = resolveBezierTime(
    clampedProgress,
    HERO_SCROLL_CURVE.x1,
    HERO_SCROLL_CURVE.x2,
  );

  return getBezierPoint(
    bezierTime,
    HERO_SCROLL_CURVE.y1,
    HERO_SCROLL_CURVE.y2,
  );
}

function resolveScrollDuration(distance) {
  return Math.min(1120, Math.max(640, 560 + (Math.abs(distance) * 0.12)));
}

export function useHomeScrollBehavior({ threshold = 520, trackVisibility = true } = {}) {
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

  function animateWindowScroll(targetTop, { duration } = {}) {
    const nextTop = Math.max(targetTop, 0);

    stopScrollAnimation();

    const startTop = window.scrollY;
    const distance = nextTop - startTop;
    const animationDuration = duration ?? resolveScrollDuration(distance);

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
      const progress = Math.min((timestamp - startedAt) / animationDuration, 1);
      const easedProgress = easeHeroScroll(progress);

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
    animateWindowScroll(nextTop, {
      duration: resolveScrollDuration(nextTop - window.scrollY),
    });
  }

  function scrollToTop() {
    animateWindowScroll(0, {
      duration: resolveScrollDuration(window.scrollY),
    });
  }

  onMounted(() => {
    if (!trackVisibility) {
      return;
    }

    updateScrollTopButtonVisibility();
    window.addEventListener('scroll', updateScrollTopButtonVisibility, { passive: true });
  });

  onBeforeUnmount(() => {
    stopScrollAnimation();

    if (trackVisibility) {
      window.removeEventListener('scroll', updateScrollTopButtonVisibility);
    }
  });

  return {
    showScrollTopButton,
    scrollToSection,
    scrollToTop,
  };
}
