<script setup>
import {
  ref,
  defineProps,
  defineEmits,
  onMounted,
  onUnmounted,
  computed,
  watch,
} from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import DatePicker from "primevue/datepicker";
import InputText from "primevue/inputtext";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Textarea from "primevue/textarea";
import { useBookingStore } from "../stores/bookingStore";
import { usePublicEntryStore } from "../stores/publicEntryStore.js";
import { useBlockedStore } from "../stores/blockedDateStore.js";

const toast = useToast();

const bookingStore = useBookingStore();
const publicStore = usePublicEntryStore();
const blockStore = useBlockedStore();
const showMenu = ref(false);
const showRescheduleModal = ref(false);
const rescheduleData = ref({});
const showCancelDialog = ref(false);
const cancelData = ref({});

const props = defineProps(["booking", "showAction", "refund"]);
const emit = defineEmits(["rescheduleBooking", "cancelBooking"]);

const openRescheduleModal = () => {
  rescheduleData.value = {
    bookingId: props.booking.bookingId,
    checkInDate: props.booking.checkInDate,
    checkOutDate: props.booking.checkOutDate,
  };
  showRescheduleModal.value = true;
  showMenu.value = false;
};

const closeModals = () => {
  showRescheduleModal.value = false;
  showCancelDialog.value = false;
};

watch(
  () => [rescheduleData.value.checkInDate, rescheduleData.value.mode],
  ([checkInDate, mode]) => {
    if (!checkInDate) {
      rescheduleData.value.checkOutDate = "";
      return;
    }
    const date = new Date(checkInDate);
    if (mode === "night-time" || mode === "whole-day") {
      date.setDate(date.getDate() + 1);
      rescheduleData.value.checkOutDate = formatDate(date);
    } else {
      rescheduleData.value.checkOutDate = checkInDate;
    }
  }
);

const confirmReschedule = () => {
  rescheduleData.value.bookStatus = "rescheduled";
  emit("rescheduleBooking", rescheduleData.value);
  toast.add({
    severity: "success",
    summary: "Rescheduled",
    detail: "Booking successfully rescheduled",
    life: 3000,
  });
  closeModals();
};

const openCancelDialog = () => {
  cancelData.value = {
    bookStatus: "pending-cancellation",
    cancelCategory: props.booking.cancelCategory,
    cancelReason: props.booking.cancelReason,
    refundMethod: props.booking.refundMethod,
    receiveName: props.booking.receiveName || null,
  };
  showCancelDialog.value = true;
  showMenu.value = false;
};

const confirmCancellation = () => {
  emit("cancelBooking", {
    ...props.booking,
    bookStatus: "pending-cancellation",
    cancelCategory: cancelData.value.cancelCategory,
    cancelReason: cancelData.value.cancelReason,
    refundMethod: cancelData.value.refundMethod,
    receiveName: cancelData.value.receiveName || null,
  });
  toast.add({
    severity: "info",
    summary: "Pending Cancellation",
    detail: "Booking has been pending for cancellation",
    life: 3000,
  });
  showMenu.value = false;
  showCancelDialog.value = false;
};

const hideMenu = ref(null);
const closeMenu = (event) => {
  if (hideMenu.value && !hideMenu.value.contains(event.target)) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeMenu);
});
onUnmounted(() => {
  document.removeEventListener("click", closeMenu);
});

const minDate = new Date();

const disabledDates = computed(() => {
  const disabled = [];

  // Blocked dates
  blockStore.blocked.forEach((bd) => {
    if (bd.blockedDates) {
      disabled.push(new Date(bd.blockedDates));
    }
  });

  // Fully booked dates (whole-day or both day-time and night-time)
  const bookingsByDate = {};
  bookingStore.bookings.forEach((b) => {
    if (b.checkInDate) {
      const date = b.checkInDate;
      if (!bookingsByDate[date]) bookingsByDate[date] = new Set();
      bookingsByDate[date].add(b.mode);
    }
  });
  publicStore.public.forEach((p) => {
    if (p.entryDate) {
      const date = p.entryDate;
      if (!bookingsByDate[date]) bookingsByDate[date] = new Set();
      bookingsByDate[date].add(p.mode);
    }
  });

  Object.entries(bookingsByDate).forEach(([date, modes]) => {
    if (
      modes.has("whole-day") ||
      (modes.has("day-time") && modes.has("night-time"))
    ) {
      disabled.push(new Date(date));
    }
  });

  return disabled;
});

