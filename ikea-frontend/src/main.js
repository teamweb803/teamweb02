import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAccountStore } from './stores/account';
import './styles.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

const accountStore = useAccountStore(pinia);
accountStore.hydrate();

app.use(router);

router.isReady().then(() => {
  app.mount('#app');
});
