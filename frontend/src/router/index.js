import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import About from '../pages/About.vue';

//Admin
import AdminDashboard from '../Admin/pages/AdminDashboard.vue';
import AdminLogin from '../Admin/pages/AdminLogin.vue'
import EmployeeManagement from '../Admin/pages/EmployeeManagement.vue';
import Booking from '../Admin/pages/Booking.vue';
import Transaction from '../Admin/pages/Transaction.vue';
import Reports from '../Admin/pages/Reports.vue';
import PackagesAndPromos from '../Admin/pages/PackagesAndPromos.vue';
import DiscountAndAddOns from '../Admin/pages/DiscountAndAddOns.vue';
import CustomerManagement from '../Admin/pages/CustomerManagement.vue';
import Homepage from '../Admin/pages/Homepage.vue';
import Reviews from '../Admin/pages/Reviews.vue';
import Gallery from '../Admin/pages/Gallery.vue';
import FAQs from '../Admin/pages/FAQs.vue';
import AboutUs from '../Admin/pages/AboutUs.vue';
import Footer from '../Admin/pages/Footer.vue';
import TermsAndCondition from '../Admin/pages/TermsAndCondition.vue';
import Archived from '../Admin/pages/Archived.vue';

const routes = [
  { path: '/', component: AdminLogin},
  { path : '/AdminDashboard', component: AdminDashboard },
  { path : '/EmployeeManagement', component: EmployeeManagement },
  { path : '/Booking', component: Booking },
  { path : '/Transaction', component: Transaction },
  { path : '/Reports', component: Reports },
  { path : '/PackagesAndPromos', component: PackagesAndPromos },
  { path : '/DiscountAndAddOns', component: DiscountAndAddOns },
  { path : '/CustomerManagement', component: CustomerManagement },
  { path : '/Homepage', component: Homepage },
  { path : '/Reviews', component: Reviews },
  { path : '/Gallery', component: Gallery },
  { path : '/FAQs', component: FAQs },
  { path : '/AboutUs', component: AboutUs },
  { path : '/Footer', component: Footer },
  { path : '/TermsAndCondition', component: TermsAndCondition },
  { path : '/Archived', component: Archived },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

console.log('Registered Routes:', router.getRoutes());

export default router;
