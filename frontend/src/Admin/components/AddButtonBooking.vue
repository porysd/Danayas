<script setup>
import { ref, defineProps, defineEmits, onMounted, watch, computed } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import DatePicker from "primevue/datepicker";
import MultiSelect from "primevue/multiselect";
import FileUpload from "primevue/fileupload";
import {
  formatDates,
  formatDate,
  formatDateISO,
} from "../../utility/dateFormat";
import { formatPeso } from "../../utility/pesoFormat.js";
import Select from "primevue/select";
import { useCatalogStore } from "../../stores/catalogStore.js";
import { useDiscountStore } from "../../stores/discountStore.js";
import { useBookingStore } from "../../stores/bookingStore.js";
import { usePublicEntryStore } from "../../stores/publicEntryStore.js";
import { useBlockedStore } from "../../stores/blockedDateStore.js";
import { usePackageStore } from "../../stores/packageStore.js";
import {
  getBookingStyle,
  disabledDates,
} from "../../composables/calendarStyle";
import InputNumber from "primevue/inputnumber";

const toast = useToast();
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

defineProps(["data", "packageName"]);

const showAddBookingModal = ref(false);
const showPaymentModal = ref(false);
const showBookingSummary = ref(false);

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
  showBookingSummary.value = false;
};

const addBooking = () => {
  const contactRegex =
    /^(?:\+63\d{10}|\+63 \d{3} \d{3} \d{4}|09\d{9}|09\d{2} \d{3} \d{4})$/;
  if (
    !newBooking.value.firstName ||
    !newBooking.value.lastName ||
    !newBooking.value.emailAddress ||
    !newBooking.value.address ||
    !newBooking.value.packageName ||
    !newBooking.value.checkInDate ||
    !newBooking.value.checkOutDate ||
    !newBooking.value.mode
  ) {
    alert("Please fill in all required fields.");
    return;
  }
  if (!contactRegex.test(newBooking.value.contactNo)) {
    alert(
      "Invalid contact number format. Use +639171234567, +63 917 123 4567, 09171234567, or 0917 123 4567."
    );
    return;
  }
  showAddBookingModal.value = false;
  showPaymentModal.value = true;
};

const bookingSummary = () => {
  if (
    !newBooking.value.paymentTerms ||
    !paymentDetails.value.tenderedAmount ||
    !paymentDetails.value.paymentMethod ||
    !paymentDetails.value.senderName
  ) {
    alert("Please fill in all required fields.");
    return;
  }

  if (paymentDetails.value.paymentMethod === "gcash") {
    if (!paymentDetails.value.reference || !paymentDetails.value.imageUrl) {
      alert("Please fill in all required fields.");
      return;
    }
  }

  showBookingSummary.value = true;
  showPaymentModal.value = false;
};

const backToBooking = () => {
  showAddBookingModal.value = true;
  showPaymentModal.value = false;
};

const backToPayment = () => {
  showPaymentModal.value = true;
  showBookingSummary.value = false;
};

const minDate = new Date();

const checkOutMinDate = computed(() => {
  if (!newBooking.value.checkInDate) return minDate;
  const checkIn = new Date(newBooking.value.checkInDate);
  if (
    newBooking.value.mode === "night-time" ||
    newBooking.value.mode === "whole-day"
  ) {
    const nextDay = new Date(checkIn);
    nextDay.setDate(checkIn.getDate() + 1);
    return nextDay;
  }
  return checkIn;
});

const maxDate = computed(() => {
  if (!newBooking.value.checkInDate) return null;

  const checkIn = new Date(newBooking.value.checkInDate);

  if (
    newBooking.value.mode === "night-time" ||
    newBooking.value.mode === "whole-day"
  ) {
    const nextDay = new Date(checkIn);
    nextDay.setDate(checkIn.getDate() + 1);
    return nextDay;
  }

  return checkIn;
});

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

const allPackages = computed(() => {
  const combined = [
    ...(packageStore.packages || []),
    ...(packageStore.promos || []),
  ];
  const seen = new Set();
  return combined.filter((pkg) => {
    if (seen.has(pkg.packageId)) return false;
    seen.add(pkg.packageId);
    return true;
  });
});

const pkgName = selectedPackage?.name;
const pkgPrice = selectedPackage?.price;

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
      newBooking.value.checkOutDate = date;
    } else {
      newBooking.value.checkOutDate = checkInDate;
    }
  }
);

const allowedStatus = ["reserved", "pending", "rescheduled"];

const unavailableModes = computed(() => {
  const date = newBooking.value.checkInDate;
  if (!date) return new Set();

  const formattedDate = formatDateISO(date);

  const modes = new Set();

  bookingStore.bookings
    .filter((b) => allowedStatus.includes(b.bookStatus))
    .forEach((b) => {
      if (b.checkInDate) {
        const bookingDate =
          typeof b.checkInDate === "string"
            ? b.checkInDate.slice(0, 10)
            : new Date(b.checkInDate).toISOString().split("T")[0];

        if (bookingDate === formattedDate) {
          modes.add(b.mode);
        }
      }
    });

  publicStore.public
    .filter((p) => allowedStatus.includes(p.status))
    .forEach((p) => {
      if (p.entryDate) {
        const entryDate =
          typeof p.entryDate === "string"
            ? p.entryDate.slice(0, 10)
            : new Date(p.entryDate).toISOString().split("T")[0];

        if (entryDate === formattedDate) {
          modes.add(p.mode);
        }
      }
    });

  if (modes.has("whole-day")) {
    return new Set(["day-time", "night-time", "whole-day"]);
  }
  return modes;
});

