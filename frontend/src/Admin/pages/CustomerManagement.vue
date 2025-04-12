<script setup>
import { ref, onMounted, computed } from "vue";
import SearchBar from "../components/SearchBar.vue";
import AddButtonCustomer from "../components/AddButtonCustomer.vue";
import FilterButton from "../components/FilterButton.vue";
import T3ButtonCustomer from "../components/T3ButtonCustomer.vue";
import SideBar from "../components/SideBar.vue";
import Tag from "primevue/tag";
import Notification from "../components/Notification.vue";
import DarkModeButton from "../components/DarkModeButton.vue";
import Divider from "primevue/divider";
import ProfileAvatar from "../components/ProfileAvatar.vue";
import Paginator from "primevue/paginator";

const customers = ref([]);

// Get all Users with pagination
const getAllCustomer = async () => {
  customers.value = [];
  const limit = 50;
  let page = 1;
  let hasMoreData = true;

  while (hasMoreData) {
    const response = await fetch(
      `http://localhost:3000/users?limit=${limit}&page=${page}`
    );
    if (!response.ok) throw new Error("Failed to fetch users");
    const users = await response.json();

    if (users.items && users.items.length > 0) {
      const customerData = users.items.filter(
        (user) => user.role === "customer"
      );

      if (customerData.length === 0) {
        hasMoreData = false;
      } else {
        customers.value.push(...customerData);
        page++;
      }
    } else {
      // If 'items' is missing or empty, stop the loop
      hasMoreData = false;
    }
  }
};

onMounted(() => getAllCustomer());

const totalCustomers = computed(() => filteredCustomer.value.length);

const deleteCustomerHandler = async (customer) => {
  try {
    const response = await fetch(
      `http://localhost:3000/users/${customer.userId}`
    );
    if (!response.ok) throw new Error("Failed to delete customer");
    customers.value = customers.value.filter(
      (c) => c.userId !== customer.userId
    );
    customers.value.disabled = true;
    getAllCustomer();
  } catch (error) {
    console.error("Error deleting customer:", error);
  }
};

const addCustomerHandler = async (customer) => {
  try {
    const response = await fetch("http://localhost:3000/users/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...customer,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add customer: ${errorText}`);
    }
    getAllCustomer();
    console.log("Customer added successfully");
  } catch (error) {
    console.error("Error adding customer:", error);
  }
};

//Fix Date Format
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Customer Details Modal
const selectedCustomer = ref(null);
const customerDetails = ref(false);

const openCustomerDetails = (customer) => {
  selectedCustomer.value = customer;
  customerDetails.value = true;
};

const closeModal = () => {
  customerDetails.value = false;
};

// Checks Severity of Status of each Users
const getStatusSeverity = (status) => {
  return status === "active" ? "success" : "danger";
};

// Paginator or pagination of the tables
const first = ref(0);
const rows = ref(10);

const paginatedCustomers = computed(() => {
  return filteredCustomer.value.slice(first.value, first.value + rows.value);
});

const onPageChange = (event) => {
  first.value = event.first;
  rows.value = event.rows;
};

// Search and Filter Button Logic
const showMenu = ref(false);
const searchQuery = ref("");

const filterStatuses = ref({
  active: false,
  inactive: false,
});
const filterState = ref({
  enable: false,
  disable: false,
});

const filteredCustomer = computed(() => {
  let result = customers.value;

  if (searchQuery.value !== "") {
    result = result.filter((customer) =>
      Object.values(customer).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }

  const selectedStatuses = Object.keys(filterStatuses.value).filter(
    (status) => filterStatuses.value[status]
  );
  if (selectedStatuses.length > 0) {
    result = result.filter((customer) =>
      selectedStatuses.includes(customer.status.toLowerCase())
    );
  }

  // const selectedStates = Object.keys(filterState.value).filter(
  //   (status) => filterState.value[state]
  // );
  // if (selectedStates.length > 0) {
  //   result = result.filter((customer) =>
  //     selectedStates.inclues(customer.state.toLowerCase())
  //   );
  // }
  return result;
});
</script>

<template>
  <main class="customerM">
    <SideBar />
    <div class="container">
      <div class="headers">
        <h1 class="text-5xl font-black">Customer Management</h1>
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
                    id="active"
                    v-model="filterStatuses.active"
                  />
                  <label class="" for="active">Active</label>
                </li>
                <li class="hover:bg-gray-100 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inactive"
                    v-model="filterStatuses.inactive"
                  />
                  <label for="inactive">Inactive</label>
                </li>
              </ul>
              <Divider />
              <h2 class="font-bold mb-1">State</h2>
              <ul>
                <li class="hover:bg-gray-100 flex items-center gap-2">
                  <input type="checkbox" id="enable" />
                  <label for="enable">Enable</label>
                </li>
                <li class="hover:bg-gray-100 flex items-center gap-2">
                  <input type="checkbox" id="disable" />
                  <label for="disable">Disable</label>
                </li>
              </ul>
            </div>
          </div>
          <AddButtonCustomer
            class="addBtn"
            data="Customer"
            @addCustomer="addCustomerHandler"
          />
        </div>
      </div>

      <div class="tableContainer">
        <table class="dTable">
          <thead>
            <tr class="header-style">
              <th>ID</th>
              <th>NAME</th>
              <th>CONTACT NO.</th>
              <th>STATUS</th>
              <th>CREATED</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="cRow"
              v-for="customer in paginatedCustomers"
              :key="customer.userId"
              @click="openCustomerDetails(customer)"
            >
              <td class="w-[5%]">{{ customer.userId }}</td>
              <td class="w-[25%]">
                <strong>{{ customer.firstName }} {{ customer.lastName }}</strong
                ><br />
                {{ customer.email }}
              </td>
              <td class="w-[15%]">{{ customer.contactNo }}</td>
              <td class="w-[10%]">
                <Tag
                  style="font-size: 12px"
                  :severity="getStatusSeverity(customer.status)"
                  :value="customer.status === 'active' ? 'Active' : 'Inactive'"
                />
              </td>
              <td class="w-[20%]">{{ formatDate(customer.dateReg) }}</td>
              <td class="w-[5%]" @click.stop>
                <T3ButtonCustomer
                  :customer="customer"
                  @deleteCustomer="deleteCustomerHandler"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <Paginator
          :first="first"
          :rows="rows"
          :totalRecords="totalCustomers"
          :rowsPerPageOptions="[5, 10, 20, 30]"
          @page="onPageChange"
          class="rowPagination"
        />
      </div>
    </div>

    <div v-if="customerDetails" class="modal">
      <div class="modal-content font-[Poppins]">
        <h2 class="text-xl font-bold m-auto justify-center flex">
          Customer Details
        </h2>
        <Divider />
        <div class="flex flex-col gap-2">
          <p><strong>User ID:</strong> {{ selectedCustomer?.userId }}</p>
          <p><strong>Role:</strong> {{ selectedCustomer?.role }}</p>
          <p>
            <strong>Name:</strong> {{ selectedCustomer?.firstName }}
            {{ selectedCustomer?.lastName }}
          </p>
          <p>
            <strong>Contact No.:</strong> . {{ selectedCustomer?.contactNo }}
          </p>
          <p><strong>Email Address:</strong> {{ selectedCustomer?.email }}</p>
          <p><strong>Address:</strong> {{ selectedCustomer?.address }}</p>
          <p>
            <strong>Date Registration:</strong> {{ selectedCustomer?.dateReg }}
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
</style>
