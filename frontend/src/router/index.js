import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore.js";

// Public Pages
import Home from "../pages/Home.vue";
import AboutUs from "../pages/aboutUs.vue";
import PackageSection from "../pages/PackageSection.vue";
import booking from "../pages/booking.vue";
import gallery from "../pages/gallery.vue";
import faqs from "../pages/faqs.vue";
import ContactUs from "../pages/contactUs.vue";
import Logs from "../pages/Logs.vue";
import Profilepage from "../pages/Profilepage.vue";

// Admin Pages
import AdminDashboard from "../Admin/pages/AdminDashboard.vue";
import AdminLogin from "../Admin/pages/AdminLogin.vue";
import EmployeeManagement from "../Admin/pages/EmployeeManagement.vue";
import Booking from "../Admin/pages/Booking.vue";
import Payment from "../Admin/pages/Payment.vue";
import Transaction from "../Admin/pages/Transaction.vue";
import Reports from "../Admin/pages/Reports.vue";
import PackagesAndPromos from "../Admin/pages/PackagesAndPromos.vue";
import DiscountAndAddOns from "../Admin/pages/DiscountAndAddOns.vue";
import CustomerManagement from "../Admin/pages/CustomerManagement.vue";
import Homepage from "../Admin/pages/Homepage.vue";
import Reviews from "../Admin/pages/Reviews.vue";
import Gallery from "../Admin/pages/Gallery.vue";
import FAQs from "../Admin/pages/FAQs.vue";
import AdminAboutUs from "../Admin/pages/AboutUs.vue";
import Footer from "../Admin/pages/Footer.vue";
import TermsAndCondition from "../Admin/pages/TermsAndCondition.vue";
import Archived from "../Admin/pages/Archived.vue";
import Profile from "../Admin/pages/Profile.vue";

// Not Found
import NotFound from "../pages/NotFound.vue";
import AccessDenied from "../Admin/pages/AccessDenied.vue";

const routes = [
  // Public Pages
  { path: "/", component: Home },
  { path: "/home", component: Home },
  { path: "/packages", component: PackageSection },
  { path: "/booking", component: booking },
  { path: "/faqs", component: faqs },
  { path: "/gallery", component: gallery },
  { path: "/about-us", component: AboutUs },
  { path: "/contact-us", component: ContactUs },
  { path: "/logs", component: Logs },
  { path: "/profile-page", component: Profilepage },

  // Admin Pages
  { path: "/admin/admin-login", component: AdminLogin },
  {
    path: "/admin/admin-dashboard",
    component: AdminDashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/employee-management",
    component: EmployeeManagement,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/booking",
    component: Booking,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/payment",
    component: Payment,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/transaction",
    component: Transaction,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/reports",
    component: Reports,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/packages-and-promos",
    component: PackagesAndPromos,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/discount-and-add-ons",
    component: DiscountAndAddOns,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/customer-management",
    component: CustomerManagement,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/homepage",
    component: Homepage,
    meta: { requiresAuth: true },
  },
  { path: "/admin/reviews", component: Reviews, meta: { requiresAuth: true } },
  { path: "/admin/gallery", component: Gallery, meta: { requiresAuth: true } },
  { path: "/admin/faqs", component: FAQs, meta: { requiresAuth: true } },
  {
    path: "/admin/about-us",
    component: AdminAboutUs,
    meta: { requiresAuth: true },
  },
  { path: "/admin/footer", component: Footer, meta: { requiresAuth: true } },
  {
    path: "/admin/terms-and-condition",
    component: TermsAndCondition,
    meta: { requiresAuth: true },
  },
  // {
  //   path: "/admin/archived",
  //   component: Archived,
  //   meta: { requiresAuth: true },
  // },
  { path: "/admin/profile", component: Profile, meta: { requiresAuth: true } },

  // Not Found Page
  { path: "/:pathMatch(.*)*", component: NotFound },
  { path: "/access-denied", component: AccessDenied },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next("/access-denied");
  } else {
    next();
  }
});

export default router;