const getBookingStyle = (slotDate) => {
  const formattedDate = `${slotDate.year}-${String(slotDate.month + 1).padStart(
    2,
    "0"
  )}-${String(slotDate.day).padStart(2, "0")}`;

  // Collect all booking/public modes for the date
  const mode = new Set();
  let isBlocked = false;

  bookingStore.bookings.forEach((b) => {
    if (b.checkInDate === formattedDate) {
      mode.add(b.mode);
    }
  });

  publicStore.public.forEach((p) => {
    if (p.entryDate === formattedDate) {
      mode.add(p.mode);
    }
  });

  if (blockStore.blocked.some((bd) => bd.blockedDates === formattedDate)) {
    isBlocked = true;
  }

  let backgroundColor, color;

  if (isBlocked) {
    backgroundColor = "grey";
    color = "white";
  } else if (
    mode.has("whole-day") ||
    (mode.has("day-time") && mode.has("night-time"))
  ) {
    backgroundColor = "#FF6B6B"; // Fully Booked
    color = "white";
  } else if (mode.has("day-time")) {
    backgroundColor = "#6A5ACD"; // Night Available
    color = "white";
  } else if (mode.has("night-time")) {
    backgroundColor = "#FFD580"; // Day Available
    color = "black";
  } else {
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
    fontSize: "17px",
  };
};

// Process booking days
const mapBookingsToEvents = (
  bookings = [],
  publics = [],
  blockedDates = []
) => {
  const eventByDate = {};

  bookings.forEach((b) => {
    const date = b.checkInDate;
    if (!eventByDate[date])
      eventByDate[date] = { modes: new Set(), blocked: null };
    eventByDate[date].modes.add(b.mode);
  });

  publics.forEach((p) => {
    const date = p.entryDate;
    if (!eventByDate[date])
      eventByDate[date] = { modes: new Set(), blocked: null };
    eventByDate[date].modes.add(p.mode);
  });

  blockedDates.forEach((bd) => {
    const date = bd.blockedDates;
    if (!eventByDate[date])
      eventByDate[date] = { modes: new Set(), blocked: null };
    eventByDate[date].blocked = bd;
  });

  return Object.entries(eventByDate).map(([date, { modes, blocked }]) => {
    let backgroundColor, textColor, title;

    if (blocked) {
      backgroundColor = "grey";
      textColor = "white";
      title = "Not Available";
    } else if (
      modes.has("whole-day") ||
      (modes.has("day-time") && modes.has("night-time"))
    ) {
      backgroundColor = "#FF6B6B";
      textColor = "white";
      title = "Fully Booked";
    } else if (modes.has("day-time")) {
      backgroundColor = "#6A5ACD";
      textColor = "white";
      title = "Night Available";
    } else if (modes.has("night-time")) {
      backgroundColor = "#FFD580";
      textColor = "black";
      title = "Day Available";
    } else {
      backgroundColor = "#90EE90";
      textColor = "#15803D";
      title = "Available";
    }

    return {
      id: `summary-${date}`,
      title,
      start: date,
      backgroundColor,
      textColor,
      allDay: true,
    };
  });
};

const calendarEvents = computed(() => {
  return mapBookingsToEvents(
    bookingStore.bookings,
    publicStore.public,
    blockStore.blocked
  );
});

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay",
  },
  initialView: "dayGridMonth",
  editable: false,
  selectable: false,
  selectMirror: false,
  dayMaxEvents: false,
  weekends: true,
  events: calendarEvents,
});
</script>

