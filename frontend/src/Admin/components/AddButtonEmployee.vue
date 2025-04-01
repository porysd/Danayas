<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const showAddEmployeeModal = ref(false);
const newEmployee = ref({
    firstName: '',
    lastName: '',
    email: '',
    contactNo: '',
    address: '',
    password: '',
    role: "staff"
});

defineProps(['data']);
const emit = defineEmits(['addEmployee']);

const openAddEmployeeModal = () => {
    showAddEmployeeModal.value = true;
};

const closeAddEmployeeModal = () => {
    showAddEmployeeModal.value = false;
};

const addEmployee = () => {
    if (!newEmployee.value.firstName || !newEmployee.value.lastName || !newEmployee.value.email || !newEmployee.value.password) {
        alert('Please fill in all required fields.');
        return;
    }
    console.log('Sending Employee Data:', newEmployee.value); 
    emit('addEmployee', { 
        firstName: newEmployee.value.firstName,
        lastName: newEmployee.value.lastName,
        email: newEmployee.value.email,
        contactNo: newEmployee.value.contactNo,
        address: newEmployee.value.address,
        password: newEmployee.value.password,
        role: newEmployee.value.role || 'staff'
    });

    closeAddEmployeeModal();
};
</script>

<template>

    <div>
        <button class="adminButton text-white font-bold bg-[#194D1D] dark:bg-[#18181b] hover:bg-[#2B6D30]" @click="openAddEmployeeModal"><i class="aIcon pi pi-plus"></i> Add {{ data }}</button>


    
        <div v-if="showAddEmployeeModal" class="modal-overlay-role">
            <div class="modal-role">
                <h2 class="font-black text-2xl mb-5 text-center">Add Employee:</h2>

                <div class="addEmp">
                    <div class="addEmpInput">
                        <input v-model="newEmployee.username" placeholder="Username">
                    </div>
                    <div class="addEmpInput">
                        <input v-model="newEmployee.email" id="newemailAddess" placeholder="Email Address">
                    </div>

                </div>

                <div class="addEmp">
                    <div class="addEmpInput">
                        <input v-model="newEmployee.firstName" id="firstName" placeholder="First Name">
                    </div>
                    <div class="addEmpInput">
                        <input v-model="newEmployee.lastName" id="lastName" placeholder="Last Name">
                    </div>
                </div>

                <div class="addEmp">
                    <div class="addEmpInput">
                        <input v-model="newEmployee.contactNo" id="contactNo" placeholder="Contact Number">
                    </div>
                    <div class="addEmpInput">
                        <input v-model="newEmployee.address" id="address" placeholder="Address">
                    </div>
                </div>

                <div class="addEmp">
                    <div class="addEmpInput">
                        <input v-model="newEmployee.password" id="password" placeholder="Password">
                    </div>
                    <div class="addEmpInput">
                        <input v-model="newEmployee.password" id="confirmPassword" placeholder="Confirm Password">
                    </div>

                </div>

                <h2 class="font-black text-xl mb-5 w-[70%] text-left m-auto mt-5">Permissions:</h2>
                    
                <div class="role-container">
                    <div class="role1">
                        <label class="switch"> Authorization
                            <input type="checkbox">
                            <span class="slider round"></span>
                        </label>

                        <label class="switch"> Employee Management
                            <input type="checkbox">
                            <span class="slider round"></span>
                        </label>
                        
                        <label class="switch"> Packages and Promos
                            <input type="checkbox">
                            <span class="slider round"></span>
                        </label>

                        <label class="switch"> Discount and Add Ons
                            <input type="checkbox">
                            <span class="slider round"></span>
                        </label>
                    </div>

                    <div class="role2">
                        <label class="switch"> Content Management
                            <input type="checkbox">
                            <span class="slider round"></span>
                        </label>

                        <label class="switch"> Booking Management
                            <input type="checkbox">
                            <span class="slider round"></span>
                        </label>

                        <label class="switch"> Transaction
                            <input type="checkbox">
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>


                <div class="modal-actions">
                    <button class="cancelBtn font-bold" @click="closeAddEmployeeModal">Cancel</button>
                    <button class="saveBtn font-bold" @click="addEmployee">Save</button>
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

.role-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.role1, .role2 {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px; 
  text-align: center;
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

.role-container {
  display: flex;
  justify-content: space-between;
  margin:auto;
  gap: 90px;
  width: 70%;
  margin-bottom: 10px;
}

.role1, .role2 {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px; 
}

.switch {
  display: flex;
  justify-content: space-between; 
  align-items: center; 
  width: 100%; 
}

.switch input {
  margin-left: auto;
}

</style>