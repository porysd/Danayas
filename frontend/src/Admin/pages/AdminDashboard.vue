<script setup>
import { ref, onMounted, computed } from "vue";
import Chart from "primevue/chart";
import DatePicker from "primevue/datepicker";
import SideBar from "../components/SideBar.vue";
import DarkModeButton from "../components/DarkModeButton.vue";
import Notification from "../components/Notification.vue";
import ProfileAvatar from "../components/ProfileAvatar.vue";
import Header from "../components/Header.vue";
import Divider from "primevue/divider";

const bookings = ref([]);
const customers = ref([]);
const months = ref(new Array(12).fill(0));
const day = ref(new Array(31).fill(0));

// Get All Booking and Customer with pagination
onMounted(async () => {
  const limit = 50;
  let page = 1;
  let hasMoreData = true;

  while (hasMoreData) {
    const bResponse = await fetch(
      `http://localhost:3000/bookings?limit=${limit}&page=${page}`
    );
    if (!bResponse.ok) throw new Error("Failed to fetch bookings");
    const bookingData = await bResponse.json();

    // const cResponse = await fetch(
    //   `http://localhost:3000/users?limit=${limit}&page=${page}`
    // );
    // if (!cResponse.ok) throw new Error("Failed to fetch customers");
    // const customerData = await cResponse.json();

    if (bookingData.items.length === 0) {
      hasMoreData = false;
    } else {
      bookings.value.push(...bookingData.items);
      // customers.value.push(...customerData.items);
      page++;
    }
  }

  processBookings();
});

const totalCustomer = computed(() => customers.value.length);

// Process bookings to count booking occurences per month
const processBookings = () => {
  months.value = new Array(12).fill(0);

  bookings.value.forEach((booking) => {
    if (booking.checkInDate) {
      const monthIndex = new Date(booking.checkInDate).getMonth();
      months.value[monthIndex]++;
    }
  });

  updateChartData();
};

const monthColors = [
  "#4F46E5", // January - Indigo
  "#EC4899", // February - Pink
  "#EF4444", // March - Red
  "#F59E0B", // April - Amber
  "#84CC16", // May - Lime
  "#06B6D4", // June - Cyan
  "#10B981", // July - Emerald
  "#8B5CF6", // August - Violet
  "#22C55E", // September - Green
  "#EAB308", // October - Yellow
  "#3B82F6", // November - Blue
  "#14B8A6", // December - Teal
];

const chartData = ref({
  labels: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  datasets: [
    {
      data: months.value,
      backgroundColor: monthColors,
      borderWidth: 2,
      borderRadius: 20,
      borderSkipped: false,
    },
  ],
});

const updateChartData = () => {
  chartData.value.datasets[0].data = [...months.value];
};

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
});

// Get PENDING Bookings
const countPendingBookings = computed(() => {
  return bookings.value.filter(
    (b) => b.bookStatus && b.bookStatus.trim().toLowerCase() === "pending"
  ).length;
});

// Get CONFIRMED Booking Status
const countConfirmedBookings = computed(() => {
  return bookings.value.filter(
    (b) => b.bookStatus && b.bookStatus.trim().toLowerCase() === "confirmed"
  ).length;
});

// Get RESCHEDULED Booking Status
const countRescheduledBooking = computed(() => {
  return bookings.value.filter(
    (b) => b.bookStatus && b.bookStatus.trim().toLowerCase() === "rescheduled"
  ).length;
});

// Get CANCELLED Booking Status
const countCancelledBookings = computed(() => {
  return bookings.value.filter(
    (b) => b.bookStatus && b.bookStatus.trim().toLowerCase() === "cancelled"
  ).length;
});

// Get COMPLETED Booking Status
const countCompletedBookings = computed(() => {
  return bookings.value.filter(
    (b) => b.bookStatus && b.bookStatus.trim().toLowerCase() === "completed"
  ).length;
});

