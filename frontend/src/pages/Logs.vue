<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";
import DatePicker from "primevue/datepicker";
import { useBookingStore } from "../stores/bookingStore";
import { useUserStore } from "../stores/userStore";
import { formatDates } from "../utility/dateFormat";
import { usePackageStore } from "../stores/packageStore";
import { useAuthStore } from "../stores/authStore";
import Tag from "primevue/tag";
import Logger from "../components/Logger.vue";

const isMenuOpen1 = ref(false);
const isMenuOpen2 = ref(false);
const RescheduleModal = ref(false);
const calendar = ref(null);
const date = ref(null);

const bookingStore = useBookingStore();
const userStore = useUserStore();
const packageStore = usePackageStore();
const authStore = useAuthStore();

const userBookings = ref([]);
const bookingDone = ref([]);

const openMenuBookingId = ref(null);
const rescheduleBookingId = ref(null);

onMounted(async () => {
  await packageStore.fetchAllPackages();
  await packageStore.fetchAllPromos();
  await bookingStore.fetchUserBookings();

  try {
    const userId = authStore.user?.userId;
    if (!userId) {
      console.error("User ID not found in authStore");
      return;
    }

    const fetchedUser = await userStore.getUserById(userId);
    console.log("Fetched user:", fetchedUser);

    if (fetchedUser?.userId) {
      const id = fetchedUser.userId;
      // Filter bookings for the user based on status
      userBookings.value = bookingStore.bookings.filter(
        (booking) =>
          booking.userId === id &&
          ["pending", "reserved", "rescheduled"].includes(booking.bookStatus)
      );

      bookingDone.value = bookingStore.bookings.filter(
        (booking) =>
          booking.userId === id &&
          ["cancelled", "completed"].includes(booking.bookStatus)
      );

      console.log("User bookings:", userBookings.value);
      console.log("Booking done:", bookingDone.value);
    } else {
      console.error("User ID not found in fetched data.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

const rescheduleHandler = async (updatedDate) => {
  await bookingStore.updateBookingDates(updatedDate);
};

const cancelHandler = async (cancelStatus) => {
  await bookingStore.updateBookingStatus(cancelStatus);
};

const getPackageName = (packageId) => {
  const pkg =
    packageStore.packages.find((p) => p.packageId === packageId) ||
    packageStore.promos.find((p) => p.packageId === packageId);
  return pkg ? pkg.name : "Unknown Package";
};

const getStatusSeverity = (status) => {
  switch (status) {
    case "pending":
      return "warn";
    case "reserved":
      return "info";
    case "rescheduled":
      return "secondary";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "secondary";
  }
};
</script>

<template>
  <NavBar />
  <div class="ContainerAbout">
    <img
      src="../assets/danayas_day.jpg"
      alt="package_image"
      id="about"
      class="aboutUs"
    />
    <h1 class="AboutText" style="text-align: center">Logs</h1>
  </div>

  <div class="Logs-Container">
    <hr class="Header" data-content=" On Going" />
  </div>

  <div class="w-[70%] m-auto justify-center">
    <div v-if="userBookings.length > 0"></div>
    <div v-else>
      <p class="flex justify-center m-auto">No bookings found for this user.</p>
    </div>

    <div
      class="logsBox"
      v-for="booking in userBookings"
      :key="booking.bookingId"
    >
      <div class="w-full mt-10 text-right">
        <Logger
          :booking="booking"
          @rescheduleBooking="rescheduleHandler"
          @cancelBooking="cancelHandler"
        />
      </div>

      <div class="information">
        <p>Package Name: {{ getPackageName(booking.packageId) }}</p>

        <p>
          Date: {{ formatDates(booking.checkInDate) }} to
          {{ formatDates(booking.checkOutDate) }}
        </p>
        <p>
          Personal Information: {{ booking.firstName }}
          {{ booking.lastName }}
        </p>
      </div>
      <div class="flex justify-end mb-10" style="position: relative">
        <Tag
          class="mb"
          :severity="getStatusSeverity(booking.bookStatus)"
          :value="booking.bookStatus"
        />
      </div>
    </div>
  </div>

  <div class="Logs-Container">
    <hr class="Header" data-content="History" />
  </div>

  <div class="w-[70%] m-auto justify-center">
    <div v-if="bookingDone.length > 0"></div>
    <div v-else>
      <p class="flex justify-center m-auto">
        No completed or cancelled bookings found.
      </p>
    </div>

    <div
      class="logsBox"
      v-for="booking in bookingDone"
      :key="booking.bookingId"
    >
      <div class="w-full relative inline-block">
        <div class="flex justify-end mr-3">
          <button
            @click.stop="isMenuOpen2 = !isMenuOpen2"
            class="pi pi-ellipsis-v"
            style="font-size: 1.5rem"
          ></button>

          <div
            v-if="isMenuOpen2"
            class="absolute right-2 mt-4 w-35 shadow-md z-50 bg-[#fcf5f5] p-4 rounded"
          >
            <button class="hover:bg-[#FF8080]">Delete</button>
          </div>
        </div>
      </div>

      <div class="information">
        <p>Package Name: {{ getPackageName(booking.packageId) }}</p>
        <p>
          Date: {{ formatDates(booking.checkInDate) }} to
          {{ formatDates(booking.checkOutDate) }}
        </p>
        <p>
          Personal Information: {{ booking.firstName }} {{ booking.lastName }}
        </p>
      </div>

      <div class="flex justify-end mb-10" style="position: relative">
        <Tag
          class="mb"
          :severity="getStatusSeverity(booking.bookStatus)"
          :value="booking.bookStatus"
        />
      </div>
    </div>
  </div>
  <Footer />
</template>

<style scoped>
calendar-range {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
textarea {
  background-color: #f7f0f0;
  border: 1px solid green;
  padding: 2px;
  height: 10vh;
  width: 100%;
  break-inside: auto;
  object-fit: cover;
  display: flex;
}
.Logs-Container {
  margin-top: 5rem;
  margin-bottom: 2rem;
}
.btn1,
.btn2 {
  background-color: #41ab5d;
  padding: 10px;
  width: 6rem;
  border-radius: 10px;
}
.btn1:hover {
  background: #ff8080;
}
.btn2:hover {
  background: lightgreen;
}

.DelBox {
  border: 1px solid #38dc87;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(28, 216, 34, 0.5);
  align-items: center;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  font-weight: 600;
  font-size: large;
}

.Button {
  display: flex;
  gap: 50px;
  align-items: center;
  justify-content: center;
  margin: auto;
  margin-top: 20px;
}
.modal {
  z-index: 999;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  background: rgba(193, 175, 175, 0.5);
  align-items: center;
  justify-content: center;
}
img {
  width: 30px;
  height: 30px;
  position: static;
}
.information {
  font-weight: 600;

  width: 100%;
  line-height: 1.9rem;
}

.logsBox {
  display: flex;
  flex-direction: column;
  height: 10rem;
  justify-content: center;
  margin: auto;
  padding: 2rem;
  border-radius: 10px;
  width: auto;
  background: transparent;
  border: 1px solid #41ab5d;
  margin-bottom: 2rem;
}

.Header {
  line-height: 1rem;
  position: relative;
  outline: 0;
  border: 0;
  font-weight: bolder;
  font-size: 1.3rem;
  margin-top: 20px;
  margin-bottom: 2rem;
  color: rgb(2, 2, 2);
  text-align: center;
  height: 1.5rem;
}

.Header::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(
    -50%,
    -50%
  ); /* Center the line horizontally and vertically */
  background: #000000;
  width: 50%; /* or a percentage like 80% if you want shorter lines */
  height: 1.2px;
  z-index: -1; /* Optional: keeps the line behind the text */
}

.Header::after {
  content: attr(data-content);
  position: relative;
  color: rgb(0, 0, 0);
  padding: 0 0.5em;
  background-color: #ffffff;
}

.ContainerAbout {
  position: relative;
  width: 85rem;
  justify-content: center;
  align-items: center;
  height: 400px;
  margin: auto;
  border-radius: 25px;
  overflow: hidden;
}

.aboutUs {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.AboutText {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 80px;
  font-weight: bold;
  color: white;
  text-shadow: 0px 4px 4px rgb(12, 70, 39);
  text-align: center;
}
</style>
