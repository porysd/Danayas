<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../stores/authStore";

const authStore = useAuthStore();
const role = computed(() => authStore.user?.role || "guest");
const isContentOpen = ref(false);
const isBookingOpen = ref(false);
const route = useRoute();

// List of routes under "Booking"
const bookingRoutes = [
  "/employee/private-booking",
  // "/admin/walk-in-booking",
  "/employee/public-booking",
  "/employee/blocked-dates",
];

const currentBookingRoute = computed(() => bookingRoutes.includes(route.path));

onMounted(() => {
  isBookingOpen.value = currentBookingRoute.value;
});

const toggleBookingMenu = () => {
  if (currentBookingRoute.value) {
    isBookingOpen.value = !isBookingOpen.value;
  } else {
    isBookingOpen.value = true;
  }
};

// List of routes under "Content Management"
const cmsRoute = [
  "/employee/homepage",
  "/employee/reviews",
  "/employee/gallery",
  "/employee/faqs",
  "/employee/about-us",
  "/employee/footer",
  "/employee/terms-and-condition",
];

const currentCMSRoute = computed(() => cmsRoute.includes(route.path));

onMounted(() => {
  isContentOpen.value = currentCMSRoute.value;
});

const toggleContentMenu = () => {
  if (currentCMSRoute.value) {
    isContentOpen.value = !isContentOpen.value;
  } else {
    isContentOpen.value = true;
  }
};
</script>

<template>
  <div
    class="drevsBar w-64 h-screen bg-[#194D1D] dark:bg-[#18181b] text-white flex flex-col overflow-auto"
  >
    <div class="flex items-center px-3 py-2.5">
      <img
        src="../assets/drevslogo.png"
        alt="DREVS Logo"
        class="drevsLogo w-17 h-17 mr-5"
      />
      <h1 class="text-h1 font-bold text-2xl text-[#FCFCFC] dark:text-[#FCFCFC]">
        DREVS
      </h1>
    </div>

    <nav
      class="flex flex-col space-y-2 w-full px-3 text-[#FCFCFC] dark:text-[#FCFCFC]"
    >
      <router-link
        to="/employee/employee-dashboard"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-chart-bar mr-2"></i>
        Dashboard</router-link
      >
      <button
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        @click="toggleBookingMenu"
      >
        <i class="pi pi-book mr-2"></i>
        Bookings
        <span
          :class="{ 'rotate-180': isBookingOpen }"
          class="dropdown-arrow pi pi-angle-down ml-26.5"
          style="font-size: 12px"
        ></span>
      </button>

      <div v-show="isBookingOpen" class="flex flex-col space-y-2 w-full pl-6">
        <router-link
          to="/employee/private-booking"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-calendar-plus mr-2"></i>
          Private Booking</router-link
        >
        <!--<router-link
          to="/admin/walk-in-booking"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-book mr-2"></i>
          Walk-In Booking</router-link
        >-->
        <router-link
          to="/employee/public-booking"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-calendar-plus mr-2"></i>
          Public Booking</router-link
        >
        <router-link
          to="/employee/blocked-dates"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-calendar-times mr-2"></i>
          Blocked Dates</router-link
        >
      </div>

      <router-link
        to="/employee/payment"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-credit-card mr-2"></i>
        Payment Management</router-link
      >
      <router-link
        to="/employee/refund"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-receipt mr-2"></i>
        Refund Management</router-link
      >
      <router-link
        v-if="role !== 'staff'"
        to="/employee/reports"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-file-excel mr-2"></i>
        Reports</router-link
      >
      <!-- <router-link
        to="/admin/transaction"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-receipt mr-2"></i>
        Transaction Records</router-link
      > -->

      <router-link
        v-if="role !== 'staff'"
        to="/employee/customer-management"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-users mr-2"></i>
        Customer Management</router-link
      >
      <router-link
        v-if="role !== 'staff'"
        to="/employee/employee-management"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-user mr-2"></i>
        Employee Management</router-link
      >
      <router-link
        v-if="role !== 'staff'"
        to="/employee/packages-and-promos"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-box mr-2"></i>
        Packages and Promos</router-link
      >
      <router-link
        v-if="role !== 'staff'"
        to="/employee/public-rates"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-box mr-2"></i>
        Public Rates</router-link
      >
      <router-link
        v-if="role !== 'staff'"
        to="/employee/discount-and-add-ons"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-percentage mr-2"></i>
        Discount and Add Ons</router-link
      >

      <button
        v-if="role !== 'staff'"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        @click="toggleContentMenu"
      >
        <i class="pi pi-wrench mr-2"></i>
        Content Management
        <span
          :class="{ 'rotate-180': isContentOpen }"
          class="dropdown-arrow pi pi-angle-down ml-8.5"
          style="font-size: 12px"
        ></span>
      </button>

      <div
        v-if="role !== 'staff'"
        v-show="isContentOpen"
        class="flex flex-col space-y-2 w-full pl-6"
      >
        <router-link
          to="/employee/homepage"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-home mr-2"></i>
          Homepage</router-link
        >
        <router-link
          to="/employee/reviews"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-check-circle mr-2"></i>
          Reviews</router-link
        >
        <router-link
          to="/employee/gallery"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-image mr-2"></i>
          Gallery</router-link
        >
        <router-link
          to="/employee/faqs"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-question-circle mr-2"></i>
          FAQs</router-link
        >
        <router-link
          to="/employee/about-us"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-users mr-2"></i>
          About Us</router-link
        >
        <!-- <router-link
          to="/employee/contact-us"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-file mr-2"></i>
          Contact Us</router-link
        > -->
        <router-link
          to="/employee/terms-and-condition"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-clipboard mr-2"></i>
          Terms and Conditions</router-link
        >
      </div>

      <router-link
        v-if="role !== 'staff'"
        to="/employee/logs"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-clipboard mr-2"></i>
        Logs</router-link
      >

      <!--<router-link
        to="/admin/archived"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-history"></i>
        Archived</router-link
      >-->
    </nav>
  </div>

  <router-view />
</template>

<style scoped>
.drevsBar::-webkit-scrollbar {
  display: none;
}

.drevsBar {
}

.drevsLogo {
  display: block;
  filter: drop-shadow(0 0 3px #000000);
}

.sidebar-btn {
  font-size: 12px;
}

.sidebar-btn:hover {
  background-color: #2b6d30;
  font-size: 13px;
}

.avatarIcon:hover {
  background-color: #2b6d30;
}

.active-route {
  background-color: #2b6d30;
  font-size: 13px;
}
</style>
