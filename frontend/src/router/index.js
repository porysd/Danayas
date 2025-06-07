import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore.js";

// Public Pages
import Home from "../pages/Home.vue";
import AboutUs from "../pages/aboutUs.vue";
import PackageSection from "../pages/PackageSection.vue";
import booking from "../pages/booking.vue";
import publicEntry from "../pages/publicEntry.vue";
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
import PublicEntry from "../Admin/pages/PublicEntry.vue";
import PublicRates from "../Admin/pages/PublicRate.vue";
import BlockedDate from "../Admin/pages/BlockedDates.vue";
import Payment from "../Admin/pages/Payment.vue";
import Refund from "../Admin/pages/RefundManagement.vue";
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
import Footer from "../Admin/pages/ContactUs.vue";
import TermsAndCondition from "../Admin/pages/TermsAndCondition.vue";
import Archived from "../Admin/pages/Archived.vue";
import Profile from "../Admin/pages/Profile.vue";
import AuditLogs from "../Admin/pages/AuditLogs.vue";

// Not Found
import NotFound from "../pages/NotFound.vue";
import AccessDenied from "../Admin/pages/AccessDenied.vue";

const routes = [
  // Public Pages
  { path: "/", component: Home },
  { path: "/home", component: Home },
  { path: "/packages", component: PackageSection },
  { path: "/booking", component: booking },
  { path: "/public-entry", component: publicEntry },
  { path: "/faqs", component: faqs },
  { path: "/gallery", component: gallery },
  { path: "/about-us", component: AboutUs },
  { path: "/contact-us", component: ContactUs },
  { path: "/logs", component: Logs },
  { path: "/profile-page", component: Profilepage },

  // Admin Pages
  { path: "/employee/employee-login", component: AdminLogin },
  {
    path: "/employee/employee-dashboard",
    component: AdminDashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/employee-management",
    component: EmployeeManagement,
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/private-booking",
    component: Booking,
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/public-booking",
    component: PublicEntry,
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/blocked-dates",
    component: BlockedDate,
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/payment",
    component: Payment,
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/refund",
    component: Refund,
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/transaction",
    component: Transaction,
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/reports",
    component: Reports,
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/packages-and-promos",
    component: PackagesAndPromos,
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/public-rates",
    component: PublicRates,
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/discount-and-add-ons",
    component: DiscountAndAddOns,
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/customer-management",
    component: CustomerManagement,
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/homepage",
    component: Homepage,
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/reviews",
    component: Reviews,
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/gallery",
    component: Gallery,
    meta: { requiresAuth: true },
  },
  { path: "/employee/faqs", component: FAQs, meta: { requiresAuth: true } },
  {
    path: "/employee/about-us",
    component: AdminAboutUs,
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/contact-us",
    component: Footer,
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/terms-and-condition",
    component: TermsAndCondition,
    meta: { requiresAuth: true },
  },
  // {
  //   path: "/admin/archived",
  //   component: Archived,
  //   meta: { requiresAuth: true },
  // },
  {
    path: "/employee/profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
  { path: "/employee/logs", component: AuditLogs },

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
