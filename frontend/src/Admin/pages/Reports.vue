<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from "vue";
import SearchBar from "../components/SearchBar.vue";
import FilterButton from "../components/FilterButton.vue";
import T3ButtonTransaction from "../components/T3ButtonTransaction.vue";
import SideBar from "../components/SideBar.vue";
import Tag from "primevue/tag";
import Notification from "../components/Notification.vue";
import DarkModeButton from "../components/DarkModeButton.vue";
import ProfileAvatar from "../components/ProfileAvatar.vue";
import RadioButton from "primevue/radiobutton";
import Button from "primevue/button";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import { useReportStore } from "../../stores/reportStore.js";
import { useBookingStore } from "../../stores/bookingStore.js";
import { usePublicEntryStore } from "../../stores/publicEntryStore.js";
import { formatPeso } from "../../utility/pesoFormat.js";
import { formatDates } from "../../utility/dateFormat.js";
import { exportToPDF } from "../../utility/exportPDF";

const reportStore = useReportStore();
const bookingStore = useBookingStore();
const publicStore = usePublicEntryStore();

onMounted(() => {
  reportStore.fetchReportData();
  bookingStore.fetchUserBookings();
  publicStore.fetchAllPublic();
  reportStore.getTransactionByPeriod(selectedPeriod.value);
});

// Customer Details

const selectedPayment = ref(null);
const paymentDetails = ref(false);

const openPaymentDetails = (payment) => {
  selectedPayment.value = payment;
  paymentDetails.value = true;
};

const closeModal = () => {
  paymentDetails.value = false;
};

const getPaymentName = (payment) => {
  if (payment.bookingId) {
    const booking = bookingStore.bookings.find(
      (b) => b.bookingId === payment.bookingId
    );
    if (booking) return booking.firstName + " " + booking.lastName;
  }
  if (payment.publicEntryId) {
    const publics = publicStore.public.find(
      (p) => p.publicEntryId === payment.publicEntryId
    );
    if (publics) return publics.firstName + " " + publics.lastName;
  }
  return "Unknown";
};

// Checks Severity of Status of the Payment
const getStatusSeverity = (status) => {
  switch (status) {
    case "pending":
      return "warn";
    case "partially-paid":
      return "info";
    case "paid":
      return "success";
    case "failed":
      return "danger";
    default:
      return "secondary";
  }
};

const handlePDFExport = () => {
  const rows = reportStore.payments.map((p) => ({
    Type: p.bookingId ? "Private" : "Public",
    RefID: p.bookingId ?? p.publicEntryId,
    Name: getPaymentName(p),
    Method: p.paymentMethod,
    Amount: formatPeso(p.netPaidAmount),
    Date: formatDates(p.createdAt),
  }));

  const columns = ["Type", "RefID", "Name", "Method", "Amount", "Date"];

  const totalRevenue = reportStore.payments.reduce(
    (sum, p) => sum + p.netPaidAmount,
    0
  );

  exportToPDF(rows, columns, totalRevenue);
};

const showMenu = ref(false);
const selectedPeriod = ref("weekly");

watch(selectedPeriod, (newPeriod) => {
  reportStore.getTransactionByPeriod(newPeriod);
});

const hideMenu = ref(false);

const closeMenu = (event) => {
  if (hideMenu.value && !hideMenu.value.contains(event.target)) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeMenu);
});

onUnmounted(() => {
  document.addEventListener("click", closeMenu);
});
</script>

