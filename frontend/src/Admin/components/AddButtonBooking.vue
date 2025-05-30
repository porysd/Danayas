<script setup>
import { ref, defineProps, defineEmits, onMounted, watch, computed } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import DatePicker from "primevue/datepicker";
import MultiSelect from "primevue/multiselect";
import FileUpload from "primevue/fileupload";
import { formatDate } from "../../utility/dateFormat";
import { formatPeso } from "../../utility/pesoFormat.js";
import Select from "primevue/select";
// import { getBookingStyle } from "../../composables/calendarStyle.js";
import { useCatalogStore } from "../../stores/catalogStore.js";
import { useDiscountStore } from "../../stores/discountStore.js";
import { useBookingStore } from "../../stores/bookingStore.js";
import { usePublicEntryStore } from "../../stores/publicEntryStore.js";
import { useBlockedStore } from "../../stores/blockedDateStore.js";
import { usePackageStore } from "../../stores/packageStore.js";

const bookingStore = useBookingStore();
const publicStore = usePublicEntryStore();
const blockStore = useBlockedStore();

const catalogStore = useCatalogStore();
const discountStore = useDiscountStore();
const packageStore = usePackageStore();

onMounted(() => {
  catalogStore.fetchAllCatalogs();
  discountStore.fetchAllDiscounts();
  packageStore.fetchAllPackages();
  packageStore.fetchAllPromos();
  bookingStore.fetchUserBookings();
  publicStore.fetchAllPublic();
  blockStore.fetchAllBlocked();
});
const toast = useToast();
defineProps(["data", "packageName"]);

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
  amountPaid: "" || null,
  catering: "" || null,
  numberOfGuest: "" || null,
  discountId: "" || null,
  catalogAddOnIds: [] || null,
  paymentTerms: "",
});

