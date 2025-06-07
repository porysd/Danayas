<script setup>
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { formatDate, formatDates } from "../../utility/dateFormat";
import { useToast } from "primevue/usetoast";
import DatePicker from "primevue/datepicker";

const toast = useToast();

const showMenu = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const formData = ref({});

const props = defineProps(["blocks"]);
const emit = defineEmits(["updateBlocked", "deleteBlocked"]);

const openEditModal = () => {
  formData.value = { ...props.blocks };
  showEditModal.value = true;
  showMenu.value = false;
};

const openDeleteModal = () => {
  formData.value = { ...props.blocks };
  showDeleteModal.value = true;
  showMenu.value = false;
};

const closeModals = () => {
  showEditModal.value = false;
  showDeleteModal.value = false;
  showDisableModal.value = false;
};

const confirmEdit = () => {
  emit("updateBlocked", formData.value);
  toast.add({
    severity: "success",
    summary: "Updated blocks",
    detail: "Successfully Updated blocks",
    life: 3000,
  });
  closeModals();
};

const confirmDelete = () => {
  emit("deleteBlocked", formData.value);
  toast.add({
    severity: "success",
    summary: "Deleted blocks",
    detail: "Successfully Deleted blocks",
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
          @click="openEditModal"
        >
          Update
        </li>
        <li
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openDeleteModal"
        >
          Delete
        </li>
      </ul>
    </div>
    <Dialog v-model:visible="showEditModal" modal :style="{ width: '25rem' }">
      <template #header>
        <div class="flex flex-col items-center justify-center w-full">
          <h2 class="text-2xl font-bold font-[Poppins]">EDIT BLOCKED DATES:</h2>
        </div>
      </template>

      <div class="packageDetails">
        <div class="addPack flex flex-col justify-center m-auto content-center">
          <div class="addPackInput">
            <label>Blocked Date:</label>
            <DatePicker
              v-model="formData.blockedDates"
              placeholder="Block Date"
              showIcon
              fluid
              iconDisplay="input"
              dateFormat="mm-dd-yy"
            />
          </div>
          <div class="addPackInput">
            <div>
              <label>Category:</label>
              <select v-model="formData.category" placeholder="Add Ons Name">
                <option value="maintenance">Maintenance</option>
                <option value="holiday">Holiday</option>
                <option value="internal-use">Internal Use</option>
                <option value="natural-disaster">Natural Disaster</option>
                <option value="others">others</option>
              </select>
            </div>
            <div>
              <template v-if="formData.category === 'others'">
                <label>Others:</label>
                <input
                  v-model="formData.others"
                  placeholder="Please specify ..."
                />
              </template>
            </div>
          </div>
          <div class="addPackInput">
            <div>
              <label>Status:</label>
              <select v-model="formData.status" placeholder="Add Ons Name">
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
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
          severity="primary"
          @click="confirmEdit"
          class="font-bold w-full"
        />
      </div>
    </Dialog>

    <Dialog v-model:visible="showDeleteModal" modal :style="{ width: '30rem' }">
      <template #header>
        <div class="flex flex-col items-center justify-center w-full">
          <h2 class="text-xl font-bold font-[Poppins]">Delete Blocked Dates</h2>
        </div>
      </template>

      <span
        class="text-lg text-surface-700 dark:text-surface-400 block mb-8 text-center font-[Poppins]"
      >
        Are you sure you want to
        <strong class="text-red-500">DELETE</strong> this Blocked Date:
        <span class="font-black font-[Poppins]"
          >{{ formatDates(blocks.blockedDates) }} : {{ blocks.category }}</span
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
          label="Delete"
          severity="danger"
          @click="confirmDelete"
          class="font-bold w-full"
        />
      </div>
    </Dialog>
    <Toast />
  </div>
</template>

<style scoped>
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
.addPack {
  gap: 10px;
}

.addPack input {
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #fcfcfc;
  border-radius: 5px;
  height: 40px;
}

.addPack div {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
