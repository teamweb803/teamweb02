<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <article class="product-tile" :class="{ compact }">
    <div class="product-media" :data-color="product.color">
      <img v-if="product.image" class="product-photo" :src="product.image" :alt="product.imageAlt || product.name" />
      <span class="product-badge">{{ product.badge }}</span>
      <div v-if="!product.image" class="product-silhouette"></div>
    </div>
    <div class="product-copy">
      <p class="eyebrow">{{ product.category }}</p>
      <h3>{{ product.name }}</h3>
      <p class="summary">{{ product.summary }}</p>
      <div class="price-row">
        <strong>{{ product.price }}</strong>
        <span class="meta">{{ compact ? '빠른보기' : '상세보기' }}</span>
      </div>
    </div>
  </article>
</template>
