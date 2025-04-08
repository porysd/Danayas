<script setup>
import { ref, onMounted, computed } from "vue";
import SearchBar from "../components/SearchBar.vue";
import T3ButtonPromos from "../components/T3ButtonPromos.vue";
import T3ButtonPackages from "../components/T3ButtonPackages.vue";
import AddButtonPromos from "../components/AddButtonPromos.vue";
import AddButtonPackage from "../components/AddButtonPackage.vue";
import FilterButton from "../components/FilterButton.vue";
import SideBar from "../components/SideBar.vue";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import Paginator from "primevue/paginator";
import Divider from "primevue/divider";
import Tag from "primevue/tag";
import ProfileAvatar from "../components/ProfileAvatar.vue";
import Notification from "../components/Notification.vue";
import DarkModeButton from "../components/DarkModeButton.vue";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const packages = ref([]);

const getAllPackages = async () => {
  try {
    const limit = 50;
    const response = await fetch(
      `http://localhost:3000/packages/packages?limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to fetch packages");

    const packagesData = await response.json();
    packages.value = packagesData.items;
  } catch (error) {
    console.error("Error fetching packages:", error);
  }
};
const totalPackages = computed(() => packages.value.length);

onMounted(() => {
  getAllPackages();
});

const promos = ref([
  {
    id: 1,
    name: "Cruz Package",
    price: "PHP 7000.00",
    status: "Active",
    timeLimit: "2024-04-01",
    created: "2024-03-01",
  },
  {
    id: 2,
    name: "Cruz Package",
    price: "PHP 7000.00",
    status: "Active",
    timeLimit: "2024-04-01",
    created: "2024-03-01",
  },
  {
    id: 3,
    name: "Cruz Package",
    price: "PHP 7000.00",
    status: "Active",
    timeLimit: "2024-04-01",
    created: "2024-03-01",
  },
  {
    id: 4,
    name: "Cruz Package",
    price: "PHP 7000.00",
    status: "Active",
    timeLimit: "2024-04-01",
    created: "2024-03-01",
  },
  {
    id: 5,
    name: "Cruz Package",
    price: "PHP 7000.00",
    status: "Active",
    timeLimit: "2024-04-01",
    created: "2024-03-01",
  },
]);
const totalPromos = computed(() => promos.value.length);

// Add Package

const addPackageHandler = async (packageT) => {
  const formatPackage = {
    ...packageT,
    price: packageT.price ? Number(packageT.price) : null,
  };
  try {
    const response = await fetch("http://localhost:3000/packages/package", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(formatPackage),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add package: ${errorText}`);
    }
  } catch (error) {
    console.error("Error adding package:", error);
  }
};

// Delete Package by ID

const deletePackageHandler = async (packageT) => {
  try {
    const response = await fetch(
      `http://localhost:3000/packages/${packageT.packageId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("Failed to delete packages");
    packages.value = packages.value.filter(
      (c) => c.packageId !== packageT.packageId
    );
    getAllPackages();
  } catch (error) {
    console.error("Error deleting packages", error);
  }
};

// Update the Package by ID

const updatePackageHandler = async (updatedPackage) => {
  const formatEdit = {
    updatedPackage,
    price: updatedPackage.price ? Number(updatedPackage.price) : null,
  };

  try {
    const response = await fetch(
      `http://localhost:3000/packages/${updatedPackage.packageId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPackage),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add package: ${errorText}`);
    }
    getAllPackages();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Update Failed",
      detail: error.message,
      life: 3000,
    });
  }
};

//Package Details
const selectedPackage = ref(null);
const packageDetails = ref(false);

const openPackageDetails = (packageT) => {
  selectedPackage.value = packageT;
  packageDetails.value = true;
};

const closeModal = () => {
  packageDetails.value = false;
};

//Fix Date Format
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

//Checks Severity of Status of the Package
const getStatusSeverity = (status) => {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "secondary";
    case "sold-out":
      return "danger";
    case "coming-soon":
      return "info";
    default:
      return "secondary";
  }
};

// Paginator or pagination of the tables
const firstPack = ref(0);
const rowsPack = ref(10);

const paginatedPackages = computed(() => {
  return packages.value.slice(
    firstPack.value,
    firstPack.value + rowsPack.value
  );
});

const onPageChangePack = (event) => {
  firstPack.value = event.first;
  rowsPack.value = event.rows;
};

// Paginator or pagination of the tables
const firstPro = ref(0);
const rowsPro = ref(10);

const paginatedPromos = computed(() => {
  return promos.value.slice(firstPro.value, firstPro.value + rowsPro.value);
});

const onPageChangePro = (event) => {
  firstPro.value = event.first;
  rowsPro.value = event.rows;
};
</script>

