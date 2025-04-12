<script setup>
import { ref, onMounted, computed } from "vue";
import SearchBar from "../components/SearchBar.vue";
import AddButtonCustomer from "../components/AddButtonCustomer.vue";
import FilterButton from "../components/FilterButton.vue";
import T3ButtonTransaction from "../components/T3ButtonTransaction.vue";
import SideBar from "../components/SideBar.vue";
import Tag from "primevue/tag";
import Notification from "../components/Notification.vue";
import DarkModeButton from "../components/DarkModeButton.vue";
import ProfileAvatar from "../components/ProfileAvatar.vue";

const payments = ref([]);

onMounted(async () => {
  try {
    const limit = 50;
    const page = 1;

    const response = await fetch(
      `http://localhost:3000/payments?limit=${limit}&page=${page}`
    );
    if (!response.ok) throw new Error("Failed to fetch payments");
    const paymentData = await response.json();

    payments.value = paymentData.items;
  } catch (error) {
    console.error("Error fetching payments:", error);
  }
});

const totalPayments = computed(() => payments.value.length);

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
      (p) => p.paymentId === updatedPayment.paymentId
    );
    if (index !== -1) {
      Object.assign(payments.value[index], updatedPayment);
    }
  } catch (error) {
    console.error("Error updating payment:", error);
  }
};

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
          <FilterButton />
        </div>
      </div>

      <div class="tableContainer">
        <table class="dTable">
          <thead>
            <tr class="header-style">
              <th>DISCOUNT AMOUNT</th>
              <th>DOWNPAYMENT AMOUNT</th>
              <th>AMOUNT PAID</th>
              <th>TOTAL DUE</th>
              <th>MODE</th>
              <th>REFERENCE</th>
              <th>STATUS</th>
              <th>PAID AT</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="cRow"
              v-for="payment in payments"
              :key="payment.paymentId"
              @click="openPaymentDetails(payment)"
            >
              <td>{{ payment.discountAmount }}</td>
              <td>{{ payment.downpaymentAmount }}</td>
              <td>{{ payment.amountPaid }}</td>
              <td>{{ payment.totalAmountDue }}</td>
              <td>{{ payment.mode }}</td>
              <td>{{ payment.reference }}</td>
              <td>
                <Tag
                  :severity="getStatusSeverity(payment.paymentStatus)"
                  :value="payment.paymentStatus"
                />
              </td>
              <td>{{ payment.paidAt }}</td>
              <td @click.stop>
                <T3ButtonTransaction
                  :payment="payment"
                  @updatePayment="updatePaymentHandler"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="paymentDetails" class="modal">
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
    </div>
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
  max-height: 75%;
  overflow-y: auto;
  border: 1px solid #194d1d;
  border-radius: 7px;
}

.tableContainer::-webkit-scrollbar {
  display: none;
}

.dTable {
  width: 100%;
  height: auto;
  background-color: #c7e3b6;
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
  border-right: 1px solid #194d1d;
}

.cRow {
  width: 100%;
  font-size: 15px;
  height: auto;
  text-align: center;
  border: 1px solid #194d1d;
  cursor: pointer;
}

.cRow:hover {
  background-color: #e6f4e8;
}

.cRow:nth-child(even) {
  background-color: #eaf6e9;
}

.cRow:nth-child(odd) {
  background-color: #c7e3b6;
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

.closeDetails {
  width: 100px;
  padding: 8px 15px;
  background: #ccc;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
