import { categoryMeta } from './catalogShared';

export const heroSlides = [
  {
    id: 'hero-sofa',
    eyebrow: categoryMeta.sofa.heroEyebrow,
    title: categoryMeta.sofa.heroTitle,
    description: categoryMeta.sofa.heroDescription,
    image: categoryMeta.sofa.heroImage,
    categorySlug: 'sofa',
    imagePosition: 'center center',
  },
  {
    id: 'hero-bed',
    eyebrow: categoryMeta['bed-mattress'].heroEyebrow,
    title: categoryMeta['bed-mattress'].heroTitle,
    description: categoryMeta['bed-mattress'].heroDescription,
    image: categoryMeta['bed-mattress'].heroImage,
    categorySlug: 'bed-mattress',
    imagePosition: 'center center',
  },
  {
    id: 'hero-dining',
    eyebrow: categoryMeta.dining.heroEyebrow,
    title: categoryMeta.dining.heroTitle,
    description: categoryMeta.dining.heroDescription,
    image: categoryMeta.dining.heroImage,
    categorySlug: 'dining',
    imagePosition: 'center center',
  },
];
