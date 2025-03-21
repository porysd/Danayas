<script setup>
import { ref, onMounted } from 'vue';
import SearchBar from '../components/SearchBar.vue';
import T3Button from '../components/T3ButtonBooking.vue';
import AddButton from '../components/AddButton.vue';
import FilterButton from '../components/FilterButton.vue';
import SideBar from '../components/SideBar.vue'


// const discounts = ref({});

// onMounted (async () => {
//     try{

//         const limit = 50;
//         const response = await fetch(`http://localhost:3000/packages/packages?limit=${limit}`);
//         if (!response.ok) throw new Error('Failed to fetch packages');

//         const packagesData = await response.json();
//         packages.value = packagesData.items;

//         } catch (error){
//         console.error('Error fetching packages:', error);
//         }
// });

const discounts = ref([
    {id: 1, discountName: 'Senior Citizen', percentage: '10%', status: 'Active', created: '2024-03-01', updated: '2024-03-01'},  
    {id: 2, discountName: 'Senior Citizen', percentage: '10%', status: 'Active', created: '2024-03-01', updated: '2024-03-01'},
    {id: 3, discountName: 'Senior Citizen', percentage: '10%', status: 'Active', created: '2024-03-01', updated: '2024-03-01'},
    {id: 4, discountName: 'Senior Citizen', percentage: '10%', status: 'Active', created: '2024-03-01', updated: '2024-03-01'},
    {id: 5, discountName: 'Senior Citizen', percentage: '10%', status: 'Active', created: '2024-03-01', updated: '2024-03-01'},
    {id: 6, discountName: 'Senior Citizen', percentage: '10%', status: 'Active', created: '2024-03-01', updated: '2024-03-01'},
    {id: 7, discountName: 'Senior Citizen', percentage: '10%', status: 'Active', created: '2024-03-01', updated: '2024-03-01'},
    {id: 8, discountName: 'Senior Citizen', percentage: '10%', status: 'Active', created: '2024-03-01', updated: '2024-03-01'},
    {id: 9, discountName: 'Senior Citizen', percentage: '10%', status: 'Active', created: '2024-03-01', updated: '2024-03-01'},
    {id: 10, discountName: 'Senior Citizen', percentage: '10%', status: 'Active', created: '2024-03-01', updated: '2024-03-01'},
]); 

const addOns = ref([
    {id: 1, name: 'Chairs', price: 'PHP 200.00', quantity: 10, status: 'Active', created: '2024-03-01'},
    {id: 2, name: 'Chairs', price: 'PHP 200.00', quantity: 10, status: 'Active', created: '2024-03-01'},
    {id: 3, name: 'Chairs', price: 'PHP 200.00', quantity: 10, status: 'Active', created: '2024-03-01'},
    {id: 4, name: 'Chairs', price: 'PHP 200.00', quantity: 10, status: 'Active', created: '2024-03-01'},
    {id: 5, name: 'Chairs', price: 'PHP 200.00', quantity: 10, status: 'Active', created: '2024-03-01'},
    {id: 6, name: 'Chairs', price: 'PHP 200.00', quantity: 10, status: 'Active', created: '2024-03-01'},
    {id: 7, name: 'Chairs', price: 'PHP 200.00', quantity: 10, status: 'Active', created: '2024-03-01'},
    {id: 8, name: 'Chairs', price: 'PHP 200.00', quantity: 10, status: 'Active', created: '2024-03-01'},
    {id: 9, name: 'Chairs', price: 'PHP 200.00', quantity: 10, status: 'Active', created: '2024-03-01'},
    {id: 10, name: 'Chairs', price: 'PHP 200.00', quantity: 10, status: 'Active', created: '2024-03-01'},

])
      

//Change logic
</script>

<template>
    
<main class="paM">
    <SideBar/>
     <div class="container">
        <div class="headers"> 
            <h1 class="text-5xl font-black">Discount and Add Ons</h1>           
        </div>
        <div class="searchB">
            <SearchBar class="sBar"/>
            <div class="paBtns">
                <FilterButton/>
                <AddButton class="addBtn" data="Add Ons"/>
                <AddButton class="addBtn" data="Discount"/>
            </div>
        </div>

        <div class="tableContainer">
            <table class="dTable">
                <thead>
                    <tr class="header-style">
                        <th>DISCOUNT NAME</th>
                        <th>PERCENTAGE</th>
                        <th>STATUS</th>
                        <th>CREATED</th>
                        <th>UPDATED</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="paRow" v-for="discount in discounts" :key="discount.id">
                        <td>{{ discount.discountName }}</td>
                        <td>{{ discount.percentage }}</td>
                        <td>{{ discount.status }}</td>
                        <td>{{ discount.created }}</td>
                        <td>{{ discount.updated }}</td>
                        <td><T3Button/></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="tableContainer">
            <table class="dTable">
                <thead>
                    <tr class="header-style">
                        <th>ADD ONS NAME</th>
                        <th>PRICE</th>
                        <th>QUANTITY</th>
                        <th>STATUS</th>
                        <th>CREATED</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="paRow" v-for="addOn in addOns" :key="addOn.id">
                        <td>{{ addOn.name }}</td>
                        <td>{{ addOn.price }}</td>
                        <td>{{ addOn.quantity }}</td>
                        <td>{{ addOn.status }}</td>
                        <td>{{ addOn.created }}</td>
                        <td><T3Button/></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</main>

</template>

<style scoped>

.paM{
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

.paBtns {
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

.paRow{
    width: 100%;
    font-size: 15px;
    height: auto;
    text-align: center;
    border: 1px solid #194D1D;
}

.paRow:hover {
  background-color: #e6f4e8;
}

.paRow:nth-child(even) {
  background-color: #eaf6e9;
}

.paRow:nth-child(odd) {
    background-color: #C7E3B6;
}


</style>