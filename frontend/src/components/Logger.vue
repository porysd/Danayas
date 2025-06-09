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
import {
  getBookingStyle,
  disabledDates,
  fullCalendarEvents,
} from "../composables/calendarStyle";
import { formatPeso } from "../utility/pesoFormat";
import FileUpload from "primevue/fileupload";
import Checkbox from "primevue/checkbox";

const toast = useToast();

const bookingStore = useBookingStore();
const publicStore = usePublicEntryStore();
const blockStore = useBlockedStore();
const showMenu = ref(false);
const showRescheduleModal = ref(false);
const rescheduleData = ref({});
const showCancelDialog = ref(false);
const cancelData = ref({});
const { calendarEvents, calendarOptions } = fullCalendarEvents();
const showPayModal = ref(false);
const showPaymentModal = ref(false);
const formData = ref({});

const props = defineProps(["booking", "showAction", "refund", "payAgain"]);
const emit = defineEmits(["rescheduleBooking", "cancelBooking", "payPayment"]);

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
  showPayModal.value = false;
  showPaymentModal.value = false;
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

const onFileSelect = (event) => {
  const file = event.files[0];
  if (file) {
    formData.value.imageUrl = file;
  }
};

const openPayModal = () => {
  formData.value = { ...props.payAgain };
  showPayModal.value = true;
  showMenu.value = false;
};

const nextPay = () => {
  showPayModal.value = false;
  showPaymentModal.value = true;
};

const backPay = () => {
  showPayModal.value = true;
  showPaymentModal.value = false;
};

