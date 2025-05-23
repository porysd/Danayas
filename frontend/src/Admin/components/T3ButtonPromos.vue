<script setup>
import { ref, defineProps, defineEmits } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import Textarea from "primevue/textarea";
import { useToast } from "primevue/usetoast";
import FileUpload from "primevue/fileupload";

const toast = useToast();

const showMenu = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showDisableModal = ref(false);
const formData = ref({});

const props = defineProps(["packageT"]);
const emit = defineEmits(["updatePackage", "deletePackage", "disablePackage"]);

const openEditModal = () => {
  formData.value = { ...props.packageT };
  showEditModal.value = true;
  showMenu.value = false;
};

const openDeleteModal = () => {
  formData.value = { ...props.packageT };
  showDeleteModal.value = true;
  showMenu.value = false;
};

const openDisableModal = () => {
  formData.value = { ...props.packageT };
  showDisableModal.value = true;
  showMenu.value = false;
};

const closeModals = () => {
  showEditModal.value = false;
  showDeleteModal.value = false;
  showDisableModal.value = false;
};

const confirmEditPackage = () => {
  emit("updatePackage", formData.value);
  toast.add({
    severity: "success",
    summary: "Updated Package",
    detail: "Successfully Updated Package",
    life: 3000,
  });
  closeModals();
};

const confirmDeletePackage = () => {
  emit("deletePackage", formData.value);
  toast.add({
    severity: "success",
    summary: "Deleted Package",
    detail: "Successfully Deleted Package",
    life: 3000,
  });
  closeModals();
};

const confirmDisablePackage = () => {
  emit("disablePackage", formData.value);
  toast.add({
    severity: "success",
    summary: "Updated Package",
    detail: "Successfully Updated Package",
    life: 3000,
  });
  closeModals();
};
</script>

<template>
  <div class="relative menu-container inline-block">
    <button
      @click.stop="showMenu = !showMenu"
      class="adminButton pi pi-ellipsis-v"
    ></button>

    <div v-if="showMenu" class="dropdown-menu">
      <ul>
        <li @click="openEditModal">Update</li>
        <li @click="openDeleteModal">Delete</li>
        <li @click="openDisableModal">Disable</li>
      </ul>
    </div>
    <Dialog v-model:visible="showEditModal" modal :style="{ width: '25rem' }">
      <template #header>
        <div class="flex flex-col items-center justify-center w-full">
          <h2 class="text-2xl font-bold font-[Poppins]">ADD PACKAGE:</h2>
        </div>
      </template>

      <div class="packageDetails">
        <div class="addPack flex flex-col justify-center m-auto content-center">
          <div class="addPackInput">
            <label>Name:</label>
            <input v-model="formData.name" placeholder="Package Name" />
          </div>
          <div class="addPackInput">
            <label>Price:</label>
            <input v-model="formData.price" placeholder="Price" />
          </div>
          <div class="addPackInput">
            <label>Description:</label>
            <Textarea
              v-model="formData.description"
              autoResize
              rows="3"
              cols="30"
              placeholder="Description"
            />
          </div>
          <div class="addPackInput">
            <label>Status:</label>
            <select v-model="formData.status" class="border p-2 rounded w-full">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="coming-soon">Coming Soon</option>
              <option value="sold-out">Sold Out</option>
            </select>
          </div>
          <div class="addPackInput">
            <label>Image URL:</label>
            <FileUpload
              ref="fileupload"
              mode="basic"
              name="demo[]"
              url="/api/upload"
              accept="image/*"
              :maxFileSize="1000000"
            />
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
          @click="confirmEditPackage"
          class="font-bold w-full"
        />
      </div>
    </Dialog>

    <Dialog v-model:visible="showDeleteModal" modal :style="{ width: '30rem' }">
      <template #header>
        <div class="flex flex-col items-center justify-center w-full">
          <h2 class="text-xl font-bold font-[Poppins]">Archive User</h2>
        </div>
      </template>

      <span
        class="text-lg text-surface-700 dark:text-surface-400 block mb-8 text-center font-[Poppins]"
      >
        Are you sure you want to
        <strong class="text-red-500">DELETE</strong> this Package:
        <span class="font-black font-[Poppins]">{{ packageT.name }}</span
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
          @click="confirmDeletePackage"
          class="font-bold w-full"
        />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
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
