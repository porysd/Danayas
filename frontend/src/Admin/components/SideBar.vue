<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import Avatar from "primevue/avatar";
import Divider from "primevue/divider";

const isContentOpen = ref(false);

const toggleContentMenu = () => {
  isContentOpen.value = true;
};

// 194D1D
</script>

<template>
  <div
    class="drevsBar w-64 h-screen bg-[#194D1D] dark:bg-[#18181b] text-white flex flex-col overflow-auto"
  >
    <div class="flex items-center px-3 py-2.5">
      <img
        src="../assets/drevslogo.png"
        alt="DREVS Logo"
        class="drevsLogo w-20 h-20 mr-3"
      />
      <h1 class="text-h1 font-bold text-3xl text-[#FCFCFC] dark:text-[#FCFCFC]">
        DREVS
      </h1>
    </div>

    <nav
      class="flex flex-col space-y-2 w-full px-3 text-[#FCFCFC] dark:text-[#FCFCFC]"
    >
      <router-link
        to="/AdminDashboard"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-chart-bar"></i>
        Dashboard</router-link
      >
      <router-link
        to="/EmployeeManagement"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-user"></i>
        Employee Management</router-link
      >
      <router-link
        to="/Booking"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-book"></i>
        Booking</router-link
      >
      <router-link
        to="/Transaction"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-credit-card"></i>
        Transaction</router-link
      >
      <router-link
        to="/Reports"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-file-excel"></i>
        Reports</router-link
      >
      <router-link
        to="/PackagesAndPromos"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-box"></i>
        Packages and Promos</router-link
      >
      <router-link
        to="/DiscountAndAddOns"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-percentage"></i>
        Discount and Add Ons</router-link
      >
      <router-link
        to="/CustomerManagement"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-users"></i>
        Customer Management</router-link
      >

      <button
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        @click="toggleContentMenu"
      >
        <i class="pi pi-wrench"></i>
        Content Management
        <span
          :class="{ 'rotate-180': isContentOpen }"
          class="dropdown-arrow pi pi-angle-down ml-10"
          style="font-size: 12px"
        ></span>
      </button>

      <div v-show="isContentOpen" class="flex flex-col space-y-2 w-full pl-6">
        <router-link
          to="/Homepage"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-home"></i>
          Homepage</router-link
        >
        <router-link
          to="/Reviews"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-check-circle"></i>
          Reviews</router-link
        >
        <router-link
          to="/Gallery"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-image"></i>
          Gallery</router-link
        >
        <router-link
          to="/FAQs"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-question-circle"></i>
          FAQs</router-link
        >
        <router-link
          to="/AboutUs"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-users"></i>
          About Us</router-link
        >
        <router-link
          to="/Footer"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-file"></i>
          Footer</router-link
        >
        <router-link
          to="/TermsAndCondition"
          class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
          active-class="active-route"
        >
          <i class="pi pi-clipboard"></i>
          Terms and Conditions</router-link
        >
      </div>

      <router-link
        to="/Archived"
        class="sidebar-btn rounded-xl p-2.5 text-left font-bold"
        active-class="active-route"
      >
        <i class="pi pi-history"></i>
        Archived</router-link
      >
    </nav>
  </div>

  <router-view />
</template>

<style scoped>
.drevsBar::-webkit-scrollbar {
  display: none;
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
