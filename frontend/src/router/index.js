import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import AboutUs from "../pages/AboutUs.vue";
import PackageSection from "../pages/PackageSection.vue";
import booking from "../pages/Booking.vue";
import gallery from "../pages/Gallery.vue";
import faqs from "../pages/FAQs.vue";
import ContactUs from "../pages/ContactUs.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/AboutUs", component: AboutUs },
  { path: "/contactUs", component: ContactUs },
  { path: "/packages", component: PackageSection },
  { path: "/booking", component: booking },
  { path: "/gallery", component: gallery },
  { path: "/faqs", component: faqs },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
