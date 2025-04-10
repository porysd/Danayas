<script setup>
import { ref } from 'vue';
import SearchBar from '../components/SearchBar.vue';
import T3Button from '../components/T3ButtonBooking.vue';
import AddButton from '../components/AddButton.vue';
import FilterButton from '../components/FilterButton.vue';
import SideBar from '../components/SideBar.vue'

const employees = ref([
    { id: 1, name: 'John Doe', email: 'johndoe@gmail.com', contact: '123456789', status: 'Active', created: '2024-03-01' },
    { id: 2, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', status: 'Inactive', created: '2024-03-02' },
    { id: 3, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', status: 'Inactive', created: '2024-03-02' },
    { id: 4, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', status: 'Inactive', created: '2024-03-02' },
    { id: 5, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', status: 'Inactive', created: '2024-03-02' },
    { id: 6, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', status: 'Inactive', created: '2024-03-02' },
    { id: 7, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', status: 'Inactive', created: '2024-03-02' },
    { id: 8, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', status: 'Inactive', created: '2024-03-02' },
    { id: 9, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', status: 'Inactive', created: '2024-03-02' },
    { id: 10, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', status: 'Inactive', created: '2024-03-02' },
]); 
      
const totalEmployees = employees.value.length;

const bookings = ref([
    { id: 1, name: 'John Doe', email: 'johndoe@gmail.com', contact: '123456789', Package: 'Package 1', mode: 'Day', payterms: 'Full-Payment', checkIn:'2024-03-05', checkOut: '2024-03-05', amount:'PHP 12,000.00', status: 'Active', created: '2024-03-01' },
    { id: 2, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', Package: 'Package 1', mode: 'Day', payterms: 'Full-Payment', checkIn:'2024-03-05', checkOut: '2024-03-05', amount:'PHP 12,000.00',status: 'Inactive', created: '2024-03-02' },
    { id: 3, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', Package: 'Package 1', mode: 'Day', payterms: 'Full-Payment', checkIn:'2024-03-05', checkOut: '2024-03-05', amount:'PHP 12,000.00',status: 'Inactive', created: '2024-03-02' },
    { id: 4, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', Package: 'Package 1', mode: 'Day', payterms: 'Full-Payment', checkIn:'2024-03-05', checkOut: '2024-03-05', amount:'PHP 12,000.00',status: 'Inactive', created: '2024-03-02' },
    { id: 5, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', Package: 'Package 1', mode: 'Day', payterms: 'Full-Payment', checkIn:'2024-03-05', checkOut: '2024-03-05', amount:'PHP 12,000.00',status: 'Inactive', created: '2024-03-02' },
    { id: 6, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', Package: 'Package 1', mode: 'Day', payterms: 'Full-Payment', checkIn:'2024-03-05', checkOut: '2024-03-05', amount:'PHP 12,000.00',status: 'Inactive', created: '2024-03-02' },
    { id: 7, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', Package: 'Package 1', mode: 'Day', payterms: 'Full-Payment', checkIn:'2024-03-05', checkOut: '2024-03-05', amount:'PHP 12,000.00',status: 'Inactive', created: '2024-03-02' },
    { id: 8, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', Package: 'Package 1', mode: 'Day', payterms: 'Full-Payment', checkIn:'2024-03-05', checkOut: '2024-03-05', amount:'PHP 12,000.00',status: 'Inactive', created: '2024-03-02' },
    { id: 9, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', Package: 'Package 1', mode: 'Day', payterms: 'Full-Payment', checkIn:'2024-03-05', checkOut: '2024-03-05', amount:'PHP 12,000.00',status: 'Inactive', created: '2024-03-02' },
    { id: 10, name: 'Jane Smith', email: 'janesmith@gmail.com', contact: '987654321', Package: 'Package 1', mode: 'Day',payterms: 'Full-Payment', checkIn:'2024-03-05', checkOut: '2024-03-05', amount:'PHP 12,000.00',status: 'Inactive', created: '2024-03-02' },
]); 
      
const totalArchived = bookings.value.length + employees.value.length;



//Change logic
</script>

<template>
    
<main class="customerM">
    <SideBar/>
     <div class="container">
        <div class="headers"> 
            <h1 class="text-5xl font-black">Archived</h1>
            <h2 class="text-xl font-medium">Total archived: {{ totalArchived }}</h2>
        </div>
        <div class="searchB">
            <SearchBar class="sBar"/>
            <div class="cusBtns">
                <FilterButton/>
            </div>
        </div>

        <div class="tableContainer">
            <table class="dTable">
            <thead>
                <tr class="header-style">
                    <th>NAME</th>
                    <th>CONTACT NO.</th>
                    <th>STATUS</th>
                    <th>CREATED</th>
                    <th>ACTIONS</th>
                </tr>
            </thead>
            <tbody>
                <tr class="cRow" v-for="employee in employees" :key="employee.id">
                    <td>{{ employee.name }} <br/> {{ employee.email }}</td>
                    <td>{{ employee.contact }}</td>
                    <td>{{ employee.status }}</td>
                    <td>{{ employee.created }}</td>
                    <td><T3Button/></td>
                </tr>
            </tbody>
        </table>

        </div>

        <div class="tableContainer">
            <table class="dTable">
            <thead>
                <tr class="header-style">
                    <th>NAME</th>
                    <th>CONTACT NO.</th>
                    <th>PACKAGE</th>
                    <th>PAYMENT TERMS</th>
                    <th>CHECK IN</th>
                    <th>CHECK OUT</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                    <th>ACTIONS</th>
                </tr>
            </thead>
            <tbody>
                <tr class="bRow" v-for="booking in bookings" :key="booking.id">
                    <td>{{ booking.name }} <br/> {{ booking.email }}</td>
                    <td>{{ booking.contact }}</td>
                    <td>{{ booking.Package }} <br/> {{ booking.mode }}</td>
                    <td>{{ booking.payterms }}</td>
                    <td>{{ booking.checkIn }}</td>
                    <td>{{ booking.checkOut }}</td>
                    <td>{{ booking.amount }}</td>
                    <td>{{ booking.status }}</td>
                    <td>{{ booking.created }}</td>
                    <td><T3Button/></td>
                </tr>
            </tbody>
        </table>

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
    max-height: 37%; 
    height: 550px;
    overflow-y: auto;
    border: 1px solid #194D1D;
    border-radius: 7px;
    margin-bottom: 20px;
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
    position: sticky;
    top: 0;
    z-index: 1;
    border-right: 1px solid #194D1D;
}

.cRow, .bRow{
    width: 100%;
    font-size: 15px;
    height: auto;
    text-align: center;
    border: 1px solid #194D1D;
}

.cRow:hover, .bRow:hover {
  background-color: #e6f4e8;
}

.cRow:nth-child(even), .bRow:nth-child(even) {
  background-color: #eaf6e9;
}

.cRow:nth-child(odd), .bRow:nth-child(odd) {
    background-color: #C7E3B6;
}


</style>