const availableModes = computed(() => {
  const allModes = [
    { value: "day-time", label: "Day Time" },
    { value: "night-time", label: "Night Time" },
    { value: "whole-day", label: "Whole Day" },
  ];
  return allModes.filter((mode) => !unavailableModes.value.has(mode.value));
});

const confirmBooking = async () => {
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
      :style="{ width: '60rem', minHeight: 'auto' }"
    >
      <template #header>
        <div class="flex flex-col items-center justify-center w-full">
          <h2 class="text-xl font-bold font-[Poppins]">Booking Details</h2>
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
              :options="allPackages"
              optionLabel="name"
              optionValue="packageId"
              placeholder="Select a Package or Promos"
              class="w-full"
            />
          </div>
          <div class="w-[40%]">
            <label>Catering:</label>
            <select
              v-model="newBooking.catering"
              class="border p-2 rounded w-full"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <!-- <div class="w-[40%]">
            <label>Event Type:</label>
            <input
              class="packEvents"
              v-model="newBooking.eventType"
              placeholder="Event Type"
              style="width: 100%"
            />
          </div> -->
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
              :minDate="checkOutMinDate"
              :maxDate="maxDate"
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
              <option
                v-for="mode in availableModes"
                :key="mode.value"
                :value="mode.value"
              >
                {{ mode.label }}
              </option>
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
          <!-- <div>
            <label>Catering:</label>
            <select
              v-model="newBooking.catering"
              class="border p-2 rounded w-full"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div> -->
          <div>
            <label>Number of Guest:</label>
            <!-- <InputNumber
              class="atcngs"
              type="number"
              v-model="newBooking.numberOfGuest"
              placeholder="Number of Guest"
            /> -->
            <InputNumber
              v-model="newBooking.numberOfGuest"
              placeholder="Number of Guest"
              inputId="minmax-buttons"
              mode="decimal"
              showButtons
              :min="0"
              :max="100"
              fluid
            />
          </div>
        </div>
        <!-- 
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
        </div> -->
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
            <!-- <input
              v-model.number="paymentDetails.tenderedAmount"
              placeholder="Total Amount"
            /> -->
            <InputNumber
              class="w-full"
              placeholder="e.g. 2000"
              inputId="currency-php"
              mode="currency"
              currency="PHP"
              locale="en-PH"
              v-model="paymentDetails.tenderedAmount"
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
        <!-- 
        <div class="packEvent">
          <div>
            <label>Total Amount: {{ formatPeso(totalAmount) }}</label>
          </div>
        </div> -->

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
          @click="bookingSummary"
          class="font-bold w-full"
        />
      </div>
    </Dialog>

    <Dialog
      v-model:visible="showBookingSummary"
      modal
      :style="{ width: 'auto', maxWidth: 'auto' }"
    >
      <template #header
        ><div class="flex flex-col items-center justify-center w-full">
          <h2 class="text-xl font-bold font-[Poppins]">Booking Confirmation</h2>
        </div></template
      >

      <div class="text-left text-base space-y-2">
        <div class="flex flex-row w-auto">
          <div class="w-[50%]">
            <p>
              <strong>Name: </strong>{{ newBooking.firstName }}
              {{ newBooking.lastName }}
            </p>
            <p><strong>Contact No: </strong> {{ newBooking.contactNo }}</p>
            <p><strong>Email Address: </strong>{{ newBooking.emailAddress }}</p>
            <p><strong>Address: </strong> {{ newBooking.address }}</p>
          </div>
          <div class="w-[50%]">
            <p>
              <strong>Date: </strong>
              {{ formatDates(newBooking.checkInDate) }} to
              {{ formatDates(newBooking.checkOutDate) }}
            </p>
            <p>
              <strong>Check-In Date: </strong
              >{{ formatDates(newBooking.checkInDate) }}
            </p>
            <p>
              <strong>Check-Out Date: </strong
              >{{ formatDates(newBooking.checkOutDate) }}
            </p>
          </div>
        </div>

        <div class="mt-10">
          <table class="w-full">
            <thead>
              <tr>
                <th>Description:</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody class="">
              <tr>
                <td>{{ selectedPackage?.name }}</td>
                <td>{{ formatPeso(selectedPackage?.price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-10">
          <p><strong>Payment Terms: </strong> {{ newBooking.paymentTerms }}</p>
          <p>
            <strong>Payment Method: </strong> {{ paymentDetails.paymentMethod }}
          </p>
          <p>
            <strong>Tendered Amount: </strong>
            {{ paymentDetails.tenderedAmount }}
          </p>
          <p>
            <strong>Change Amount: </strong>
            {{
              paymentDetails.tenderedAmount > totalAmount
                ? formatPeso(paymentDetails.tenderedAmount - totalAmount)
                : "₱0.00"
            }}
          </p>
        </div>

        <div class="mt-10">
          <div class="justify-items-end">
            <h2>Sub Total: {{ formatPeso(totalAmount) }}</h2>
            <h1 class="font-black">TOTAL: {{ formatPeso(totalAmount) }}</h1>
          </div>
        </div>
      </div>

      <div class="flex justify-center gap-2 font-[Poppins] mt-10">
        <Button
          type="button"
          label="Back"
          severity="secondary"
          @click="backToPayment"
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

.cDate div {
  width: 26.3%;
}

.atcng div {
  width: 40%;
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
