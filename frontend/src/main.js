import { createApp } from "vue";
import { createPinia } from 'pinia'
import "./styles/style.css";
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import Tooltip from "primevue/tooltip";
import ToastService from "primevue/toastservice";
import AnimateOnScroll from "primevue/animateonscroll";

const pinia = createPinia()

createApp(App)
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: false || ".my-app-dark",
      },
    },
  })
  .use(pinia)
  .use(ToastService)
  .directive("animateonscroll", AnimateOnScroll)
  .directive("tooltip", Tooltip)
  .mount("#app");
