<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const showAddPackageModal = ref(false);
const newPackage = ref({
    name: '',
    price: '',
    description: '',
    status: ''
});

defineProps(['data']);
const emit = defineEmits(['addPackage']);

const openAddPackageModal = () => {
    showAddPackageModal.value = true;
}

const closeAddPackageModal = () => {
    showAddPackageModal.value = false;
}

const addPackage = () => {
    emit('addPackage', {
        name: newPackage.value.name,
        price: newPackage.value.price,
        description: newPackage.value.description,
        status: newPackage.value.status
    });

    closeAddPackageModal();
};

//name, price, description, status
</script>

<template>
    <button class="adminButton text-white font-bold bg-[#194D1D] hover:bg-[#2B6D30]" @click="openAddPackageModal"><i class="aIcon pi pi-plus"></i> Add {{ data }}</button>

    <div v-if="showAddPackageModal" class="modal-overlay">
        <div class="modal">
            <h2 class="font-black text-2xl mb-5 text-center">Add Package:</h2>

            <div class="addPack">
                <div class="addPackInput">
                    <input v-model="newPackage.name" placeholder="Package Name">
                </div>
                <div class="addPackInput">
                    <input v-model="newPackage.price" placeholder="Price">
                </div>
            </div>

            <div class="addPack">
                <div class="addPackInput">
                    <input v-model="newPackage.description" placeholder="Description">
                </div>
                <div class="addPackInput">
                    <input v-model="newPackage.status" placeholder="Status">
                </div>
            </div>

            <div class="modal-actions">
                <button class="cancelBtn font-bold" @click="closeAddPackageModal">Cancel</button>
                <button class="saveBtn font-bold" @click="addPackage">Save</button>
            </div>
        </div>
    </div>
</template>

<style scoped>

.adminButton{
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s;
}   

.aIcon{
    margin-right: 5px;
    font-size: 13px;
}

.addPack{
    display: flex;
    flex-wrap: wrap;
    gap: 10px; 
    justify-content: center;
}

.addPack div{
    display: flex;
    flex-direction: column; 
    width: 40%;
}

.addPackInput {
    padding: 8px;
    border: 1px solid #ccc;
    background-color: #FCF5F5;
    border-radius: 10px;
    margin-top: 10px;
}

.modal-overlay{
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

.modal{
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
</style>