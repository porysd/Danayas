<script setup>
import { ref, defineProps, defineEmits, onMounted, computed } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import DatePicker from "primevue/datepicker";
import MultiSelect from "primevue/multiselect";
import FileUpload from "primevue/fileupload";
import { useCatalogStore } from "../../stores/catalogStore.js";
import { useDiscountStore } from "../../stores/discountStore.js";

const catalogStore = useCatalogStore();
const discountStore = useDiscountStore();

const catalogs = ref([]);

onMounted(() => {
  catalogStore.fetchAllCatalogs();
  discountStore.fetchAllDiscounts();
});
const toast = useToast();
defineProps(["data"]);

const showAddBookingModal = ref(false);
const showPaymentModal = ref(false);

const newBooking = ref({
  firstName: "" || null,
  lastName: "" || null,
  contactNo: "" || null,
  emailAddress: "" || null,
  address: "" || null,
  packageId: "",
  eventType: "" || null,
  checkInDate: "",
  checkOutDate: "",
  mode: "",
  arrivalTime: "" || null,
  catering: "" || null,
  numberOfGuest: "" || null,
  discountId: "" || null,
  bookingAddOns: [] || null,
  paymentTerms: "",
});

const paymentDetails = ref({
  mode: "",
  reference: "" || null,
  imageUrl: "" || null,
  senderName: "" || null,
});

const emit = defineEmits(["addBooking"]);

const openAddBookingModal = () => {
  showAddBookingModal.value = true;
};

const closeAddBookingModal = () => {
  showAddBookingModal.value = false;
  showPaymentModal.value = false;
};

const addBooking = () => {
  showAddBookingModal.value = false;
  showPaymentModal.value = true;
};

