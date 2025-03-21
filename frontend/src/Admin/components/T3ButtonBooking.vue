<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const showMenu = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const formData = ref({});

const props = defineProps(['booking']);
const emit = defineEmits(['updateBooking', 'deleteBooking']);

const openEditModal = () => {
  formData.value = { ...props.booking }; 
  showEditModal.value = true;
  showMenu.value = false; 
};

const openDeleteModal = () => {
  formData.value = { ...props.booking };
  showDeleteModal.value = true;
  showMenu.value = false;
};

const closeModals = () => {
  showEditModal.value = false;
  showDeleteModal.value = false;
};

const saveChanges = () => {
  emit('updateBooking', formData.value);
  closeModals();
};

const confirmDelete = () => {
  emit('deleteBooking', formData.value);
  closeModals();
};
</script>

<template>
  <div class="relative menu-container inline-block">

    <button @click.stop="showMenu = !showMenu" class="adminButton pi pi-ellipsis-v"></button>

    <div v-if="showMenu" class="dropdown-menu">
      <ul>
        <li>Confirm</li>
        <li @click="openEditModal">Update</li>
        <li>Cancel</li>
        <li @click="openDeleteModal">Delete</li>
      </ul>
    </div>
  </div>

  <div v-if="showEditModal" class="modal-overlay">
    <div class="modal">
      <h2 class="font-black text-2xl mb-10">UPDATE BOOKING NO. {{ bookingId }}</h2>

      <div class="packEvent">
        <div>
          <label>Package Name:</label>
          <input class="packEvents" v-model="formData.packageId" placeholder="Package Name" />
        </div>
        <div>
          <label>Event Type:</label>
          <input class="packEvents" v-model="formData.eventType" placeholder="Event Type" />
        </div>
      </div>

      <div class="cDate">
        <div>
          <label>Check-In Date:</label>
          <input class="cDates" v-model="formData.checkInDate" placeholder="Check-In" />
        </div>
        <div>
        <label>Check-Out Date:</label>
        <input class="cDates" v-model="formData.checkOutDate" placeholder="Check-Out" />
        </div>
        <div>        
          <label>Mode:</label>
          <input class="cDates" v-model="formData.mode" placeholder="Mode" />
        </div>
      </div>

      <div class="atcng">
        <div>
          <label>Arrival Time:</label>
          <input class="atcngs"v-model="formData.arrivalTime" placeholder="Arival Time" />
        </div>
        <div>
          <label>Catering:</label>
          <input class="atcngs"v-model="formData.catering" placeholder="Catering" />
        </div>
        <div>        
          <label>Number of Guest:</label>
          <input class="atcngs"v-model="formData.numberOfGuest" placeholder="Number of Guest" />
        </div>
      </div>

      <div class="dAdd">
        <div>
          <label>Discount:</label>
          <input class="dAdds" v-model="formData.discountPromoId" placeholder="Discount" />
        </div>
        <div>
          <label>Add Ons:</label>
          <input class="dAdds" v-model="formData.bookingAddOn" placeholder="Add Ons" />
        </div>
      </div>

      <div class="modal-actions">
        <button class="cancelBtn font-bold" @click="closeModals">Cancel</button>
        <button class="saveBtn font-bold" @click="saveChanges">Save</button>
      </div>
    </div>
  </div>


  <div v-if="showDeleteModal" class="modal-overlay-delete">
    <div class="modal-delete">
      <h2 class="font-black text-2xl mb-10">Are you sure you want to DELETE this booking no. {{ bookingId }}?</h2>

      <div class="modal-actions-delete">
        <button class="cancelBtn font-bold" @click="closeModals">Cancel</button>
        <button class="deleteBtn font-bold" @click="confirmDelete">Delete</button>
      </div>
    </div>
  </div>
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
  background: #FCF5F5;
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
  color:#FCF5F5
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
  width: 70%;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #333;
}

.packEvent, .cDate, .atcng, .dAdd {
  display: flex;
  flex-wrap: wrap;
  gap: 10px; 
  justify-content: center;
}

.packEvent div, .cDate div, .atcng div, .dAdd div {
  display: flex;
  flex-direction: column; 
  width: 40%;
}

.cDate div, .atcng div {
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
  background-color: #FCF5F5;
  border-radius: 10px;
  margin-top: 10px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  margin-right: 100px;
  margin-bottom: 20px;
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
  background: #194D1D;
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

.modal-delete{
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
