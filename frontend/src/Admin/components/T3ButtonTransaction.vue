<script setup>
import { ref, defineProps, defineEmits } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const showMenu = ref(false);
const showVoidModal = ref(false);
const formData = ref({});

// const showArchiveModal = ref(false);
// const showUpdateModal = ref(false);

const prop = defineProps(["payment"]);
const emit = defineEmits(["voidPayment"]);
let previousStatus = null;

const openVoidModal = () => {
  formData.value = { ...prop.payment };
  showVoidModal.value = true;
  previousStatus = formData.value.paymentStatus;
  showMenu.value = false;
};

const closeModals = () => {
  //   showArchiveModal.value = false;
  showVoidModal.value = false;
  // showUpdateModal.value = false;
};
const confirmVoid = () => {
  formData.value.paymentStatus = "failed";
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
  formData.value.paymentStatus = previousStatus;
  emit("voidPayment", formData.value);
  toast.add({
    severity: "success",
    summary: "Payment Reverted",
    detail: "The payment has been reverted.",
    life: 3000,
  });
  showMenu.value = false;
};

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

    <div v-if="showMenu" class="dropdown-menu">
      <ul>
        <li>Pay</li>
        <li v-if="payment.paymentStatus !== 'failed'" @click="openVoidModal">
          Void
        </li>
        <li v-else @click="revertPayment">Revert</li>
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
  background: #fcf5f5;
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

.dropdown-menu li:hover {
  background: #555;
  color: #fcf5f5;
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
</style>
