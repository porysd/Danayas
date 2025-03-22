<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const showMenu = ref(false);
// const showArchiveModal = ref(false);
const showDeleteModal = ref(false);
const showUpdateModal = ref(false);
const formData = ref({});

const prop = defineProps(['payment']);
const emit = defineEmits(['deletePayment', 'updatePayment']);

// const openArchiveModal = () => {
//   formData.value = { ...prop.customer };
//   showArchiveModal.value = true;
//   showMenu.value = false;
// };

const openUpdateModal = () => {
  formData.value = { ...prop.payment };
  showUpdateModal.value = true;
  showMenu.value = false;
}

const openDeleteModal = () => {
  formData.value = { ...prop.payment };
  showDeleteModal.value = true;
  showMenu.value = false;
};

const closeModals = () => {
//   showArchiveModal.value = false;
  showDeleteModal.value = false;
  showUpdateModal.value = false;
};

// const archiveCustomer = () => {
//   emit('archiveCustomer', formData.value);
//   closeModals();
// };

const confirmDelete = () => {
  emit('deletePayment', formData.value);
  closeModals();
};

const confirmUpdate = () => {
  emit('updatePayment', formData.value);
  console.log(formData.value);
  closeModals();
};

// const confirmUpdate = () => {
//   const index = payment.value.findIndex(p => p.paymentId === formData.value.paymentId);
//   if (index !== -1) {
//     payment.value[index] = { ...formData.value }; 
//   }
//   console.log('After Update:', payment.value);
//   emit('updatePayment', formData.value);
//   closeModals();
// };

</script>

<template>
  <div class="relative menu-container inline-block">

    <button @click.stop="showMenu = !showMenu" class="adminButton pi pi-ellipsis-v"></button>


    <div v-if="showMenu" class="dropdown-menu">
      <ul>
        <!--<li @click="openArchiveModal">Archive</li>-->
        <li @click="openUpdateModal">Update</li>
        <li @click="openDeleteModal">Delete</li>
      </ul>
    </div>
  </div>


  <!--<div v-if="showArchiveModal" class="modal-overlay">
    <div class="modal">
      <h2 class="font-black text-2xl mb-10">Are you sure you want to ARCHIVE this user: {{ customer.firstName }} {{ customer.lastName }}</h2>

      <div class="modal-actions-delete">
        <button class="cancelBtn font-bold" @click="closeModals">Cancel</button>
        <button class="saveBtn font-bold" @click="archiveCustomer">Archive</button>
      </div>
    </div>
  </div>-->

  <div v-if="showUpdateModal" class="modal-overlay">
    <div class="modal">
      <h2 class="font-black text-2xl mb-5">Update Payment Status</h2>

      <div class="mb-4">
        <label class="block text-lg font-semibold mb-2">Payment Status</label>
        <select v-model="formData.paymentStatus" class="border p-2 rounded w-full">
          <option value="pending">Pending</option>
          <option value="partially-paid">Partially Paid</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div class="modal-actions-delete">
        <button class="cancelBtn font-bold" @click="closeModals">Cancel</button>
        <button class="saveBtn font-bold" @click="confirmUpdate">Update</button>
      </div>
    </div>
  </div>
  
  <div v-if="showDeleteModal" class="modal-overlay-delete">
    <div class="modal-delete">
      <h2 class="font-black text-2xl mb-10">Are you sure you want to DELETE this user: {{ payment.paymentId }}</h2>

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
  width: 400px;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;

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
