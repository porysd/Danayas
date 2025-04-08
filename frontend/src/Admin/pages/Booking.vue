<script setup>
import { ref, onMounted, computed } from "vue";
import SearchBar from "../components/SearchBar.vue";
import T3ButtonBooking from "../components/T3ButtonBooking.vue";
import AddButtonBooking from "../components/AddButtonBooking.vue";
import FilterButton from "../components/FilterButton.vue";
import SideBar from "../components/SideBar.vue";
import Tag from "primevue/tag";
import Notification from "../components/Notification.vue";
import DarkModeButton from "../components/DarkModeButton.vue";
import Divider from "primevue/divider";
import ProfileAvatar from "../components/ProfileAvatar.vue";
import Paginator from "primevue/paginator";

const bookings = ref([]);
const packages = ref([]);

// Get All Booking with pagination
onMounted(async () => {
  const limit = 50;
  let page = 1;
  let hasMoreData = true;

  while (hasMoreData) {
    const bResponse = await fetch(
      `http://localhost:3000/bookings/bookings?limit=${limit}&page=${page}`
    );
    if (!bResponse.ok) throw new Error("Failed to fetch bookings");
    const bookingData = await bResponse.json();

    if (bookingData.items.length === 0) {
      hasMoreData = false;
    } else {
      bookings.value.push(...bookingData.items);
      page++;
    }
  }

  const pResponse = await fetch(
    `http://localhost:3000/packages/packages?limit=${limit}`
  );
  if (!pResponse.ok) throw new Error("Failed to fetch packages");

  const packagesData = await pResponse.json();

  packages.value = packagesData.items;
});

const totalBookings = computed(() => filteredBooking.value.length);

// Delete Booking by ID
const deleteBookingHandler = async (booking) => {
  try {
    const response = await fetch(
      `http://localhost:3000/bookings/${booking.bookingId}`,
      {
        method: "delete",
      }
    );
    if (!response.ok) throw new Error("Failed to delete booking");
    bookings.value = bookings.value.filter(
      (c) => c.bookingId !== booking.bookingId
    );
  } catch (error) {
    console.error("Error deleting booking", error);
  }
};

const addBookingHandler = async (booking) => {
  const formattedBooking = {
    ...booking,
    userId: booking.userId ? Number(booking.userId) : null,
    createdBy: booking.createdBy ? Number(booking.createdBy) : null,
    packageId: Number(booking.packageId),
    numberOfGuest: Number(booking.numberOfGuest),
    discountPromoId: Number(booking.discountPromoId),
    totalAmountDue: booking.totalAmountDue ? Number(booking.totalAmountDue) : 0,
    catering:
      booking.catering === "true"
        ? true
        : booking.catering === "false"
        ? false
        : Boolean(booking.catering),
  };

  try {
    const response = await fetch("http://localhost:3000/bookings/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedBooking),
    });

    const text = await response.text();
    console.log("Raw response:", text);

    const data = JSON.parse(text);

    if (!response.ok)
      throw new Error(`Failed to add booking: ${JSON.stringify(data)}`);
    console.log("Booking added successfully:", data);
  } catch (error) {
    console.error("Error adding booking:", error);
  }
};

