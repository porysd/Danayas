<script setup>
import { ref, defineProps, defineEmits } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const showRate = ref(false);
const newRate = ref({
  category: "",
  rate: "",
  mode: "",
  isActive: "",
});

defineProps(["data"]);
const emit = defineEmits(["addRate"]);

const openModal = () => {
  showRate.value = true;
};

const closeModals = () => {
  showRate.value = false;
};

const confirmAddRate = () => {
  emit("addRate", { ...newRate.value });
  toast.add({
    severity: "success",
    summary: "Added Add Ons",
    detail: "Successfully Added Add Ons",
    life: 3000,
  });
  closeModals();
};
</script>

<template>
  <button
    class="adminButton text-white font-bold bg-[#194D1D] hover:bg-[#2B6D30]"
    @click="openModal"
  >
    <i class="aIcon pi pi-plus"></i> Add {{ data }}
  </button>

  <Dialog v-model:visible="showRate" modal :style="{ width: '25rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-2xl font-bold font-[Poppins]">ADD PUBLIC RATE:</h2>
      </div>
    </template>

    <div class="packageDetails">
      <div class="addPack flex flex-col justify-center m-auto content-center">
        <div class="addPackInput">
          <label>Category:</label>
          <select v-model="newRate.category" placeholder="Add Ons Name">
            <option value="adult">Adult</option>
            <option value="kid">Kid</option>
          </select>
        </div>
        <div class="addPackInput">
          <label>Price Rate:</label>
          <input v-model="newRate.rate" placeholder="Price" />
        </div>
        <div class="addPackInput">
          <label>Mode:</label>
          <select v-model="newRate.mode" class="border p-2 rounded w-full">
            <option value="day-time">Day Time</option>
            <option value="night-time">Night Time</option>
          </select>
        </div>
        <div class="addPackInput">
          <label>Active:</label>
          <select v-model="newRate.isActive" placeholder="Active or Inactive">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
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
        label="Add Rate"
        severity="primary"
        @click="confirmAddRate"
        class="font-bold w-full"
      />
    </div>
  </Dialog>
  <Toast />
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