<template>
  <main class="paM">
    <SideBar />
    <div class="container">
      <div class="headers">
        <h1 class="text-5xl font-black">Package and Promos</h1>
        <div class="flex items-center gap-5">
          <DarkModeButton />
          <Notification />
          <ProfileAvatar />
        </div>
      </div>
      <div class="searchB">
        <SearchBar class="sBar" />
        <div class="paBtns">
          <FilterButton />
          <AddButtonPromos class="addBtn" data="Promos" />
          <AddButtonPackage
            class="addBtn"
            data="Packages"
            @addPackage="addPackageHandler"
          />
        </div>
      </div>

      <div class="tabPackPro">
        <Tabs value="0">
          <TabList>
            <Tab value="0">PACKAGE</Tab>
            <Tab value="1">PROMOS</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <div class="tableContainer">
                <table class="dTable">
                  <thead>
                    <tr
                      class="header-style bg-[#194d1d] dark:bg-[#18181b] border-[#194D1D] dark:border-[#18181b]"
                    >
                      <th>ID</th>
                      <th>PACKAGE NAME</th>
                      <th>PRICE</th>
                      <th>STATUS</th>
                      <th>CREATED</th>
                      <th>UPDATED</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="paRow"
                      v-for="packageT in paginatedPackages"
                      :key="packageT.id"
                      @click="openPackageDetails(packageT)"
                    >
                      <td class="w-[5%]">{{ packageT.packageId }}</td>
                      <td class="w-[20%]">{{ packageT.name }}</td>
                      <td class="w-[10%]">{{ packageT.price }}</td>
                      <td class="w-[15%]">
                        <Tag
                          :severity="getStatusSeverity(packageT.status)"
                          :value="packageT.status"
                        />
                      </td>
                      <td class="w-[10%]">
                        {{ formatDate(packageT.createdAt) }}
                      </td>
                      <td class="w-[10%]">
                        {{ formatDate(packageT.updatedAt) }}
                      </td>
                      <td class="w-[5%]" @click.stop>
                        <T3ButtonPackages
                          :packageT="packageT"
                          @updatePackage="updatePackageHandler"
                          @deletePackage="deletePackageHandler"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="firstPack"
                  :rows="rowsPack"
                  :totalRecords="totalPackages"
                  :rowsPerPageOptions="[5, 10, 20, 30]"
                  @page="onPageChangePack"
                  class="rowPagination"
                />
              </div>
            </TabPanel>
            <TabPanel value="1">
              <div class="tableContainer">
                <table class="dTable">
                  <thead>
                    <tr
                      class="header-style bg-[#194d1d] dark:bg-[#18181b] border-[#194D1D] dark:border-[#18181b]"
                    >
                      <th>PROMO NAME</th>
                      <th>PRICE</th>
                      <th>STATUS</th>
                      <th>TIME LIMIT</th>
                      <th>CREATED</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="paRow"
                      v-for="promo in paginatedPromos"
                      :key="promo.id"
                    >
                      <td>{{ promo.name }}</td>
                      <td>{{ promo.price }}</td>
                      <td>{{ promo.status }}</td>
                      <td>{{ promo.timeLimit }}</td>
                      <td>{{ promo.created }}</td>
                      <td>
                        <T3ButtonPromos
                          :packageT="packageT"
                          @updatePackage="updatePackageHandler"
                          @deletePackage="deletePackageHandler"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="firstPro"
                  :rows="rowsPro"
                  :totalRecords="totalPromos"
                  :rowsPerPageOptions="[5, 10, 20, 30]"
                  @page="onPageChangePro"
                  class="rowPagination"
                />
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>

    <div v-if="packageDetails" class="modal">
      <div class="modal-content font-[Poppins]">
        <h2 class="text-xl font-bold m-auto justify-center align-center flex">
          Employee Details
        </h2>
        <Divider />
        <div class="flex flex-col gap-2">
          <p><strong>Package ID:</strong> {{ selectedPackage?.packageId }}</p>
          <p><strong>Package Name:</strong> {{ selectedPackage?.name }}</p>
          <p><strong>Package Price: </strong>{{ selectedPackage?.price }}</p>
          <p>
            <strong>Package Description:</strong>
            {{ selectedPackage?.description }}
          </p>
          <p><strong>Package Status:</strong> {{ selectedPackage?.status }}</p>
          <p><strong>Created At:</strong> {{ selectedPackage?.createdAt }}</p>
          <p><strong>Updated At:</strong> {{ selectedPackage?.updatedAt }}</p>
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
.paM {
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

.paBtns {
  display: flex;
  gap: 5px;
}

.tableContainer {
  max-height: 75%;
  overflow-y: auto;
  border-radius: 5px;
}

.tableContainer::-webkit-scrollbar,
.tabPackPro::-webkit-scrollbar {
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

.paRow {
  width: 100%;
  font-size: 15px;
  height: auto;
  text-align: center;
  border-bottom: 1px solid #194d1d;
  cursor: pointer;
}

.my-app-dark .paRow {
  border: 1px solid #fcfcfc;
}

.paRow:hover {
  background-color: #e6f4e8;
}

.my-app-dark .paRow {
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
  width: 30rem;
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

:deep(.tabPackPro) {
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
