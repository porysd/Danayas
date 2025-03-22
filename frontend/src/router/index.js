import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import AboutUs from '../pages/aboutUs.vue';
import PackageSection from '../pages/PackageSection.vue';
import booking from '../pages/booking.vue';
import Login from '../pages/Login.vue';
import gallery from '../pages/gallery.vue';
import faqs from '../pages/faqs.vue';
import ContactUs from '../pages/contactUs.vue';


const routes= [
  { path: '/', component: Home },
  { path: '/AboutUs', component: AboutUs },
  {path: '/contactUs', component: ContactUs},
  {path: '/packages', component: PackageSection},
  {path: '/booking', component:  booking},
  {path: '/Login', component: Login},
  {path: '/gallery', component: gallery},
  {path: '/faqs', component: faqs},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
