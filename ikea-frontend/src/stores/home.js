import { defineStore } from 'pinia';
import { getHomeContent } from '../services/homeService';

export const useHomeStore = defineStore('home', {
  state: () => getHomeContent(),
});
