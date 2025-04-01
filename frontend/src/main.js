import { createApp } from 'vue'
import './styles/style.css'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import Tooltip from 'primevue/tooltip';

createApp(App)
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: false || '.my-app-dark' ,
      }
    }
  })
  .directive('tooltip', Tooltip)
  .mount('#app')