<template>
  <div class="relative menu-container inline-block">
    <button
      @click.stop="$emit('click')"
      class="logBtn pi pi-ellipsis-v cursor-pointer"
    ></button>

    <div v-if="showAction" ref="hideMenu" class="loggerBtn">
      <ul>
        <li
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openRescheduleModal"
        >
          Reschedule
        </li>
        <li
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openCancelDialog"
        >
          Cancel
        </li>
      </ul>
    </div>
  </div>

  <Dialog
    v-model:visible="showRescheduleModal"
    modal
    :style="{ width: 'auto' }"
  >
    <template #header>
      <div class="text-xl font-bold text-center w-full font-[Poppins]">
        Reschedule Booking
      </div>
    </template>

    <div>
      <FullCalendar class="fullCalendar" :options="calendarOptions">
        <template #eventContent="{ event, timeText }">
          <b>{{ timeText }}</b> <i>{{ event.title }}</i>
        </template>
      </FullCalendar>
    </div>

    <div class="mb-4 space-y-4 flex">
      <div>
        <label>Check-In Date: </label>
        <DatePicker
          v-model="rescheduleData.checkInDate"
          showIcon
          iconDisplay="input"
          dateFormat="mm-dd-yy"
          placeholder="Check-In"
          :minDate="minDate"
          :disabledDates="disabledDates"
        >
          <template #date="slotProps">
            <span>
              <strong :style="getBookingStyle(slotProps.date)" class="date-box">
                {{ slotProps.date.day }}
              </strong>
            </span>
          </template></DatePicker
        >
      </div>
      <div>
        <label>Check-Out Date: </label>
        <DatePicker
          v-model="rescheduleData.checkOutDate"
          showIcon
          iconDisplay="input"
          dateFormat="mm-dd-yy"
          placeholder="Check-Out"
          :minDate="minDate"
          :disabledDates="disabledDates"
        >
          <template #date="slotProps">
            <span>
              <strong :style="getBookingStyle(slotProps.date)" class="date-box">
                {{ slotProps.date.day }}
              </strong>
            </span>
          </template></DatePicker
        >
      </div>
    </div>

    <div class="flex justify-center gap-2 font-[Poppins] mt-4">
      <Button
        label="Cancel"
        severity="secondary"
        @click="closeModals"
        class="font-bold w-full"
      />
      <Button
        label="Save"
        severity="primary"
        @click="confirmReschedule"
        class="font-bold w-full"
      />
    </div>
  </Dialog>

  <Dialog v-model:visible="showCancelDialog" modal :style="{ width: '30rem' }">
    <template #header>
      <div class="text-xl font-semibold w-full text-center font-[Poppins]">
        Confirm Cancellation
      </div>
    </template>

    <div class="text-center font-[Poppins] text-lg">
      Are you sure you want to <strong class="text-red-500">CANCEL</strong>?
      Downpayment is non-refundable except in cases of verified natural
      disasters. All requests are reviewed by admin.
    </div>

    <div>
      <label>Cancel Category:</label>
      <select
        v-model="cancelData.cancelCategory"
        class="border p-2 rounded w-full"
        required
      >
        <option value="natural-disaster">Natural Disaster</option>
        <option value="others">Others:</option>
      </select>
      <label>Reason for Cancellation:</label>
      <Textarea
        class="w-full"
        v-model="cancelData.cancelReason"
        autoResize
        rows="3"
        cols="30"
        placeholder="Please provide a message or link(if natural disaster)"
      />

      <select
        v-model="cancelData.refundMethod"
        class="border p-2 rounded w-full"
        required
      >
        <option value="gcash">GCash</option>
        <option value="cash">Cash</option>
      </select>

      <template v-if="cancelData.refundMethod === 'cash'">
        <div class="flex flex-col">
          <label>Receiver Name:</label>
          <InputText v-model="cancelData.receiveName" />
        </div>
      </template>
    </div>

    <div class="flex justify-center gap-2 mt-4 font-[Poppins]">
      <Button
        label="No"
        severity="secondary"
        @click="closeModals"
        class="w-full font-bold"
      />
      <Button
        label="Yes, Cancel"
        severity="danger"
        @click="confirmCancellation"
        class="w-full font-bold"
      />
    </div>
  </Dialog>

  <Toast />
</template>

<style scoped>
.loggerBtn {
  position: absolute;
  right: 0;
  top: 100%;
  background: #fcfcfc;
  color: #333;
  border-radius: 5px;
  padding: 5px;
  width: 120px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.loggerBtn ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.loggerBtn li {
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}
:deep(.fullCalendar) {
  margin: 0 auto;

  height: 350px;
  font-size: 10px;
  padding: 10px;
  background: white;
  border-radius: 10px;

  .fc {
    font-family: Poppins, sans-serif;
  }

  .fc-toolbar-title {
    font-size: 14px;
  }

  .fc-button {
    background-color: #41ab5d;
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
    display: none;
  }
}
</style>
