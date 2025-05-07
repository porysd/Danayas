<script setup>
import { ref, defineProps, defineEmits } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const showDiscountModal = ref(false);
const newDiscount = ref({
  name: "",
  percentage: "",
  typeFor: "",
  status: "",
});

defineProps(["data"]);
const emit = defineEmits(["addDiscount"]);

const openDiscountModal = () => {
  showDiscountModal.value = true;
};

const closeModals = () => {
  showDiscountModal.value = false;
};

const addDiscount = () => {
  emit("addDiscount", { ...newDiscount.value });
  toast.add({
    severity: "success",
    summary: "Added Discount",
    detail: "Successfully Added Discount",
    life: 3000,
  });
  closeModals();
};
</script>

<template>
  <button
    class="adminButton text-white font-bold bg-[#194D1D] hover:bg-[#2B6D30]"
    @click="openDiscountModal"
  >
    <i class="aIcon pi pi-plus"></i> Add {{ data }}
  </button>

  <Dialog v-model:visible="showDiscountModal" modal :style="{ width: '25rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-2xl font-bold font-[Poppins]">ADD DISCOUNT:</h2>
      </div>
    </template>

    <div class="packageDetails">
      <div class="addPack flex flex-col justify-center m-auto content-center">
        <div class="addPackInput">
          <label>Discount Name:</label>
          <input v-model="newDiscount.name" placeholder="Discount Name" />
        </div>
        <div class="addPackInput">
          <label>Percentage:</label>
          <input v-model="newDiscount.percentage" placeholder="Percentage" />
        </div>
        <div class="addPackInput">
          <label>Type:</label>
          <input v-model="newDiscount.typeFor" placeholder="Type" />
        </div>
        <div class="addPackInput">
          <label>Status:</label>
          <select
            v-model="newDiscount.status"
            class="border p-2 rounded w-full"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
        label="Save"
        severity="primary"
        @click="addDiscount"
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
