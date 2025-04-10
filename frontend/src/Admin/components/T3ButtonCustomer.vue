<script setup>
import { ref, defineProps, defineEmits } from "vue";

const showMenu = ref(false);
const showArchiveModal = ref(false);
const showDeleteModal = ref(false);
const formData = ref({});

const prop = defineProps(["customer"]);
const emit = defineEmits(["archiveCustomer", "deleteCustomer"]);

const openArchiveModal = () => {
  formData.value = { ...prop.customer };
  showArchiveModal.value = true;
  showMenu.value = false;
};

const openDeleteModal = () => {
  formData.value = { ...prop.customer };
  showDeleteModal.value = true;
  showMenu.value = false;
};

const closeModals = () => {
  showArchiveModal.value = false;
  showDeleteModal.value = false;
};

const archiveCustomer = () => {
  emit("archiveCustomer", formData.value);
  closeModals();
};

const confirmDelete = () => {
  emit("deleteCustomer", formData.value);
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
        <li @click="openArchiveModal">Archive</li>
        <li @click="openDeleteModal">Disable</li>
      </ul>
    </div>
  </div>

  <div v-if="showArchiveModal" class="modal-overlay">
    <div class="modal">
      <h2 class="font-black text-2xl mb-10">
        Are you sure you want to ARCHIVE this user: {{ customer.firstName }}
        {{ customer.lastName }}
      </h2>

      <div class="modal-actions-delete">
        <button class="cancelBtn font-bold" @click="closeModals">Cancel</button>
        <button class="saveBtn font-bold" @click="archiveCustomer">
          Archive
        </button>
      </div>
    </div>
  </div>

  <div v-if="showDeleteModal" class="modal-overlay-delete">
    <div class="modal-delete">
      <h2 class="font-black text-2xl mb-10">
        Are you sure you want to DELETE this user: {{ customer.firstName }}
        {{ customer.lastName }}
      </h2>

      <div class="modal-actions-delete">
        <button class="cancelBtn font-bold" @click="closeModals">Cancel</button>
        <button class="deleteBtn font-bold" @click="confirmDelete">
          Delete
        </button>
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
  background: #194d1d;
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

.modal-delete {
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
