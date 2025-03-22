<script setup>
import { ref, onMounted, computed } from 'vue';
import SearchBar from '../components/SearchBar.vue';
import AddButtonCustomer from '../components/AddButtonCustomer.vue';
import FilterButton from '../components/FilterButton.vue';
import T3ButtonCustomer from '../components/T3ButtonCustomer.vue';
import SideBar from '../components/SideBar.vue'

const customers = ref([]);

onMounted(async () => {
  try {

    const limit = 50;
    const page = 1;

    const response = await fetch(`http://localhost:3000/users?limit=${limit}&page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch users');
    const users = await response.json();

    customers.value = users.items.filter(user => user.role === 'customer');

  } catch (error) {
    console.error('Error fetching users:', error);
  }
});

const totalCustomers = computed(() => customers.value.length);

const deleteCustomerHandler = async (customer) => {
  try {
    const response = await fetch(`http://localhost:3000/users/${customer.userId}`, {
      method: 'delete',
    });
    if (!response.ok) throw new Error('Failed to delete customer');
    customers.value = customers.value.filter(c => c.userId !== customer.userId);
  } catch (error) {
    console.error('Error deleting customer:', error);
  }
};

const addCustomerHandler = async (customer) => {
    try {
        const response = await fetch('http://localhost:3000/users/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...customer
        })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add customer: ${errorText}`);
    }
    console.log('Customer added successfully');
    } catch (error) {
        console.error('Error adding customer:', error);
    }
};


// Customer Details Modal

const selectedCustomer = ref(null);
const customerDetails = ref(false);

const openCustomerDetails = (customer) => {
    selectedCustomer.value = customer
    customerDetails.value = true;
}

const closeModal = () =>{
    customerDetails.value = false;
}



</script>

<template>
    
<main class="customerM">
    <SideBar/>
     <div class="container">
        <div class="headers"> 
            <h1 class="text-5xl font-black">Customer Management</h1>
            <h2 class="text-xl font-medium">Total customers: {{ totalCustomers }}</h2>
        </div>
        <div class="searchB">
            <SearchBar class="sBar"/>
            <div class="cusBtns">
                <FilterButton/>
                <AddButtonCustomer class="addBtn" data="Customer" @addCustomer="addCustomerHandler"/>
            </div>
        </div>

        <div class="tableContainer">
            <table class="dTable">
            <thead>
                <tr class="header-style">
                    <th>CUSTOMER ID</th>
                    <th>NAME</th>
                    <th>CONTACT NO.</th>
                    <th>STATUS</th>
                    <th>CREATED</th>
                    <th>ACTIONS</th>
                </tr>
            </thead>
            <tbody>
                <tr class="cRow" v-for="customer in customers" :key="customer.userId" @click="openCustomerDetails(customer)">
                    <td>{{ customer.userId }}</td>
                    <td>{{ customer.firstName }} {{ customer.lastName }}<br/> {{ customer.email }}</td>
                    <td>{{ customer.contactNo }}</td>
                    <td>{{ customer.status }}</td>
                    <td>{{ customer.dateReg }}</td>
                    <td @click.stop><T3ButtonCustomer :customer="customer" @deleteCustomer="deleteCustomerHandler"/></td>
                </tr>
            </tbody>
        </table>
        </div>
    </div>

    <div v-if="customerDetails" class="modal">
        <div class="modal-content">
            <h2>Customer Details</h2>
            <p>User ID: {{ selectedCustomer?.userId }}</p>
            <p>Role: {{ selectedCustomer?.role }}</p>
            <p>Name: {{ selectedCustomer?.firstName }} {{ selectedCustomer?.lastName }}</p>
            <p>Contact No. {{ selectedCustomer?.contactNo }}</p>
            <p>Email Address: {{ selectedCustomer?.email }}</p>
            <p>Address: {{ selectedCustomer?.address }}</p>
            <p>Date Registration {{ selectedCustomer?.dateReg }}</p>
            <button class="closeDetails" @click="closeModal">Close</button>
        </div>
    </div>
</main>

</template>

<style scoped>

.customerM{
    background-color: #EEF9EB;
}

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

.cusBtns {
    display: flex;
    gap: 5px; 
}

.tableContainer{
    max-height: 75%; 
    overflow-y: auto;
    border: 1px solid #194D1D;
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
    background-color: #194D1D;
    color: white;
    text-align: center;

    top: 0;
    z-index: 1;
    border-right: 1px solid #194D1D;
}

.cRow{
    width: 100%;
    font-size: 15px;
    height: auto;
    text-align: center;
    border: 1px solid #194D1D;
    cursor: pointer;
}

.cRow:hover {
  background-color: #e6f4e8;
}

.cRow:nth-child(even) {
  background-color: #eaf6e9;
}

.cRow:nth-child(odd) {
    background-color: #C7E3B6;
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