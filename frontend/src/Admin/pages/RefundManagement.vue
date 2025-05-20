<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import SearchBar from "../components/SearchBar.vue";
import FilterButton from "../components/FilterButton.vue";
import T3ButtonTransaction from "../components/T3ButtonTransaction.vue";
import T3ButtonRefund from "../components/T3ButtonRefund.vue";
import SideBar from "../components/SideBar.vue";
import Tag from "primevue/tag";
import Paginator from "primevue/paginator";
import Divider from "primevue/divider";
import Notification from "../components/Notification.vue";
import DarkModeButton from "../components/DarkModeButton.vue";
import ProfileAvatar from "../components/ProfileAvatar.vue";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import Checkbox from "primevue/checkbox";
import { formatPeso } from "../../utility/pesoFormat.js";
import { formatDates } from "../../utility/dateFormat.js";
import { usePaymentStore } from "../../stores/paymentStore.js";
import { useRefundStore } from "../../stores/refundStore.js";
import { useTransactionStore } from "../../stores/transactionStore.js";
import { useBookingStore } from "../../stores/bookingStore.js";

const refundStore = useRefundStore();
const bookingStore = useBookingStore();

onMounted(() => {
  refundStore.fetchRefunds();
  bookingStore.fetchUserBookings();
});

const getBookingName = (bookingId) => {
  const booking = bookingStore.bookings.find((b) => b.bookingId === bookingId);
  return booking ? booking.firstName + " " + booking.lastName : "Unknown";
};

const getBalance = (bookingId) => {
  const booking = bookingStore.bookings.find((b) => b.bookingId === bookingId);
  return booking ? booking.remainingBalance : "Unknown";
};

// Update Refund by ID
const updateRefundHandler = async (refund) => {
  await refundStore.updateRefund(refund);
};

// Refund Details
const selectedRefund = ref(null);
const refundDetails = ref(false);

const openRefundDetails = (refund) => {
  selectedRefund.value = refund;
  refundDetails.value = true;
};

const closeModal = () => {
  refundDetails.value = false;
};

// Checks Severity of Status of the Payment
const getStatusSeverity = (status) => {
  switch (status) {
    case "pending":
      return "warn";
    case "completed":
      return "success";
    case "failed":
    default:
      return "secondary";
  }
};

const totalPending = computed(() => filteredPending.value.length);
const totalCompleted = computed(() => filteredCompleted.value.length); // VALID
const totalFailed = computed(() => filteredFailed.value.length);

const first = ref(0);
const rows = ref(10);

const paginatedPending = computed(() => {
  return filteredPending.value.slice(first.value, first.value + rows.value);
});

const paginatedCompleted = computed(() => {
  return filteredCompleted.value.slice(first.value, first.value + rows.value);
});

const paginatedFailed = computed(() => {
  return filteredFailed.value.slice(first.value, first.value + rows.value);
});

const onPageChange = (event) => {
  first.value = event.first;
  rows.value = event.rows;
};

//Search logic
const showMenu = ref(false);
const searchQuery = ref("");

const filterMode = ref({
  cash: false,
  gcash: false,
});

