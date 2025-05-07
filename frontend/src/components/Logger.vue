<script setup>
import {
  ref,
  defineProps,
  defineEmits,
  onMounted,
  onUnmounted,
  computed,
} from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import DatePicker from "primevue/datepicker";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useBookingStore } from "../stores/bookingStore";

const toast = useToast();

const bookingStore = useBookingStore();
const showMenu = ref(false);
const showRescheduleModal = ref(false);
const rescheduleData = ref({});
const showCancelDialog = ref(false);
const cancelData = ref({});

const props = defineProps(["booking"]);
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

const confirmReschedule = () => {
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
  };
  showCancelDialog.value = true;
  showMenu.value = false;
};

const closeCancelDialog = () => {
  showCancelDialog.value = false;
};

const confirmCancellation = () => {
  emit("cancelBooking", {
    ...props.booking,
    bookStatus: "pending-cancellation",
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

// Process booking days
const mapBookingsToEvents = (bookings) => {
  return bookings
    .filter((b) => b.bookStatus === "reserved")
    .map((b) => {
      let backgroundColor;
      let textColor = "white";
      let title;

      switch (b.mode) {
        case "day-time": // if someone booked day status it will give Night Available
          backgroundColor = "#6A5ACD";
          textColor = "white";
          title = "Night Available";
          break;
        case "night-time": // if someone booked night status it will give Day Available
          backgroundColor = "#FFD580";
          textColor = "black";
          title = "Day Available";
          break;
        case "whole-day": // if someone booked day and night status and whole day status it will give Fully Booked
          backgroundColor = "#FF6B6B";
          title = "Fully Booked";
          break;
        default:
          backgroundColor = "#90EE94";
          textColor = "#15803D";
      }

      return {
        id: b.bookingId,
        title: title,
        start: b.checkInDate,
        // end: b.checkOutDate,
        backgroundColor: backgroundColor,
        textColor: textColor,
        allDay: true,
      };
    });
};

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
  events: computed(() => mapBookingsToEvents(bookingStore.bookings)),
});
</script>

<template>
  <div class="relative menu-container inline-block">
    <button
      @click.stop="showMenu = !showMenu"
      class="logBtn pi pi-ellipsis-v cursor-pointer"
    ></button>

    <div v-if="showMenu" ref="hideMenu" class="loggerBtn">
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
        />
      </div>
      <div>
        <label>Check-Out Date: </label>
        <DatePicker
          v-model="rescheduleData.checkOutDate"
          showIcon
          iconDisplay="input"
          dateFormat="mm-dd-yy"
          placeholder="Check-Out"
        />
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
