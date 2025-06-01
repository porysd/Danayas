<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
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
import Checkbox from "primevue/checkbox";
import { useUserStore } from "../../stores/userStore.js";

const userStore = useUserStore();

onMounted(() => {
  userStore.fetchEmployee();
});

const addEmployeeHandler = async (employee) => {
  await userStore.addEmployee(employee);
};

const disableEmployeeHandler = async (employee) => {
  await userStore.disableUser(employee);
};

const enableEmployeeHandler = async (employee) => {
  await userStore.enableUser(employee);
};

const changeRoleHandler = async (employee) => {
  await userStore.changeRole(employee);
};

const totalEmployees = computed(() => filteredEmployee.value.length);

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
  disable: false,
});

const filteredEmployee = computed(() => {
  let result = userStore.users;

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

  // Sort customers: active > inactive > disable
  result = result.sort((a, b) => {
    const statusOrder = { active: 1, inactive: 2, disable: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return result;
});

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

//Fix Date Format
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Checks Severity of Status of each Users
const getStatusSeverity = (status) => {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "warning";
    case "disable":
      return "danger";
    default:
      return null;
  }
};

const formatPhoneNumber = (raw) => {
  if (!raw) return "";

  const digits = raw.replace(/\D/g, "");

  if (digits.startsWith("0")) {
    return digits.replace(/^0(\d{3})(\d{3})(\d{4})$/, "+63 $1 $2 $3");
  } else if (digits.startsWith("63")) {
    return digits.replace(/^63(\d{3})(\d{3})(\d{4})$/, "+63 $1 $2 $3");
  } else if (digits.startsWith("9") && digits.length === 10) {
    return digits.replace(/^(\d{3})(\d{3})(\d{4})$/, "+63 $1 $2 $3");
  } else {
    return raw;
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
              ref="hideMenu"
              class="absolute -left-20 mt-2 w-40 shadow-md z-50 bg-[#fcfcfc] dark:bg-stone-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <h2
                class="font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm"
              >
                Filter by Roles
              </h2>
              <ul class="space-y-1">
                <li
                  class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                >
                  <Checkbox
                    v-model="filterRoles.admin"
                    binary
                    inputId="admin"
                  />
                  <label
                    for="admin"
                    class="text-gray-600 dark:text-gray-300 text-sm"
                    >Admin</label
                  >
                </li>
                <li
                  class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                >
                  <Checkbox
                    v-model="filterRoles.staff"
                    binary
                    inputId="staff"
                  />
                  <label
                    for="staff"
                    class="text-gray-600 dark:text-gray-300 text-sm"
                    >Staff</label
                  >
                </li>
              </ul>
              <Divider class="my-2" />
              <h2
                class="font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm"
              >
                Filter by Status
              </h2>
              <ul class="space-y-1">
                <li
                  class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                >
                  <Checkbox
                    v-model="filterStatuses.active"
                    binary
                    inputId="active"
                  />
                  <label
                    for="active"
                    class="text-gray-600 dark:text-gray-300 text-sm"
                    >Active</label
                  >
                </li>
                <li
                  class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                >
                  <Checkbox
                    v-model="filterStatuses.inactive"
                    binary
                    inputId="inactive"
                  />
                  <label
                    for="inactive"
                    class="text-gray-600 dark:text-gray-300 text-sm"
                    >Inactive</label
                  >
                </li>
                <li
                  class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
                >
                  <Checkbox
                    v-model="filterStatuses.disable"
                    binary
                    inputId="disable"
                  />
                  <label
                    for="disable"
                    class="text-gray-600 dark:text-gray-300 text-sm"
                    >Disable</label
                  >
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
              :class="{ 'disabled-row': employee.status === 'disable' }"
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
              <td class="w-[15%]">
                {{ formatPhoneNumber(employee.contactNo) }}
              </td>
              <td class="w-[10%]">{{ employee.role }}</td>
              <td class="w-[10%]">
                <Tag
                  style="font-size: 12px"
                  :severity="getStatusSeverity(employee.status)"
                  :value="employee.status"
                />
              </td>
              <td class="w-[20%]">{{ formatDate(employee.dateReg) }}</td>
              <td class="w-[5%]" @click.stop>
                <T3ButtonEmployee
                  :employee="employee"
                  @disableEmployee="disableEmployeeHandler"
                  @enableEmployee="enableEmployeeHandler"
                  @changeRole="changeRoleHandler"
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
          <p>
            <strong>Contact No.:</strong>
            {{ formatPhoneNumber(selectedEmployee?.contactNo) }}
          </p>
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

.disabled-row {
  background-color: #4d4d4d20;
  color: grey;
  opacity: 0.8;
}

.disabled-row:hover {
  background-color: #4d4d4d20;
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
