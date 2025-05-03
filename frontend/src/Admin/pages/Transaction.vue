<script setup>
import { ref, onMounted, computed } from "vue";
import SearchBar from "../components/SearchBar.vue";
import AddButtonCustomer from "../components/AddButtonCustomer.vue";
import FilterButton from "../components/FilterButton.vue";
import T3ButtonTransaction from "../components/T3ButtonTransaction.vue";
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
import { formatPeso } from "../../utility/pesoFormat.js";
import { formatDates } from "../../utility/dateFormat.js";
import { usePaymentStore } from "../../stores/paymentStore.js";
import { useTransactionStore } from "../../stores/transactionStore.js";
import { useBookingStore } from "../../stores/bookingStore.js";

const paymentStore = usePaymentStore();
const transactionStore = useTransactionStore();
const bookingStore = useBookingStore();

onMounted(() => {
  paymentStore.fetchPayments();
  transactionStore.fetchTransaction();
  bookingStore.fetchUserBookings();
});

const getBookingName = (bookingId) => {
  const booking = bookingStore.bookings.find((b) => b.bookingId === bookingId);
  return booking ? booking.firstName + " " + booking.lastName : "Unknown";
};

const secondPaymentHandler = async (payment) => {
  try {
    const paymentData = await paymentStore.addPayment(payment);

    console.log("Payment successfully processed", paymentData);
    await fetchPayments();
  } catch (error) {
    console.error("Payment failed:", error.message);
  }
};

// Update Payment by ID
const updatePaymentHandler = async (payment) => {
  await paymentStore.updatePayment(payment);
};

// Payment Details
const selectedPayment = ref(null);
const selectedTransaction = ref(null);
const paymentDetails = ref(false);
const transactionDetails = ref(false);

const openPaymentDetails = (payment) => {
  selectedPayment.value = payment;
  paymentDetails.value = true;
};

const openTransactionDetails = (transaction) => {
  selectedTransaction.value = transaction;
  transactionDetails.value = true;
};

const closeModal = () => {
  paymentDetails.value = false;
  transactionDetails.value = false;
};

