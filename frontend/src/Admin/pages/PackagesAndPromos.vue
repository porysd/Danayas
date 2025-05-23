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
import { usePackageStore } from "../../stores/packageStore.js";
import { formatPeso } from "../../utility/pesoFormat";
import { formatDates } from "../../utility/dateFormat";
import Inplace from "primevue/inplace";
import Image from "primevue/image";

const toast = useToast();
const packageStore = usePackageStore();

onMounted(() => {
  packageStore.fetchAllPackages();
  packageStore.fetchAllPromos();
});

const addPackageHandler = async (packageT) => {
  await packageStore.addPackage(packageT);
};

const updatePackageHandler = async (updatedPackage) => {
  await packageStore.updatePackage(updatedPackage);
};

const updatePromoHandler = async (updatedPromo) => {
  await packageStore.updatePromo(updatedPromo);
};

const deletePackageHandler = async (packageT) => {
  await packageStore.deletePackage(packageT);
};

const totalPackages = computed(() => filteredPackages.value.length);
const totalPromos = computed(() => filteredPromos.value.length);

// Paginator or pagination of the tables
const firstPack = ref(0);
const rowsPack = ref(10);

const paginatedPackages = computed(() => {
  return filteredPackages.value.slice(
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
  return filteredPromos.value.slice(
    firstPro.value,
    firstPro.value + rowsPro.value
  );
});

const onPageChangePro = (event) => {
  firstPro.value = event.first;
  rowsPro.value = event.rows;
};

//Package Details
const selectedPackage = ref(null);
const packageDetails = ref(false);
const selectedPromo = ref(null);
const promoDetails = ref(false);

const openPackageDetails = (packageT) => {
  selectedPackage.value = packageT;
  packageDetails.value = true;
};

const openPromoDetails = (promo) => {
  selectedPromo.value = promo;
  promoDetails.value = true;
};

const closeModal = () => {
  packageDetails.value = false;
  promoDetails.value = false;
};

// Search logic
const searchQuery = ref("");
const filteredPackages = computed(() => {
  let result = packageStore.packages;
  if (searchQuery.value) {
    result = result.filter((packageT) =>
      Object.values(packageT).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return result;
});
const filteredPromos = computed(() => {
  let result = packageStore.promos;
  if (searchQuery.value) {
    result = result.filter((packageT) =>
      Object.values(packageT).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return result;
});

const getMode = (mode) => {
  switch (mode) {
    case "day-time":
      return "warn";
    case "night-time":
      return "info";
    case "whole-day":
      return "danger";
    default:
      return "secondary";
  }
};

//Checks Severity of Status of the Package
const getStatusSeverity = (status) => {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "danger";
    default:
      return "secondary";
  }
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
        <SearchBar class="sBar" v-model="searchQuery" />
        <div class="paBtns">
          <!--<FilterButton />-->
          <AddButtonPromos
            class="addBtn"
            data="Promos"
            @addPromos="addPackageHandler"
          />
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
                      <th>MODE</th>
                      <th>STATUS</th>
                      <th>CREATED</th>
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
                      <td class="w-[10%]">{{ formatPeso(packageT.price) }}</td>
                      <td class="w-[10%]">
                        <Tag
                          :severity="getMode(packageT.mode)"
                          :value="packageT.mode"
                        />
                      </td>
                      <td class="w-[15%]">
                        <Tag
                          :severity="getStatusSeverity(packageT.status)"
                          :value="packageT.status"
                        />
                      </td>
                      <td class="w-[10%]">
                        {{ formatDates(packageT.createdAt) }}
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
                      <th>ID</th>
                      <th>PROMO NAME</th>
                      <th>PRICE</th>
                      <th>MODE</th>
                      <th>STATUS</th>
                      <td>PROMO START & END</td>
                      <th>CREATED</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="paRow"
                      v-for="promo in paginatedPromos"
                      :key="promo.id"
                      @click="openPromoDetails(promo)"
                    >
                      <td>{{ promo.packageId }}</td>
                      <td>{{ promo.name }}</td>
                      <td>{{ formatPeso(promo.price) }}</td>
                      <td>
                        <Tag
                          :severity="getMode(promo.mode)"
                          :value="promo.mode"
                        />
                      </td>
                      <td>
                        <Tag
                          :severity="getStatusSeverity(promo.status)"
                          :value="promo.status"
                        />
                      </td>
                      <td>{{ promo.promoStart }} - {{ promo.promoEnd }}</td>
                      <td>{{ formatDates(promo.createdAt) }}</td>
                      <td @click.stop>
                        <T3ButtonPromos
                          :packageT="promo"
                          @updatePromo="updatePromoHandler"
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
          Package Details
        </h2>
        <Divider />
        <div class="flex flex-col gap-2">
          <p><strong>Package ID:</strong> {{ selectedPackage?.packageId }}</p>
          <p><strong>Package Name:</strong> {{ selectedPackage?.name }}</p>
          <p>
            <strong>Package Price: </strong
            >{{ formatPeso(selectedPackage?.price) }}
          </p>
          <p>
            <strong>Package Inclusion:</strong>
            {{ selectedPackage?.inclusion }}
          </p>
          <p><strong>Package Mode:</strong> {{ selectedPackage?.mode }}</p>
          <p><strong>Package Status:</strong> {{ selectedPackage?.status }}</p>
          <p><strong>Package Image:</strong></p>
          <Inplace>
            <template #display>
              <span class="inline-flex items-center gap-2">
                <span class="pi pi-image"></span>
                <span>View Photo</span>
              </span>
            </template>
            <template #content>
              <div v-if="selectedPackage?.imageUrl">
                <Image
                  :src="`http://localhost:3000${selectedPackage?.imageUrl}`"
                  class="w-full sm:w-80 shadow-md"
                  alt="Image"
                />
              </div>
              <div v-else>
                <p>No image available for this promo.</p>
              </div>
            </template>
          </Inplace>
          <p>
            <strong>Created At:</strong>
            {{ formatDates(selectedPackage?.createdAt) }}
          </p>
          <p>
            <strong>Updated At:</strong>
            {{ formatDates(selectedPackage?.updatedAt) }}
          </p>
          <Divider />
          <button class="closeDetails mt-5 w-[100%]" @click="closeModal">
            Close
          </button>
        </div>
      </div>
    </div>

    <div v-if="promoDetails" class="modal">
      <div class="modal-content font-[Poppins]">
        <h2 class="text-xl font-bold m-auto justify-center align-center flex">
          Promo Details
        </h2>
        <Divider />
        <div class="flex flex-col gap-2">
          <p><strong>Package ID:</strong> {{ selectedPromo?.packageId }}</p>
          <p><strong>Promo Name:</strong> {{ selectedPromo?.name }}</p>
          <p>
            <strong>Promo Price: </strong>{{ formatPeso(selectedPromo?.price) }}
          </p>
          <p>
            <strong>Promo Inclusion:</strong>
            {{ selectedPromo?.inclusion }}
          </p>
          <p><strong>Promo Mode:</strong> {{ selectedPromo?.mode }}</p>
          <p><strong>Promo Status:</strong> {{ selectedPromo?.status }}</p>
          <p><strong>Promo Start:</strong> {{ selectedPromo?.promoStart }}</p>
          <p><strong>Promo End:</strong> {{ selectedPromo?.promoEnd }}</p>
          <p><strong>Promo Image: </strong></p>
          <Inplace>
            <template #display>
              <span class="inline-flex items-center gap-2">
                <span class="pi pi-image"></span>
                <span>View Photo</span>
              </span>
            </template>
            <template #content>
              <div v-if="selectedPromo?.imageUrl">
                <Image
                  :src="`http://localhost:3000${selectedPromo?.imageUrl}`"
                  class="w-full sm:w-80 shadow-md"
                  alt=" Promo Image"
                />
              </div>
              <div v-else>
                <p>No image available for this promo.</p>
              </div>
            </template>
          </Inplace>
          <p>
            <strong>Created At:</strong>
            {{ formatDates(selectedPromo?.createdAt) }}
          </p>
          <p>
            <strong>Updated At:</strong>
            {{ formatDates(selectedPromo?.updatedAt) }}
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
  height: 50px;
  min-height: auto;
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
    overflow: visible;

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
