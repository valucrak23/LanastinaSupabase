// imports principales
import { createApp } from 'vue';
import './style.css';
import router from './router/router';
import App from './App.vue';

// crea app y monta en DOM
const app = createApp(App);
app.use(router);
app.mount('#app');