// Checks Severity of Status of the Payment
const getStatusSeverity = (status) => {
  switch (status) {
    case "refund":
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

const totalPayments = computed(() => filteredPayment.value.length);
const totalFull = computed(() => filteredFull.value.length);
const totalRefund = computed(() => filteredRefund.value.length);
const totalVoid = computed(() => filteredVoid.value.length);
// Paginator or pagination of the tables
const first = ref(0);
const rows = ref(10);

const paginatedPayments = computed(() => {
  return filteredPayment.value.slice(first.value, first.value + rows.value);
});

const paginatedFull = computed(() => {
  return filteredFull.value.slice(first.value, first.value + rows.value);
});

const paginatedRefund = computed(() => {
  return filteredRefund.value.slice(first.value, first.value + rows.value);
});

const paginatedVoided = computed(() => {
  return filteredVoid.value.slice(first.value, first.value + rows.value);
});

const onPageChange = (event) => {
  first.value = event.first;
  rows.value = event.rows;
};

//Search logic
const showMenu = ref(false);
const searchQuery = ref("");

const filterStatuses = ref({
  "partially-paid": false,
  paid: false,
  failed: false,
  refund: false,
});

const filteredPayment = computed(() => {
  let result = transactionStore.partially;

  if (searchQuery.value !== "") {
    result = result.filter((payment) =>
      Object.values(payment).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }

  const selectedStatuses = Object.keys(filterStatuses.value).filter(
    (status) => filterStatuses.value[status]
  );
  if (selectedStatuses.length > 0) {
    result = result.filter((payment) =>
      selectedStatuses.includes(payment.paymentStatus.toLowerCase())
    );
  }

  return result;
});
const filteredFull = computed(() => {
  let result = transactionStore.full;

  if (searchQuery.value !== "") {
    result = result.filter((payment) =>
      Object.values(payment).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }

  const selectedStatuses = Object.keys(filterStatuses.value).filter(
    (status) => filterStatuses.value[status]
  );
  if (selectedStatuses.length > 0) {
    result = result.filter((payment) =>
      selectedStatuses.includes(payment.paymentStatus.toLowerCase())
    );
  }

  return result;
});
const filteredRefund = computed(() => {
  let result = transactionStore.refund;

  if (searchQuery.value !== "") {
    result = result.filter((payment) =>
      Object.values(payment).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }

  const selectedStatuses = Object.keys(filterStatuses.value).filter(
    (status) => filterStatuses.value[status]
  );
  if (selectedStatuses.length > 0) {
    result = result.filter((payment) =>
      selectedStatuses.includes(payment.paymentStatus.toLowerCase())
    );
  }

  return result;
});
const filteredVoid = computed(() => {
  let result = transactionStore.voided;

  if (searchQuery.value !== "") {
    result = result.filter((payment) =>
      Object.values(payment).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }

  const selectedStatuses = Object.keys(filterStatuses.value).filter(
    (status) => filterStatuses.value[status]
  );
  if (selectedStatuses.length > 0) {
    result = result.filter((payment) =>
      selectedStatuses.includes(payment.paymentStatus.toLowerCase())
    );
  }

  return result;
});
</script>

<template>
  <main class="customerM">
    <SideBar />
    <div class="container">
      <div class="headers">
        <h1 class="text-5xl font-black">Transaction Management</h1>
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
              class="absolute -left-20 mt-2 w-35 shadow-md z-50 bg-[#fcf5f5] p-4 rounded"
            >
              <h2 class="font-bold mb-1">Status</h2>
              <ul>
                <li class="hover:bg-gray-100 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="partiallypaid"
                    v-model="filterStatuses['partially-paid']"
                  />
                  <label class="" for="partiallypaid">Partially Paid</label>
                </li>
                <li class="hover:bg-gray-100 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="paid"
                    v-model="filterStatuses.paid"
                  />
                  <label for="paid">Paid</label>
                </li>
                <li class="hover:bg-gray-100 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="failed"
                    v-model="filterStatuses.failed"
                  />
                  <label for="failed">Failed</label>
                </li>
                <li class="hover:bg-gray-100 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="refund"
                    v-model="filterStatuses.refund"
                  />
                  <label for="refund">Refund</label>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="tabPayBill">
        <Tabs value="0">
          <TabList>
            <Tab value="0">PARTIALLY PAID</Tab>
            <Tab value="1">FULLY PAID</Tab>
            <Tab value="2">REFUND</Tab>
            <Tab value="3">VOIDED</Tab>
            <Tab value="4">TRANSACTION</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <div class="tableContainer">
                <table class="dTable">
                  <thead>
                    <tr class="header-style">
                      <th>ID</th>
                      <th>BOOKING ID</th>
                      <th>NAME</th>
                      <th>STATUS</th>
                      <th>BALANCE</th>
                      <th>CREATED</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="cRow"
                      v-for="transaction in paginatedPayments"
                      :key="transaction.transactionId"
                      @click="openTransactionDetails(transaction)"
                    >
                      <td class="w-[3%]">{{ transaction.transactionId }}</td>
                      <td class="w-[5%]">{{ transaction.bookingId }}</td>
                      <td class="w-[10%]">
                        {{ getBookingName(transaction.bookingId) }}
                      </td>
                      <td class="w-[12%]">
                        <Tag
                          :severity="
                            getStatusSeverity(transaction.transactionStatus)
                          "
                          :value="transaction.transactionStatus"
                        />
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(transaction.remainingBalance) }}
                      </td>
                      <td class="w-[15%]">
                        {{ formatDates(transaction.createdAt) }}
                      </td>
                      <td class="w-[3%]" @click.stop>
                        <T3ButtonTransaction
                          :payment="transaction"
                          :bookingName="getBookingName(transaction.bookingId)"
                          @voidPayment="updatePaymentHandler"
                          @payPayment="secondPaymentHandler"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="first"
                  :rows="rows"
                  :totalRecords="totalPayments"
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
                      <th>NAME</th>
                      <th>STATUS</th>
                      <th>BALANCE</th>
                      <th>CREATED</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="cRow"
                      v-for="transaction in paginatedFull"
                      :key="transaction.transactionId"
                      @click="openTransactionDetails(transaction)"
                    >
                      <td class="w-[3%]">{{ transaction.transactionId }}</td>
                      <td class="w-[5%]">{{ transaction.bookingId }}</td>
                      <td class="w-[10%]">
                        {{ getBookingName(transaction.bookingId) }}
                      </td>
                      <td class="w-[12%]">
                        <Tag
                          :severity="
                            getStatusSeverity(transaction.transactionStatus)
                          "
                          :value="transaction.transactionStatus"
                        />
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(transaction.remainingBalance) }}
                      </td>
                      <td class="w-[15%]">
                        {{ formatDates(transaction.createdAt) }}
                      </td>
                      <td class="w-[3%]" @click.stop>
                        <T3ButtonTransaction
                          :payment="transaction"
                          @voidPayment="updatePaymentHandler"
                          @payPayment="secondPaymentHandler"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="first"
                  :rows="rows"
                  :totalRecords="totalFull"
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
                      <th>NAME</th>
                      <th>STATUS</th>
                      <th>BALANCE</th>
                      <th>CREATED</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="cRow"
                      v-for="transaction in paginatedRefund"
                      :key="transaction.transactionId"
                      @click="openTransactionDetails(transaction)"
                    >
                      <td class="w-[3%]">{{ transaction.transactionId }}</td>
                      <td class="w-[5%]">{{ transaction.bookingId }}</td>
                      <td class="w-[10%]">
                        {{ getBookingName(transaction.bookingId) }}
                      </td>
                      <td class="w-[12%]">
                        <Tag
                          :severity="
                            getStatusSeverity(transaction.transactionStatus)
                          "
                          :value="transaction.transactionStatus"
                        />
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(transaction.remainingBalance) }}
                      </td>
                      <td class="w-[15%]">
                        {{ formatDates(transaction.createdAt) }}
                      </td>
                      <td class="w-[3%]" @click.stop>
                        <T3ButtonTransaction
                          :payment="transaction"
                          @voidPayment="updatePaymentHandler"
                          @payPayment="secondPaymentHandler"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="first"
                  :rows="rows"
                  :totalRecords="totalRefund"
                  :rowsPerPageOptions="[5, 10, 20, 30]"
                  @page="onPageChange"
                  class="rowPagination"
                />
              </div>
            </TabPanel>

            <TabPanel value="3">
              <div class="tableContainer">
                <table class="dTable">
                  <thead>
                    <tr class="header-style">
                      <th>ID</th>
                      <th>BOOKING ID</th>
                      <th>NAME</th>
                      <th>STATUS</th>
                      <th>BALANCE</th>
                      <th>CREATED</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="cRow"
                      v-for="transaction in paginatedVoided"
                      :key="transaction.transactionId"
                      @click="openTransactionDetails(transaction)"
                    >
                      <td class="w-[3%]">{{ transaction.transactionId }}</td>
                      <td class="w-[5%]">{{ transaction.bookingId }}</td>
                      <td class="w-[10%]">
                        {{ getBookingName(transaction.bookingId) }}
                      </td>
                      <td class="w-[12%]">
                        <Tag
                          :severity="
                            getStatusSeverity(transaction.transactionStatus)
                          "
                          :value="transaction.transactionStatus"
                        />
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(transaction.remainingBalance) }}
                      </td>
                      <td class="w-[15%]">
                        {{ formatDates(transaction.createdAt) }}
                      </td>
                      <td class="w-[3%]" @click.stop>
                        <T3ButtonTransaction
                          :payment="transaction"
                          @voidPayment="updatePaymentHandler"
                          @payPayment="secondPaymentHandler"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="first"
                  :rows="rows"
                  :totalRecords="totalVoid"
                  :rowsPerPageOptions="[5, 10, 20, 30]"
                  @page="onPageChange"
                  class="rowPagination"
                />
              </div>
            </TabPanel>

            <TabPanel value="4">
              <div class="tableContainer">
                <table class="dTable">
                  <thead>
                    <tr class="header-style">
                      <th>ID</th>
                      <th>BOOKING ID</th>
                      <th>NAME</th>
                      <th>STATUS</th>
                      <th>BALANCE</th>
                      <th>CREATED</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="cRow"
                      v-for="transaction in transactionStore.transactions"
                      :key="transaction.transactionId"
                      @click="openTransactionDetails(transaction)"
                    >
                      <td class="w-[3%]">{{ transaction.transactionId }}</td>
                      <td class="w-[5%]">{{ transaction.bookingId }}</td>
                      <td class="w-[10%]">
                        {{ getBookingName(transaction.bookingId) }}
                      </td>
                      <td class="w-[12%]">
                        <Tag
                          :severity="
                            getStatusSeverity(transaction.transactionStatus)
                          "
                          :value="transaction.transactionStatus"
                        />
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(transaction.remainingBalance) }}
                      </td>
                      <td class="w-[15%]">
                        {{ formatDates(transaction.createdAt) }}
                      </td>
                      <td class="w-[3%]" @click.stop>
                        <T3ButtonTransaction
                          :payment="transaction"
                          @voidPayment="updatePaymentHandler"
                          @payPayment="secondPaymentHandler"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="first"
                  :rows="rows"
                  :totalRecords="totalPayments"
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

    <div v-if="transactionDetails" class="modal">
      <div class="modal-content font-[Poppins]">
        <h2 class="text-xl font-bold m-auto justify-center align-center flex">
          Transaction Details
        </h2>
        <Divider />
        <div class="flex flex-col gap-2">
          <p>
            <strong>Transaction ID:</strong>
            {{ selectedTransaction?.transactionId }}
          </p>
          <p>
            <strong>Booking ID:</strong> {{ selectedTransaction?.bookingId }}
          </p>

          <p>
            <strong>Created At: </strong>{{ selectedTransaction?.createdAt }}
          </p>
          <Divider />
          <button class="closeDetails mt-5 w-[100%]" @click="closeModal">
            Close
          </button>
        </div>
      </div>
    </div>

    <div v-if="paymentDetails" class="modal">
      <div class="modal-content font-[Poppins]">
        <h2 class="text-xl font-bold m-auto justify-center align-center flex">
          Payment Details
        </h2>
        <Divider />
        <div class="flex flex-col gap-2">
          <p><strong>Payment ID:</strong> {{ selectedPayment?.paymentId }}</p>
          <p>
            <strong>Transaction ID:</strong>
            {{ selectedPayment?.transactionId }}
          </p>
          <p>
            <strong>Downpayment Amount: </strong
            >{{ selectedPayment?.downPaymentAmount }}
          </p>
          <p><strong>Amount Paid:</strong> {{ selectedPayment?.amountPaid }}</p>
          <p>
            <strong>Remaining Balance: </strong
            >{{ selectedPayment?.remainingBalance }}
          </p>
          <p><strong>Mode:</strong> {{ selectedPayment?.mode }}</p>
          <p><strong>Reference: </strong>{{ selectedPayment?.reference }}</p>
          <p>
            <strong>Payment Status: </strong
            >{{ selectedPayment?.paymentStatus }}
          </p>
          <p><strong>Paid At: </strong>{{ selectedPayment?.paidAt }}</p>
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

  top: 0;
  z-index: 1;
}

.cRow {
  width: 100%;
  font-size: 15px;
  height: 50px;
  min-height: auto;
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
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  width: auto;
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
