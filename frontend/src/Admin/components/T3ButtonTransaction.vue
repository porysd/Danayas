<script setup>
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import Checkbox from "primevue/checkbox";
import { useToast } from "primevue/usetoast";
import { formatPeso } from "../../utility/pesoFormat";
import InputOtp from "primevue/inputotp";
import { usePinStore } from "../../stores/pinStore";

const toast = useToast();
const showMenu = ref(false);
const showVoidModal = ref(false);
const showValidModal = ref(false);
const showInvalidModal = ref(false);
const showRefractorModal = ref(false);
const formData = ref({});

const pinStore = usePinStore();

const prop = defineProps({
  payment: Object,
  paymentName: Function,
  showAction: true,
});
const emit = defineEmits([
  "voidPayment",
  "validPayment",
  "invalidPayment",
  "refractorPayment",
]);

const openVoidModal = () => {
  formData.value = { ...prop.payment };
  showVoidModal.value = true;
  previousStatus = formData.value.paymentStatus;
  showMenu.value = false;
};

const openValidModal = () => {
  formData.value = { ...prop.payment };
  showValidModal.value = true;
  showMenu.value = false;
};

const openInvalidModal = () => {
  formData.value = { ...prop.payment };
  showInvalidModal.value = true;
  showMenu.value = false;
};

const showOtp = ref(false);
const value = ref("");

const openOtp = () => {
  showOtp.value = true;
  showMenu.value = false;
};

const verifyOtp = async () => {
  formData.value = { ...prop.payment };
  if (!/^\d{6}$/.test(value.value)) {
    toast.add({
      severity: "error",
      summary: "Invalid PIN",
      detail: "PIN must be 6 digits.",
      life: 3000,
    });
    return;
  }
  try {
    const result = await pinStore.verifyPin(value.value);
    if (result) {
      showRefractorModal.value = true;
      showOtp.value = false;
    } else {
      toast.add({
        severity: "error",
        summary: "Invalid PIN",
        detail: "The PIN you entered is incorrect.",
        life: 3000,
      });
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "PIN Verification Failed",
      detail: err.message,
      life: 3000,
    });
  }
};

const confirmOverride = () => {
  emit("refractorPayment", formData.value);
  toast.add({
    severity: "success",
    summary: "Refractored Amount",
    detail: "The tendered amount has been refractor successfully.",
    life: 3000,
  });
  closeModals();
};

const closeModals = () => {
  showVoidModal.value = false;
  showValidModal.value = false;
  showInvalidModal.value = false;
  showRefractorModal.value = false;
  showOtp.value = false;
};

const confirmValid = () => {
  const status = {
    ...formData.value,
    paymentStatus: "valid",
  };
  emit("validPayment", status);
  toast.add({
    severity: "success",
    summary: "Payment Valid",
    detail: "The payment has been valid successfully.",
    life: 3000,
  });
  closeModals();
};

const confirmInvalid = () => {
  const status = {
    ...formData.value,
    paymentStatus: "invalid",
    remarks: formData.value.remarks || "Marked as invalid",
  };
  emit("invalidPayment", status);
  toast.add({
    severity: "warn",
    summary: "Payment Invalid",
    detail: "The payment has been invalid successfully.",
    life: 3000,
  });
  closeModals();
};

const confirmVoid = () => {
  const status = {
    ...formData.value,
    paymentStatus: "voided",
    remarks: formData.value.remarks || "Marked are void",
  };
  emit("voidPayment", status);
  toast.add({
    severity: "danger",
    summary: "Payment Voided",
    detail: "The payment has been voided successfully.",
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
          @click="openValidModal"
        >
          Valid
        </li>
        <li
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openInvalidModal"
        >
          Invalid
        </li>
        <li
          @click="openVoidModal"
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Void
        </li>
        <li
          v-if="showAction"
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openOtp"
        >
          Refractor
        </li>
        <!-- <li
          v-else
          @click="revertPayment"
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Revert
        </li> -->
      </ul>
    </div>
  </div>

  <Dialog v-model:visible="showValidModal" modal :style="{ width: '30rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">Valid Payment</h2>
      </div>
    </template>
    <span
      class="text-lg text-surface-700 dark:text-surface-400 block mb-8 text-center font-[Poppins]"
    >
      Are you sure you want to
      <strong class="text-green-500">VALID</strong> this payment by
      <span class="font-black font-[Poppins]">{{ paymentName(payment) }}</span
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
        label="Valid"
        severity="success"
        @click="confirmValid"
        class="font-bold w-full"
      />
    </div>
  </Dialog>

  <Dialog v-model:visible="showInvalidModal" modal :style="{ width: '30rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">Invalid Payment</h2>
      </div>
    </template>
    <span
      class="text-lg text-surface-700 dark:text-surface-400 block mb-8 text-center font-[Poppins]"
    >
      Are you sure you want to
      <strong class="text-orange-500">INVALID</strong> this payment:
      <span class="font-black font-[Poppins]">{{ paymentName(payment) }}</span
      >?
    </span>

    <div class="text-left text-base space-y-2 mb-5">
      <label>Remarks:</label>
      <input class="w-full" v-model="formData.remarks" />
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
        label="Invalid"
        severity="warn"
        @click="confirmInvalid"
        class="font-bold w-full"
      />
    </div>
  </Dialog>

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
      <span class="font-black font-[Poppins]">{{ paymentName(payment) }}</span
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

  <Dialog
    v-model:visible="showOtp"
    modal
    :style="{ width: '30rem' }"
    class="rounded-xl shadow-md"
  >
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2
          class="text-2xl font-bold font-[Poppins] text-gray-800 dark:text-white"
        >
          Enter PIN
        </h2>
      </div>
    </template>

    <p
      class="text-lg text-center text-surface-700 dark:text-surface-300 mb-6 font-[Poppins] px-4"
    >
      Please confirm if you want to
      <strong class="text-green-500">validate</strong> this payment.
    </p>

    <div class="flex justify-center mb-6">
      <InputOtp v-model="value" :length="6" mask />
    </div>

    <div class="flex justify-center gap-4 px-4">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="closeModals"
        class="font-bold w-full font-[Poppins]"
      />
      <Button
        type="button"
        label="Submit"
        severity="success"
        @click="verifyOtp"
        class="font-bold w-full font-[Poppins]"
      />
    </div>
  </Dialog>

  <Dialog
    v-model:visible="showRefractorModal"
    modal
    :style="{ width: '30rem' }"
  >
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">
          Refractor Tendered Amount
        </h2>
      </div>
    </template>

    <div class="space-y-4 font-[Poppins] px-4">
      <p class="text-center text-lg">
        Please enter new
        <strong class="text-green-600">tendered amount</strong> for this
        payment?
      </p>

      <div class="text-left text-base space-y-2">
        <div class="flex flex-col">
          <div class="w-[100%]">
            <label>Tendered Amount:</label>
            <input class="w-full" v-model.number="formData.tenderedAmount" />
          </div>
          <div class="w-[100%]">
            <label>Remarks:</label>
            <input class="w-full" v-model.number="formData.remarks" />
          </div>
        </div>
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
        @click="confirmOverride"
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