const backToBooking = () => {
  showAddBookingModal.value = true;
  showPaymentModal.value = false;
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}-${day}-${year}`;
};

const confirmBooking = async () => {
  if (
    !newBooking.value.packageId ||
    !newBooking.value.checkInDate ||
    !newBooking.value.checkOutDate ||
    !newBooking.value.mode ||
    !newBooking.value.paymentTerms
  ) {
    alert("Please fill in all required fields.");
    return;
  }
  // Find the discount by ID or name
  const discount = discountStore.discounts.find(
    (d) =>
      d.id === newBooking.value.discountId ||
      d.name.toLowerCase() === newBooking.value.discountId?.toLowerCase()
  );

  if (!discount) {
    toast.add({
      severity: "error",
      summary: "Discount not found",
      detail: "Please check the Discount ID or Name.",
    });
    return;
  }

  const bookingData = {
    ...newBooking.value,
    checkInDate: formatDate(newBooking.value.checkInDate),
    checkOutDate: formatDate(newBooking.value.checkOutDate),
    discountId: discount?.discountId || null,
    bookingAddOns: newBooking.value.bookingAddOns || [],
  };

  emit("addBooking", bookingData, paymentDetails.value);

  closeAddBookingModal();
};

console.log("Booking Data:", newBooking.value, paymentDetails.value);
</script>

<template>
  <div>
    <button
      class="adminButton text-white font-bold bg-[#194D1D] dark:bg-[#18181b] hover:bg-[#2B6D30]"
      @click="openAddBookingModal"
    >
      <i class="aIcon pi pi-plus"></i> Add {{ data }}
    </button>

    <Dialog
      v-model:visible="showAddBookingModal"
      modal
      :style="{ width: '60rem', minHeight: '40rem' }"
    >
      <template #header>
        <div class="flex flex-col items-center justify-center w-full">
          <h2 class="text-xl font-bold font-[Poppins]">Add Booking</h2>
        </div>
      </template>
      <div class="modal">
        <div class="packEvent">
          <div>
            <label>First Name:</label>
            <input
              class="packEvents"
              v-model="newBooking.firstName"
              placeholder="First Name"
            />
          </div>
          <div>
            <label>Last Name:</label>
            <input
              class="packEvents"
              v-model="newBooking.lastName"
              placeholder="Last Name"
            />
          </div>
          <div>
            <label>Contact No.:</label>
            <input
              class="packEvents"
              v-model="newBooking.contactNo"
              placeholder="Contact No"
            />
          </div>
          <div>
            <label>Email Address</label>
            <input
              class="packEvents"
              v-model="newBooking.emailAddress"
              placeholder="Email Address"
            />
          </div>
        </div>

        <div class="bookAddress">
          <div>
            <label>Address:</label>
            <input
              class="packEvents"
              v-model="newBooking.address"
              placeholder="Address"
            />
          </div>
        </div>

        <div class="packEvent">
          <div>
            <label>Package Name:</label>
            <input
              class="packEvents"
              v-model="newBooking.packageId"
              placeholder="Package Name"
            />
          </div>
          <div>
            <label>Event Type:</label>
            <input
              class="packEvents"
              v-model="newBooking.eventType"
              placeholder="Event Type"
            />
          </div>
        </div>

        <div class="cDate">
          <div>
            <label>Check-In Date:</label>
            <DatePicker
              v-model="newBooking.checkInDate"
              placeholder="Check-In"
              showIcon
              fluid
              iconDisplay="input"
              dateFormat="mm-dd-yy"
            />
          </div>
          <div>
            <label>Check-Out Date:</label>

            <DatePicker
              v-model="newBooking.checkOutDate"
              placeholder="Check-Out"
              showIcon
              fluid
              iconDisplay="input"
              dateFormat="mm-dd-yy"
            />
          </div>
          <div>
            <label>Mode:</label>
            <select v-model="newBooking.mode" class="border p-2 rounded w-full">
              <option value="day-time">Day Time</option>
              <option value="night-time">Night Time</option>
              <option value="whole-day">Whole Day</option>
            </select>
          </div>
        </div>

        <div class="atcng">
          <div>
            <label>Arrival Time:</label>
            <input
              class="atcngs"
              v-model="newBooking.arrivalTime"
              placeholder="Arival Time"
            />
          </div>
          <div>
            <label>Catering:</label>

            <select
              v-model="newBooking.catering"
              class="border p-2 rounded w-full"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label>Number of Guest:</label>
            <input
              class="atcngs"
              type="number"
              v-model="newBooking.numberOfGuest"
              placeholder="Number of Guest"
            />
          </div>
        </div>

        <div class="dAdd">
          <div>
            <label>Discount ID or Name:</label>
            <input
              v-model="newBooking.discountId"
              placeholder="Enter Discount ID or Name"
              class="packEvents"
              list="discount-suggestions"
            />
            <datalist id="discount-suggestions">
              <option
                v-for="discount in discountStore.discounts"
                :key="discount.discountId"
                :value="discount.discountId"
              >
                {{ discount.name }}
              </option>
            </datalist>
          </div>
          <div>
            <label>Add Ons:</label>
            <MultiSelect
              v-model="newBooking.bookingAddOns"
              :options="catalogStore.catalog"
              optionLabel="itemName"
              style="width: 100%"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-center gap-2 font-[Poppins] mt-7">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="closeAddBookingModal"
          class="font-bold w-full"
        />
        <Button
          type="button"
          label="Next"
          severity="primary"
          @click="addBooking"
          class="font-bold w-full"
        />
      </div>
    </Dialog>

    <Dialog
      v-model:visible="showPaymentModal"
      modal
      :style="{ width: '50rem', minHeight: '20rem' }"
    >
      <template #header>
        <div class="flex flex-col items-center justify-center w-full">
          <h2 class="text-xl font-bold font-[Poppins]">Payment Details:</h2>
        </div>
      </template>

      <div class="modal">
        <div class="packEvent">
          <div>
            <label>Payment Terms:</label>
            <select
              v-model="newBooking.paymentTerms"
              placeholder="Payment Terms"
              class="border p-2 rounded w-full"
            >
              <option value="installment">Installment</option>
              <option value="full-payment">Full Payment</option>
            </select>
          </div>
          <div>
            <label>Sender Name</label>
            <input
              v-model="paymentDetails.senderName"
              placeholder="Name of the sender"
            />
          </div>
        </div>
        <div class="packEvent">
          <div>
            <label>Mode of Payment:</label>

            <select
              v-model="paymentDetails.mode"
              placeholder="Book Status"
              class="border p-2 rounded w-full"
            >
              <option value="gcash">Gcash</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div>
            <template v-if="paymentDetails.mode === 'gcash'">
              <label>Reference No:</label>
              <input
                v-model="paymentDetails.reference"
                placeholder="Reference No"
              />
              <h1 class="text-xl font-bold font-[Poppins] mb-3 mt-3">
                Proof of Payment:
              </h1>
              <FileUpload
                ref="fileupload"
                mode="basic"
                name="demo[]"
                url="/api/upload"
                accept="image/*"
                :maxFileSize="1000000"
                @upload="onUpload"
              />
            </template>
            <template v-else>
              <label>Total Amount:</label>
              <input v-model="paymentDetails.totalAmount" placeholder="Total
              Amount"
            </template>
          </div>
        </div>

        <!--<div class="packEvent">
          <div>
            <label>Reservation Type:</label>
            <select
              v-model="paymentDetails.reservationType"
              placeholder="Reservation Type"
              class="border p-2 rounded w-full"
            >
              <option value="online">Online</option>
              <option value="walk-in">Walk In</option>
            </select>
          </div>
          <div>
            <label>userId:</label>
            <input v-model="paymentDetails.userId" placeholder="userId" />
          </div>
        </div>

        <div class="packEvent">
          <div>
            <label>createdBy:</label>
            <input v-model="paymentDetails.createdBy" placeholder="createdby" />
          </div>
        </div>-->
      </div>

      <div class="flex justify-center gap-2 font-[Poppins] mt-10">
        <Button
          type="button"
          label="Back"
          severity="secondary"
          @click="backToBooking"
          class="font-bold w-full"
        />
        <Button
          type="button"
          label="Book"
          severity="primary"
          @click="confirmBooking"
          class="font-bold w-full"
        />
      </div>
    </Dialog>
  </div>
  <Toast />
</template>

<style scoped>
.adminButton {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.aIcon {
  margin-right: 5px;
  font-size: 13px;
}

.packEvent,
.cDate,
.atcng,
.dAdd,
.bookAddress {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.packEvent div,
.cDate div,
.atcng div,
.dAdd div {
  display: flex;
  flex-direction: column;
  width: 40%;
}

.bookAddress div {
  display: flex;
  flex-direction: column;
  width: 81%;
}

.cDate div,
.atcng div {
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
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  border-radius: 5px;
  height: 40px;
}

.modal select {
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
}

:deep(.gcashUpload) {
  .p-fileupload {
    margin: auto;
    justify-content: start;
  }
  .p-fileupload-choose-button {
    background: #41ab5d;
  }
}

.p-multiselect {
  width: 10rem;
}
</style>
