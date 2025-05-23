<script setup>
import { ref, defineProps, defineEmits } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import DatePicker from "primevue/datepicker";

const toast = useToast();
const showBlocked = ref(false);
const newBlocked = ref({
  blockedDates: "",
  category: "",
  others: "" || null,
});

defineProps(["data"]);
const emit = defineEmits(["addBlocked"]);

const openModal = () => {
  showBlocked.value = true;
};

const closeModals = () => {
  showBlocked.value = false;
};

const confirmAddRate = () => {
  emit("addBlocked", { ...newBlocked.value });
  toast.add({
    severity: "success",
    summary: "Added Blocked Dates",
    detail: "Successfully Added Blocked Dates",
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

  <Dialog v-model:visible="showBlocked" modal :style="{ width: '25rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-2xl font-bold font-[Poppins]">ADD BLOCKED DATES:</h2>
      </div>
    </template>

    <div class="packageDetails">
      <div class="addPack flex flex-col justify-center m-auto content-center">
        <div class="addPackInput">
          <label>Blocked Date:</label>
          <DatePicker
            v-model="newBlocked.blockedDates"
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
            <select v-model="newBlocked.category" placeholder="Add Ons Name">
              <option value="maintenance">Maintenance</option>
              <option value="holiday">Holiday</option>
              <option value="internal-use">Internal Use</option>
              <option value="natural-disaster">Natural Disaster</option>
              <option value="others">others</option>
            </select>
          </div>
          <div>
            <template v-if="newBlocked.category === 'others'">
              <label>Others:</label>
              <input
                v-model="newBlocked.others"
                placeholder="Please specify ..."
              />
            </template>
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
        label="Add Blocked Date"
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
