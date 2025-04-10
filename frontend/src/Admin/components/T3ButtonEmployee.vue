<script setup>
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from "vue";
import ToggleSwitch from "primevue/toggleswitch";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const showMenu = ref(false);
const hideMenu = ref(false);
const showArchiveModal = ref(false);
const showDeleteModal = ref(false);
const showRoleModel = ref(false);
const formData = ref({});

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

const prop = defineProps(["employee"]);
const emit = defineEmits(["archiveEmployee", "deleteEmployee", "changeRole"]);

const openArchiveModal = () => {
  formData.value = { ...prop.employee };
  showArchiveModal.value = true;
  showMenu.value = false;
};

const openDeleteModal = () => {
  formData.value = { ...prop.employee };
  showDeleteModal.value = true;
  showMenu.value = false;
};

const openRoleModal = () => {
  formData.value = { ...prop.employee };
  showRoleModel.value = true;
  showMenu.value = false;
};

const closeModals = () => {
  showArchiveModal.value = false;
  showDeleteModal.value = false;
  showRoleModel.value = false;
};

const archiveEmployee = () => {
  emit("archiveEmployee", formData.value);
  toast.add({
    severity: "warn",
    summary: "Archive",
    detail: "Archived User",
    life: 3000,
  });
  closeModals();
};

const confirmDisable = () => {
  emit("deleteEmployee", formData.value);
  toast.add({
    severity: "error",
    summary: "Disable",
    detail: "Disable User",
    life: 3000,
  });
  closeModals();
};

const changeRole = () => {
  emit("changeRole", formData.value);
  closeModals();
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
        <li @click="openRoleModal">Roles</li>
        <li @click="openArchiveModal">Archive</li>
        <li @click="openDeleteModal">Disable</li>
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
        >{{ employee.firstName }} {{ employee.lastName }}</span
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
        @click="archiveEmployee"
        class="font-bold w-full"
      />
    </div>
  </Dialog>

  <Dialog v-model:visible="showDeleteModal" modal :style="{ width: '30rem' }">
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
        >{{ employee.firstName }} {{ employee.lastName }}</span
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

  <Dialog v-model:visible="showRoleModel" modal :style="{ width: '60rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-2xl font-bold font-[Poppins]">ROLE SETTINGS</h2>
      </div>
    </template>

    <div class="text-lg font-[Poppins] text-center mb-9">
      Employee Name:
      <span class="font-black"
        >{{ employee.firstName }} {{ employee.lastName }}</span
      >
    </div>

    <div
      class="text-xl font-black w-[90%] text-left m-auto font-[Poppins] mb-10"
    >
      Permissions:
    </div>

    <div class="role-container">
      <div class="role1">
        <label class="switch">
          Authorization
          <ToggleSwitch v-model="checked" />
        </label>

        <label class="switch">
          Employee Management
          <ToggleSwitch v-model="checked" />
        </label>

        <label class="switch">
          Packages and Promos
          <ToggleSwitch v-model="checked" />
        </label>

        <label class="switch">
          Discount and Add Ons
          <ToggleSwitch v-model="checked" />
        </label>
      </div>

      <div class="role2">
        <label class="switch">
          Content Management
          <ToggleSwitch v-model="checked" />
        </label>

        <label class="switch">
          Booking Management
          <ToggleSwitch v-model="checked" />
        </label>

        <label class="switch">
          Transaction
          <ToggleSwitch v-model="checked" />
        </label>
      </div>
    </div>

    <div class="flex justify-center gap-2 mt-6">
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
        @click="changeRole"
        class="font-bold w-full"
        severity="primary"
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

.role-container {
  display: flex;
  justify-content: space-between;
  margin: auto;
  gap: 70px;
  width: 90%;
  margin-bottom: 50px;
}

.role1,
.role2 {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.switch input {
  margin-left: auto;
}
</style>