// Process booking days
const getBookingStyle = (slotDate) => {
  const jsDate = new Date(slotDate.year, slotDate.month - 1, slotDate.day);

  const formattedDate = jsDate.toISOString().split("T")[0];

  const booking = bookings.value.find((b) =>
    b.checkInDate.startsWith(formattedDate)
  );

  if (!booking) {
    return {
      backgroundColor: "#90EE94",
      color: "#15803D",
      width: "40px",
      height: "40px",
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "10rem",
      fontSize: "17px",
    };
  }

  let backgroundColor;
  let color;
  switch (booking.mode) {
    case "day-time":
      backgroundColor = "#FFD580";
      color = "white";
      break;
    case "night-time":
      backgroundColor = "#6A5ACD";
      color = "white";
      break;
    case "whole-day":
      backgroundColor = "#FF6B6B";
      color = "white";
      break;
    default:
      backgroundColor = "#90EE94";
      color = "#15803D";
  }

  return {
    backgroundColor,
    color,
    width: "40px",
    height: "40px",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "10rem",
    fontSize: "18px",
  };
};

// 4BB344
// FF2D55
// 3EDFFF
// 1714BA
</script>

<template>
  <main class="adminDash bg-[#EEF9EB] dark:bg-[#09090b]">
    <SideBar />
    <div class="container">
      <div class="headers">
        <h1 class="text-5xl font-black">Dashboard</h1>
        <div class="flex items-center gap-5">
          <DarkModeButton />
          <Notification />
          <ProfileAvatar />
        </div>
      </div>
      <div class="dSection">
        <div
          class="pendingBook p-4 md:p-5 shadow-lg bg-orange-50 dark:bg-orange-100/10"
        >
          <div class="flex justify-between mb-4">
            <div>
              <p class="text-xs uppercase text-gray-500">
                Pending<i
                  class="pi pi-question-circle ml-2"
                  style="font-size: 12px"
                  v-tooltip="'Total Number of Pending'"
                />
              </p>
              <h3
                class="text-xl sm:text-3xl font-medium text-gray-800 dark:text-white mt-1"
              >
                {{ countPendingBookings }}
              </h3>
            </div>
            <div
              class="flex items-center justify-center bg-orange-200 dark:bg-orange-400/10 rounded-xl"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-spinner text-orange-600 !text-xl" />
            </div>
          </div>
        </div>
        <div
          class="pendingBook p-4 md:p-5 shadow-lg bg-cyan-50 dark:bg-cyan-100/10"
        >
          <div class="flex justify-between mb-4">
            <div>
              <p class="text-xs uppercase text-gray-500">
                RESERVED<i
                  class="pi pi-question-circle ml-2"
                  style="font-size: 12px"
                  v-tooltip="'Total Number of Reserved'"
                />
              </p>
              <h3
                class="text-xl sm:text-3xl font-medium text-gray-800 dark:text-white mt-1"
              >
                {{ countConfirmedBookings }}
              </h3>
            </div>
            <div
              class="flex items-center justify-center bg-cyan-200 dark:bg-cyan-400/10 rounded-xl"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-calendar text-cyan-600 !text-xl" />
            </div>
          </div>
        </div>
        <div
          class="completedBook p-4 md:p-5 shadow-lg bg-purple-50 dark:bg-purple-100/10"
        >
          <div class="flex justify-between mb-4">
            <div>
              <p class="text-xs uppercase text-gray-500" icon>
                Rescheduled<i
                  class="pi pi-question-circle ml-2"
                  style="font-size: 12px"
                  v-tooltip="'Total Number of Rescheduled'"
                />
              </p>
              <h3
                class="text-xl sm:text-3xl font-medium text-gray-800 dark:text-white mt-1"
              >
                {{ countRescheduledBooking }}
              </h3>
            </div>
            <div
              class="flex items-center justify-center bg-purple-200 dark:bg-purple-400/10 rounded-xl"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-calendar-clock text-purple-600 !text-xl" />
            </div>
          </div>
        </div>
        <div
          class="cancelledBook p-4 md:p-5 shadow-lg bg-red-50 dark:bg-red-100/10"
        >
          <div class="flex justify-between mb-4">
            <div>
              <p class="text-xs uppercase text-gray-500">
                Cancelled<i
                  class="pi pi-question-circle ml-2"
                  style="font-size: 12px"
                  v-tooltip="'Total Number of Cancelled'"
                />
              </p>
              <h3
                class="text-xl sm:text-3xl font-medium text-gray-800 dark:text-white mt-1"
              >
                {{ countCancelledBookings }}
              </h3>
            </div>
            <div
              class="flex items-center justify-center bg-red-200 dark:bg-red-400/10 rounded-xl"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-times-circle text-red-600 !text-xl" />
            </div>
          </div>
        </div>

        <div
          class="completedBook p-4 md:p-5 shadow-lg bg-green-50 dark:bg-green-100/10"
        >
          <div class="flex justify-between mb-4">
            <div>
              <p class="text-xs uppercase text-gray-500" icon>
                Completed<i
                  class="pi pi-question-circle ml-2"
                  style="font-size: 12px"
                  v-tooltip="'Total Number of Completed'"
                />
              </p>
              <h3
                class="text-xl sm:text-3xl font-medium text-gray-800 dark:text-white mt-1"
              >
                {{ countCompletedBookings }}
              </h3>
            </div>
            <div
              class="flex items-center justify-center bg-green-200 dark:bg-green-400/10 rounded-xl"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-check-circle text-green-600 !text-xl" />
            </div>
          </div>
        </div>
        <!--
        <div
          class="noCustomer p-4 md:p-5 shadow-lg bg-cyan-50 dark:bg-cyan-100/10"
        >
          <div class="flex justify-between mb-4">
            <div>
              <p class="text-xs uppercase text-gray-500">
                Customers<i
                  class="pi pi-question-circle ml-2"
                  style="font-size: 12px"
                  v-tooltip="'Total Number of Customers'"
                />
              </p>
              <h3
                class="text-xl sm:text-3xl font-medium text-gray-800 dark:text-white mt-1"
              >
                {{ totalCustomer }}
              </h3>
            </div>
            <div
              class="flex items-center justify-center bg-cyan-200 dark:bg-cyan-400/10 rounded-xl"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-users text-cyan-600 !text-xl" />
            </div>
          </div>
        </div>
      --></div>

      <div class="charts">
        <div
          class="calendarChart p-4 md:p-5 shadow-lg bg-[#FCFCFC] dark:bg-[#18181b] font-[Poppins]"
        >
          <DatePicker
            v-model="date"
            inline
            class="dateChart w-full sm:w-[30rem]"
          >
            <template #date="slotProps">
              <span>
                <strong
                  :style="getBookingStyle(slotProps.date)"
                  class="date-box"
                >
                  {{ slotProps.date.day }}
                </strong>
              </span>
            </template>
          </DatePicker>

          <div class="mt-4 mb-4 flex flex-wrap items-center gap-2 text-sm">
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded-full bg-[#90EE90]"></span>
              <span>Available</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded-full bg-[#FFD580]"></span>
              <span>Day Available</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded-full bg-[#6A5ACD]"></span>
              <span>Night Available</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded-full bg-[#FF6B6B]"></span>
              <span>Fully Booked</span>
            </div>
          </div>
        </div>

        <div
          class="chartPeak p-4 md:p-5 shadow-lg bg-[#FCFCFC] dark:bg-[#18181b]"
        >
          <div class="font-semibold text-xl mb-4 text-left w-[90%]">
            Peak Months of Reservations
          </div>
          <Chart
            type="bar"
            :data="chartData"
            :options="chartOptions"
            class="h-[20rem] w-[30rem]"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
:deep(.dateChart) {
  .p-datepicker-panel {
    border: none;
    background: #fcfcfc;
  }
  .p-datepicker-header {
    background: #fcfcfc;
  }
  .p-datepicker-day {
    border-radius: 0;
  }
  .p-datepicker-day:hover {
    border-radius: 0;
    font-size: 20px;
  }

  .my-app-dark .p-datepicker-panel,
  .my-app-dark .p-datepicker-header {
    border: none;
    background: #18181b;
  }
}

.h1 {
  text-align: center;
  margin-top: 50px;
  font-size: 50px;
  font-weight: bold;
}

.container {
  margin-left: 280px;
  margin-top: 30px;
  padding: 20px;

  width: 80%;
  height: 92%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  max-width: 100%;
}

.headers {
  display: flex;
  justify-content: space-between;
}

.dSection {
  display: flex;
  flex-direction: row;
  margin-top: 30px;
  gap: 10px;
  justify-content: center;

  border-radius: 10px;
  max-width: 100%;
}

.pendingBook,
.completedBook,
.noCustomer,
.cancelledBook {
  height: 100px;
  width: 300px;

  border-radius: 10px;
  max-width: 100%;
}

.charts {
  display: flex;
  flex-direction: row;
  margin-top: 30px;
  gap: 50px;
  justify-content: center;
  height: 380px;
  max-height: 550px;

  border-radius: 10px;
  max-width: 100%;
}

.calendarChart,
.chartPeak {
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 50%;
  border-radius: 10px;

  max-width: 100%;
}
</style>
