<script setup>
import { ref, onMounted, computed } from 'vue';
import SearchBar from '../components/SearchBar.vue';
import T3Button from '../components/T3ButtonBooking.vue';
import AddButton from '../components/AddButton.vue';
import FilterButton from '../components/FilterButton.vue';
import SideBar from '../components/SideBar.vue'

const packages = ref([]);

onMounted (async () => {
    try{

        const limit = 50;
        const response = await fetch(`http://localhost:3000/packages/packages?limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch packages');

        const packagesData = await response.json();
        packages.value = packagesData.items;

    } catch (error){
        console.error('Error fetching packages:', error);
    }
});

const promos = ref([
    {id: 1, name: 'Cruz Package', price: 'PHP 7000.00', status: 'Active', timeLimit:'2024-04-01', created: '2024-03-01'},
    {id: 2, name: 'Cruz Package', price: 'PHP 7000.00', status: 'Active', timeLimit:'2024-04-01', created: '2024-03-01'},
    {id: 3, name: 'Cruz Package', price: 'PHP 7000.00', status: 'Active', timeLimit:'2024-04-01', created: '2024-03-01'},
    {id: 4, name: 'Cruz Package', price: 'PHP 7000.00', status: 'Active', timeLimit:'2024-04-01', created: '2024-03-01'},
    {id: 5, name: 'Cruz Package', price: 'PHP 7000.00', status: 'Active', timeLimit:'2024-04-01', created: '2024-03-01'},
    {id: 6, name: 'Cruz Package', price: 'PHP 7000.00', status: 'Active', timeLimit:'2024-04-01', created: '2024-03-01'},
    {id: 7, name: 'Cruz Package', price: 'PHP 7000.00', status: 'Active', timeLimit:'2024-04-01', created: '2024-03-01'},
    {id: 8, name: 'Cruz Package', price: 'PHP 7000.00', status: 'Active', timeLimit:'2024-04-01', created: '2024-03-01'},
    {id: 9, name: 'Cruz Package', price: 'PHP 7000.00', status: 'Active', timeLimit:'2024-04-01', created: '2024-03-01'},
    {id: 10, name: 'Cruz Package', price: 'PHP 7000.00', status: 'Active', timeLimit:'2024-04-01', created: '2024-03-01'},
])
      
//Package Details

const selectedPackage = ref(null);
const packageDetails = ref(false);

const openPackageDetails = (packageT) => {
    selectedPackage.value = packageT;
    packageDetails.value = true;
}

const closeModal = () => {
    packageDetails.value = false
}

</script>

<template>
    
<main class="paM">
    <SideBar/>
     <div class="container">
        <div class="headers"> 
            <h1 class="text-5xl font-black">Packages and Promos</h1>           
        </div>
        <div class="searchB">
            <SearchBar class="sBar"/>
            <div class="paBtns">
                <FilterButton/>
                <AddButton class="addBtn" data="Promos"/>
                <AddButton class="addBtn" data="Packages"/>
            </div>
        </div>

        <div class="tableContainer">
            <table class="dTable">
                <thead>
                    <tr class="header-style">
                        <th>PACKAGE NAME</th>
                        <th>PRICE</th>
                        <th>STATUS</th>
                        <th>CREATED</th>
                        <th>UPDATED</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="paRow" v-for="packageT in packages" :key="packageT.id" @click="openPackageDetails(packageT)">
                        <td>{{ packageT.name }}</td>
                        <td>{{ packageT.price }}</td>
                        <td>{{ packageT.status }}</td>
                        <td>{{ packageT.createdAt }}</td>
                        <td>{{ packageT.updatedAt }}</td>
                        <td @click.stop><T3Button/></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="tableContainer">
            <table class="dTable">
                <thead>
                    <tr class="header-style">
                        <th>PROMO NAME</th>
                        <th>PRICE</th>
                        <th>STATUS</th>
                        <th>TIME LIMIT</th>
                        <th>CREATED</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="paRow" v-for="promo in promos" :key="promo.id">
                        <td>{{ promo.name }}</td>
                        <td>{{ promo.price }}</td>
                        <td>{{ promo.status }}</td>
                        <td>{{ promo.timeLimit }}</td>
                        <td>{{ promo.created }}</td>
                        <td><T3Button/></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div v-if="packageDetails" class="modal">
        <div class="modal-content">
            <h2>Package Details</h2>
            <p>User ID: {{ selectedPackage?.packageId }}</p>
            <p>Package Name: {{ selectedPackage?.name }}</p>
            <p>Package Price: {{ selectedPackage?.price }}</p>
            <p>Package Description: {{ selectedPackage?.description }}</p>
            <p>Package Status: {{ selectedPackage?.status }}</p>
            <p>Created At: {{ selectedPackage?.createdAt }}</p>
            <p>Updated At: {{ selectedCustomer?.updatedAt }}</p>
            <button class="closeDetails" @click="closeModal">Close</button>
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
    cursor: pointer;
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