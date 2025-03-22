<script setup>
import { ref, defineProps, defineEmits } from 'vue';

defineProps(['data'])

const showAddBookingModal = ref(false);
const newBooking = ref({
    firstName: '',
    lastName: '',
    contactNo: '',
    emailAddress: '',
    address: '',
    packageId: '',
    eventType: '',
    checkInDate: '',
    checkOutDate: '',
    mode: '',
    arrivalTime: '',
    catering: '',
    numberOfGuest: '',
    discountPromoId: '',
    bookingAddOns: '',
})

const emit = defineEmits(['addBooking']);

const openAddBookingModal = () => {
    showAddBookingModal.value = true;
}

const closeAddBookingModal = () => {
    showAddBookingModal.value = false;
}

const addBooking = () => {
    emit('addBooking', {
        firstName: newBooking.value.firstName,
        lastName: newBooking.value.lastName,
        contactNo: newBooking.value.contactNo,
        emailAddress: newBooking.value.emailAddress,
        address: newBooking.value.address,
        packageId: newBooking.value.packageId,
        eventType: newBooking.value.eventType,
        checkInDate: newBooking.value.chechInDate,
        checkOutDate: newBooking.value.checkOutDate,
        mode: newBooking.value.mode,
        arrivalTime: newBooking.value.arrivalTime,
        catering: newBooking.value.catering,
        numberOfGuest: newBooking.value.numberOfGuest,
        discountPromoId: newBooking.value.discountPromoId,
        bookingAddOns: newBooking.value.bookingAddOns
    })

    closeAddBookingModal();
}

</script>

<template>

    <div>
        <button class="adminButton text-white font-bold bg-[#194D1D] hover:bg-[#2B6D30]" @click="openAddBookingModal"><i class="aIcon pi pi-plus"></i> Add {{ data }}</button>

        <div v-if="showAddBookingModal" class="modal-overlay">
            <div class="modal">
                <h2 class="font-black text-2xl mb-5 text-center">Add Booking:</h2>

                <div class="packEvent">
                    <div>
                        <label>First Name:</label>
                        <input class="packEvents" v-model="newBooking.firstName" placeholder="First Name" />
                    </div>
                    <div>
                        <label>Last Name:</label>
                        <input class="packEvents" v-model="newBooking.lastName" placeholder="Last Name" />
                    </div>
                    <div>
                        <label>Contact No.:</label>
                        <input class="packEvents" v-model="newBooking.contactNo" placeholder="Contact No" />
                    </div>
                    <div>
                        <label>Email Address</label>
                        <input class="packEvents" v-model="newBooking.emailAddress" placeholder="Email Address" />
                    </div>
                </div>

                <div class="bookAddress">
                    <div>
                        <label>Address:</label>
                        <input class="packEvents" v-model="newBooking.address" placeholder="Address" />
                    </div>
                </div>


                <div class="packEvent">
                    <div>
                        <label>Package Name:</label>
                        <input class="packEvents" v-model="newBooking.packageId" placeholder="Package Name" />
                    </div>
                    <div>
                        <label>Event Type:</label>
                        <input class="packEvents" v-model="newBooking.eventType" placeholder="Event Type" />
                    </div>
                </div>

                <div class="cDate">
                    <div>
                        <label>Check-In Date:</label>
                        <input class="cDates" v-model="newBooking.checkInDate" placeholder="Check-In" />
                    </div>
                    <div>
                        <label>Check-Out Date:</label>
                        <input class="cDates" v-model="newBooking.checkOutDate" placeholder="Check-Out" />
                    </div>
                    <div>        
                        <label>Mode:</label>
                        <input class="cDates" v-model="newBooking.mode" placeholder="Mode" />
                    </div>
                </div>

                <div class="atcng">
                    <div>
                        <label>Arrival Time:</label>
                        <input class="atcngs"v-model="newBooking.arrivalTime" placeholder="Arival Time" />
                    </div>
                    <div>
                        <label>Catering:</label>
                        <input class="atcngs"v-model="newBooking.catering" placeholder="Catering" />
                    </div>
                    <div>        
                        <label>Number of Guest:</label>
                        <input class="atcngs"v-model="newBooking.numberOfGuest" placeholder="Number of Guest" />
                    </div>
                </div>

                <div class="dAdd">
                    <div>
                        <label>Discount:</label>
                        <input class="dAdds" v-model="newBooking.discountPromoId" placeholder="Discount" />
                    </div>
                    <div>
                        <label>Add Ons:</label>
                        <input class="dAdds" v-model="newBooking.bookingAddOn" placeholder="Add Ons" />
                    </div>
                </div>


                <div class="modal-actions">
                    <button class="cancelBtn font-bold" @click="closeAddBookingModal">Cancel</button>
                    <button class="saveBtn font-bold" @click="addBooking">Save</button>
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
  width: 70%;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #333;
}

.packEvent, .cDate, .atcng, .dAdd, .bookAddress {
  display: flex;
  flex-wrap: wrap;
  gap: 10px; 
  justify-content: center;
}

.packEvent div, .cDate div, .atcng div, .dAdd div {
  display: flex;
  flex-direction: column; 
  width: 40%;
}

.bookAddress div{
  display: flex;
  flex-direction: column; 
  width: 81%;
}

.cDate div, .atcng div {
  width: 26.3%; 
}

.modal label {
  display: block; 
  text-align: left; 
  font-size: 16px;
  font-weight: 400;
}

.modal input {
  padding: 8px;
  border: 1px solid #ccc;
  background-color: #FCF5F5;
  border-radius: 10px;
  height: 40px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  margin-right: 100px;
  margin-bottom: 10px;
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