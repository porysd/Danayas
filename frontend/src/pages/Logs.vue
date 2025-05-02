<script setup>
import { ref, onMounted } from "vue";
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";
import DatePicker from "primevue/datepicker";
import { useBookingStore } from "../stores/bookingStore";
import { useUserStore } from "../stores/userStore";
import { formatDates } from "../utility/dateFormat";
import { usePackageStore } from "../stores/packageStore";
import Tag from "primevue/tag";

const isMenuOpen1 = ref(false);
const isMenuOpen2 = ref(false);
const Reschedule = ref(false);
const bookingStore = useBookingStore();
const userStore = useUserStore();
const packageStore = usePackageStore();

const userBookings = ref([]);
const bookingDone = ref([]);

onMounted(async () => {
  await packageStore.fetchAllPackages();
  await packageStore.fetchAllPromos();
  try {
    // Fetch bookings and user data
    await bookingStore.fetchUserBookings();
    await userStore.fetchCustomer();

    const userNo = 4;
    const user = await userStore.getUserById(userNo);
    const userId = user?.userId;

    if (userId) {
      userBookings.value = bookingStore.bookings.filter(
        (booking) =>
          (booking.userId === userId && booking.bookStatus === "pending") ||
          (booking.userId === userId && booking.bookStatus === "reserved") ||
          (booking.userId === userId && booking.bookStatus === "rescheduled")
      );
    } else {
      console.error("No userId found in userStore.");
    }

    if (userId) {
      bookingDone.value = bookingStore.bookings.filter(
        (booking) =>
          (booking.userId === userId && booking.bookStatus === "cancelled") ||
          (booking.userId === userId && booking.bookStatus === "completed")
      );
    } else {
      console.error("No userId found in userStore.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

// Get Package Name using packageId
const getPackageName = (packageId) => {
  const pkg =
    packageStore.packages.find((p) => p.packageId === packageId) ||
    packageStore.promos.find((p) => p.packageId === packageId);
  return pkg ? pkg.name : "Unknown Package";
};

const showRescheduleModal = () => {
  RescheduleModal.value = true;
};

const closemodal = () => {
  RescheduleModal.value = false;
};
const calendar = ref(null);
const RescheduleModal = ref(false);
function checkCalendar() {
  if (calendar.value) {
    RescheduleModal.value = false;
  } else {
    RescheduleModal.value = true;
    alert("Please select your preferred date.");
  }
}

const getStatusSeverity = (status) => {
  switch (status) {
    case "pending":
      return "pending";
    case "reserved":
      return "reserved";
    case "rescheduled":
      return "rescheduled";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "secondary";
  }
};
</script>
~
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
    <div class="logsBox">
      <div class="w-full relative inline-block">
        <div class="flex justify-end mr-3">
          <button
            @click.stop="isMenuOpen1 = !isMenuOpen1"
            class="pi pi-ellipsis-v"
            style="font-size: 1.5rem"
          ></button>

          <div
            v-if="isMenuOpen1"
            class="absolute right-2 mt-4 w-35 shadow-md z-50 bg-[#fcfcfc] p-4 rounded"
          >
            <ul>
              <li class="hover:bg-[#C1F2B0]">
                <button @click="showRescheduleModal">Reschedule</button>
              </li>
            </ul>
          </div>
          <div v-if="RescheduleModal" class="modal">
            2
            <div
              class="DelBox p-10 bg-[#eef9eb]"
              style="
                border: 1px solid #38dc87;
                border-radius: 10px;
                box-shadow: 0px 0px 10px rgba(28, 216, 34, 0.5);
                align-items: center;
                flex-direction: column;
                justify-content: center;
                text-align: center;
                font-weight: 600;
                font-size: large;
              "
            >
              <i
                class="pi pi-times"
                style="
                  font-size: 1.5rem;
                  color: green;
                  align-self: flex-end;
                  margin-left: 30rem;
                  font-size: 1.5rem;
                  cursor: pointer;
                  margin-right: 10px;
                "
                @click="closemodal"
              ></i>

              <h2 class="mb-[30px]">SELECT PREPARE DATE</h2>
              <DatePicker
                v-model="date"
                inline
                showWeek
                class="w-full sm:w-[30rem]"
              />

              <div class="text-left relative mt-[20px]">
                <p>Check-in:</p>
                <p>Check-out:</p>
                <p></p>
                <p
                  class="text-green-500 top-[-1rem] relative flex m-auto justify-center content-center text-center"
                  style="margin-top: 20px; position: relative; display: flex"
                >
                  "Your selected date is currently available!"
                </p>
              </div>
              <button
                class="mt-[10px] bg-[#41ab5d] p-2 rounded-xl m-auto w-[6rem] text-center text-white"
                @click="checkCalendar"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="userBookings.length > 0">
        <div v-for="booking in userBookings" :key="booking.bookingId">
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
          <div class="flex justify-end mr-3">
            <Tag
              :severity="getStatusSeverity(booking.bookStatus)"
              :value="booking.bookStatus"
            />
          </div>
        </div>
      </div>
      <div v-else>
        <p>No bookings found for this user.</p>
      </div>
    </div>
  </div>

  <div class="Logs-Container">
    <hr class="Header" data-content="History" />
    <div class="logsBox">
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

      <div v-if="bookingDone.length > 0">
        <div v-for="booking in bookingDone" :key="booking.bookingId">
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
        </div>
        <div class="flex justify-end mr-3">
          <Tag
            :severity="getStatusSeverity(booking.bookStatus)"
            :value="booking.bookStatus"
          />
        </div>
      </div>
      <div v-else>
        <p>No bookings found for this user.</p>
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
  color: green;
  display: inline-block;
  position: relative;
  width: 100%;
  line-height: 1.9rem;
}

.logsBox {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 10rem;
  justify-content: center;
  margin: auto;
  padding: 1rem;
  border-radius: 10px;
  width: 70%;
  background: transparent;
  border: 1px solid #41ab5d;
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
