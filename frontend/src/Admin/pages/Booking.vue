<script setup>
import { ref, onMounted, computed} from 'vue';
import SearchBar from '../components/SearchBar.vue';
import T3ButtonBooking from '../components/T3ButtonBooking.vue';
import AddButtonBooking from '../components/AddButtonBooking.vue';
import FilterButton from '../components/FilterButton.vue';
import SideBar from '../components/SideBar.vue'

const bookings = ref([]);
const packages = ref([]);

// Get All Booking with pagination
onMounted(async () => {

    const limit = 50;
    const page = 1;
    const bResponse = await fetch(`http://localhost:3000/bookings/bookings?limit=${limit}&page=${page}`);
    if(!bResponse.ok) throw new Error('Failed to fetch bookings');
    const bookingData = await bResponse.json();

    const pResponse = await fetch(`http://localhost:3000/packages/packages?limit=${limit}`);
    if (!pResponse.ok) throw new Error('Failed to fetch packages');
        
    const packagesData = await pResponse.json();

    packages.value = packagesData.items;

    bookings.value = bookingData.items;
});

const totalBookings = computed(() => bookings.value.length);

// Delete Booking by ID
const deleteBookingHandler = async (booking) => {
    try {
        const response = await fetch (`http://localhost:3000/bookings/${booking.bookingId}`, {
            method: 'delete',
        });
        if (!response.ok) throw new Error('Failed to delete booking');
        bookings.value = bookings.value.filter(c => c.bookingId !== booking.bookingId);
    } catch (error){
        console.error('Error deleting booking', error);
    }
};

const addBookingHandler = async (booking) => {
    const formattedBooking = {
        ...booking,
        userId: booking.userId ? Number(booking.userId) : null,
        createdBy: booking.createdBy ? Number(booking.createdBy) : null,
        packageId: Number(booking.packageId),
        numberOfGuest: Number(booking.numberOfGuest),
        discountPromoId: Number(booking.discountPromoId),
        totalAmountDue: booking.totalAmountDue ? Number(booking.totalAmountDue) : 0,
        catering: booking.catering === 'true' ? true : booking.catering === 'false' ? false : Boolean(booking.catering),
    };

    try {
        const response = await fetch('http://localhost:3000/bookings/booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formattedBooking),
        });

        const text = await response.text(); 
        console.log('Raw response:', text);

        const data = JSON.parse(text);
        
        if (!response.ok) throw new Error(`Failed to add booking: ${JSON.stringify(data)}`);
        console.log('Booking added successfully:', data);
    } catch (error) {
        console.error('Error adding booking:', error);
    }
};

// Upadte Booking Status by ID
const updateBookingHandler = async (booking) => {
  try {
    const response = await fetch(`http://localhost:3000/bookings/${booking.bookingId}/status`, { 
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookStatus: booking.bookStatus }), 
    });

    if (!response.ok) throw new Error('Failed to update booking');

    const updatedBooking = await response.json();
    const index = bookings.value.findIndex(b => b.bookingId === booking.bookingId);
    if (index !== -1) {
        bookings.value[index].bookStatus = booking.bookStatus; 
    }
  } catch (error) {
    console.error('Error updating booking:', error);
  }
};

// Get Package Name using packageId
const getPackageName = (packageId) => {
    const pkg = packages.value.find(p => p.packageId === packageId);
    return pkg ? pkg.name : 'Unknown Package';
};

// Booking Details Modal
const selectedBooking = ref(null);
const bookingDetails = ref(false);

const openBookingDetails = (booking) => {
    selectedBooking.value = booking;
    bookingDetails.value = true;
}

const closeModal = () => {
    bookingDetails.value = false;
}

//Change logic
</script>

<template>
    
