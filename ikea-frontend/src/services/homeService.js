import {
  categoryDealCollections,
  categoryDealFilters,
  curatedSpotlight,
  footerInfoLines,
  footerLinks,
  footerNotice,
  footerSupportCards,
  heroSlides,
  mainTabs,
  newItemCollections,
  newItemFilters,
  pickSection,
  topShortcutBoxes,
  weeklyDeals,
} from '../data/siteSeed';

export function getHomeContent() {
  return {
    mainTabs,
    heroSlides,
    topShortcutBoxes,
    weeklyDeals,
    curatedSpotlight,
    categoryDealFilters,
    categoryDealCollections,
    newItemFilters,
    newItemCollections,
    pickSection,
    footerLinks,
    footerSupportCards,
    footerInfoLines,
    footerNotice,
  };
}
