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
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import DatePicker from "primevue/datepicker";
import Checkbox from "primevue/checkbox";
import Textarea from "primevue/textarea";
import { formatPeso } from "../../utility/pesoFormat.js";
import {
  formatDate,
  formatDates,
  formatDateISO,
} from "../../utility/dateFormat.js";
import { useBookingStore } from "../../stores/bookingStore.js";
import { usePublicEntryStore } from "../../stores/publicEntryStore.js";
import { useBlockedStore } from "../../stores/blockedDateStore.js";
import {
  getBookingStyle,
  disabledDates,
} from "../../composables/calendarStyle";
import FileUpload from "primevue/fileupload";
import InputNumber from "primevue/inputnumber";

const toast = useToast();

const showMenu = ref(false);
const showEditModal = ref(false);
const showStatusModal = ref(false);
const showPayModal = ref(false);
const showCancelModal = ref(false);
const showPaymentModal = ref(false);
const showExcess = ref(false);

const formData = ref({});

const bookingStore = useBookingStore();
const publicStore = usePublicEntryStore();
const blockStore = useBlockedStore();
// onMounted(() => {
//   bookingStore.fetchUserBookings();
//   publicStore.fetchAllPublic();
//   blockStore.fetchAllBlocked();
// });

const props = defineProps(["booking", "packageName", "payment", "showAction"]);
const emit = defineEmits([
  "updateBooking",
  "deleteBooking",
  "updateStatus",
  "payPayment",
]);

const openEditModal = () => {
  formData.value = { ...props.booking, packageName: props.packageName };
  showEditModal.value = true;
  showMenu.value = false;
};

const openExcessModal = () => {
  formData.value = { ...props.booking };
  showExcess.value = true;
  showMenu.value = false;
};

const openStatusModal = () => {
  formData.value = {
    bookStatus: props.booking.bookStatus || "pending",
    cancelCategory: props.booking.cancelCategory || "",
    cancelReason: props.booking.cancelReason || "",
    refundMethod: props.booking.refundMethod || "",
    receiveName: props.booking.receiveName || "",
    ...props.booking,
  };
  showStatusModal.value = true;
  showMenu.value = false;
};

const closeModals = () => {
  showEditModal.value = false;
  showStatusModal.value = false;
  showPayModal.value = false;
  showPaymentModal.value = false;
  showExcess.value = false;
  showCancelModal.value = false;
};

const confirmStatusUpdate = () => {
  if (
    formData.value.bookStatus === "cancelled" ||
    formData.value.bookStatus === "pending-cancellation"
  ) {
    if (!formData.value.cancelCategory || !formData.value.cancelReason) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Cancel Category and Cancel Reason is required",
        life: 3000,
      });
      return;
    }

    if (formData.value.bookStatus === "pending-cancellation") {
      if (!formData.value.refundMethod) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Refund Method is required",
          life: 3000,
        });
        return;
      }
      if (
        formData.value.refundMethod === "cash" &&
        !formData.value.receiveName
      ) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Receiver Name is required on cash",
          life: 3000,
        });
        return;
      } else {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Proof of Payment is required on Gcash",
          life: 3000,
        });
      }
    }
  }

  if (formData.value.bookStatus === "completed") {
    if (formData.value.bookingPaymentStatus !== "paid") {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Booking should be paid to be completed",
        life: 3000,
      });
      return;
    } else {
      toast.add({
        severity: "success",
        summary: "Success",
        detail: "Booking is set to COMPLETED",
        life: 3000,
      });
    }
  }

  emit("updateStatus", formData.value);
  closeModals();
};

watch(
  () => [formData.value.checkInDate, formData.value.mode],
  ([checkInDate, mode]) => {
    if (!checkInDate) {
      formData.value.checkOutDate = "";
      return;
    }
    const date = new Date(checkInDate);
    if (mode === "night-time" || mode === "whole-day") {
      date.setDate(date.getDate() + 1);
      formData.value.checkOutDate = date;
    } else {
      formData.value.checkOutDate = checkInDate;
    }
  }
);

