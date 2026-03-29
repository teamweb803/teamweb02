import { onBeforeUnmount, onMounted, shallowRef } from 'vue';

const DEFAULT_HEADER_HEIGHT = 74;
const DEFAULT_STICKY_OFFSET = '96px';
const STICKY_PANEL_GAP_PX = 22;

export function useStickyHeaderOffset(getHeaderElement) {
  const stickyOffset = shallowRef(DEFAULT_STICKY_OFFSET);

  let headerResizeObserver = null;

  function syncStickyOffset() {
    const headerHeight = getHeaderElement()?.offsetHeight ?? DEFAULT_HEADER_HEIGHT;
    stickyOffset.value = `${headerHeight + STICKY_PANEL_GAP_PX}px`;
  }

  onMounted(() => {
    syncStickyOffset();

    if (typeof ResizeObserver !== 'undefined' && getHeaderElement()) {
      headerResizeObserver = new ResizeObserver(() => {
        syncStickyOffset();
      });
      headerResizeObserver.observe(getHeaderElement());
    }

    window.addEventListener('resize', syncStickyOffset);
  });

  onBeforeUnmount(() => {
    headerResizeObserver?.disconnect();
    window.removeEventListener('resize', syncStickyOffset);
  });

  return {
    stickyOffset,
  };
}