// PENDING
const filteredPending = computed(() => {
  let result = refundStore.pending;

  if (searchQuery.value !== "") {
    result = result.filter((payment) =>
      Object.values(payment).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }

  const selectedMode = Object.keys(filterMode.value).filter(
    (mode) => filterMode.value[mode]
  );
  if (selectedMode.length > 0) {
    result = result.filter((mode) =>
      selectedMode.includes(mode.mode.toLowerCase())
    );
  }

  return result;
});

// COMPLETED
const filteredCompleted = computed(() => {
  let result = refundStore.completed;

  if (searchQuery.value !== "") {
    result = result.filter((payment) =>
      Object.values(payment).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }

  const selectedMode = Object.keys(filterMode.value).filter(
    (mode) => filterMode.value[mode]
  );
  if (selectedMode.length > 0) {
    result = result.filter((mode) =>
      selectedMode.includes(mode.mode.toLowerCase())
    );
  }

  return result;
});

// FAILED
const filteredFailed = computed(() => {
  let result = refundStore.failed;

  if (searchQuery.value !== "") {
    result = result.filter((payment) =>
      Object.values(payment).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }

  const selectedMode = Object.keys(filterMode.value).filter(
    (mode) => filterMode.value[mode]
  );
  if (selectedMode.length > 0) {
    result = result.filter((mode) =>
      selectedMode.includes(mode.mode.toLowerCase())
    );
  }

  return result;
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
        <h1 class="text-5xl font-black">Refund Management</h1>
        <div class="flex items-center gap-5">
          <DarkModeButton />
          <Notification />
          <ProfileAvatar />
        </div>
      </div>
      <div class="searchB">
        <SearchBar class="sBar" v-model="searchQuery" />
        <div class="cusBtns">
          <div class="relative inline-block">
            <FilterButton @click.stop="showMenu = !showMenu" />

            <div
              v-if="showMenu"
              ref="hideMenu"
              class="absolute -left-30 mt-2 w-[10rem] shadow-md z-50 bg-[#fcfcfc] dark:bg-stone-900 p-4 rounded-lg border-gray-200 dark:border-gray-700"
            >
              <h2 class="font-bold mb-1">Mode</h2>
              <ul>
                <li
                  class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                >
                  <Checkbox v-model="filterMode.cash" binary inputId="cash" />
                  <label
                    class="text-gray-600 dark:text-gray-300 text-sm"
                    for="cash"
                    >Cash</label
                  >
                </li>
                <li
                  class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                >
                  <Checkbox v-model="filterMode.gcash" binary inputId="gcash" />
                  <label
                    class="text-gray-600 dark:text-gray-300 text-sm"
                    for="gcash"
                    >GCash</label
                  >
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="tabPayBill">
        <Tabs value="0">
          <TabList>
            <Tab value="0">PENDING</Tab>
            <Tab value="1">COMPLETED</Tab>
            <Tab value="2">FAILED</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <div class="tableContainer">
                <table class="dTable">
                  <thead>
                    <tr class="header-style">
                      <th>ID</th>
                      <th>BOOKING ID</th>
                      <td>NAME</td>
                      <th>REFUND METHOD</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                      <th>REASON</th>
                      <th>IMAGE</th>
                      <th>PAID AT</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="cRow"
                      v-for="refund in paginatedPending"
                      :key="refund.id"
                      @click="openRefundDetails(refund)"
                    >
                      <td class="w-[3%]">{{ refund.refundId }}</td>
                      <td class="w-[5%]">{{ refund.bookingId }}</td>
                      <td class="w-[15%]">
                        {{ getBookingName(refund.bookingId) }}
                      </td>
                      <td class="w-[10%]">
                        {{ refund.refundMethod }}
                      </td>
                      <td class="w-[9%]">
                        {{ formatPeso(refund.refundAmount) }}
                      </td>
                      <td class="w-[5%]">
                        <Tag
                          :severity="getStatusSeverity(refund.refundStatus)"
                          :value="refund.refundStatus"
                        />
                      </td>
                      <td class="w-[9%]">
                        {{ refund.refundReason }}
                      </td>
                      <td class="w-[10%]">
                        <!-- {{
                          // refund.bookingId.imageUrl ||
                          // refund.publicEntryId.imageUrl
                        }} -->
                      </td>
                      <td class="w-[10%]">
                        {{ formatDates(refund.createdAt) }}
                      </td>
                      <td class="w-[3%]" @click.stop>
                        <T3ButtonRefund
                          :refund="refund"
                          @completedRefund="updateRefundHandler"
                          @failedRefund="updateRefundHandler"
                          :bookingName="getBookingName"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="first"
                  :rows="rows"
                  :totalRecords="totalPending"
                  :rowsPerPageOptions="[5, 10, 20, 30]"
                  @page="onPageChange"
                  class="rowPagination"
                />
              </div>
            </TabPanel>

            <TabPanel value="1">
              <div class="tableContainer">
                <table class="dTable">
                  <thead>
                    <tr class="header-style">
                      <th>ID</th>
                      <th>BOOKING ID</th>
                      <td>NAME</td>
                      <th>REFUND METHOD</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                      <th>REASON</th>
                      <th>IMAGE</th>
                      <th>PAID AT</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="cRow"
                      v-for="refund in paginatedCompleted"
                      :key="refund.id"
                      @click="openRefundDetails(refund)"
                    >
                      <td class="w-[3%]">{{ refund.refundId }}</td>
                      <td class="w-[5%]">{{ refund.bookingId }}</td>
                      <td class="w-[15%]">
                        {{ getBookingName(refund.bookingId) }}
                      </td>
                      <td class="w-[10%]">
                        {{ refund.refundMethod }}
                      </td>
                      <td class="w-[9%]">
                        {{ formatPeso(refund.refundAmount) }}
                      </td>
                      <td class="w-[5%]">
                        <Tag
                          :severity="getStatusSeverity(refund.refundStatus)"
                          :value="refund.refundStatus"
                        />
                      </td>
                      <td class="w-[9%]">
                        {{ refund.refundReason }}
                      </td>
                      <td class="w-[10%]">{{ refund.bookingId.imageUrl }}</td>
                      <td class="w-[10%]">
                        {{ formatDates(refund.createdAt) }}
                      </td>
                      <td class="w-[3%]" @click.stop>
                        <T3ButtonRefund
                          :refund="refund"
                          @completedRefund="updateRefundHandler"
                          @failedRefund="updateRefundHandler"
                          :bookingName="getBookingName"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="first"
                  :rows="rows"
                  :totalRecords="totalCompleted"
                  :rowsPerPageOptions="[5, 10, 20, 30]"
                  @page="onPageChange"
                  class="rowPagination"
                />
              </div>
            </TabPanel>

            <TabPanel value="2">
              <div class="tableContainer">
                <table class="dTable">
                  <thead>
                    <tr class="header-style">
                      <th>ID</th>
                      <th>BOOKING ID</th>
                      <td>NAME</td>
                      <th>REFUND METHOD</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                      <th>REASON</th>
                      <th>IMAGE</th>
                      <th>PAID AT</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="cRow"
                      v-for="refund in paginatedFailed"
                      :key="refund.id"
                      @click="openRefundDetails(refund)"
                    >
                      <td class="w-[3%]">{{ refund.refundId }}</td>
                      <td class="w-[5%]">{{ refund.bookingId }}</td>
                      <td class="w-[15%]">
                        {{ getBookingName(refund.bookingId) }}
                      </td>
                      <td class="w-[10%]">
                        {{ refund.refundMethod }}
                      </td>
                      <td class="w-[9%]">
                        {{ formatPeso(refund.refundAmount) }}
                      </td>
                      <td class="w-[5%]">
                        <Tag
                          :severity="getStatusSeverity(refund.refundStatus)"
                          :value="refund.refundStatus"
                        />
                      </td>
                      <td class="w-[9%]">
                        {{ refund.refundReason }}
                      </td>
                      <td class="w-[10%]">{{ refund.bookingId.imageUrl }}</td>
                      <td class="w-[10%]">
                        {{ formatDates(refund.createdAt) }}
                      </td>
                      <td class="w-[3%]" @click.stop>
                        <T3ButtonRefund
                          :refund="refund"
                          @completedRefund="updateRefundHandler"
                          @failedRefund="updateRefundHandler"
                          :bookingName="getBookingName"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="first"
                  :rows="rows"
                  :totalRecords="totalFailed"
                  :rowsPerPageOptions="[5, 10, 20, 30]"
                  @page="onPageChange"
                  class="rowPagination"
                />
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>

    <div v-if="refundDetails" class="modal">
      <div class="modal-content font-[Poppins]">
        <h2 class="text-xl font-bold m-auto justify-center align-center flex">
          Refund Details
        </h2>
        <Divider />
        <div class="flex flex-col gap-2">
          <p><strong>Refund ID:</strong> {{ selectedRefund?.refundId }}</p>
          <p>
            <strong>Booking ID:</strong>
            {{ selectedRefund?.bookingId }}
          </p>
          <p>
            <strong>Name:</strong>
            {{ getBookingName(selectedRefund?.bookingId) }}
          </p>
          <p>
            <strong>Refund Method: </strong>{{ selectedRefund?.refundMethod }}
          </p>
          <p>
            <strong>Refund Amount:</strong>
            {{ formatPeso(selectedRefund?.refundAmount) }}
          </p>
          <p>
            <strong>Refund Status:</strong> {{ selectedRefund?.refundStatus }}
          </p>
          <p><strong>Reason: </strong>{{ selectedRefund?.refundReason }}</p>
          <p><strong>Sender Name: </strong>{{ selectedRefund?.senderName }}</p>
          <p><strong>Reference: </strong>{{ selectedRefund?.reference }}</p>
          <p>
            <strong>Proof of Refund: </strong>{{ selectedRefund?.imageUrl }}
          </p>
          <p><strong>Remarks: </strong>{{ selectedRefund?.remarks }}</p>
          <p>
            <strong>Paid At: </strong
            >{{ formatDates(selectedRefund?.createdAt) }}
          </p>
          <Divider />
          <button class="closeDetails mt-5 w-[100%]" @click="closeModal">
            Close
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
table,
th,
td {
  border: 1px solid black;
}
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
  max-height: 75%;
  overflow: visible;
  border-radius: 5px;
}

.tableContainer::-webkit-scrollbar,
.tabPayBill::-webkit-scrollbar {
  display: none;
}

.dTable {
  width: 100%;
  height: auto;
  background-color: transparent;
}

.header-style {
  font-weight: bold;
  font-size: 15px;
  height: 40px;
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
  height: 50px;
  max-height: auto;
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
  z-index: 999;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  width: 40%;
}

.closeDetails {
  padding: 8px 15px;
  background: #ccc;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.closeDetails:hover {
  background: #333;
  color: white;
}

:deep(.rowPagination) {
  .p-paginator {
    background: transparent;

    border-radius: 0;
    height: 50px;
    display: flex;
  }
  .p-paginator-rpp-dropdown {
    background: transparent;
  }
}
:deep(.tabPayBill) {
  max-height: 75%;
  overflow-y: auto;

  .p-tabpanels {
    background: transparent;
    padding: 0;
  }

  .p-tablist {
    --p-tabs-tablist-background: transparent;
    display: flex;
    gap: 8px;
    padding-bottom: 4px;
    border-bottom: 2px solid #e0e0e0;
  }

  .p-tab {
    font-size: 15px;
    font-weight: 600;
    padding: 10px 16px;
    border-radius: 12px 12px 0 0;
    background-color: transparent;
    color: #194d1d;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    position: relative;
  }

  .p-tab.p-tab-active {
    background: #194d1d;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .p-tab:hover:not(.p-tab-active) {
    background-color: #e8f5e9;
    color: #194d1d;
  }

  .p-tablist-active-bar {
    display: none;
  }
}
</style>