// Upadte Booking Status by ID
const updateBookingHandler = async (booking) => {
  try {
    const response = await fetch(
      `http://localhost:3000/bookings/${booking.bookingId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookStatus: booking.bookStatus }),
      }
    );

    if (!response.ok) throw new Error("Failed to update booking");

    const updatedBooking = await response.json();
    const index = bookings.value.findIndex(
      (b) => b.bookingId === booking.bookingId
    );
    if (index !== -1) {
      bookings.value[index].bookStatus = booking.bookStatus;
    }
  } catch (error) {
    console.error("Error updating booking:", error);
  }
};

// Get Package Name using packageId
const getPackageName = (packageId) => {
  const pkg = packages.value.find((p) => p.packageId === packageId);
  return pkg ? pkg.name : "Unknown Package";
};

// Booking Details Modal
const selectedBooking = ref(null);
const bookingDetails = ref(false);

const openBookingDetails = (booking) => {
  selectedBooking.value = booking;
  bookingDetails.value = true;
};

const closeModal = () => {
  bookingDetails.value = false;
};

//Fix Date Format
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Checks Severity of Status of the Booking
const getStatusSeverity = (status) => {
  switch (status) {
    case "pending":
      return "warn";
    case "confirmed":
      return "info";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "secondary";
  }
};

// Paginator or pagination of the tables
const first = ref(0);
const rows = ref(10);

const paginatedBookings = computed(() => {
  return filteredBooking.value.slice(first.value, first.value + rows.value);
});

const onPageChange = (event) => {
  first.value = event.first;
  rows.value = event.rows;
};

// Search Bar logic
const searchQuery = ref("");
const filteredBooking = computed(() => {
  return bookings.value.filter((booking) =>
    Object.values(booking).some((val) =>
      String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  );
});

//             <h2 class="text-xl font-medium">Total bookings: {{ totalBookings }}</h2>
</script>

<template>
  <main class="bkM bg-[#EEF9EB] dark:bg-[#09090b]">
    <SideBar />
    <div class="container">
      <div class="headers">
        <h1 class="text-5xl font-black">Booking</h1>
        <div class="flex items-center gap-5">
          <DarkModeButton />
          <Notification />
          <ProfileAvatar />
        </div>
      </div>
      <div class="searchB">
        <SearchBar class="sBar" v-model="searchQuery" />
        <div class="bkBtns">
          <FilterButton />
          <AddButtonBooking
            class="addBtn"
            data="Booking"
            @addBooking="addBookingHandler"
          />
        </div>
      </div>

      <div class="tableContainer">
        <table class="dTable border-[#194D1D] dark:border-[#FCFCFC]">
          <thead>
            <tr
              class="header-style bg-[#194D1D] dark:bg-[#18181b] border-[#194D1D] dark:border-[#18181b]"
            >
              <th>ID</th>
              <th>NAME</th>
              <th>PACKAGE</th>
              <th>PAY TERMS</th>
              <th>CHECK IN & CHECK OUT</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th>DATE</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="bRow border-[#194D1D] dark:border-[#18181b]"
              v-for="booking in paginatedBookings"
              :key="booking.id"
              @click="openBookingDetails(booking)"
            >
              <td class="w-[3%]">{{ booking.bookingId }}</td>
              <td class="w-[17%]">
                <strong>{{ booking.firstName }} {{ booking.lastName }}</strong>
                <br />
                {{ booking.contactNo }}
              </td>
              <td class="w-[15%]">
                {{ getPackageName(booking.packageId) }} <br />
                {{ booking.mode }}
              </td>
              <td class="w-[10%]">{{ booking.paymentTerms }}</td>
              <td class="w-[18%]">
                {{ formatDate(booking.checkInDate) }} to
                {{ formatDate(booking.checkOutDate) }}
              </td>
              <td class="w-[8%]">{{ booking.totalAmountDue }}</td>
              <td class="w-[10%]">
                <Tag
                  :severity="getStatusSeverity(booking.bookStatus)"
                  :value="booking.bookStatus"
                />
              </td>
              <td class="w-[12%]">{{ formatDate(booking.createdAt) }}</td>
              <td class="w-[5%]" @click.stop>
                <T3ButtonBooking
                  :booking="booking"
                  :packageName="getPackageName(booking.packageId)"
                  @deleteBooking="deleteBookingHandler"
                  @updateStatus="updateBookingHandler"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <Paginator
          :first="first"
          :rows="rows"
          :totalRecords="totalBookings"
          :rowsPerPageOptions="[5, 10, 20, 30]"
          @page="onPageChange"
          class="rowPagination"
        />
      </div>
    </div>

    <div v-if="bookingDetails" class="modal">
      <div class="modal-content font-[Poppins]">
        <h2 class="text-xl font-bold m-auto justify-center align-center flex">
          Booking Details
        </h2>
        <Divider />
        <div>
          <p><strong>Booking ID:</strong> {{ selectedBooking?.bookingId }}</p>
          <p><strong>User ID:</strong> {{ selectedBooking?.userId }}</p>
          <p>
            <strong>Created By ID:</strong> {{ selectedBooking?.createdBy }}
          </p>
          <p>
            <strong>Name:</strong> {{ selectedBooking?.firstName }}
            {{ selectedBooking?.lastName }}
          </p>
          <p><strong>Contact No.:</strong> {{ selectedBooking?.contactNo }}</p>
          <p>
            <strong>Email Address:</strong> {{ selectedBooking?.emailAddress }}
          </p>
          <p><strong>Address:</strong> {{ selectedBooking?.address }}</p>
          <p>
            <strong>Package Name:</strong>
            {{ getPackageName(selectedBooking?.packageId) }}
          </p>
          <p><strong>Check IN:</strong> {{ selectedBooking?.checkInDate }}</p>
          <p><strong>Check OUT:</strong> {{ selectedBooking?.checkOutDate }}</p>
          <p><strong>Mode:</strong> {{ selectedBooking?.mode }}</p>
          <p>
            <strong>Arrival Time:</strong> {{ selectedBooking?.arrivalTime }}
          </p>
          <p><strong>Event Type:</strong> {{ selectedBooking?.eventType }}</p>
          <p>
            <strong>Number of Guest:</strong>
            {{ selectedBooking?.numberOfGuest }}
          </p>
          <p><strong>Catering:</strong> {{ selectedBooking?.catering }}</p>
          <p>
            <strong>Discount:</strong> {{ selectedBooking?.discountPromoId }}
          </p>
          <p>
            <strong>Payment Terms:</strong> {{ selectedBooking?.paymentTerms }}
          </p>
          <p>
            <strong>Total Amount Due:</strong>
            {{ selectedBooking?.totalAmountDue }}
          </p>
          <p>
            <strong>Booking Status:</strong> {{ selectedBooking?.bookStatus }}
          </p>
          <p>
            <strong>Reservation Type:</strong>
            {{ selectedBooking?.reservationType }}
          </p>
          <p><strong>Created At:</strong> {{ selectedBooking?.createdAt }}</p>
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

.bkBtns {
  display: flex;
  gap: 5px;
}

.tableContainer {
  max-height: 75%;
  overflow-y: auto;
  border-radius: 5px;
}

.tableContainer::-webkit-scrollbar {
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

  color: white;
  text-align: center;
  top: 0;
  z-index: 1;
}

.bRow {
  width: 100%;
  font-size: 15px;
  height: auto;
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
</style>
