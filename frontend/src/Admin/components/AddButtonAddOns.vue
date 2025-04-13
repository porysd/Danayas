<script setup>
import { ref, defineProps, defineEmits } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const showAddOns = ref(false);
const newAddOns = ref({
  itemName: "",
  price: "",
  status: "",
});

defineProps(["data"]);
const emit = defineEmits(["addAddOns"]);

const openModal = () => {
  showAddOns.value = true;
};

const closeModals = () => {
  showAddOns.value = false;
};

const addAddOn = () => {
  const { itemName, price, status } = newAddOns.value;
  if (!itemName || !price || !status) {
    toast.add({
      severity: "warn",
      summary: "Missing Fields",
      detail: "Please fill in all fields before saving.",
      life: 3000,
    });
    return;
  }

  emit("addAddOns", { ...newAddOns.value });
  toast.add({
    severity: "success",
    summary: "Added Add Ons",
    detail: "Successfully Added Add Ons",
    life: 3000,
  });
  closeModals();

  newAddOns.value = { itemName: "", price: "", status: "" };
};
</script>

<template>
  <button
    class="adminButton text-white font-bold bg-[#194D1D] hover:bg-[#2B6D30]"
    @click="openModal"
  >
    <i class="aIcon pi pi-plus"></i> Add {{ data }}
  </button>

  <Dialog v-model:visible="showAddOns" modal :style="{ width: '25rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-2xl font-bold font-[Poppins]">ADD ADD ONS:</h2>
      </div>
    </template>

    <div class="packageDetails">
      <div class="addPack flex flex-col justify-center m-auto content-center">
        <div class="addPackInput">
          <label>Add Ons Name:</label>
          <input v-model="newAddOns.itemName" placeholder="Discount Name" />
        </div>
        <div class="addPackInput">
          <label>Price:</label>
          <input v-model="newAddOns.price" placeholder="Type" />
        </div>
        <div class="addPackInput">
          <label>Status:</label>
          <select v-model="newAddOns.status" class="border p-2 rounded w-full">
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
        @click="addAddOn"
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
