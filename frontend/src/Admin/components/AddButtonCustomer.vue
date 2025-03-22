<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const showAddCustomerModal = ref(false);
const newCustomer = ref({
    firstName: '',
    lastName: '',
    email: '',
    contactNo: '',
    address: '',
    password: '',
    role: "customer"
});

defineProps(['data']);
const emit = defineEmits(['addCustomer']);

const openAddCustomerModal = () => {
    showAddCustomerModal.value = true;
};

const closeAddCustomerModal = () => {
    showAddCustomerModal.value = false;
};

const addCustomer = () => {
    if (!newCustomer.value.firstName || !newCustomer.value.lastName || !newCustomer.value.email || !newCustomer.value.password) {
        alert('Please fill in all required fields.');
        return;
    }
    console.log('Sending Customer Data:', newCustomer.value); 
    emit('addCustomer', { 
        ...newCustomer.value
    });

    closeAddCustomerModal();
};
</script>

<template>

    <div>
        <button class="adminButton text-white font-bold bg-[#194D1D] hover:bg-[#2B6D30]" @click="openAddCustomerModal"><i class="aIcon pi pi-plus"></i> Add {{ data }}</button>


    
        <div v-if="showAddCustomerModal" class="modal-overlay-role">
            <div class="modal-role">
                <h2 class="font-black text-2xl mb-5 text-center">Add Customer:</h2>

                <div class="addEmp">
                    <div class="addEmpInput">
                        <input v-model="newCustomer.username" placeholder="Username">
                    </div>
                    <div class="addEmpInput">
                        <input v-model="newCustomer.email" id="newemailAddess" placeholder="Email Address">
                    </div>

                </div>

                <div class="addEmp">
                    <div class="addEmpInput">
                        <input v-model="newCustomer.firstName" id="firstName" placeholder="First Name">
                    </div>
                    <div class="addEmpInput">
                        <input v-model="newCustomer.lastName" id="lastName" placeholder="Last Name">
                    </div>
                </div>

                <div class="addEmp">
                    <div class="addEmpInput">
                        <input v-model="newCustomer.contactNo" id="contactNo" placeholder="Contact Number">
                    </div>
                    <div class="addEmpInput">
                        <input v-model="newCustomer.address" id="address" placeholder="Address">
                    </div>
                </div>

                <div class="addEmp">
                    <div class="addEmpInput">
                        <input v-model="newCustomer.password" id="password" placeholder="Password">
                    </div>
                    <div class="addEmpInput">
                        <input v-model="newCustomer.password" id="confirmPassword" placeholder="Confirm Password">
                    </div>

                </div>


                <div class="modal-actions">
                    <button class="cancelBtn font-bold" @click="closeAddCustomerModal">Cancel</button>
                    <button class="saveBtn font-bold" @click="addCustomer">Save</button>
                </div>
            </div>
        </div>

    </div>
    
</template>

<style scope>

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

.addEmp{
    display: flex;
    flex-wrap: wrap;
    gap: 10px; 
    justify-content: center;
}

.addEmp div{
    display: flex;
    flex-direction: column; 
    width: 40%;
}

.addEmpInput {
    padding: 8px;
    border: 1px solid #ccc;
    background-color: #FCF5F5;
    border-radius: 10px;
    margin-top: 10px;
}

.modal-overlay-role {
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

.modal-role{
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