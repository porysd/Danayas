<script setup>
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import Checkbox from "primevue/checkbox";
import { useToast } from "primevue/usetoast";
import { formatPeso } from "../../utility/pesoFormat";

const toast = useToast();
const showMenu = ref(false);
const showCompletedModal = ref(false);
const showRemarksModal = ref(false);
const showFailedModal = ref(false);
const formData = ref({});

const prop = defineProps({
  refund: Object,
  bookingName: Function,
});
const emit = defineEmits(["completedRefund", "failedRefund"]);

const openCompletedModal = () => {
  formData.value = { ...prop.refund };
  showCompletedModal.value = true;
  showMenu.value = false;
};

const openFailedModal = () => {
  formData.value = { ...prop.refund };
  showFailedModal.value = true;
  showMenu.value = false;
};

const closeModals = () => {
  showCompletedModal.value = false;
  showFailedModal.value = false;
  showRemarksModal.value = false;
};

const confirmCompleted = () => {
  const status = {
    ...formData.value,
    refundStatus: "completed",
    // remarks: formData.value.remarks || "Refund Completed",
  };
  emit("completedRefund", status);
  toast.add({
    severity: "success",
    summary: "Refund Completed ",
    detail: "The refund has been completed successfully.",
    life: 3000,
  });
  closeModals();
};

const openRemarksModal = () => {
  formData.value = { ...prop.refund };
  showRemarksModal.value = true;
  showMenu.value = false;
};

const confirmRemarks = () => {
  const remarks = { ...formData.value, remarks: formData.value.remarks };
  emit("completedRefund", remarks);
  toast.add({
    severity: "success",
    summary: "Remark sent",
    detail: "Remarks is sent to the customer.",
    life: 3000,
  });
  closeModals();
};

const confirmFailed = () => {
  const status = {
    ...formData.value,
    refundStatus: "failed",
    // remarks: formData.value.remarks || "Not applicable",
  };
  emit("failedRefund", status);
  toast.add({
    severity: "warn",
    summary: "Refund Failed",
    detail: "The refund has been failed successfully.",
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
          @click="openCompletedModal"
        >
          Completed
        </li>
        <li
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openFailedModal"
        >
          Failed
        </li>
        <li
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openRemarksModal"
        >
          Remarks
        </li>
      </ul>
    </div>
  </div>

  <Dialog
    v-model:visible="showCompletedModal"
    modal
    :style="{ width: '30rem' }"
  >
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">Refund Payment</h2>
      </div>
    </template>

    <div class="space-y-4 font-[Poppins] px-4">
      <p class="text-center text-lg">
        Are you sure you want to
        <strong class="text-green-600">complete</strong> this refund payment?
      </p>

      <div class="text-left text-base space-y-2">
        <p>
          <strong>Name:</strong>
          {{ bookingName(refund) }}
        </p>
        <p>
          <strong>Refund Amount: </strong>{{ formatPeso(refund.refundAmount) }}
        </p>

        <label class="block text-lg mb-2">Refund Method:</label>
        <select
          v-model="formData.refundMethod"
          class="border p-2 rounded w-full"
        >
          <option value="gcash">GCash</option>
          <option value="cash">Cash</option>
        </select>

        <template v-if="formData.refundMethod === 'gcash'">
          <label>GCash Reference No:</label>
          <input class="w-full" v-model="formData.reference" />
          <label>Proof of Payment:</label>
          <input class="w-full" v-model="formData.imageUrl" />
        </template>

        <label>Sender Name:</label>
        <input class="w-full" v-model="formData.senderName" />

        <!--<div class="flex">
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
        </div>-->
      </div>
    </div>

    <div class="flex justify-center gap-2 font-[Poppins] mt-5">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="closeModals"
        class="font-bold w-full"
      />
      <Button
        type="button"
        label="Refund"
        severity="success"
        @click="confirmCompleted"
        class="font-bold w-full"
      />
    </div>
  </Dialog>

  <Dialog v-model:visible="showRemarksModal" modal :style="{ width: '30rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">Refund Payment</h2>
      </div>
    </template>

    <div class="space-y-4 font-[Poppins] px-4">
      <p class="text-center text-lg">
        Add
        <strong class="text-red-600">remarks</strong> to this refund payment?
      </p>

      <div class="text-left text-base space-y-2">
        <p>
          <strong>Name:</strong>
          {{ bookingName(refund) }}
        </p>

        <label>Remarks:</label>
        <input class="w-full" v-model="formData.remarks" />
      </div>
    </div>

    <div class="flex justify-center gap-2 font-[Poppins] mt-5">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="closeModals"
        class="font-bold w-full"
      />
      <Button
        type="button"
        label="Refund"
        severity="success"
        @click="confirmRemarks"
        class="font-bold w-full"
      />
    </div>
  </Dialog>

  <Dialog v-model:visible="showFailedModal" modal :style="{ width: '30rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">Failed Refund</h2>
      </div>
    </template>
    <span
      class="text-lg text-surface-700 dark:text-surface-400 block mb-8 text-center font-[Poppins]"
    >
      Are you sure you want to
      <strong class="text-red-500">FAILED</strong> this refund:
      <span class="font-black font-[Poppins]">{{ refund.refundId }}</span
      >?
    </span>

    <div class="space-y-4 font-[Poppins] px-4">
      <p class="text-center text-lg">
        Are you sure you want to
        <strong class="text-green-600">complete</strong> this refund payment?
      </p>

      <div class="text-left text-base space-y-2">
        <label>Remarks:</label>
        <input class="w-full" v-model="formData.remarks" />
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
        label="Confirm"
        severity="warn"
        @click="confirmFailed"
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
