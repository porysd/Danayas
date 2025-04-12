<script setup>
import { ref, onMounted, computed } from "vue";
import SearchBar from "../components/SearchBar.vue";
import T3ButtonEmployee from "../components/T3ButtonEmployee.vue";
import AddButtonEmployee from "../components/AddButtonEmployee.vue";
import FilterButton from "../components/FilterButton.vue";
import SideBar from "../components/SideBar.vue";
import Tag from "primevue/tag";
import Notification from "../components/Notification.vue";
import DarkModeButton from "../components/DarkModeButton.vue";
import Divider from "primevue/divider";
import ProfileAvatar from "../components/ProfileAvatar.vue";
import Paginator from "primevue/paginator";

const employees = ref([]);

const getAllEmployee = async () => {
  employees.value = [];
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
      const employeeData = users.items.filter(
        (user) => user.role === "staff" || user.role === "admin"
      );
      if (employeeData.length === 0) {
        hasMoreData = false;
      } else {
        employees.value.push(...employeeData);
        page++;
      }
    } else {
      hasMoreData = false;
    }
  }
};
onMounted(() => getAllEmployee());

const totalEmployees = computed(() => filteredEmployee.value.length);

const deleteEmployeeHandler = async (employee) => {
  try {
    const response = await fetch(
      `http://localhost:3000/user/${employee.userId}`,
      {
        method: "delete",
      }
    );
    if (!response.ok) throw new Error("Failed to delete employee");
    employees.value = employees.value.filter(
      (e) => e.userId !== employee.userId
    );
    getAllEmployee();
  } catch (error) {
    console.error("Error deleting employee:", error);
  }
};

