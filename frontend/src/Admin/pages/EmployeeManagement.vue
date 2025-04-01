<script setup>
import { ref, onMounted, computed } from 'vue';
import SearchBar from '../components/SearchBar.vue';
import T3ButtonEmployee from '../components/T3ButtonEmployee.vue';
import AddButtonEmployee from '../components/AddButtonEmployee.vue';
import FilterButton from '../components/FilterButton.vue';
import SideBar from '../components/SideBar.vue';
import Tag from 'primevue/tag';
import Notification from '../components/Notification.vue';
import DarkModeButton from '../components/DarkModeButton.vue';

const employees = ref([]);

onMounted(async () => {
  try {

    const limit = 50;
    const page = 1;
    const response = await fetch(`http://localhost:3000/users?limit=${limit}&page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch users');

    const users = await response.json();

    employees.value = users.items.filter(user => user.role === 'staff' || user.role === 'admin');

  } catch (error) {
    console.error('Error fetching users:', error);
  }
});

const totalEmployees = computed(() => employees.value.length);

const deleteEmployeeHandler = async (employee) => {
    try{
        const response = await fetch(`http://localhost:3000/user/${employee.userId}`, {
            method: 'delete',
        });
        if (!response.ok) throw new Error('Failed to delete employee');
        employees.value = employees.value.filter(e => e.userId !== employee.userId);
    } catch (error){
        console.error('Error deleting employee:', error);
    }
}

const addEmployeeHandler = async (employee) => {
    try {
        const response = await fetch('http://localhost:3000/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            firstName: employee.firstName,
            lastName: employee.lastName,
            contactNo: employee.contactNo,
            address: employee.address,
            email: employee.email,
            password: employee.password,
            role: employee.role
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add employee: ${errorText}`);
    }
    console.log('Employee added successfully');
    } catch (error) {
        console.error('Error adding employee:', error);
    }
};


//Employee Details

const selectedEmployee = ref(null);
const employeeDetails = ref(false);

const openEmployeeDetails = (employee) => {
    selectedEmployee.value = employee;
    employeeDetails.value = true;
}

const closeModal = () => {
    employeeDetails.value = false;
}

// Checks Severity of Status of each Users
const getStatusSeverity = (status) => {
  return status === 'active' ? 'success' : 'danger';
};



</script>

<template>
    
<main class="employeeM  bg-[#EEF9EB] dark:bg-[#09090b]">
    <SideBar/>
     <div class="container">
        <div class="headers"> 
            <h1 class="text-5xl font-black">Employee Management</h1>
                <div class="flex items-center gap-4">
                    <DarkModeButton />
                    <Notification/>
                </div>
            </div>
        <div class="searchB">
            <SearchBar class="sBar"/>
            <div class="empBtns">
                <FilterButton/>
                <AddButtonEmployee class="addBtn" data="Staff" @addEmployee="addEmployeeHandler"/>
            </div>
        </div>

        <div class="tableContainer">
            <table class="dTable border-x-1 border-y-1 border-[#194D1D] dark:border-[#FCFCFC]">
            <thead>
                <tr class="header-style bg-[#194D1D] dark:bg-[#18181b] border-[#194D1D] dark:border-[#18181b]">
                    <th>EMPLOYEE ID</th>
                    <th>NAME</th>
                    <th>CONTACT NO.</th>
                    <th>ROLE</th>
                    <th>STATUS</th>
                    <th>CREATED</th>
                    <th>ACTIONS</th>
                </tr>
            </thead>
            <tbody>
                <tr class="eRow border-[#194D1D] dark:border-[#18181b]" v-for="employee in employees" :key="employee.userId" @click="openEmployeeDetails(employee)">
                    <td>{{ employee.userId }}</td>
                    <td>{{ employee.firstName }} {{ employee.lastName }}<br/> {{ employee.email }}</td>
                    <td>{{ employee.contactNo }}</td>
                    <td>{{ employee.role}}</td>
                    <td>
                        <Tag 
                        :severity="getStatusSeverity(employee.status)" 
                        :value="employee.status === 'active' ? 'Active' : 'Inactive'"
                        />
                    </td>
                    <td>{{ employee.dateReg }}</td>
                    <td @click.stop><T3ButtonEmployee :employee="employee" @deleteEmployee="deleteEmployeeHandler"/></td>
                </tr>
            </tbody>
        </table>
        </div>
    </div>

    <div v-if="employeeDetails" class="modal">
        <div class="modal-content">
            <h2>Employee Details</h2>
            <p>User ID: {{ selectedEmployee?.userId }}</p>
            <p>Role: {{ selectedEmployee?.role }}</p>
            <p>Name: {{ selectedEmployee?.firstName }} {{ selectedEmployee?.lastName }}</p>
            <p>Contact No. {{ selectedEmployee?.contactNo }}</p>
            <p>Email Address: {{ selectedEmployee?.email }}</p>
            <p>Address: {{ selectedEmployee?.address }}</p>
            <p>Date Registration {{ selectedEmployee?.dateReg }}</p>
            <button class="closeDetails" @click="closeModal">Close</button>
        </div>
    </div>
</main>

</template>

<style scoped>



.headers{
    display: flex;
    justify-content: space-between;
}

.container{
    margin-left: 280px;
    margin-top: 30px;
    padding: 20px;


    width: 80%;
    height: 92%;
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
}


.searchB {
    display: flex;
    align-items: center;
    justify-content: space-between; 
    width: 100%;
    height: 50px;
    margin-top: 30px;
    margin-bottom: 20px;
}

.sBar {
    flex: 1; 
    max-width: 555px; 
}

.empBtns {
    display: flex;
    gap: 5px; 
}

.tableContainer{
    max-height: 75%; 
    overflow-y: auto;
    border-radius: 7px;
}

.tableContainer::-webkit-scrollbar {
    display:none
}

.dTable {
    width: 100%;
    height: auto;
    background-color: #C7E3B6;

}

.header-style{
    font-weight: bold;
    font-size: 15px;
    height:40px;

    color: white;
    text-align: center;
    top: 0;
    z-index: 1;

}

.eRow{
    width: 100%;
    font-size: 15px;
    height: auto;
    text-align: center;
    border-top: 1px solid #194D1D;
    border-bottom: 1px solid #194D1D;
    cursor: pointer;
}

.my-app-dark .eRow{
    border: 1px solid #FCFCFC;
}

.eRow:hover {
  background-color: #e6f4e8;
}

.eRow:nth-child(even) {
  background-color: #eaf6e9;
}

.eRow:nth-child(odd) {
    background-color: #C7E3B6;
}

.my-app-dark .eRow {
  background-color: #1E1E1E;
}


.modal {
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
.modal-content {
    background: white;
    padding: 20px;
    border-radius: 5px;
    width: 300px;
}

.closeDetails{
  width: 100px;
  padding: 8px 15px;
  background: #ccc;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}


</style>