<main class="bkM">
    <SideBar/>
     <div class="container">
        <div class="headers"> 
            <h1 class="text-5xl font-black">Booking</h1>
            <h2 class="text-xl font-medium">Total bookings: {{ totalBookings }}</h2>
        </div>
        <div class="searchB">
            <SearchBar class="sBar"/>
            <div class="bkBtns">
                <FilterButton/>
                <AddButtonBooking class="addBtn" data="Booking" @addBooking="addBookingHandler"/>
            </div>
        </div>

        <div class="tableContainer">
            <table class="dTable">
            <thead>
                <tr class="header-style">
                    <th>BOOKING ID:</th>
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
                <tr class="bRow" v-for="booking in bookings" :key="booking.id" @click="openBookingDetails(booking)">
                    <td>{{ booking.bookingId }}</td>
                    <td>{{ booking.firstName }} {{ booking.lastName }} <br/> {{ booking.email }}</td>
                    <td>{{ booking.contactNo }}</td>
                    <td>{{ getPackageName(booking.packageId) }} <br/> {{ booking.mode }}</td>
                    <td>{{ booking.paymentTerms }}</td>
                    <td>{{ booking.checkInDate }}</td>
                    <td>{{ booking.checkOutDate }}</td>
                    <td>{{ booking.totalAmountDue }}</td>
                    <td>{{ booking.bookStatus }}</td>
                    <td>{{ booking.createdAt }}</td>
                    <td @click.stop><T3ButtonBooking 
                        :booking="booking"
                        :packageName="getPackageName(booking.packageId)"
                        @deleteBooking="deleteBookingHandler" 
                        @updateStatus="updateBookingHandler" /></td>
                </tr>
            </tbody>
        </table>

        </div>
    </div>

    <div v-if="bookingDetails" class="modal">
        <div class="modal-content">
            <h2>Booking Details</h2>
            <p>Booking ID: {{ selectedBooking?.bookingId }}</p>
            <p>User ID: {{ selectedBooking?.userId }}</p>
            <p>Created By ID: {{ selectedBooking?.createdBy }}</p>
            <p>Name: {{ selectedBooking?.firstName }} {{ selectedBooking?.lastName }}</p>
            <p>Contact No. {{ selectedBooking?.contactNo }}</p>
            <p>Email Address: {{ selectedBooking?.emailAddress }}</p>
            <p>Address: {{ selectedBooking?.address }}</p>
            <p>Package Name: {{ getPackageName(selectedBooking?.packageId) }}</p>
            <p>Check IN: {{ selectedBooking?.checkInDate }}</p>
            <p>Check OUT: {{ selectedBooking?.checkOutDate }}</p>
            <p>Mode: {{ selectedBooking?.mode}}</p>
            <p>Arrival Time: {{ selectedBooking?.arrivalTime }}</p>
            <p>Event Type: {{ selectedBooking?.eventType }}</p>
            <p>Number of Guest: {{ selectedBooking?.numberOfGuest }}</p>
            <p>Catering: {{ selectedBooking?.catering }}</p>
            <p>Discount: {{ selectedBooking?.discountPromoId }}</p>
            <p>Payment Terms: {{ selectedBooking?.paymentTerms }}</p>
            <p>Total Amount Due: {{ selectedBooking?.totalAmountDue }}</p>
            <p>Booking Status: {{ selectedBooking?.bookStatus }}</p>
            <p>Reservation Type: {{ selectedBooking?.reservationType }}</p>
            <p>Created At: {{ selectedBooking?.createdAt }}</p>
            <button class="closeDetails" @click="closeModal">Close</button>
        </div>
    </div>
</main>

</template>

<style scoped>

.bkM{
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

.bkBtns {
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

.bRow{
    width: 100%;
    font-size: 15px;
    height: auto;
    text-align: center;
    border: 1px solid #194D1D;
    cursor: pointer;
}

.bRow:hover {
  background-color: #e6f4e8;
}

.bRow:nth-child(even) {
  background-color: #eaf6e9;
}

.bRow:nth-child(odd) {
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