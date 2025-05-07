<script setup>
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { formatPeso } from "../../utility/pesoFormat";

const toast = useToast();
const showMenu = ref(false);
const showVoidModal = ref(false);
const showPayModal = ref(false);
const formData = ref({});

const prop = defineProps({
  payment: Object,
  bookingName: {
    type: String,
    default: "Unknown",
  },
  showPay: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(["voidPayment", "payPayment"]);
let previousStatus = null;

const openVoidModal = () => {
  formData.value = { ...prop.payment };
  showVoidModal.value = true;
  previousStatus = formData.value.paymentStatus;
  showMenu.value = false;
};

const openPayModal = () => {
  formData.value = { ...prop.payment };
  showPayModal.value = true;
  showMenu.value = false;
};

const closeModals = () => {
  //   showArchiveModal.value = false;
  showVoidModal.value = false;
  showPayModal.value = false;
  // showUpdateModal.value = false;
};

const confirmPay = () => {
  emit("payPayment", formData.value);
  closeModals();
};

const confirmVoid = () => {
  formData.value.paymentStatus = "voided";
  emit("voidPayment", formData.value);
  toast.add({
    severity: "warn",
    summary: "Payment Voided",
    detail: "The payment has been voided successfully.",
    life: 3000,
  });
  closeModals();
};

const revertPayment = () => {
  formData.value.paymentStatus = "valid";
  emit("voidPayment", formData.value);
  toast.add({
    severity: "success",
    summary: "Payment Reverted",
    detail: "The payment has been reverted.",
    life: 3000,
  });
  showMenu.value = false;
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

// const showArchiveModal = ref(false);
// const showUpdateModal = ref(false);

// const openArchiveModal = () => {
//   formData.value = { ...prop.customer };
//   showArchiveModal.value = true;
//   showMenu.value = false;
// };

// const openUpdateModal = () => {
//   formData.value = { ...prop.payment };
//   showUpdateModal.value = true;
//   showMenu.value = false;
// }

// const archiveCustomer = () => {
//   emit('archiveCustomer', formData.value);
//   closeModals();
// };

// const confirmUpdate = () => {
//   emit("updatePayment", formData.value);
//   console.log(formData.value);
//   closeModals();
// };

// const confirmUpdate = () => {
//   const index = payment.value.findIndex(p => p.paymentId === formData.value.paymentId);
//   if (index !== -1) {
//     payment.value[index] = { ...formData.value };
//   }
//   console.log('After Update:', payment.value);
//   emit('updatePayment', formData.value);
//   closeModals();
// };
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
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          v-if="showPay"
          @click="openPayModal"
        >
          Pay
        </li>
        <li
          v-if="payment.paymentStatus !== 'voided'"
          @click="openVoidModal"
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Void
        </li>
        <li
          v-else
          @click="revertPayment"
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Revert
        </li>
      </ul>
    </div>
  </div>

  <Dialog v-model:visible="showVoidModal" modal :style="{ width: '30rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">Void Payment</h2>
      </div>
    </template>
    <span
      class="text-lg text-surface-700 dark:text-surface-400 block mb-8 text-center font-[Poppins]"
    >
      Are you sure you want to
      <strong class="text-red-500">VOID</strong> this payment:
      <span class="font-black font-[Poppins]">{{ payment.paymentId }}</span
      >?
    </span>

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
        label="Void"
        severity="danger"
        @click="confirmVoid"
        class="font-bold w-full"
      />
    </div>
  </Dialog>

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
          {{ bookingName }}
        </p>
        <p><strong>Payment Mode: </strong> {{ payment.mode }}</p>
        <p>
          <strong>Amount Paid: </strong>{{ formatPeso(payment.amountPaid) }}
        </p>
        <p>
          <strong>Remaining Balance: </strong
          >{{ formatPeso(payment.remainingBalance) }}
        </p>
        <label>Sender Name:</label>
        <input class="w-full" v-model="formData.senderName" />
        <label class="block text-lg mb-2">Mode:</label>
        <select v-model="formData.mode" class="border p-2 rounded w-full">
          <option value="gcash">GCash</option>
          <option value="cash">Cash</option>
        </select>

        <template v-if="formData.mode === 'gcash'">
          <label>GCash Reference No:</label>
          <input class="w-full" v-model="formData.reference" />
          <label>Proof of Payment:</label>
          <input class="w-full" v-model="formData.imageUrl" />
        </template>

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
        label="Pay"
        severity="success"
        @click="confirmPay"
        class="font-bold w-full"
      />
    </div>
  </Dialog>

  <Toast />

  <!--<div v-if="showArchiveModal" class="modal-overlay">
    <div class="modal">
      <h2 class="font-black text-2xl mb-10">Are you sure you want to ARCHIVE this user: {{ customer.firstName }} {{ customer.lastName }}</h2>

      <div class="modal-actions-delete">
        <button class="cancelBtn font-bold" @click="closeModals">Cancel</button>
        <button class="saveBtn font-bold" @click="archiveCustomer">Archive</button>
      </div>
    </div>
  </div>-->

  <!--<div v-if="showUpdateModal" class="modal-overlay">
    <div class="modal">
      <h2 class="font-black text-2xl mb-5">Update Payment Status</h2>

      <div class="mb-4">
        <label class="block text-lg font-semibold mb-2">Payment Status</label>
        <select
          v-model="formData.paymentStatus"
          class="border p-2 rounded w-full"
        >
          <option value="pending">Pending</option>
          <option value="partially-paid">Partially Paid</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div class="modal-actions-delete">
        <button class="cancelBtn font-bold" @click="closeModals">Cancel</button>
        <button class="saveBtn font-bold" @click="confirmUpdate">Update</button>
      </div>
    </div>
  </div>-->
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.cancelBtn {
  width: 100px;
  padding: 8px 15px;
  background: #ccc;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.saveBtn {
  width: 100px;
  padding: 8px 15px;
  background: #194d1d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
}

.modal-overlay-delete {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-delete {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  text-align: center;
}

.modal-actions-delete {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.deleteBtn {
  width: 100px;
  padding: 8px 15px;
  background: #d9534f;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
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
