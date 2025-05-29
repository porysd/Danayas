<script setup>
import {
  ref,
  defineProps,
  defineEmits,
  onMounted,
  onUnmounted,
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
import { formatDate } from "../../utility/dateFormat.js";

const toast = useToast();

const showMenu = ref(false);
const showEditModal = ref(false);
const showStatusModal = ref(false);
const showPayModal = ref(false);
const showPaymentModal = ref(false);
const formData = ref({});

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

const openStatusModal = () => {
  formData.value = {
    bookStatus: props.booking.bookStatus || "pending",
    cancelCategory: props.booking.cancelCategory || "",
    cancelReason: props.booking.cancelReason || "",
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

    if (formData.value.bookStatus === "completed") {
      toast.add({
        severity: "success",
        summary: "success",
        detail: "Booking is set to COMPLETED",
        life: 3000,
      });
    }
  }
  console.log("Payload:", formData.value);
  emit("updateStatus", formData.value);
  toast.add({
    severity: "success",
    summary: "Updated Status",
    detail: "Successfully Updated Status",
    life: 3000,
  });
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
      formData.value.checkOutDate = formatDate(date);
    } else {
      formData.value.checkOutDate = checkInDate;
    }
  }
);

const saveChanges = () => {
  formData.value.bookStatus = "rescheduled";
  emit("updateBooking", formData.value);
  toast.add({
    severity: "success",
    summary: "Updated Booking",
    detail: "Successfully Updated Booking",
    life: 3000,
  });
  closeModals();
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
</script>

<template>
  <div class="relative menu-container inline-block">
    <button
      @click.stop="showMenu = !showMenu"
      class="adminButton pi pi-ellipsis-v"
    ></button>

    <div v-if="showMenu && !showAction" ref="hideMenu" class="dropdown-menu">
      <ul>
        <li
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openPayModal"
        >
          Pay
        </li>
        <li
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openStatusModal"
        >
          Status
        </li>
        <li
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openEditModal"
        >
          Update
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
          <input class="w-full" v-model="formData.imageUrl" />
        </template>

        <label>Sender Name:</label>
        <input class="w-full" v-model="formData.senderName" />

        <div class="flex">
          <div class="w-[100%]">
            <label>Tendered Amount:</label>
            <input
              class="w-full"
              v-model.number="formData.tenderedAmount"
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
          UPDATE BOOKING NO. {{ booking.bookingId }} by {{ booking.firstName }}
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
          dateFormat="mm-dd-yy"
        />
      </div>
      <div>
        <label>Check-Out Date:</label>
        <DatePicker
          v-model="formData.checkOutDate"
          placeholder="Check-Out"
          showIcon
          fluid
          iconDisplay="input"
          dateFormat="mm-dd-yy"
        />
      </div>
      <div>
        <label>Mode:</label>
        <input
          class="cDates"
          v-model="formData.mode"
          placeholder="Mode"
          disabled
        />
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
