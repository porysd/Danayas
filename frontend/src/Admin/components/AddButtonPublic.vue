<script setup>
import { ref, defineProps, defineEmits, onMounted, computed, watch } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import DatePicker from "primevue/datepicker";
import MultiSelect from "primevue/multiselect";
import FileUpload from "primevue/fileupload";
import { useCatalogStore } from "../../stores/catalogStore.js";
import { useDiscountStore } from "../../stores/discountStore.js";
import { formatDate } from "../../utility/dateFormat.js";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";

const toast = useToast();
const catalogStore = useCatalogStore();
const discountStore = useDiscountStore();

onMounted(() => {
  catalogStore.fetchAllCatalogs();
  discountStore.fetchAllDiscounts();
});

const showAddBookingModal = ref(false);
const showPaymentModal = ref(false);

const newPublic = ref({
  firstName: "" || null,
  lastName: "" || null,
  contactNo: "" || null,
  address: "" || null,
  discountId: "" || null,
  mode: "",
  paymentTerms: "",
  entryDate: "",
  numAdults: 0,
  numKids: 0,
  adultGuestNames: [],
  kidGuestNames: [],
});

const paymentDetails = ref({
  paymentMethod: "",
  reference: "" || null,
  imageUrl: "" || null,
  senderName: "" || null,
  tenderedAmount: "" || null,
});

defineProps(["data"]);
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

watch(
  () => newPublic.value.numAdults,
  (newVal, oldVal) => {
    if (newVal > oldVal) {
      for (let i = oldVal; i < newVal; i++)
        newPublic.value.adultGuestNames.push("");
    } else {
      newPublic.value.adultGuestNames.splice(newVal);
    }
  }
);

watch(
  () => newPublic.value.numKids,
  (newVal, oldVal) => {
    if (newVal > oldVal) {
      for (let i = oldVal; i < newVal; i++)
        newPublic.value.kidGuestNames.push("");
    } else {
      newPublic.value.kidGuestNames.splice(newVal);
    }
  }
);

const confirmBooking = async () => {
  // if (
  //   !newPublic.value.packageId ||
  //   !newPublic.value.checkInDate ||
  //   !newPublic.value.checkOutDate ||
  //   !newPublic.value.mode ||
  //   !newPublic.value.paymentTerms
  // ) {
  //   alert("Please fill in all required fields.");
  //   return;
  // }
  // Find the discount by ID or name
  const discount = discountStore.discounts.find(
    (d) =>
      d.id === newPublic.value.discountId ||
      d.name.toLowerCase() === newPublic.value.discountId?.toLowerCase()
  );

  const bookingData = {
    ...newPublic.value,
    entryDate: formatDate(newPublic.value.entryDate),
    discountId: discount?.discountId || null,
    // bookingAddOns: newBooking.value.bookingAddOns || [],
  };

  emit("addBooking", bookingData, paymentDetails.value);

  closeAddBookingModal();
};

console.log("Booking Data:", newPublic.value, paymentDetails.value);
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
          <h2 class="text-xl font-bold font-[Poppins]">Add Public Booking</h2>
        </div>
      </template>
      <div class="modal">
        <div class="packEvent">
          <div>
            <label>First Name:</label>
            <input
              class="packEvents"
              v-model="newPublic.firstName"
              placeholder="First Name"
            />
          </div>
          <div>
            <label>Last Name:</label>
            <input
              class="packEvents"
              v-model="newPublic.lastName"
              placeholder="Last Name"
            />
          </div>
          <div>
            <label>Contact No.:</label>
            <input
              class="packEvents"
              v-model="newPublic.contactNo"
              placeholder="Contact No"
            />
          </div>
          <div>
            <label>Email Address</label>
            <input
              class="packEvents"
              v-model="newPublic.emailAddress"
              placeholder="Email Address"
            />
          </div>
        </div>

        <div class="bookAddress">
          <div>
            <label>Address:</label>
            <input
              class="packEvents"
              v-model="newPublic.address"
              placeholder="Address"
            />
          </div>
        </div>

        <div class="packEvent">
          <div>
            <label>Entry Date:</label>
            <DatePicker
              v-model="newPublic.entryDate"
              placeholder="Entry Date"
              showIcon
              fluid
              iconDisplay="input"
              dateFormat="mm-dd-yy"
            />
          </div>
          <div>
            <label>Mode:</label>
            <select v-model="newPublic.mode" class="border p-2 rounded w-full">
              <option value="day-time">Day Time</option>
              <option value="night-time">Night Time</option>
            </select>
          </div>
        </div>

        <div class="flex justify-center gap-3">
          <div class="w-[40%]">
            <label>Discount Code:</label>
            <input class="packEvents" placeholder="" style="width: 100%" />
          </div>
          <div class="w-[40%]">
            <label>Add Ons:</label>
            <MultiSelect
              v-model="newPublic.bookingAddOns"
              :options="catalogStore.catalog"
              optionLabel="itemName"
              style="width: 100%"
            />
          </div>
        </div>

        <div class="packEvent">
          <div class="flex flex-col">
            <label>Number of Adults:</label>
            <InputNumber
              v-model="newPublic.numAdults"
              showButtons
              buttonLayout="horizontal"
              style="width: 100%"
              :min="0"
              :max="99"
            >
              <template #incrementbuttonicon>
                <span class="pi pi-plus" />
              </template>
              <template #decrementbuttonicon>
                <span class="pi pi-minus" />
              </template>
            </InputNumber>

            <div
              v-for="(adult, index) in newPublic.adultGuestNames"
              :key="'adult-' + index"
              class="mt-2"
              style="width: 100%"
            >
              <InputText
                v-model="newPublic.adultGuestNames[index]"
                placeholder="Enter guest name"
              />
            </div>
          </div>
          <div>
            <label>Number of Kids:</label>
            <InputNumber
              v-model="newPublic.numKids"
              showButtons
              buttonLayout="horizontal"
              style="width: 100%"
              :min="0"
              :max="99"
            >
              <template #incrementbuttonicon>
                <span class="pi pi-plus" />
              </template>
              <template #decrementbuttonicon>
                <span class="pi pi-minus" />
              </template>
            </InputNumber>

            <div
              v-for="(kid, index) in newPublic.kidGuestNames"
              :key="'kid-' + index"
              class="mt-2"
              style="width: 100%"
            >
              <InputText
                v-model="newPublic.kidGuestNames[index]"
                placeholder="Enter kid's name"
              />
            </div>
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
              v-model="newPublic.paymentTerms"
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
              v-model="paymentDetails.paymentMethod"
              placeholder="Book Status"
              class="border p-2 rounded w-full"
            >
              <option value="gcash">Gcash</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div>
            <template v-if="paymentDetails.paymentMethod === 'gcash'">
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
              <input v-model.number="paymentDetails.tenderedAmount"
              placeholder="Total Amount"
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

<style scope>
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
}
</style>