const confirmPay = () => {
  const payload = { ...formData.value, paymentMethod: "gcash" };
  emit("payPayment", payload);
  closeModals();
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

const checkOutMinDate = computed(() => {
  if (!rescheduleData.value.checkInDate) return minDate;
  const checkIn = new Date(rescheduleData.value.checkInDate);
  if (
    rescheduleData.value.mode === "night-time" ||
    rescheduleData.value.mode === "whole-day"
  ) {
    const nextDay = new Date(checkIn);
    nextDay.setDate(checkIn.getDate() + 1);
    return nextDay;
  }
  return checkIn;
});

const maxDate = computed(() => {
  if (!rescheduleData.value.checkInDate) return null;

  const checkIn = new Date(rescheduleData.value.checkInDate);

  if (
    rescheduleData.value.mode === "night-time" ||
    rescheduleData.value.mode === "whole-day"
  ) {
    const nextDay = new Date(checkIn);
    nextDay.setDate(checkIn.getDate() + 1);
    return nextDay;
  }

  return checkIn;
});

const allowedStatus = ["reserved", "pending", "rescheduled"];

const unavailableModes = computed(() => {
  const date = rescheduleData.value.checkInDate;
  if (!date) return new Set();

  const formattedDate = formatDateISO(date);

  const modes = new Set();

  bookingStore.bookings
    .filter((b) => allowedStatus.includes(b.bookStatus))
    .forEach((b) => {
      if (b.checkInDate) {
        const bookingDate =
          typeof b.checkInDate === "string"
            ? b.checkInDate.slice(0, 10)
            : new Date(b.checkInDate).toISOString().split("T")[0];

        if (bookingDate === formattedDate) {
          modes.add(b.mode);
        }
      }
    });

  publicStore.public
    .filter((p) => allowedStatus.includes(p.status))
    .forEach((p) => {
      if (p.entryDate) {
        const entryDate =
          typeof p.entryDate === "string"
            ? p.entryDate.slice(0, 10)
            : new Date(p.entryDate).toISOString().split("T")[0];

        if (entryDate === formattedDate) {
          modes.add(p.mode);
        }
      }
    });

  if (modes.has("whole-day")) {
    return new Set(["day-time", "night-time", "whole-day"]);
  }

  if (modes.has("day-time") || modes.has("night-time")) {
    const unavailable = new Set([...modes]);
    unavailable.add("whole-day");
    return unavailable;
  }
  return modes;
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
          v-if="payAgain"
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openPayModal"
        >
          Pay Again
        </li>
        <li
          v-if="!showAction && !payAgain"
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openRescheduleModal"
        >
          Reschedule
        </li>
        <li
          v-if="!showAction && !payAgain"
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openCancelDialog"
        >
          Cancel
        </li>
      </ul>
    </div>
  </div>

  <Dialog v-model:visible="showPayModal" modal :style="{ width: '30rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">Confirm Payment</h2>
      </div>
    </template>

    <div class="space-y-4 font-[Poppins] px-4">
      <p class="text-center text-lg">
        Please pay
        <strong class="text-green-600">AGAIN</strong> to process this payment?
      </p>

      <div class="text-left text-base space-y-2">
        <p>
          <strong>Name:</strong>
          {{ booking.firstName }} {{ booking.lastName }}
        </p>
        <p><strong>Payment Terms: </strong> {{ booking.paymentTerms }}</p>
        <p>
          <strong>Amount Paid: </strong>{{ formatPeso(booking.amountPaid) }}
        </p>
        <p>
          <strong>Remaining Balance: </strong
          >{{ formatPeso(booking.remainingBalance) }}
        </p>
        <label class="block text-lg mb-2"
          ><strong>Payment Method:</strong> GCash</label
        >

        <label>GCash Reference No:</label>
        <input class="w-full" v-model="formData.reference" />
        <label>Proof of Payment:</label>
        <FileUpload
          ref="fileupload"
          v-model="formData.imageUrl"
          mode="basic"
          name="imageUrl"
          url="/api/upload"
          accept="image/*"
          :maxFileSize="1000000"
          @select="onFileSelect"
        />

        <label>Sender Name:</label>
        <input class="w-full" v-model="formData.senderName" />

        <div class="flex">
          <div class="w-[100%]">
            <label>Tendered Amount:</label>
            <input class="w-full" v-model.number="formData.tenderedAmount" />
          </div>
        </div>

        <!--<div class="mb-4">
          <label class="block text-lg mb-2">Excess Charge</label>
          <select
            v-model="formData.bookStatus"
            class="border p-2 rounded w-full"
          >
            <option value="cancelled">Yes</option>
            <option value="completed">No</option>
          </select>
          <div class="flex flex-col">
            <template v-if="formData.bookStatus === 'cancelled'">
              <label>Extra Guest:</label>
              <input v-model="formData.cancelReason" />
              <label>Add ons:</label>
              <input v-model="formData.cancelReason" />
            </template>
          </div>
        </div>-->
      </div>
    </div>

    <div class="flex justify-center gap-2 mt-6 font-[Poppins] px-4">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="closeModals"
        class="font-bold w-full"
      />
      <Button
        type="button"
        label="Next"
        severity="success"
        @click="nextPay"
        class="font-bold w-full"
      />
    </div>
  </Dialog>

  <Dialog v-model:visible="showPaymentModal" modal :style="{ width: '30rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">Confirm Payment</h2>
      </div>
    </template>

    <div class="space-y-4 font-[Poppins] px-4">
      <p class="text-center text-lg">
        Are you sure you want to
        <strong class="text-green-600">complete</strong> this partial payment?
      </p>

      <div class="text-left text-base space-y-2">
        <p>
          <strong>Name:</strong>
          {{ booking.firstName }} {{ booking.lastName }}
        </p>
        <p><strong>Payment Terms: </strong> {{ booking.paymentTerms }}</p>
        <p>
          <strong>Amount Paid: </strong>{{ formatPeso(booking.amountPaid) }}
        </p>
        <p>
          <strong>Remaining Balance: </strong
          >{{ formatPeso(booking.remainingBalance) }}
        </p>

        <p><strong>Payment Method: </strong> {{ formData.paymentMethod }}</p>
        <p><strong>Sender Name: </strong> {{ formData.senderName }}</p>
        <p>
          <strong>Tendered Amount: </strong>
          {{ formatPeso(formData.tenderedAmount) }}
        </p>
      </div>
    </div>
    <div class="flex justify-center gap-2 mt-6 font-[Poppins] px-4">
      <Button
        type="button"
        label="Back"
        severity="secondary"
        @click="backPay"
        class="font-bold w-full"
      />
      <Button
        type="button"
        label="Pay"
        severity="success"
        @click="confirmPay"
        class="font-bold w-full"
      /></div
  ></Dialog>

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
          :minDate="checkOutMinDate"
          :maxDate="maxDate"
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

      <label>Refund Method:</label>
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

.packEvent,
.cDate,
.atcng,
.dAdd {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.packEvent div,
.cDate div,
.atcng div,
.dAdd div {
  display: flex;
  flex-direction: column;
  width: 40%;
}

.cDate div,
.atcng div {
  width: 26.3%;
}

label {
  display: block;
  text-align: left;
  font-size: 16px;
  font-weight: 400;
  margin-bottom: 10px;
  margin-top: 10px;
}

input {
  padding: 8px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  border-radius: 5px;
}
</style>
