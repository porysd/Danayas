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

const payments = ref([]);

const getAllPayment = async () => {
  payments.value = [];
  const limit = 50;
  let page = 1;
  let hasMoreData = true;

  while (hasMoreData) {
    const response = await fetch(
      `http://localhost:3000/payments?limit=${limit}&page=${page}`
    );
    if (!response.ok) throw new Error("Failed to fetch payments");
    const paymentData = await response.json();

    if (paymentData.items.length === 0) {
      hasMoreData = false;
    } else {
      payments.value.push(...paymentData.items);
      page++;
    }
  }
};

onMounted(() => getAllPayment());

const totalPayments = computed(() => filteredPayment.value.length);

// Delete Payment by Id
// const deletePaymentHandler = async (payment) => {
//   try {
//     const response = await fetch(`http://localhost:3000/payments/${payment.userId}`, {
//       method: 'delete',
//     });
//     if (!response.ok) throw new Error('Failed to delete payment');
//     payment.value = payment.value.filter(c => c.userId !== payment.userId);
//   } catch (error) {
//     console.error('Error deleting payment:', error);
//   }
// };

// Update Payment by ID
const updatePaymentHandler = async (payment) => {
  try {
    const response = await fetch(
      `http://localhost:3000/payments/${payment.paymentId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payment),
      }
    );

    if (!response.ok) throw new Error("Failed to update payment");

    const updatedPayment = await response.json();
    const index = payments.value.findIndex(
      (p) => p.paymentId === payment.paymentId
    );
    if (index !== -1) {
      Object.assign(payments.value[index], payment);
    }
    getAllPayment();
  } catch (error) {
    console.error("Error updating payment:", error);
  }
};

//Fix Date Format
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Payment Details
const selectedPayment = ref(null);
const paymentDetails = ref(false);

const openPaymentDetails = (payment) => {
  selectedPayment.value = payment;
  paymentDetails.value = true;
};

const closeModal = () => {
  paymentDetails.value = false;
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

// Paginator or pagination of the tables
const first = ref(0);
const rows = ref(10);

const paginatedPayments = computed(() => {
  return filteredPayment.value.slice(first.value, first.value + rows.value);
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
  // refund: false,
});
const filterMode = ref({
  cash: false,
  gcash: false,
});
const filteredPayment = computed(() => {
  let result = payments.value;

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
                  <input type="checkbox" id="refund" />
                  <label for="refund">Refund</label>
                </li>
              </ul>
              <Divider />
              <h2 class="font-bold mb-1">Mode</h2>
              <ul>
                <li class="hover:bg-gray-100 flex items-center gap-2">
                  <input type="checkbox" id="cash" v-model="filterMode.cash" />
                  <label for="cash">Cash</label>
                </li>
                <li class="hover:bg-gray-100 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="gcash"
                    v-model="filterMode.gcash"
                  />
                  <label for="gcash">GCash</label>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="tabPayBill">
        <Tabs value="0">
          <TabList>
            <Tab value="0">PAYMENTS</Tab>
            <Tab value="1">BILLING</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <div class="tableContainer">
                <table class="dTable">
                  <thead>
                    <tr class="header-style">
                      <th>ID</th>
                      <th>DISCOUNT AMOUNT</th>
                      <th>DOWNPAYMENT AMOUNT</th>
                      <th>AMOUNT PAID</th>
                      <th>TOTAL DUE</th>
                      <th>MODE</th>
                      <th>REFERENCE</th>
                      <th>STATUS</th>
                      <th>PAID AT</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="cRow"
                      v-for="payment in paginatedPayments"
                      :key="payment.paymentId"
                      @click="openPaymentDetails(payment)"
                    >
                      <td class="w-[3%]">{{ payment.paymentId }}</td>
                      <td class="w-[10%]">{{ payment.discountAmount }}</td>
                      <td class="w-[15%]">{{ payment.downpaymentAmount }}</td>
                      <td class="w-[10%]">{{ payment.amountPaid }}</td>
                      <td class="w-[10%]">{{ payment.totalAmountDue }}</td>
                      <td class="w-[8%]">{{ payment.mode }}</td>
                      <td class="w-[15%]">{{ payment.reference }}</td>
                      <td class="w-[12%]">
                        <Tag
                          :severity="getStatusSeverity(payment.paymentStatus)"
                          :value="payment.paymentStatus"
                        />
                      </td>
                      <td>{{ formatDate(payment.paidAt) }}</td>
                      <td @click.stop>
                        <T3ButtonTransaction
                          :payment="payment"
                          @voidPayment="updatePaymentHandler"
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
                      <th>AMOUNT PAID</th>
                      <th>PAYMENT DATE</th>
                      <th>MODE</th>
                      <th>STATUS</th>
                      <th>REMAINING BALANACE</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="cRow"
                      v-for="payment in paginatedPayments"
                      :key="payment.paymentId"
                      @click="openPaymentDetails(payment)"
                    >
                      <td class="w-[3%]">{{ payment.paymentId }}</td>

                      <td class="w-[15%]">{{ payment.downpaymentAmount }}</td>
                      <td class="w-[10%]">{{ payment.amountPaid }}</td>
                      <td class="w-[10%]">{{ payment.totalAmountDue }}</td>
                      <td class="w-[8%]">{{ payment.mode }}</td>
                      <td class="w-[15%]">{{ payment.reference }}</td>
                      <td class="w-[12%]">
                        <Tag
                          :severity="getStatusSeverity(payment.paymentStatus)"
                          :value="payment.paymentStatus"
                        />
                      </td>
                      <td class="w-[5%]" @click.stop>
                        <T3ButtonTransaction
                          :payment="payment"
                          @voidPayment="updatePaymentHandler"
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

    <div v-if="paymentDetails" class="modal">
      <div class="modal-content font-[Poppins]">
        <h2 class="text-xl font-bold m-auto justify-center align-center flex">
          Payment Details
        </h2>
        <Divider />
        <div class="flex flex-col gap-2">
          <p><strong>Payment ID:</strong> {{ selectedPayment?.paymentId }}</p>
          <p><strong>Booking ID:</strong> {{ selectedPayment?.bookingId }}</p>
          <p>
            <strong>Discount Amount:</strong>
            {{ selectedPayment?.discountAmount }}
          </p>
          <p>
            <strong>Downpayment Amount: </strong
            >{{ selectedPayment?.downpaymentAmount }}
          </p>
          <p><strong>Amount Paid:</strong> {{ selectedPayment?.amountPaid }}</p>
          <p>
            <strong>Total Amount Due: </strong
            >{{ selectedPayment?.totalAmountDue }}
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
  overflow-y: auto;

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
  }
  .p-tab {
    font-size: 15px;
    font-weight: bold;
    padding: 10px;
    margin-top: 0;
    border-radius: 5px 5px 0 0;
    border: 1px solid #194d1d;
  }
  .p-tab.p-tab-active {
    background-color: #194d1d;
    color: white;
  }
  .p-tab:hover {
    background-color: #b5d9b5;
  }
  .p-tablist-active-bar {
    color: transparent;
    background: white;
  }
}
</style>
