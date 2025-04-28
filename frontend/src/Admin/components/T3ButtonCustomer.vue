<script setup>
import { ref, defineProps, defineEmits, onUnmounted, onMounted } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const showMenu = ref(false);
const showArchiveModal = ref(false);
const showDisableModal = ref(false);
const showEnableModal = ref(false);
const formData = ref({});

const prop = defineProps(["customer"]);
const emit = defineEmits([
  "archiveCustomer",
  "disableCustomer",
  "enableCustomer",
]);

const openArchiveModal = () => {
  formData.value = { ...prop.customer };
  showArchiveModal.value = true;
  showMenu.value = false;
};

const openDisableModal = () => {
  formData.value = { ...prop.customer };
  showDisableModal.value = true;
  showMenu.value = false;
};

const openEnableModal = () => {
  formData.value = { ...prop.customer };
  showEnableModal.value = true;
  showMenu.value = false;
};

const closeModals = () => {
  showArchiveModal.value = false;
  showDisableModal.value = false;
  showEnableModal.value = false;
};

const archiveCustomer = () => {
  emit("archiveCustomer", formData.value);
  toast.add({
    severity: "warn",
    summary: "Archive",
    detail: "Archived User",
    life: 3000,
  });
  closeModals();
};

const confirmDisable = () => {
  emit("disableCustomer", formData.value);
  toast.add({
    severity: "error",
    summary: "Disable",
    detail: "Disable User",
    life: 3000,
  });
  closeModals();
};

const enableUser = () => {
  emit("enableCustomer", formData.value);
  toast.add({
    severity: "success",
    summary: "Enabled",
    detail: "Successfully Enabled a User",
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
          @click="openArchiveModal"
        >
          Archive
        </li>
        <li
          v-if="customer.status !== 'disable'"
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openDisableModal"
        >
          Disable
        </li>
        <li
          v-else
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openEnableModal"
        >
          Enable
        </li>
      </ul>
    </div>
  </div>

  <Dialog v-model:visible="showArchiveModal" modal :style="{ width: '30rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">Archive User</h2>
      </div>
    </template>

    <span
      class="text-lg text-surface-700 dark:text-surface-400 block mb-8 text-center font-[Poppins]"
    >
      Are you sure you want to
      <strong class="text-orange-500">ARCHIVE</strong> this user:
      <span class="font-black font-[Poppins]"
        >{{ customer.firstName }} {{ customer.lastName }}</span
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
        label="Archive"
        severity="warn"
        @click="archiveCustomer"
        class="font-bold w-full"
      />
    </div>
  </Dialog>

  <Dialog v-model:visible="showDisableModal" modal :style="{ width: '30rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">Disable User</h2>
      </div>
    </template>

    <span
      class="text-lg text-surface-700 dark:text-surface-400 block mb-8 text-center font-[Poppins]"
    >
      Are you sure you want to
      <strong class="text-red-500">DISABLE</strong> this user:
      <span class="font-black font-[Poppins]"
        >{{ customer.firstName }} {{ customer.lastName }}</span
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
        label="Disable"
        severity="danger"
        @click="confirmDisable"
        class="font-bold w-full"
      />
    </div>
  </Dialog>

  <Dialog v-model:visible="showEnableModal" modal :style="{ width: '30rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">Enable User</h2>
      </div>
    </template>

    <span
      class="text-lg text-surface-700 dark:text-surface-400 block mb-8 text-center font-[Poppins]"
    >
      Are you sure you want to
      <strong class="text-green-500">ENABLE</strong> this user:
      <span class="font-black font-[Poppins]"
        >{{ customer.firstName }} {{ customer.lastName }}</span
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
        label="Enable"
        severity="success"
        @click="enableUser"
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
</style>
