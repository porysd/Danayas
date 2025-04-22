<script setup>
import { ref, defineProps, defineEmits } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import Textarea from "primevue/textarea";
import FileUpload from "primevue/fileupload";

const toast = useToast();
const showAddPackageModal = ref(false);
const newPackage = ref({
  name: "",
  price: "",
  inclusion: "",
  status: "",
  mode: "",
  imageUrl: "",
  isPromo: false,
  promoStart: null,
  promoEnd: null,
});

defineProps(["data"]);
const emit = defineEmits(["addPackage"]);

const openAddPackageModal = () => {
  showAddPackageModal.value = true;
};

const closeAddPackageModal = () => {
  showAddPackageModal.value = false;
};

const addPackage = () => {
  emit("addPackage", { ...newPackage.value });

  closeAddPackageModal();
};

//name, price, description, status
</script>

<template>
  <button
    class="adminButton text-white font-bold bg-[#194D1D] hover:bg-[#2B6D30]"
    @click="openAddPackageModal"
  >
    <i class="aIcon pi pi-plus"></i> Add {{ data }}
  </button>

  <Dialog
    v-model:visible="showAddPackageModal"
    modal
    :style="{ width: '25rem' }"
  >
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-2xl font-bold font-[Poppins]">ADD PACKAGE:</h2>
      </div>
    </template>

    <div class="packageDetails">
      <div class="addPack flex flex-col justify-center m-auto content-center">
        <div class="addPackInput">
          <label>Name:</label>
          <input v-model="newPackage.name" placeholder="Package Name" />
        </div>
        <div class="addPackInput">
          <label>Price:</label>
          <input v-model="newPackage.price" placeholder="Price" />
        </div>
        <div class="addPackInput">
          <label>Inclusion:</label>
          <Textarea
            v-model="newPackage.inclusion"
            autoResize
            rows="3"
            cols="30"
            placeholder="Inclusions:
            - example
            - example"
          />
        </div>
        <div class="addPackInput">
          <label>Status:</label>
          <select v-model="newPackage.status" class="border p-2 rounded w-full">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="addPackInput">
          <label>Mode:</label>
          <select v-model="newPackage.mode" class="border p-2 rounded w-full">
            <option value="day-time">Day Time</option>
            <option value="night-time">Night Time</option>
            <option value="whole-day">Whole Day</option>
          </select>
        </div>
        <div class="addPackInput">
          <label>Image URL:</label>
          <FileUpload
            ref="fileupload"
            v-model="newPackage.imageUrl"
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
        @click="closeAddPackageModal"
        class="font-bold w-full"
      />
      <Button
        type="button"
        label="Save"
        severity="primary"
        @click="addPackage"
        class="font-bold w-full"
      />
    </div>
  </Dialog>
</template>

<style scoped>
.adminButton {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.aIcon {
  margin-right: 5px;
  font-size: 13px;
}

.addPack {
  gap: 10px;
}

.addPack input,
.addPack select {
  padding: 10px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  border-radius: 5px;
  height: 40px;
}

.addPack div {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