const addEmployeeHandler = async (employee) => {
  try {
    const response = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: employee.firstName,
        lastName: employee.lastName,
        contactNo: employee.contactNo,
        address: employee.address,
        email: employee.email,
        password: employee.password,
        role: employee.role,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add employee: ${errorText}`);
    }
    getAllEmployee();
    console.log("Employee added successfully");
  } catch (error) {
    console.error("Error adding employee:", error);
  }
};

//Fix Date Format
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

//Employee Details
const selectedEmployee = ref(null);
const employeeDetails = ref(false);

const openEmployeeDetails = (employee) => {
  selectedEmployee.value = employee;
  employeeDetails.value = true;
};

const closeModal = () => {
  employeeDetails.value = false;
  showFilterModal.value = false;
};

// Checks Severity of Status of each Users
const getStatusSeverity = (status) => {
  return status === "active" ? "success" : "danger";
};

// Paginator or pagination of the tables
const first = ref(0);
const rows = ref(10);

const paginatedEmployees = computed(() => {
  return filteredEmployee.value.slice(first.value, first.value + rows.value);
});

const onPageChange = (event) => {
  first.value = event.first;
  rows.value = event.rows;
};

// Search and Filter Button Logic
const showMenu = ref(false);
const searchQuery = ref("");

const filterRoles = ref({
  admin: false,
  staff: false,
});
const filterStatuses = ref({
  active: false,
  inactive: false,
});
const filterState = ref({
  enable: false,
  disable: false,
});

const filteredEmployee = computed(() => {
  let result = employees.value;

  if (searchQuery.value !== "") {
    result = result.filter((employee) =>
      Object.values(employee).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }

  // Filter Btn for Roles
  const selectedRoles = Object.keys(filterRoles.value).filter(
    (role) => filterRoles.value[role]
  );
  if (selectedRoles.length > 0) {
    result = result.filter((emp) => selectedRoles.includes(emp.role));
  }

  // Filter Btn for Status
  const selectedStatuses = Object.keys(filterStatuses.value).filter(
    (status) => filterStatuses.value[status]
  );
  if (selectedStatuses.length > 0) {
    result = result.filter((emp) =>
      selectedStatuses.includes(emp.status.toLowerCase())
    );
  }

  // Filter Btn for State
  // const state = Object.keys(filterStatuses.value).filter(
  //   (status) => filterStatuses.value[status]
  // );
  // if (state.length > 0) {
  //   result = result.filter((emp) =>
  //     state.includes(emp.status.toLowerCase())
  //   );
  // }

  return result;
});
</script>

<template>
  <main class="employeeM bg-[#EEF9EB] dark:bg-[#09090b]">
    <SideBar />
    <div class="container">
      <div class="headers">
        <h1 class="text-5xl font-black">Employee Management</h1>
        <div class="flex items-center gap-5">
          <DarkModeButton />
          <Notification />
          <ProfileAvatar />
        </div>
      </div>
      <div class="searchB">
        <SearchBar class="sBar" v-model="searchQuery" />
        <div class="empBtns">
          <div class="relative inline-block">
            <FilterButton @click.stop="showMenu = !showMenu" />

            <div
              v-if="showMenu"
              class="absolute -left-20 mt-2 w-35 shadow-md z-50 bg-[#fcf5f5] p-4 rounded"
            >
              <h2 class="font-bold mb-1">Roles</h2>
              <ul>
                <li class="hover:bg-gray-100 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="admin"
                    v-model="filterRoles.admin"
                  />
                  <label for="admin">Admin</label>
                </li>
                <li class="hover:bg-gray-100 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="staff"
                    v-model="filterRoles.staff"
                  />
                  <label for="staff">Staff</label>
                </li>
              </ul>
              <Divider />
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

          <AddButtonEmployee
            class="addBtn"
            data="Staff"
            @addEmployee="addEmployeeHandler"
          />
        </div>
      </div>

      <div class="tableContainer">
        <table class="dTable">
          <thead>
            <tr class="header-style bg-[#194d1d] dark:bg-[#18181b]">
              <th>ID</th>
              <th>NAME</th>
              <th>CONTACT NO.</th>
              <th>ROLE</th>
              <th>STATUS</th>
              <th>CREATED</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="eRow border-[#194D1D] dark:border-[#18181b]"
              v-for="employee in paginatedEmployees"
              :key="employee.userId"
              @click="openEmployeeDetails(employee)"
            >
              <td class="w-[5%]">{{ employee.userId }}</td>
              <td class="w-[25%]">
                <strong>{{ employee.firstName }} {{ employee.lastName }}</strong
                ><br />
                {{ employee.email }}
              </td>
              <td class="w-[15%]">{{ employee.contactNo }}</td>
              <td class="w-[10%]">{{ employee.role }}</td>
              <td class="w-[10%]">
                <Tag
                  style="font-size: 12px"
                  :severity="getStatusSeverity(employee.status)"
                  :value="employee.status === 'active' ? 'Active' : 'Inactive'"
                />
              </td>
              <td class="w-[20%]">{{ formatDate(employee.dateReg) }}</td>
              <td class="w-[5%]" @click.stop>
                <T3ButtonEmployee
                  :employee="employee"
                  @deleteEmployee="deleteEmployeeHandler"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <Paginator
          :first="first"
          :rows="rows"
          :totalRecords="totalEmployees"
          :rowsPerPageOptions="[5, 10, 20, 30]"
          @page="onPageChange"
          class="rowPagination"
        />
      </div>
    </div>

    <div v-if="employeeDetails" class="modal">
      <div class="modal-content font-[Poppins]">
        <h2 class="text-xl font-bold m-auto justify-center align-center flex">
          Employee Details
        </h2>
        <Divider />
        <div class="flex flex-col gap-2">
          <p><strong>User ID:</strong> {{ selectedEmployee?.userId }}</p>
          <p><strong>Role:</strong> {{ selectedEmployee?.role }}</p>
          <p>
            <strong>Name:</strong> {{ selectedEmployee?.firstName }}
            {{ selectedEmployee?.lastName }}
          </p>
          <p><strong>Contact No.:</strong> {{ selectedEmployee?.contactNo }}</p>
          <p><strong>Email Address:</strong> {{ selectedEmployee?.email }}</p>
          <p><strong>Address:</strong> {{ selectedEmployee?.address }}</p>
          <p>
            <strong>Date Registration:</strong> {{ selectedEmployee?.dateReg }}
          </p>
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

.empBtns {
  display: flex;
  gap: 5px;
}

.tableContainer {
  max-height: 75%;
  overflow: visible;
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

.eRow {
  width: 100%;
  font-size: 15px;
  height: auto;
  text-align: center;

  border-bottom: 1px solid #194d1d;
  cursor: pointer;
}

.my-app-dark .eRow {
  border: 1px solid #fcfcfc;
}

.eRow:hover {
  background-color: #e6f4e8;
}

.my-app-dark .eRow {
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
    overflow: visible;

    border-radius: 0;
    height: 50px;
    display: flex;
  }
  .p-paginator-rpp-dropdown {
    background: transparent;
  }
}
</style>
