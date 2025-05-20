<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import SearchBar from "../components/SearchBar.vue";
import T3ButtonBooking from "../components/T3ButtonBooking.vue";
import T3ButtonPublic from "../components/T3ButtonPublic.vue";
import AddButtonBooking from "../components/AddButtonBooking.vue";
import FilterButton from "../components/FilterButton.vue";
import SideBar from "../components/SideBar.vue";
import Tag from "primevue/tag";
import Notification from "../components/Notification.vue";
import DarkModeButton from "../components/DarkModeButton.vue";
import Divider from "primevue/divider";
import ProfileAvatar from "../components/ProfileAvatar.vue";
import Paginator from "primevue/paginator";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import Checkbox from "primevue/checkbox";
import { useBookingStore } from "../../stores/bookingStore.js";
import { usePublicEntryStore } from "../../stores/publicEntryStore.js";
import { usePaymentStore } from "../../stores/paymentStore.js";
import { formatPeso } from "../../utility/pesoFormat";
import { formatDates } from "../../utility/dateFormat";

const bookingStore = useBookingStore();
const publicStore = usePublicEntryStore();
const paymentStore = usePaymentStore();

onMounted(() => {
  publicStore.fetchAllPublic();
  bookingStore.fetchUserBookings();
});

const addBookingHandler = async (booking, paymentDetails) => {
  try {
    // 1: Create Booking
    const newBooking = await bookingStore.addBooking(booking);
    const bookingId = newBooking.bookingId;

    // 2: Create Transaction
    // const newTransaction = await transactionStore.addTransaction({ bookingId });
    // console.log("Created transaction:", newTransaction);
    // const transactionId = newTransaction.transactionId;

    // 3: Create Payment with transaction
    const fullPaymentDetails = {
      ...paymentDetails,
      bookingId,
    };

    console.log("Full payment details being sent:", fullPaymentDetails);
    await paymentStore.addPayment(fullPaymentDetails);

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Booking and Payment successfully created!",
      life: 3000,
    });

    await bookingStore.fetchUserBookings();
  } catch (error) {
    console.error("Error adding booking:", error);
  }
};

// Upadte Booking Status by ID
const updateStatusHandler = async (publics) => {
  console.log("Booking payload:", publics);
  await publicStore.updatePublicStatus(publics);
};