const paymentDetails = ref({
  paymentMethod: "",
  reference: null,
  imageUrl: null,
  senderName: "" || null,
  tenderedAmount: "" || null,
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

const minDate = new Date();

const disabledDates = computed(() => {
  const disabled = [];

  // Blocked dates
  blockStore.blocked.forEach((bd) => {
    if (bd.blockedDates) {
      disabled.push(new Date(bd.blockedDates));
    }
  });

  // Fully booked dates (whole-day or both day-time and night-time)
  const bookingsByDate = {};
  bookingStore.bookings.forEach((b) => {
    if (b.checkInDate) {
      const date = b.checkInDate;
      if (!bookingsByDate[date]) bookingsByDate[date] = new Set();
      bookingsByDate[date].add(b.mode);
    }
  });
  publicStore.public.forEach((p) => {
    if (p.entryDate) {
      const date = p.entryDate;
      if (!bookingsByDate[date]) bookingsByDate[date] = new Set();
      bookingsByDate[date].add(p.mode);
    }
  });

  Object.entries(bookingsByDate).forEach(([date, modes]) => {
    if (
      modes.has("whole-day") ||
      (modes.has("day-time") && modes.has("night-time"))
    ) {
      disabled.push(new Date(date));
    }
  });

  return disabled;
});

const getBookingStyle = (slotDate) => {
  const formattedDate = `${slotDate.year}-${String(slotDate.month + 1).padStart(
    2,
    "0"
  )}-${String(slotDate.day).padStart(2, "0")}`;

  // Collect all booking/public modes for the date
  const mode = new Set();
  let isBlocked = false;

  bookingStore.bookings.forEach((b) => {
    if (b.checkInDate === formattedDate) {
      mode.add(b.mode);
    }
  });

  publicStore.public.forEach((p) => {
    if (p.entryDate === formattedDate) {
      mode.add(p.mode);
    }
  });

  if (blockStore.blocked.some((bd) => bd.blockedDates === formattedDate)) {
    isBlocked = true;
  }

  let backgroundColor, color;

  if (isBlocked) {
    backgroundColor = "grey";
    color = "white";
  } else if (
    mode.has("whole-day") ||
    (mode.has("day-time") && mode.has("night-time"))
  ) {
    backgroundColor = "#FF6B6B"; // Fully Booked
    color = "white";
  } else if (mode.has("day-time")) {
    backgroundColor = "#6A5ACD"; // Night Available
    color = "white";
  } else if (mode.has("night-time")) {
    backgroundColor = "#FFD580"; // Day Available
    color = "black";
  } else {
  }

  return {
    backgroundColor,
    color,
    width: "40px",
    height: "40px",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "10rem",
    fontSize: "17px",
  };
};

const onFileSelect = (event) => {
  const file = event.files[0];
  if (file) {
    paymentDetails.value.imageUrl = file;
  }
};

const selectedPackage = computed(() => {
  const allPackages = [
    ...(packageStore.packages || []),
    ...(packageStore.promos || []),
  ];
  return allPackages.find(
    (pkg) => pkg.packageId === newBooking.value.packageName
  );
});

const selectedDiscount = computed(() => {
  return discountStore.discounts.find(
    (d) => d.discountId === newBooking.value.discountId
  );
});

const addOnsTotal = computed(() => {
  if (!newBooking.value.catalogAddOnIds || !catalogStore.catalog) return 0;
  return newBooking.value.catalogAddOnIds.reduce((sum, addOnId) => {
    const addOn = catalogStore.catalog.find(
      (c) => c.catalogAddOnId === addOnId
    );
    return sum + (addOn?.price || 0);
  }, 0);
});

const totalAmount = computed(() => {
  const pkgPrice = selectedPackage.value?.price || 0;
  const discount = selectedDiscount.value?.percentage || 0;
  const discounted = pkgPrice - pkgPrice * (discount / 100);
  return Math.max(discounted + addOnsTotal.value, 0);
  // return discounted;
});

watch(
  () => [newBooking.value.checkInDate, newBooking.value.mode],
  ([checkInDate, mode]) => {
    if (!checkInDate) {
      newBooking.value.checkOutDate = "";
      return;
    }
    const date = new Date(checkInDate);
    if (mode === "night-time" || mode === "whole-day") {
      date.setDate(date.getDate() + 1);
      newBooking.value.checkOutDate = formatDate(date);
    } else {
      newBooking.value.checkOutDate = checkInDate;
    }
  }
);

const confirmBooking = async () => {
  if (
    !newBooking.value.packageName ||
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
    (d) => d.discountId === newBooking.value.discountId
  );

  const bookingData = {
    ...newBooking.value,
    packageId: newBooking.value.packageName,
    discountId: discount?.discountId || null,
    catalogAddOnIds: newBooking.value.catalogAddOnIds || [],
  };

  const paymentPayload = {
    paymentMethod: paymentDetails.value.paymentMethod,
    senderName: paymentDetails.value.senderName,
    tenderedAmount: paymentDetails.value.tenderedAmount,
  };
  if (paymentDetails.value.paymentMethod === "gcash") {
    paymentPayload.reference = paymentDetails.value.reference;
    paymentPayload.imageUrl = paymentDetails.value.imageUrl;
  }

  emit("addBooking", bookingData, paymentPayload);

  closeAddBookingModal();
};
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

        <div class="flex justify-center gap-3">
          <div class="w-full md:w-[40%]">
            <label for="packages">Package Name:</label>
            <Select
              id="packages"
              v-model="newBooking.packageName"
              :options="[
                ...(packageStore.packages || []),
                ...(packageStore.promos || []),
              ]"
              optionLabel="name"
              optionValue="packageId"
              placeholder="Select a Package or Promos"
              class="w-full"
            />
          </div>
          <div class="w-[40%]">
            <label>Event Type:</label>
            <input
              class="packEvents"
              v-model="newBooking.eventType"
              placeholder="Event Type"
              style="width: 100%"
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
              :minDate="minDate"
              :disabledDates="disabledDates"
            >
              <template #date="slotProps">
                <span>
                  <strong
                    :style="getBookingStyle(slotProps.date)"
                    class="date-box"
                  >
                    {{ slotProps.date.day }}
                  </strong>
                </span>
              </template></DatePicker
            >
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
              :minDate="minDate"
              :disabledDates="disabledDates"
            >
              <template #date="slotProps">
                <span>
                  <strong
                    :style="getBookingStyle(slotProps.date)"
                    class="date-box"
                  >
                    {{ slotProps.date.day }}
                  </strong>
                </span>
              </template></DatePicker
            >
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

        <div class="flex justify-center gap-3">
          <div class="w-full md:w-[40%]">
            <label for="discount">Discount ID or Name:</label>
            <Select
              id="discount"
              v-model="newBooking.discountId"
              :options="discountStore.discounts"
              optionLabel="name"
              optionValue="discountId"
              placeholder="Select a Discount"
              class="w-full"
            />
          </div>
          <div class="w-[40%]">
            <label>Add Ons:</label>
            <MultiSelect
              v-model="newBooking.catalogAddOnIds"
              :options="catalogStore.catalog"
              optionLabel="itemName"
              optionValue="catalogAddOnId"
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
              v-model="paymentDetails.paymentMethod"
              placeholder="Book Status"
              class="border p-2 rounded w-full"
            >
              <option value="gcash">Gcash</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div>
            <label>Tendered Amount:</label>
            <input
              v-model.number="paymentDetails.tenderedAmount"
              placeholder="Total Amount"
            />
          </div>
        </div>

        <div class="packEvent">
          <template v-if="paymentDetails.paymentMethod === 'gcash'">
            <div>
              <label>Reference No:</label>
              <input
                v-model="paymentDetails.reference"
                placeholder="Reference No"
              />
            </div>

            <div>
              <label>Proof of Payment:</label>
              <FileUpload
                ref="fileupload"
                v-model="paymentDetails.imageUrl"
                mode="basic"
                name="imageUrl"
                url="/api/upload"
                accept="image/*"
                :maxFileSize="1000000"
                @select="onFileSelect"
              />
            </div>
          </template>
        </div>

        <div class="packEvent">
          <div>
            <label>Total Amount: {{ formatPeso(totalAmount) }}</label>
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
