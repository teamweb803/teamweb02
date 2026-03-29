import { computed, ref, watch } from 'vue';

const DEFAULT_ORIGIN = {
  x: 50,
  y: 50,
};

export function useProductGallery(imagesSource) {
  const selectedIndex = ref(0);
  const isZoomed = ref(false);
  const zoomOrigin = ref({ ...DEFAULT_ORIGIN });

  const galleryImages = computed(() => {
    const source = typeof imagesSource === 'function'
      ? imagesSource()
      : imagesSource?.value ?? imagesSource;

    return Array.from(new Set((source ?? []).filter(Boolean)));
  });

  const selectedImage = computed(() => (
    galleryImages.value[selectedIndex.value] ?? galleryImages.value[0] ?? ''
  ));

  const imageStyle = computed(() => ({
    transform: `scale(${isZoomed.value ? 1.55 : 1})`,
    transformOrigin: `${zoomOrigin.value.x}% ${zoomOrigin.value.y}%`,
  }));

  const zoomLabel = computed(() => (
    isZoomed.value ? '원래 크기로 보기' : '확대해서 보기'
  ));

  const zoomSymbol = computed(() => (
    isZoomed.value ? '−' : '+'
  ));

  watch(
    galleryImages,
    () => {
      selectedIndex.value = 0;
      isZoomed.value = false;
      zoomOrigin.value = { ...DEFAULT_ORIGIN };
    },
    { immediate: true },
  );

  function setZoomOriginFromEvent(event) {
    if (!event?.currentTarget) {
      zoomOrigin.value = { ...DEFAULT_ORIGIN };
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    zoomOrigin.value = {
      x: Math.min(90, Math.max(10, x)),
      y: Math.min(90, Math.max(10, y)),
    };
  }

  function selectImage(index) {
    selectedIndex.value = index;
    isZoomed.value = false;
    zoomOrigin.value = { ...DEFAULT_ORIGIN };
  }

  function toggleZoom(event) {
    if (!selectedImage.value) {
      return;
    }

    if (!isZoomed.value) {
      setZoomOriginFromEvent(event);
      isZoomed.value = true;
      return;
    }

    isZoomed.value = false;
    zoomOrigin.value = { ...DEFAULT_ORIGIN };
  }

  function updateZoomOrigin(event) {
    if (!isZoomed.value) {
      return;
    }

    setZoomOriginFromEvent(event);
  }

  return {
    galleryImages,
    imageStyle,
    isZoomed,
    selectedImage,
    selectedIndex,
    selectImage,
    toggleZoom,
    updateZoomOrigin,
    zoomLabel,
    zoomSymbol,
  };
}
