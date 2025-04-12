import { createRouter, createWebHistory } from "vue-router";
//Public Pages
import Home from "../pages/Home.vue";
import AboutUs from "../pages/aboutUs.vue";
import PackageSection from "../pages/PackageSection.vue";
import booking from "../pages/booking.vue";
import gallery from "../pages/gallery.vue";
import faqs from "../pages/faqs.vue";
import ContactUs from "../pages/contactUs.vue";
import Logs from "../pages/Logs.vue";

//Admin Pages
import AdminDashboard from "../Admin/pages/AdminDashboard.vue";
import AdminLogin from "../Admin/pages/AdminLogin.vue";
import EmployeeManagement from "../Admin/pages/EmployeeManagement.vue";
import Booking from "../Admin/pages/Booking.vue";
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
import NotFound from '../pages/NotFound.vue'

const routes = [
  //Public Pages
  { path: "/", component: Home },
  { path: "/home", component: Home },
  { path: "/packages", component: PackageSection },
  { path: "/booking", component: booking },
  { path: "/faqs", component: faqs },
  { path: "/gallery", component: gallery },
  { path: "/about-us", component: AboutUs },
  { path: "/contact-us", component: ContactUs },
  { path: "/logs", component: Logs },

  //Admin Pages
  { path: "/admin/admin-login", component: AdminLogin },
  { path: "/admin/admin-dashboard", component: AdminDashboard },
  { path: "/admin/employee-management", component: EmployeeManagement },
  { path: "/admin/booking", component: Booking },
  { path: "/admin/transaction", component: Transaction },
  { path: "/admin/reports", component: Reports },
  { path: "/admin/packages-amd-promos", component: PackagesAndPromos },
  { path: "/admin/discount-and-add-ons", component: DiscountAndAddOns },
  { path: "/admin/customer-management", component: CustomerManagement },
  { path: "/admin/homepage", component: Homepage },
  { path: "/admin/reviews", component: Reviews },
  { path: "/admin/gallery", component: Gallery },
  { path: "/admin/faqs", component: FAQs },
  { path: "/admin/about-us", component: AdminAboutUs },
  { path: "/admin/footer", component: Footer },
  { path: "/admin/terms-and-condition", component: TermsAndCondition },
  { path: "/admin/archived", component: Archived },
  { path: "/admin/profile", component: Profile },

    { path: '/:pathMatch(.*)*', component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
