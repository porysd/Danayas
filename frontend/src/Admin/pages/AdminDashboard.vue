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
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useBookingStore } from "../../stores/bookingStore.js";
import { usePublicEntryStore } from "../../stores/publicEntryStore.js";
import { useBlockedStore } from "../../stores/blockedDateStore.js";
import {
  getBookingStyle,
  disabledDates,
  fullCalendarEvents,
} from "../../composables/calendarStyle";

const bookingStore = useBookingStore();
const publicStore = usePublicEntryStore();
const blockStore = useBlockedStore();
const { calendarEvents, calendarOptions } = fullCalendarEvents();

onMounted(async () => {
  await bookingStore.fetchUserBookings();
  await publicStore.fetchAllPublic();
  await blockStore.fetchAllBlocked();

  processBookings();
});

const months = ref(new Array(12).fill(0));
const day = ref(new Array(31).fill(0));

// Process bookings to count booking occurences per month
const processBookings = () => {
  months.value = new Array(12).fill(0);

  bookingStore.bookings.forEach((booking) => {
    if (booking.checkInDate) {
      const monthIndex = new Date(booking.checkInDate).getMonth();
      months.value[monthIndex]++;
    }
  });

  publicStore.public.forEach((p) => {
    if (p.entryDate) {
      const monthIndex = new Date(p.entryDate).getMonth();
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
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ],
  datasets: [
    {
      data: months.value,
      backgroundColor: monthColors,
      borderWidth: 1,
      borderRadius: 10,
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
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
    },
    y: {
      grid: {
        drawBorder: false,
      },
    },
  },
});

// Get PENDING Bookings
const countPendingBookings = computed(() => {
  const bPending = bookingStore.bookingPending.filter(
    (b) => b.bookStatus && b.bookStatus.trim().toLowerCase() === "pending"
  ).length;

  const pPending = publicStore.pending.filter(
    (p) => p.status && p.status.trim().toLowerCase() === "pending"
  ).length;

  const pendingDates = bPending + pPending;

  return pendingDates;
});

// Get CONFIRMED Booking Status
const countConfirmedBookings = computed(() => {
  const bReserved = bookingStore.bookingReserved.filter(
    (b) => b.bookStatus && b.bookStatus.trim().toLowerCase() === "reserved"
  ).length;

  const pReserved = publicStore.reserved.filter(
    (p) => p.status && p.status.trim().toLowerCase() === "reserved"
  ).length;

  const reservedDates = bReserved + pReserved;

  return reservedDates;
});

// Get RESCHEDULED Booking Status
const countRescheduledBooking = computed(() => {
  const bReschedule = bookingStore.bookingRescheduled.filter(
    (b) => b.bookStatus && b.bookStatus.trim().toLowerCase() === "rescheduled"
  ).length;

  const pReschedule = publicStore.rescheduled.filter(
    (p) => p.status && p.status.trim().toLowerCase() === "rescheduled"
  ).length;

  const rescheduleDates = bReschedule + pReschedule;

  return rescheduleDates;
});

// Get PENDING CANCELLATION Booking Status
// const countPendingCancellationBookings = computed(() => {
//   const bPendingCancel = bookingStore.bookingCancelled.filter(
//     (b) =>
//       b.bookStatus &&
//       b.bookStatus.trim().toLowerCase() === "pending-cancellation"
//   ).length;

//   const pPendingCancel = publicStore.pendingCancellation.filter(
//     (p) => p.status && p.status.trim().toLowerCase() === "pending-cancellation"
//   ).legnth;

//   const pendingCancelDates = bPendingCancel + pPendingCancel;

//   return pendingCancelDates;
// });

// Get CANCELLED Booking Status
const countCancelledBookings = computed(() => {
  const bCancelled = bookingStore.bookingCancelled.filter(
    (b) => b.bookStatus && b.bookStatus.trim().toLowerCase() === "cancelled"
  ).length;

  const pCancelled = publicStore.cancelled.filter(
    (p) => p.status && p.status.trim().toLowerCase() === "cancelled"
  ).length;

  const cancelledDates = bCancelled + pCancelled;

  return cancelledDates;
});

// Get COMPLETED Booking Status
const countCompletedBookings = computed(() => {
  const bCompleted = bookingStore.bookingCompleted.filter(
    (b) => b.bookStatus && b.bookStatus.trim().toLowerCase() === "completed"
  ).length;

  const pCompleted = publicStore.completed.filter(
    (p) => p.status && p.status.trim().toLowerCase() === "completed"
  ).length;

  const completedDates = bCompleted + pCompleted;

  return completedDates;
});
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
                class="text-xl sm:text-5xl font-medium text-gray-800 dark:text-white"
              >
                {{ countPendingBookings }}
              </h3>
            </div>
            <div
              class="flex items-center justify-center bg-yellow-200 dark:bg-yellow-400/10 rounded-xl"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-spinner text-yellow-600 !text-xl" />
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
                class="text-xl sm:text-5xl font-medium text-gray-800 dark:text-white"
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
                class="text-xl sm:text-5xl font-medium text-gray-800 dark:text-white"
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
        <!--<div
          class="cancelledBook p-4 md:p-5 shadow-lg bg-red-50 dark:bg-red-100/10"
        >
          <div class="flex justify-between mb-4">
            <div>
              <p class="text-xs uppercase text-gray-500">
                PENDING CANCELLATION<i
                  class="pi pi-question-circle ml-2"
                  style="font-size: 12px"
                  v-tooltip="'Total Number of Pending Cancellation'"
                />
              </p>
              <h3
                class="text-xl sm:text-3xl font-medium text-gray-800 dark:text-white mt-1"
              >
                {{ countPendingCancellationBookings }}
              </h3>
            </div>
            <div
              class="flex items-center justify-center bg-orange-200 dark:bg-orange-400/10 rounded-xl"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-hourglass text-orange-600 !text-xl" />
            </div>
          </div>
        </div>-->

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
                class="text-xl sm:text-5xl font-medium text-gray-800 dark:text-white"
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
                class="text-xl sm:text-5xl font-medium text-gray-800 dark:text-white"
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
          class="calendarChart p-4 md:p-5 shadow-lg bg-[#FCFCFC] dark:bg-[#18181b] font-[Poppins] w-[100%]"
        >
          <FullCalendar class="fullCalendar" :options="calendarOptions">
            <template #eventContent="{ event, timeText }">
              <b>{{ timeText }}</b> <i>{{ event.title }}</i>
            </template>
          </FullCalendar>
          <!--<DatePicker
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
          </DatePicker>-->

          <!--<div class="mt-2 flex flex-wrap items-center gap-2 text-sm">
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
          </div>-->
        </div>

        <div
          class="chartPeak p-4 md:p-5 shadow-lg bg-[#FCFCFC] dark:bg-[#18181b]"
        >
          <div class="font-semibold text-xl mb-4 text-center w-[100%]">
            Peak Months of Reservations
          </div>
          <Chart
            type="bar"
            :data="chartData"
            :options="chartOptions"
            class="h-[20rem] w-[20rem]"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
:deep(.fullCalendar) {
  margin: 0 auto;
  width: 750px;
  height: 345px;
  font-size: 10px;

  .fc {
    font-family: Poppins, sans-serif;
  }

  .fc-toolbar-title {
    font-size: 20px;
    font-weight: bold;
  }

  .fc-button {
    background-color: #194d1d;
    color: white;
    border-radius: 6px;
    padding: 2px 6px;
    font-size: 10px;
    height: 24px;
    min-width: 24px;
  }

  .fc-button .fc-icon {
    font-size: 10px;
  }

  .fc-daygrid-event {
    font-size: 10px;
    padding: 1px 2px;
    white-space: normal;
  }

  .fc-daygrid-more-link {
    font-size: 9px;
  }

  .fc-event-title {
    font-weight: 600;
  }

  .fc-daygrid-event-dot {
    display: none; /* Hide dot, show full colored event */
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
  min-height: 140px;
  width: 320px;
  border-radius: 16px;
  max-width: 100%;
  box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.1);
  transition: box-shadow 0.3s, transform 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.pendingBook:hover,
.completedBook:hover,
.noCustomer:hover,
.cancelledBook:hover {
  box-shadow: 0 16px 40px 0 rgba(31, 38, 135, 0.18);
  transform: translateY(-4px) scale(1.03);
}

/*.pendingBook:active,
.completedBook:active,
.noCustomer:active,
.cancelledBook:active {
  height: 105px;
  width: 320px;

  opacity: 0.8;
  cursor: pointer;
} */

.charts {
  display: flex;
  flex-direction: row;
  margin-top: 30px;
  gap: 10px;
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
  border-radius: 10px;
  max-width: 100%;
}

.chartPeak {
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.12);
  border-radius: 18px;
  background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%);
  transition: box-shadow 0.3s;
}
.chartPeak:hover {
  box-shadow: 0 16px 40px 0 rgba(31, 38, 135, 0.18);
}

.my-app-dark .chartPeak {
  background: #18181b;
}

.calendarChart {
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.12);
  border-radius: 18px;

  transition: box-shadow 0.3s;
}
.calendarChart:hover {
  box-shadow: 0 16px 40px 0 rgba(31, 38, 135, 0.18);
}
</style>