<template>
  <main class="customerM">
    <SideBar />
    <div class="container">
      <div class="headers">
        <h1 class="text-5xl font-black">Reports</h1>
        <div class="flex items-center gap-5">
          <DarkModeButton />
          <Notification />
          <ProfileAvatar />
        </div>
      </div>
      <div class="searchB">
        <SearchBar class="sBar" />
        <div class="cusBtns">
          <div class="relative inline-block">
            <FilterButton @click.stop="showMenu = !showMenu" />

            <div
              v-if="showMenu"
              ref="hideMenu"
              class="absolute -left-30 mt-2 w-[10rem] shadow-md z-50 bg-[#fcfcfc] dark:bg-stone-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <h2
                class="font-bold mb-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Mode
              </h2>
              <ul class="space-y-2">
                <li
                  class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                >
                  <RadioButton
                    :value="'weekly'"
                    :modelValue="selectedPeriod"
                    @update:modelValue="selectedPeriod = $event"
                    inputId="weekly"
                  />
                  <label
                    class="text-sm text-gray-600 dark:text-gray-300"
                    for="weekly"
                    >Weekly</label
                  >
                </li>
                <li
                  class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                >
                  <RadioButton
                    :value="'monthly'"
                    :modelValue="selectedPeriod"
                    @update:modelValue="selectedPeriod = $event"
                    inputId="monthly"
                  />
                  <label
                    class="text-sm text-gray-600 dark:text-gray-300"
                    for="monthly"
                    >Monthly</label
                  >
                </li>
                <li
                  class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                >
                  <RadioButton
                    :value="'annually'"
                    :modelValue="selectedPeriod"
                    @update:modelValue="selectedPeriod = $event"
                    inputId="annually"
                  />
                  <label
                    class="text-sm text-gray-600 dark:text-gray-300"
                    for="annually"
                    >Annually</label
                  >
                </li>
              </ul>
            </div>
          </div>
          <Button
            label="Export PDF"
            icon="pi pi-file-pdf"
            @click="handlePDFExport"
            style="background: #194d1d; border-radius: 10px"
          />
        </div>
      </div>

      <div class="tableContainer">
        <p class="font-black mb-1 text-2xl sticky">Revenue</p>
        <table class="dTable">
          <thead>
            <tr class="header-style bg-[#194d1d] dark:bg-[#18181b]">
              <th>TYPE</th>
              <th>REF ID</th>
              <th>NAME</th>
              <th>PAYMENT METHOD</th>
              <th>AMOUNT</th>
              <th>DATE</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="cRow border-[#194D1D] dark:border-[#18181b]"
              v-for="revenue in reportStore.payments"
              :key="revenue.paymentId"
              @click="openPaymentDetails(revenue)"
            >
              <td>
                {{ revenue.bookingId ? "Private" : "Public" }}
              </td>
              <td>{{ revenue.bookingId ?? revenue.publicEntryId }}</td>
              <td>{{ getPaymentName(revenue) }}</td>
              <td>{{ revenue.paymentMethod }}</td>
              <td>{{ formatPeso(revenue.netPaidAmount) }}</td>
              <td>{{ formatDates(revenue.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex flex-col mt-2 items-end">
        <p class="text-lg">
          <strong>Total Revenue: </strong>
          {{ formatPeso(reportStore.totalRevenue) }}
        </p>
      </div>

      <div class="tableContainer">
        <p class="font-black mb-1 text-2xl sticky">Refund</p>
        <table class="dTable">
          <thead>
            <tr class="header-style bg-[#194d1d] dark:bg-[#18181b]">
              <th>TYPE</th>
              <th>REF ID</th>
              <th>NAME</th>
              <th>REFUND METHOD</th>
              <th>AMOUNT</th>
              <th>DATE</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="cRow border-[#194D1D] dark:border-[#18181b]"
              v-for="revenue in reportStore.refunds"
              :key="revenue.paymentId"
              @click="openPaymentDetails(revenue)"
            >
              <td>
                {{ revenue.bookingId ? "Private" : "Public" }}
              </td>
              <td>{{ revenue.bookingId ?? revenue.publicEntryId }}</td>
              <td>{{ getPaymentName(revenue) }}</td>
              <td>{{ revenue.refundMethod }}</td>
              <td>{{ formatPeso(revenue.refundAmount) }}</td>
              <td>{{ formatDates(revenue.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex flex-col mt-2 items-end">
        <p class="text-lg">
          <strong>Total Refund: </strong>
          {{ formatPeso(reportStore.totalRefund) }}
        </p>
      </div>
    </div>

    <!-- <div v-if="paymentDetails" class="modal">
      <div class="modal-content">
        <h2>Payment Details</h2>
        <p>Payment ID: {{ selectedPayment?.paymentId }}</p>
        <p>Booking ID: {{ selectedPayment?.bookingId }}</p>
        <p>Discount Amount: {{ selectedPayment?.discountAmount }}</p>
        <p>Downpayment Amount: {{ selectedPayment?.downpaymentAmount }}</p>
        <p>Amount Paid: {{ selectedPayment?.amountPaid }}</p>
        <p>Total Amount Due: {{ selectedPayment?.totalAmountDue }}</p>
        <p>Mode: {{ selectedPayment?.mode }}</p>
        <p>Reference: {{ selectedPayment?.reference }}</p>
        <p>Payment Status: {{ selectedPayment?.paymentStatus }}</p>
        <p>Paid At: {{ selectedPayment?.paidAt }}</p>
        <button class="closeDetails" @click="closeModal">Close</button>
      </div>
    </div> -->
  </main>
</template>

<style scoped>
.customerM {
  background-color: #eef9eb;
}

.headers {
  display: flex;
  justify-content: space-between;
}

.container {
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

.tableContainer {
  max-height: 30%;
  overflow-y: auto;
  border-radius: 5px;
}

.tableContainer::-webkit-scrollbar {
  display: none;
}

.dTable {
  width: 100%;
  max-height: auto;
  background-color: transparent;
}

.header-style {
  font-weight: bold;
  font-size: 15px;
  height: 30px;
  background-color: #194d1d;
  color: white;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 1;
}

.cRow {
  width: 100%;
  font-size: 15px;
  height: auto;
  text-align: center;
  border-bottom: 1px solid #194d1d;
  cursor: pointer;
}

.cRow:hover {
  background-color: #e6f4e8;
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
  z-index: 1;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  width: 300px;
}

.closeDetails {
  width: 100px;
  padding: 8px 15px;
  background: #ccc;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
