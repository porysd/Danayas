<script setup>
import { ref, defineProps, defineEmits } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const showMenu = ref(false);
const showEditModal = ref(false);
const showStatusModal = ref(false);
const formData = ref({});

const props = defineProps(["booking", "packageName"]);
const emit = defineEmits(["updateBooking", "deleteBooking", "updateStatus"]);

const openEditModal = () => {
  formData.value = { ...props.booking, packageName: props.packageName };
  showEditModal.value = true;
  showMenu.value = false;
};

const openStatusModal = () => {
  formData.value = { ...props.booking };
  showStatusModal.value = true;
  showMenu.value = false;
};

const closeModals = () => {
  showEditModal.value = false;
  showStatusModal.value = false;
};

const confirmStatusUpdate = () => {
  emit("updateStatus", formData.value);
  toast.add({
    severity: "success",
    summary: "Updated Status",
    detail: "Successfully Updated Status",
    life: 3000,
  });
  closeModals();
};

const saveChanges = () => {
  emit("updateBooking", formData.value);
  toast.add({
    severity: "success",
    summary: "Updated Booking",
    detail: "Successfully Updated Booking",
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
        <li @click="openStatusModal">Status</li>
        <li @click="openEditModal">Update</li>
      </ul>
    </div>
  </div>

  <Dialog v-model:visible="showStatusModal" modal :style="{ width: '30rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">Update Booking Status</h2>
      </div>
    </template>

    <div class="mb-4">
      <label class="block text-lg font-semibold mb-2">Booking Status</label>
      <select v-model="formData.bookStatus" class="border p-2 rounded w-full">
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
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
        label="Save"
        severity="primary"
        @click="confirmStatusUpdate"
        class="font-bold w-full"
      />
    </div>
  </Dialog>

  <Dialog
    v-model:visible="showEditModal"
    modal
    :style="{ width: '60rem', minHeight: '30rem' }"
  >
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-bold font-[Poppins]">
          UPDATE BOOKING NO. {{ booking.bookingId }} by {{ booking.firstName }}
          {{ booking.lastName }}
        </h2>
      </div>
    </template>

    <div class="packEvent">
      <div>
        <label>Package Name:</label>
        <input
          class="packEvents"
          v-model="formData.packageName"
          placeholder="Package Name"
        />
      </div>
      <div>
        <label>Event Type:</label>
        <input
          class="packEvents"
          v-model="formData.eventType"
          placeholder="Event Type"
        />
      </div>
    </div>

    <div class="cDate">
      <div>
        <label>Check-In Date:</label>
        <input
          class="cDates"
          v-model="formData.checkInDate"
          placeholder="Check-In"
        />
      </div>
      <div>
        <label>Check-Out Date:</label>
        <input
          class="cDates"
          v-model="formData.checkOutDate"
          placeholder="Check-Out"
        />
      </div>
      <div>
        <label>Mode:</label>
        <input class="cDates" v-model="formData.mode" placeholder="Mode" />
      </div>
    </div>

    <div class="atcng">
      <div>
        <label>Arrival Time:</label>
        <input
          class="atcngs"
          v-model="formData.arrivalTime"
          placeholder="Arival Time"
        />
      </div>
      <div>
        <label>Catering:</label>
        <input
          class="atcngs"
          v-model="formData.catering"
          placeholder="Catering"
        />
      </div>
      <div>
        <label>Number of Guest:</label>
        <input
          class="atcngs"
          v-model="formData.numberOfGuest"
          placeholder="Number of Guest"
        />
      </div>
    </div>

    <div class="dAdd">
      <div>
        <label>Discount:</label>
        <input
          class="dAdds"
          v-model="formData.discountPromoId"
          placeholder="Discount"
        />
      </div>
      <div>
        <label>Add Ons:</label>
        <input
          class="dAdds"
          v-model="formData.bookingAddOn"
          placeholder="Add Ons"
        />
      </div>
    </div>

    <div class="flex justify-center gap-2 font-[Poppins] mt-10">
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
        @click="saveChanges"
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

.packEvent,
.cDate,
.atcng,
.dAdd {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.packEvent div,
.cDate div,
.atcng div,
.dAdd div {
  display: flex;
  flex-direction: column;
  width: 40%;
}

.cDate div,
.atcng div {
  width: 26.3%;
}

label {
  display: block;
  text-align: left;
  font-size: 16px;
  font-weight: 400;
  margin-bottom: 2px;
}

input {
  padding: 8px;
  border: 1px solid #ccc;
  background-color: #fcfcfc;
  border-radius: 10px;
  margin-top: 10px;
}
</style>