const saveChanges = () => {
  try {
    console.log("Saving booking with mode:", formData.value.mode);
    formData.value.bookStatus = "rescheduled";
    emit("updateBooking", formData.value);
    toast.add({
      severity: "success",
      summary: "Updated Booking",
      detail: "Successfully Updated Booking",
      life: 3000,
    });
    closeModals();
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Update Failed",
      detail: "Failed to update booking. Please try again.",
      life: 3000,
    });
  }
};

const addExcess = () => {
  try {
    formData.value.bookStatus = "reserved";
    formData.value.bookingPaymentStatus = "partially-paid";
    console.log("Emitting updateBooking with:", formData.value);
    emit("updateBooking", formData.value);
    toast.add({
      severity: "success",
      summary: "Updated Booking",
      detail: "Successfully Updated Booking",
      life: 3000,
    });
    closeModals();
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Update Failed",
      detail: "Failed to update booking. Please try again.",
      life: 3000,
    });
  }
};

const openPayModal = () => {
  formData.value = { ...props.payment };
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
  emit("payPayment", formData.value);
  closeModals();
};

const isExact = ref(false);

watch(isExact, (e) => {
  if (e) {
    formData.value.tenderedAmount = props.booking.remainingBalance;
  } else {
    formData.value.tenderedAmount = null;
  }
});

const openCancelModal = () => {
  formData.value = { ...props.booking };
  showCancelModal.value = true;
  showMenu.value = false;
};

const confirmCancel = () => {
  formData.value.bookStatus = "cancelled";
  emit("updateStatus", formData.value);
  toast.add({
    severity: "success",
    summary: "Booking Cancelled",
    detail: "Successfully Cancelled the Booking",
    life: 3000,
  });
  closeModals();
};

const hideMenu = ref(false);

const closeMenu = (event) => {
  if (hideMenu.value && !hideMenu.value.contains(event.target)) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeMenu);
});

onUnmounted(() => {
  document.addEventListener("click", closeMenu);
});

const minDate = new Date();

const checkOutMinDate = computed(() => {
  if (!formData.value.checkInDate) return minDate;
  const checkIn = new Date(formData.value.checkInDate);
  if (
    formData.value.mode === "night-time" ||
    formData.value.mode === "whole-day"
  ) {
    const nextDay = new Date(checkIn);
    nextDay.setDate(checkIn.getDate() + 1);
    return nextDay;
  }
  return checkIn;
});

const maxDate = computed(() => {
  if (!formData.value.checkInDate) return null;

  const checkIn = new Date(formData.value.checkInDate);

  if (
    formData.value.mode === "night-time" ||
    formData.value.mode === "whole-day"
  ) {
    const nextDay = new Date(checkIn);
    nextDay.setDate(checkIn.getDate() + 1);
    return nextDay;
  }

  return checkIn;
});

const allowedStatus = ["reserved", "pending", "rescheduled"];