const updateBookingHandler = async (publics) => {
  await publicStore.updatePublic(publics);
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

const totalPublic = computed(() => filteredPublic.value.length);
const totalPendings = computed(() => filteredPendings.value.length);
const totalReserved = computed(() => filteredReserved.value.length);
const totalRescheduled = computed(() => filteredRescheduled.value.length);
const totalCancelled = computed(() => filteredCancelled.value.length);
const totalCompleted = computed(() => filteredCompleted.value.length);

// Booking Details Modal
const selectedPublic = ref(null);
const publicDetails = ref(false);

const openPublicDetails = (booking) => {
  selectedPublic.value = booking;
  publicDetails.value = true;
};

const closeModal = () => {
  publicDetails.value = false;
};

// Paginator or pagination of the tables
const first = ref(0);
const rows = ref(10);

const paginatedPublic = computed(() => {
  return filteredPublic.value.slice(first.value, first.value + rows.value);
});

const paginatedPendings = computed(() => {
  return filteredPendings.value.slice(first.value, first.value + rows.value);
});

const paginatedReserved = computed(() => {
  return filteredReserved.value.slice(first.value, first.value + rows.value);
});

const paginatedCancellation = computed(() => {
  return filteredPendingCancellation.value.slice(
    first.value,
    first.value + rows.value
  );
});

const paginatedCancelled = computed(() => {
  return filteredCancelled.value.slice(first.value, first.value + rows.value);
});

const paginatedCompleted = computed(() => {
  return filteredCompleted.value.slice(first.value, first.value + rows.value);
});

const paginatedRescheduled = computed(() => {
  return filteredRescheduled.value.slice(first.value, first.value + rows.value);
});

const onPageChange = (event) => {
  first.value = event.first;
  rows.value = event.rows;
};

// Search Bar logic
const showMenu = ref(false);
const searchQuery = ref("");

const filterStatuses = ref({
  pending: false,
  confirmed: false,
  completed: false,
  cancelled: false,
});
const filterPaymentTerms = ref({
  installment: false,
  "full-payment": false,
});
const filterMode = ref({
  "day-time": false,
  "night-time": false,
  "whole-day": false,
});
const filterReservationType = ref({
  online: false,
  "walk-in": false,
});
const filteredPublic = computed(() => {
  let result = publicStore.public;

  if (searchQuery.value !== "") {
    result = result.filter((booking) =>
      Object.values(booking).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  const selectedStatuses = Object.keys(filterStatuses.value).filter(
    (status) => filterStatuses.value[status]
  );
  if (selectedStatuses.length > 0) {
    result = result.filter((booking) =>
      selectedStatuses.includes(booking.bookStatus)
    );
  }

  const selectedPaymentTerms = Object.keys(filterPaymentTerms.value).filter(
    (terms) => filterPaymentTerms.value[terms]
  );
  if (selectedPaymentTerms.length > 0) {
    result = result.filter((booking) =>
      selectedPaymentTerms.includes(booking.paymentTerms)
    );
  }

  const selectedMode = Object.keys(filterMode.value).filter(
    (mode) => filterMode.value[mode]
  );
  if (selectedMode.length > 0) {
    result = result.filter((booking) => selectedMode.includes(booking.mode));
  }

  const selectedReservationType = Object.keys(
    filterReservationType.value
  ).filter((type) => filterReservationType.value[type]);
  if (selectedReservationType.length > 0) {
    result = result.filter((booking) =>
      selectedReservationType.includes(booking.reservationType)
    );
  }

  // Sort booking
  result = result.sort((a, b) => {
    const statusOrder = {
      pending: 1,
      reserved: 2,
      rescheduled: 3,
      pending_cancellation: 4,
      cancelled: 5,
      completed: 6,
    };
    return statusOrder[a.bookStatus] - statusOrder[b.bookStatus];
  });

  result = result.sort((a, b) => {
    const statusOrder = {
      unpaid: 1,
      "partially-paid": 2,
      paid: 3,
    };
    return (
      statusOrder[a.bookingPaymentStatus] - statusOrder[b.bookingPaymentStatus]
    );
  });

  return result;
});

const filteredPendings = computed(() => {
  let result = publicStore.pending;

  if (searchQuery.value !== "") {
    result = result.filter((booking) =>
      Object.values(booking).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return result;
});

const filteredReserved = computed(() => {
  let result = publicStore.reserved;

  if (searchQuery.value !== "") {
    result = result.filter((booking) =>
      Object.values(booking).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return result;
});

const filteredPendingCancellation = computed(() => {
  let result = publicStore.pendingCancellation;

  if (searchQuery.value !== "") {
    result = result.filter((booking) =>
      Object.values(booking).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return result;
});

const filteredCancelled = computed(() => {
  let result = publicStore.cancelled;

  if (searchQuery.value !== "") {
    result = result.filter((booking) =>
      Object.values(booking).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return result;
});

const filteredCompleted = computed(() => {
  let result = publicStore.completed;

  if (searchQuery.value !== "") {
    result = result.filter((booking) =>
      Object.values(booking).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return result;
});

const filteredRescheduled = computed(() => {
  let result = publicStore.rescheduled;

  if (searchQuery.value !== "") {
    result = result.filter((booking) =>
      Object.values(booking).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return result;
});

// Checks Severity of Status of the Booking
const getStatusSeverity = (status) => {
  switch (status) {
    case "pending":
      return "warn";
    case "reserved":
      return "info";
    case "rescheduled":
      return "secondary";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "secondary";
  }
};

const getPaymentStatusSeverity = (status) => {
  switch (status) {
    case "unpaid":
      return "danger";
    case "paid":
      return "success";
    case "partially-paid":
      return "info";
    default:
      return "secondary";
  }
};

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
  <main class="bkM bg-[#EEF9EB] dark:bg-[#09090b]">
    <SideBar />
    <div class="container">
      <div class="headers">
        <h1 class="text-5xl font-black">Public Booking</h1>
        <div class="flex items-center gap-5">
          <DarkModeButton />
          <Notification />
          <ProfileAvatar />
        </div>
      </div>
      <div class="searchB">
        <SearchBar class="sBar" v-model="searchQuery" />
        <div class="bkBtns">
          <div class="relative inline-block">
            <FilterButton @click.stop="showMenu = !showMenu" />

            <div
              v-if="showMenu"
              ref="hideMenu"
              class="absolute -left-30 mt-2 w-[21rem] shadow-md z-50 bg-[#fcfcfc] dark:bg-stone-900 p-4 rounded-lg border-gray-200 dark:border-gray-700"
            >
              <div class="flex flex-row">
                <div class="flex-1">
                  <h2 class="font-bold mb-1">Status</h2>
                  <ul>
                    <li
                      class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                    >
                      <Checkbox
                        v-model="filterStatuses.pending"
                        binary
                        inputId="pending"
                      />
                      <label
                        class="text-gray-600 dark:text-gray-300 text-sm"
                        for="pending"
                        >Pending</label
                      >
                    </li>
                    <li
                      class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                    >
                      <Checkbox
                        v-model="filterStatuses.reserved"
                        binary
                        inputId="reserved"
                      />
                      <label
                        class="text-gray-600 dark:text-gray-300 text-sm"
                        for="reserved"
                        >Reserved</label
                      >
                    </li>
                    <li
                      class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                    >
                      <Checkbox
                        v-model="filterStatuses.rescheduled"
                        binary
                        inputId="rescheduled"
                      />
                      <label
                        class="text-gray-600 dark:text-gray-300 text-sm"
                        for="rescheduled"
                        >Rescheduled</label
                      >
                    </li>
                    <li
                      class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                    >
                      <Checkbox
                        v-model="filterStatuses.cancelled"
                        binary
                        inputId="cancelled"
                      />
                      <label
                        class="text-gray-600 dark:text-gray-300 text-sm"
                        for="cancelled"
                        >Cancelled</label
                      >
                    </li>
                    <li
                      class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                    >
                      <Checkbox
                        v-model="filterStatuses.completed"
                        binary
                        inputId="completed"
                      />
                      <label
                        class="text-gray-600 dark:text-gray-300 text-sm"
                        for="completed"
                        >Completed</label
                      >
                    </li>
                  </ul>
                  <Divider />
                  <h2 class="font-bold mb-1">Payment Terms</h2>
                  <ul>
                    <li
                      class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                    >
                      <Checkbox
                        v-model="filterPaymentTerms.installment"
                        binary
                        inputId="installment"
                      />
                      <label
                        class="text-gray-600 dark:text-gray-300 text-sm"
                        for="installment"
                        >Installment</label
                      >
                    </li>
                    <li
                      class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                    >
                      <Checkbox
                        v-model="filterPaymentTerms['full-payment']"
                        binary
                        inputId="fullpayment"
                      />
                      <label
                        class="text-gray-600 dark:text-gray-300 text-sm"
                        for="fullpayment"
                        >Full Payment</label
                      >
                    </li>
                  </ul>
                </div>
                <Divider layout="vertical" />
                <div class="flex-1">
                  <h2 class="font-bold mb-1">Mode</h2>
                  <ul>
                    <li
                      class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                    >
                      <Checkbox
                        v-model="filterMode['day-time']"
                        binary
                        inputId="day"
                      />
                      <label
                        class="text-gray-600 dark:text-gray-300 text-sm"
                        for="day"
                        >Day</label
                      >
                    </li>
                    <li
                      class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                    >
                      <Checkbox
                        v-model="filterMode['night-time']"
                        binary
                        inputId="night"
                      />
                      <label
                        class="text-gray-600 dark:text-gray-300 text-sm"
                        for="night"
                        >Night</label
                      >
                    </li>
                    <li
                      class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                    >
                      <Checkbox
                        v-model="filterMode['whole-day']"
                        binary
                        inputId="whole-day"
                      />
                      <label
                        class="text-gray-600 dark:text-gray-300 text-sm"
                        for="whole-day"
                        >Whole Day</label
                      >
                    </li>
                  </ul>
                  <Divider />
                  <h2 class="font-bold mb-1">Reservation Type</h2>
                  <ul>
                    <li
                      class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                    >
                      <Checkbox
                        v-model="filterReservationType.online"
                        binary
                        inputId="online"
                      />
                      <label
                        class="text-gray-600 dark:text-gray-300 text-sm"
                        for="online"
                        >Online</label
                      >
                    </li>
                    <li
                      class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                    >
                      <Checkbox
                        v-model="filterReservationType['walk-in']"
                        binary
                        inputId="walk-in"
                      />
                      <label
                        class="text-gray-600 dark:text-gray-300 text-sm"
                        for="walk-in"
                        >Walk In</label
                      >
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <AddButtonBooking
            class="addBtn"
            data="Public"
            @addBooking="addBookingHandler"
          />
        </div>
      </div>

      <div class="tabBookings">
        <Tabs value="0">
          <TabList>
            <Tab value="0">PENDING</Tab>
            <Tab value="1">RESERVED</Tab>
            <Tab value="2">RESCHEDULED</Tab>
            <Tab value="3">PENDING CANCELLATION</Tab>
            <Tab value="4">CANCELLED</Tab>
            <Tab value="5">COMPLETED</Tab>
            <Tab value="6">OVERALL</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <div class="tableContainer">
                <table class="dTable border-[#194D1D] dark:border-[#FCFCFC]">
                  <thead>
                    <tr
                      class="header-style bg-[#194D1D] dark:bg-[#18181b] border-[#194D1D] dark:border-[#18181b]"
                    >
                      <th>ID</th>
                      <th>NAME</th>
                      <th>ENTRY DATE</th>
                      <th>NO. ADULTS</th>
                      <th>NO. KIDS</th>
                      <th>STATUS</th>
                      <th>PAY TERMS</th>
                      <th>PAYMENT STATUS</th>
                      <th>TOTAL</th>
                      <th>PAID</th>
                      <th>BALANCE</th>
                      <th>DATE</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="bRow border-[#194D1D] dark:border-[#18181b]"
                      v-for="publics in paginatedPendings"
                      :key="publics.id"
                      @click="openPublicDetails(publics)"
                    >
                      <td class="w-[3%]">{{ publics.publicEntryId }}</td>
                      <td class="w-[15%]">
                        <strong
                          >{{ publics.firstName }}
                          {{ publics.lastName }}</strong
                        >
                        <br />
                        {{ publics.contactNo }}
                      </td>
                      <td class="w-[12%]">
                        {{ formatDates(publics.entryDate) }}
                      </td>
                      <td class="w-[7%]">
                        {{ publics.numAdults }}
                      </td>
                      <td class="w-[7%]">
                        {{ publics.numKids }}
                      </td>
                      <td class="w-[8%]">
                        <Tag
                          :severity="getStatusSeverity(publics.status)"
                          :value="publics.status"
                        />
                      </td>
                      <td class="w-[7%]">{{ publics.paymentTerms }}</td>
                      <td class="w-[7%]">
                        <Tag
                          :severity="
                            getPaymentStatusSeverity(
                              publics.publicPaymentStatus
                            )
                          "
                          :value="publics.publicPaymentStatus"
                        />
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.totalAmount) }}
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.amountPaid) }}
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.remainingBalance) }}
                      </td>
                      <td class="w-[8%]">
                        {{ formatDates(publics.createdAt) }}
                      </td>
                      <td class="w-[5%]" @click.stop>
                        <T3ButtonPublic
                          :publics="publics"
                          :payment="publics"
                          @payPayment="secondPaymentHandler"
                          @updateStatus="updateStatusHandler"
                          @updateBooking="updateBookingHandler"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="first"
                  :rows="rows"
                  :totalRecords="totalPendings"
                  :rowsPerPageOptions="[5, 10, 20, 30]"
                  @page="onPageChange"
                  class="rowPagination"
                />
              </div>
            </TabPanel>
            <TabPanel value="1">
              <div class="tableContainer">
                <table class="dTable border-[#194D1D] dark:border-[#FCFCFC]">
                  <thead>
                    <tr
                      class="header-style bg-[#194D1D] dark:bg-[#18181b] border-[#194D1D] dark:border-[#18181b]"
                    >
                      <th>ID</th>
                      <th>NAME</th>
                      <th>ENTRY DATE</th>
                      <th>NO. ADULTS</th>
                      <th>NO. KIDS</th>
                      <th>STATUS</th>
                      <th>PAY TERMS</th>
                      <th>PAYMENT STATUS</th>
                      <th>TOTAL</th>
                      <th>PAID</th>
                      <th>BALANCE</th>
                      <th>DATE</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="bRow border-[#194D1D] dark:border-[#18181b]"
                      v-for="publics in paginatedReserved"
                      :key="publics.id"
                      @click="openPublicDetails(publics)"
                    >
                      <td class="w-[3%]">{{ publics.publicEntryId }}</td>
                      <td class="w-[15%]">
                        <strong
                          >{{ publics.firstName }}
                          {{ publics.lastName }}</strong
                        >
                        <br />
                        {{ publics.contactNo }}
                      </td>
                      <td class="w-[12%]">
                        {{ formatDates(publics.entryDate) }}
                      </td>
                      <td class="w-[7%]">
                        {{ publics.numAdults }}
                      </td>
                      <td class="w-[7%]">
                        {{ publics.numKids }}
                      </td>
                      <td class="w-[8%]">
                        <Tag
                          :severity="getStatusSeverity(publics.status)"
                          :value="publics.status"
                        />
                      </td>
                      <td class="w-[7%]">{{ publics.paymentTerms }}</td>
                      <td class="w-[7%]">
                        <Tag
                          :severity="
                            getPaymentStatusSeverity(
                              publics.publicPaymentStatus
                            )
                          "
                          :value="publics.publicPaymentStatus"
                        />
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.totalAmount) }}
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.amountPaid) }}
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.remainingBalance) }}
                      </td>
                      <td class="w-[8%]">
                        {{ formatDates(publics.createdAt) }}
                      </td>
                      <td class="w-[5%]" @click.stop>
                        <T3ButtonPublic
                          :publics="publics"
                          :payment="publics"
                          @payBooking="secondPaymentHandler"
                          @updateStatus="updateStatusHandler"
                          @updateBooking="updateBookingHandler"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="first"
                  :rows="rows"
                  :totalRecords="totalReserved"
                  :rowsPerPageOptions="[5, 10, 20, 30]"
                  @page="onPageChange"
                  class="rowPagination"
                />
              </div>
            </TabPanel>
            <TabPanel value="2">
              <div class="tableContainer">
                <table class="dTable border-[#194D1D] dark:border-[#FCFCFC]">
                  <thead>
                    <tr
                      class="header-style bg-[#194D1D] dark:bg-[#18181b] border-[#194D1D] dark:border-[#18181b]"
                    >
                      <th>ID</th>
                      <th>NAME</th>
                      <th>ENTRY DATE</th>
                      <th>NO. ADULTS</th>
                      <th>NO. KIDS</th>
                      <th>STATUS</th>
                      <th>PAY TERMS</th>
                      <th>PAYMENT STATUS</th>
                      <th>TOTAL</th>
                      <th>PAID</th>
                      <th>BALANCE</th>
                      <th>DATE</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="bRow border-[#194D1D] dark:border-[#18181b]"
                      v-for="publics in paginatedRescheduled"
                      :key="publics.id"
                      @click="openPublicDetails(publics)"
                    >
                      <td class="w-[3%]">{{ publics.publicEntryId }}</td>
                      <td class="w-[15%]">
                        <strong
                          >{{ publics.firstName }}
                          {{ publics.lastName }}</strong
                        >
                        <br />
                        {{ publics.contactNo }}
                      </td>
                      <td class="w-[12%]">
                        {{ formatDates(publics.entryDate) }}
                      </td>
                      <td class="w-[7%]">
                        {{ publics.numAdults }}
                      </td>
                      <td class="w-[7%]">
                        {{ publics.numKids }}
                      </td>
                      <td class="w-[8%]">
                        <Tag
                          :severity="getStatusSeverity(publics.status)"
                          :value="publics.status"
                        />
                      </td>
                      <td class="w-[7%]">{{ publics.paymentTerms }}</td>
                      <td class="w-[7%]">
                        <Tag
                          :severity="
                            getPaymentStatusSeverity(
                              publics.publicPaymentStatus
                            )
                          "
                          :value="publics.publicPaymentStatus"
                        />
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.totalAmount) }}
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.amountPaid) }}
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.remainingBalance) }}
                      </td>
                      <td class="w-[8%]">
                        {{ formatDates(publics.createdAt) }}
                      </td>
                      <td class="w-[5%]" @click.stop>
                        <T3ButtonPublic
                          :publics="publics"
                          :payment="publics"
                          @payBooking="secondPaymentHandler"
                          @updateStatus="updateStatusHandler"
                          @updateBooking="updateBookingHandler"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="first"
                  :rows="rows"
                  :totalRecords="totalRescheduled"
                  :rowsPerPageOptions="[5, 10, 20, 30]"
                  @page="onPageChange"
                  class="rowPagination"
                />
              </div>
            </TabPanel>
            <TabPanel value="3">
              <div class="tableContainer">
                <table class="dTable border-[#194D1D] dark:border-[#FCFCFC]">
                  <thead>
                    <tr
                      class="header-style bg-[#194D1D] dark:bg-[#18181b] border-[#194D1D] dark:border-[#18181b]"
                    >
                      <th>ID</th>
                      <th>NAME</th>
                      <th>ENTRY DATE</th>
                      <th>NO. ADULTS</th>
                      <th>NO. KIDS</th>
                      <th>STATUS</th>
                      <th>PAY TERMS</th>
                      <th>PAYMENT STATUS</th>
                      <th>TOTAL</th>
                      <th>PAID</th>
                      <th>BALANCE</th>
                      <th>DATE</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="bRow border-[#194D1D] dark:border-[#18181b]"
                      v-for="publics in paginatedCancellation"
                      :key="publics.id"
                      @click="openPublicDetails(publics)"
                    >
                      <td class="w-[3%]">{{ publics.publicEntryId }}</td>
                      <td class="w-[15%]">
                        <strong
                          >{{ publics.firstName }}
                          {{ publics.lastName }}</strong
                        >
                        <br />
                        {{ publics.contactNo }}
                      </td>
                      <td class="w-[12%]">
                        {{ formatDates(publics.entryDate) }}
                      </td>
                      <td class="w-[7%]">
                        {{ publics.numAdults }}
                      </td>
                      <td class="w-[7%]">
                        {{ publics.numKids }}
                      </td>
                      <td class="w-[8%]">
                        <Tag
                          :severity="getStatusSeverity(publics.status)"
                          :value="publics.status"
                        />
                      </td>
                      <td class="w-[7%]">{{ publics.paymentTerms }}</td>
                      <td class="w-[7%]">
                        <Tag
                          :severity="
                            getPaymentStatusSeverity(
                              publics.publicPaymentStatus
                            )
                          "
                          :value="publics.publicPaymentStatus"
                        />
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.totalAmount) }}
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.amountPaid) }}
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.remainingBalance) }}
                      </td>
                      <td class="w-[8%]">
                        {{ formatDates(publics.createdAt) }}
                      </td>
                      <td class="w-[5%]" @click.stop>
                        <T3ButtonPublic
                          :publics="publics"
                          :payment="publics"
                          @payBooking="secondPaymentHandler"
                          @updateStatus="updateStatusHandler"
                          @updateBooking="updateBookingHandler"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="first"
                  :rows="rows"
                  :totalRecords="totalCancelled"
                  :rowsPerPageOptions="[5, 10, 20, 30]"
                  @page="onPageChange"
                  class="rowPagination"
                />
              </div>
            </TabPanel>
            <TabPanel value="4">
              <div class="tableContainer">
                <table class="dTable border-[#194D1D] dark:border-[#FCFCFC]">
                  <thead>
                    <tr
                      class="header-style bg-[#194D1D] dark:bg-[#18181b] border-[#194D1D] dark:border-[#18181b]"
                    >
                      <th>ID</th>
                      <th>NAME</th>
                      <th>ENTRY DATE</th>
                      <th>NO. ADULTS</th>
                      <th>NO. KIDS</th>
                      <th>STATUS</th>
                      <th>PAY TERMS</th>
                      <th>PAYMENT STATUS</th>
                      <th>TOTAL</th>
                      <th>PAID</th>
                      <th>BALANCE</th>
                      <th>DATE</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="bRow border-[#194D1D] dark:border-[#18181b]"
                      v-for="publics in paginatedCancelled"
                      :key="publics.id"
                      @click="openPublicDetails(publics)"
                    >
                      <td class="w-[3%]">{{ publics.publicEntryId }}</td>
                      <td class="w-[15%]">
                        <strong
                          >{{ publics.firstName }}
                          {{ publics.lastName }}</strong
                        >
                        <br />
                        {{ publics.contactNo }}
                      </td>
                      <td class="w-[12%]">
                        {{ formatDates(publics.entryDate) }}
                      </td>
                      <td class="w-[7%]">
                        {{ publics.numAdults }}
                      </td>
                      <td class="w-[7%]">
                        {{ publics.numKids }}
                      </td>
                      <td class="w-[8%]">
                        <Tag
                          :severity="getStatusSeverity(publics.status)"
                          :value="publics.status"
                        />
                      </td>
                      <td class="w-[7%]">{{ publics.paymentTerms }}</td>
                      <td class="w-[7%]">
                        <Tag
                          :severity="
                            getPaymentStatusSeverity(
                              publics.publicPaymentStatus
                            )
                          "
                          :value="publics.publicPaymentStatus"
                        />
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.totalAmount) }}
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.amountPaid) }}
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.remainingBalance) }}
                      </td>
                      <td class="w-[8%]">
                        {{ formatDates(publics.createdAt) }}
                      </td>
                      <td class="w-[5%]" @click.stop>
                        <T3ButtonPublic
                          :publics="publics"
                          :payment="publics"
                          @payBooking="secondPaymentHandler"
                          @updateStatus="updateStatusHandler"
                          @updateBooking="updateBookingHandler"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="first"
                  :rows="rows"
                  :totalRecords="totalCancelled"
                  :rowsPerPageOptions="[5, 10, 20, 30]"
                  @page="onPageChange"
                  class="rowPagination"
                />
              </div>
            </TabPanel>
            <TabPanel value="5">
              <div class="tableContainer">
                <table class="dTable border-[#194D1D] dark:border-[#FCFCFC]">
                  <thead>
                    <tr
                      class="header-style bg-[#194D1D] dark:bg-[#18181b] border-[#194D1D] dark:border-[#18181b]"
                    >
                      <th>ID</th>
                      <th>NAME</th>
                      <th>ENTRY DATE</th>
                      <th>NO. ADULTS</th>
                      <th>NO. KIDS</th>
                      <th>STATUS</th>
                      <th>PAY TERMS</th>
                      <th>PAYMENT STATUS</th>
                      <th>TOTAL</th>
                      <th>PAID</th>
                      <th>BALANCE</th>
                      <th>DATE</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="bRow border-[#194D1D] dark:border-[#18181b]"
                      v-for="publics in paginatedCompleted"
                      :key="publics.id"
                      @click="openPublicDetails(publics)"
                    >
                      <td class="w-[3%]">{{ publics.publicEntryId }}</td>
                      <td class="w-[15%]">
                        <strong
                          >{{ publics.firstName }}
                          {{ publics.lastName }}</strong
                        >
                        <br />
                        {{ publics.contactNo }}
                      </td>
                      <td class="w-[12%]">
                        {{ formatDates(publics.entryDate) }}
                      </td>
                      <td class="w-[7%]">
                        {{ publics.numAdults }}
                      </td>
                      <td class="w-[7%]">
                        {{ publics.numKids }}
                      </td>
                      <td class="w-[8%]">
                        <Tag
                          :severity="getStatusSeverity(publics.status)"
                          :value="publics.status"
                        />
                      </td>
                      <td class="w-[7%]">{{ publics.paymentTerms }}</td>
                      <td class="w-[7%]">
                        <Tag
                          :severity="
                            getPaymentStatusSeverity(
                              publics.publicPaymentStatus
                            )
                          "
                          :value="publics.publicPaymentStatus"
                        />
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.totalAmount) }}
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.amountPaid) }}
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.remainingBalance) }}
                      </td>
                      <td class="w-[8%]">
                        {{ formatDates(publics.createdAt) }}
                      </td>
                      <td class="w-[5%]" @click.stop>
                        <T3ButtonPublic
                          :publics="publics"
                          :payment="publics"
                          @payBooking="secondPaymentHandler"
                          @updateStatus="updateStatusHandler"
                          @updateBooking="updateBookingHandler"
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
            <TabPanel value="6">
              <div class="tableContainer">
                <table class="dTable border-[#194D1D] dark:border-[#FCFCFC]">
                  <thead>
                    <tr
                      class="header-style bg-[#194D1D] dark:bg-[#18181b] border-[#194D1D] dark:border-[#18181b]"
                    >
                      <th>ID</th>
                      <th>NAME</th>
                      <th>ENTRY DATE</th>
                      <th>NO. ADULTS</th>
                      <th>NO. KIDS</th>
                      <th>STATUS</th>
                      <th>PAY TERMS</th>
                      <th>PAYMENT STATUS</th>
                      <th>TOTAL</th>
                      <th>PAID</th>
                      <th>BALANCE</th>
                      <th>DATE</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="bRow border-[#194D1D] dark:border-[#18181b]"
                      v-for="publics in paginatedPubilc"
                      :key="publics.id"
                      @click="openPublicDetails(publics)"
                    >
                      <td class="w-[3%]">{{ publics.publicEntryId }}</td>
                      <td class="w-[15%]">
                        <strong
                          >{{ publics.firstName }}
                          {{ publics.lastName }}</strong
                        >
                        <br />
                        {{ publics.contactNo }}
                      </td>
                      <td class="w-[12%]">
                        {{ formatDates(publics.entryDate) }}
                      </td>
                      <td class="w-[7%]">
                        {{ publics.numAdults }}
                      </td>
                      <td class="w-[7%]">
                        {{ publics.numKids }}
                      </td>
                      <td class="w-[8%]">
                        <Tag
                          :severity="getStatusSeverity(publics.status)"
                          :value="publics.status"
                        />
                      </td>
                      <td class="w-[7%]">{{ publics.paymentTerms }}</td>
                      <td class="w-[7%]">
                        <Tag
                          :severity="
                            getPaymentStatusSeverity(
                              publics.publicPaymentStatus
                            )
                          "
                          :value="publics.publicPaymentStatus"
                        />
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.totalAmount) }}
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.amountPaid) }}
                      </td>
                      <td class="w-[7%]">
                        {{ formatPeso(publics.remainingBalance) }}
                      </td>
                      <td class="w-[8%]">
                        {{ formatDates(publics.createdAt) }}
                      </td>
                      <td class="w-[5%]" @click.stop>
                        <T3ButtonPublic
                          :publics="publics"
                          :payment="publics"
                          @payBooking="secondPaymentHandler"
                          @updateStatus="updateStatusHandler"
                          @updateBooking="updateBookingHandler"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="first"
                  :rows="rows"
                  :totalRecords="totalPublic"
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

    <div v-if="publicDetails" class="modal">
      <div class="modal-content font-[Poppins]">
        <h2 class="text-xl font-bold m-auto justify-center align-center flex">
          Public Details
        </h2>
        <Divider />
        <div>
          <p><strong>Booking ID:</strong> {{ selectedPublic?.bookingId }}</p>
          <p><strong>User ID:</strong> {{ selectedPublic?.userId }}</p>
          <p>
            <strong>Name:</strong> {{ selectedPublic?.firstName }}
            {{ selectedPublic?.lastName }}
          </p>
          <p><strong>Contact No.:</strong> {{ selectedPublic?.contactNo }}</p>
          <p>
            <strong>Email Address:</strong> {{ selectedPublic?.emailAddress }}
          </p>
          <p><strong>Address:</strong> {{ selectedPublic?.address }}</p>
          <p><strong>Check IN:</strong> {{ selectedPublic?.checkInDate }}</p>
          <p><strong>Check OUT:</strong> {{ selectedPublic?.checkOutDate }}</p>
          <p><strong>Mode:</strong> {{ selectedPublic?.mode }}</p>
          <p>
            <strong>Arrival Time:</strong> {{ selectedPublic?.arrivalTime }}
          </p>
          <p><strong>Event Type:</strong> {{ selectedPublic?.eventType }}</p>
          <p>
            <strong>Number of Guest:</strong>
            {{ selectedPublic?.numberOfGuest }}
          </p>
          <p><strong>Catering:</strong> {{ selectedPublic?.catering }}</p>
          <p><strong>Discount:</strong> {{ selectedPublic?.discountId }}</p>
          <p>
            <strong>Payment Terms:</strong> {{ selectedPublic?.paymentTerms }}
          </p>
          <p>
            <strong>Total Amount Due:</strong>
            {{ selectedPublic?.totalAmount }}
          </p>
          <p>
            <strong>Booking Status:</strong> {{ selectedPublic?.bookStatus }}
          </p>
          <p>
            <strong>Reservation Type:</strong>
            {{ selectedPublic?.reservationType }}
          </p>
          <p><strong>Created At:</strong> {{ selectedPublic?.createdAt }}</p>
        </div>
        <Divider />
        <button class="closeDetails mt-5 w-[100%]" @click="closeModal">
          Close
        </button>
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
  max-width: 100%;
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

.bkBtns {
  display: flex;
  gap: 5px;
}

.tableContainer {
  max-height: 75%;
  overflow: visible;
  border-radius: 5px;
}

.tableContainer::-webkit-scrollbar,
.tabBookings::-webkit-scrollbar {
  display: none;
}

.dTable {
  width: 100%;
  height: auto;
  background-color: transparent;
}

.header-style {
  font-weight: bold;
  font-size: 13px;
  height: 40px;
  position: sticky;
  color: white;
  text-align: center;
  top: 0;
  z-index: 1;
}

.bRow {
  width: 100%;
  font-size: 13px;
  height: 50px;
  min-height: auto;
  text-align: center;
  border-bottom: 1px solid #194d1d;
  cursor: pointer;
}

.my-app-dark .bRow {
  border: 1px solid #fcfcfc;
}

.bRow:hover {
  background-color: #e6f4e8;
}

.my-app-dark .bRow {
  background-color: #1e1e1e;
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
  width: 40rem;
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
    overflow: visible;

    border-radius: 0;
    height: 50px;
    display: flex;
  }
  .p-paginator-rpp-dropdown {
    background: transparent;
  }
}
:deep(.tabBookings) {
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