const unavailableModes = computed(() => {
  const date = formData.value.checkInDate;
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

const availableModes = computed(() => {
  const allModes = [
    { value: "day-time", label: "Day Time" },
    { value: "night-time", label: "Night Time" },
    { value: "whole-day", label: "Whole Day" },
  ];
  return allModes.filter((mode) => !unavailableModes.value.has(mode.value));
});

const onFileSelect = (event) => {
  const file = event.files[0];
  if (file) {
    formData.value.imageUrl = file;
  }
};
</script>

<template>
  <div class="relative menu-container inline-block">
    <button
      @click.stop="showMenu = !showMenu"
      class="adminButton pi pi-ellipsis-v"
    ></button>

    <div v-if="showMenu" ref="hideMenu" class="dropdown-menu">
      <ul>
        <li
          v-if="!showAction"
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openPayModal"
        >
          Pay
        </li>
        <li
          v-if="!showAction"
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openStatusModal"
        >
          Status
        </li>
        <li
          v-if="!showAction"
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openEditModal"
        >
          Reschedule
        </li>
        <li
          v-if="!showAction"
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openExcessModal"
        >
          Excess
        </li>
        <li
          v-if="showAction"
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openCancelModal"
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
        <label class="block text-lg mb-2">Payment Method:</label>
        <select
          v-model="formData.paymentMethod"
          class="border p-2 rounded w-full"
        >
          <option value="gcash">GCash</option>
          <option value="cash">Cash</option>
        </select>

        <template v-if="formData.paymentMethod === 'gcash'">
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
        </template>

        <label>Sender Name:</label>
        <input class="w-full" v-model="formData.senderName" />

        <div class="flex">
          <div class="w-[100%]">
            <label>Tendered Amount:</label>
            <!-- <input
              class="w-full"
              v-model.number="formData.tenderedAmount"
              :disabled="isExact"
            /> -->
            <InputNumber
              class="w-full"
              placeholder="e.g. 2000"
              inputId="currency-php"
              mode="currency"
              currency="PHP"
              locale="en-PH"
              v-model="formData.tenderedAmount"
              :disabled="isExact"
            />
          </div>
          <div class="flex flex-col items-center gap-2.5">
            <label>Exact?</label>
            <Checkbox binary v-model="isExact" />
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

        <p>
          <strong>Change: </strong>
          {{ formatPeso(formData.tenderedAmount - formData.remainingBalance) }}
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

  <Dialog v-model:visible="showStatusModal" modal :style="{ width: '30rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">Update Booking Status</h2>
      </div>
    </template>

    <div class="mb-4">
      <label class="block text-lg font-semibold mb-2">Booking Status</label>
      <select v-model="formData.bookStatus" class="border p-2 rounded w-full">
        <option value="completed">Completed</option>
        <option value="pending-cancellation">Pending Cancellation</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <div>
        <template
          v-if="
            formData.bookStatus === 'pending-cancellation' ||
            formData.bookStatus === 'cancelled'
          "
        >
          <label>Cancel Category:</label>
          <select
            v-model="formData.cancelCategory"
            class="border p-2 rounded w-full"
            required
          >
            <option value="natural-disaster">Natural Disaster</option>
            <option value="others">Others:</option>
          </select>
          <label>Reason for Cancellation:</label>
          <Textarea
            class="w-full"
            v-model="formData.cancelReason"
            autoResize
            rows="3"
            cols="30"
            placeholder="Please provide a message or link(if natural disaster)"
          />

          <label>Refund Method:</label>
          <select
            v-model="formData.refundMethod"
            class="border p-2 rounded w-full"
            required
          >
            <option value="gcash">GCash</option>
            <option value="cash">Cash</option>
          </select>

          <template v-if="formData.refundMethod === 'cash'">
            <div class="flex flex-col">
              <label>Receiver Name:</label>
              <InputText v-model="formData.receiveName" />
            </div>
          </template>
        </template>
      </div>
    </div>

    <div class="flex justify-center gap-2 font-[Poppins]">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="closeModals"
        class="font-bold w-full"
      />
      <Button
        type="button"
        label="Save"
        severity="primary"
        @click="confirmStatusUpdate"
        class="font-bold w-full"
      />
    </div>
  </Dialog>

  <Dialog
    v-model:visible="showEditModal"
    modal
    :style="{ width: '60rem', minHeight: '30rem' }"
  >
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">
          RESCHEDULE BOOKING NO. {{ booking.bookingId }} by
          {{ booking.firstName }}
          {{ booking.lastName }}
        </h2>
      </div>
    </template>

    <div class="packEvent">
      <div>
        <label>Package Name:</label>
        <input
          class="packEvents"
          v-model="formData.packageName"
          placeholder="Package Name"
          disabled
        />
      </div>
      <div>
        <label>Event Type:</label>
        <input
          class="packEvents"
          v-model="formData.eventType"
          placeholder="Event Type"
          disabled
        />
      </div>
    </div>

    <div class="cDate">
      <div>
        <label>Check-In Date:</label>
        <DatePicker
          v-model="formData.checkInDate"
          placeholder="Check-In"
          showIcon
          fluid
          iconDisplay="input"
          dateFormat="mm/dd/yy"
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
        <label>Check-Out Date:</label>
        <DatePicker
          v-model="formData.checkOutDate"
          placeholder="Check-Out"
          showIcon
          fluid
          iconDisplay="input"
          dateFormat="mm/dd/yy"
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
      <div>
        <label>Mode:</label>

        <select v-model="formData.mode" class="border p-2 rounded w-full">
          <option
            v-for="mode in availableModes"
            :key="mode.value"
            :value="mode.value"
          >
            {{ mode.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="atcng">
      <div>
        <label>Arrival Time:</label>
        <input
          class="atcngs"
          v-model="formData.arrivalTime"
          placeholder="Arival Time"
          disabled
        />
      </div>
      <div>
        <label>Catering:</label>
        <select
          v-model="formData.catering"
          placeholder="Catering"
          class="border p-2 rounded w-full"
          disabled
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
      <div>
        <label>Number of Guest:</label>
        <input
          class="atcngs"
          type="number"
          v-model="formData.numberOfGuest"
          placeholder="Number of Guest"
          disabled
        />
      </div>
    </div>

    <div class="dAdd">
      <div>
        <label>Discount:</label>
        <input
          class="dAdds"
          v-model="formData.discountId"
          placeholder="Discount"
          disabled
        />
      </div>
      <div>
        <label>Add Ons:</label>
        <input
          class="dAdds"
          v-model="formData.bookingAddOn"
          placeholder="Add Ons"
          disabled
        />
      </div>
    </div>

    <div class="flex justify-center gap-2 font-[Poppins] mt-10">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="closeModals"
        class="font-bold w-full"
      />
      <Button
        type="button"
        label="Save"
        severity="primary"
        @click="saveChanges"
        class="font-bold w-full"
      />
    </div>
  </Dialog>

  <Dialog v-model:visible="showExcess" modal :style="{ width: '30rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">
          Excess Guest or Add Ons Payment
        </h2>
      </div>
    </template>

    <div class="space-y-4 font-[Poppins] px-4">
      <p class="text-center text-lg">
        Please confirm the updated
        <strong class="text-orange-600">number of guest or new add ons</strong>
        and complete the payment for any excess
      </p>

      <div class="text-left text-base space-y-2">
        <p>
          <strong>Name:</strong>
          {{ booking.firstName }} {{ booking.lastName }}
        </p>

        <label>Number of Guest:</label>
        <input
          class="atcngs w-full"
          type="number"
          v-model="formData.numberOfGuest"
          placeholder="Number of Guest"
        />
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
        @click="addExcess"
        class="font-bold w-full"
      />
    </div>
  </Dialog>

  <Dialog v-model:visible="showCancelModal" modal :style="{ width: '30rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">Cancel Booking</h2>
      </div>
    </template>

    <span
      class="text-lg text-surface-700 dark:text-surface-400 block mb-8 text-center font-[Poppins]"
    >
      Are you sure you want to
      <strong class="text-red-500">CANCEL</strong> this Booking by
      <span class="font-black font-[Poppins]">
        {{ booking.firstName }} {{ booking.lastName }}</span
      >?
    </span>

    <div class="mb-4">
      <div>
        <label>Cancel Category:</label>
        <select
          v-model="formData.cancelCategory"
          class="border p-2 rounded w-full"
          required
        >
          <option value="natural-disaster">Natural Disaster</option>
          <option value="others">Others:</option>
        </select>
        <label>Reason for Cancellation:</label>
        <Textarea
          class="w-full"
          v-model="formData.cancelReason"
          autoResize
          rows="3"
          cols="30"
          placeholder="Please provide a message or link(if natural disaster)"
        />
      </div>
    </div>

    <div class="flex justify-center gap-2 font-[Poppins]">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="closeModals"
        class="font-bold w-full"
      />
      <Button
        type="button"
        label="Save"
        severity="primary"
        @click="confirmCancel"
        class="font-bold w-full"
      />
    </div>
  </Dialog>

  <Toast />
</template>

<style scoped>
.adminButton {
  border: none;
  border-radius: 5px;
  padding: 5px;
  cursor: pointer;
  background: transparent;
}

.dropdown-menu {
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

.dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-menu li {
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
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
