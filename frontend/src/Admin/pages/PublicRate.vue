<script setup>
import { ref, onMounted, computed } from "vue";
import SearchBar from "../components/SearchBar.vue";
import T3ButtonAddOns from "../components/T3ButtonAddOns.vue";
import T3ButtonDiscount from "../components/T3ButtonDiscount.vue";
import AddButtonAddOns from "../components/AddButtonAddOns.vue";
import AddButtonDiscount from "../components/AddButtonDiscount.vue";
import T3ButtonCatalog from "../components/T3ButtonCatalog.vue";
import SideBar from "../components/SideBar.vue";
import ProfileAvatar from "../components/ProfileAvatar.vue";
import Notification from "../components/Notification.vue";
import DarkModeButton from "../components/DarkModeButton.vue";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import Paginator from "primevue/paginator";
import Divider from "primevue/divider";
import Tag from "primevue/tag";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { usePublicRateStore } from "../../stores/publicRateStore.js";

const toast = useToast();
const rateStore = usePublicRateStore();

onMounted(() => {
  rateStore.fetchAllRates();
});

// CATALOG

const totalRates = computed(() => filteredRates.value.length);

// const addCatalogHandler = async (catalogDetails) => {
//   await catalogStore.addCatalog(catalogDetails);
// };

// const updateCatalogHandler = async (catalogDetails) => {
//   await catalogStore.updateCatalog(catalogDetails);
// };

// const deleteCatalogHandler = async (catalogDetails) => {
//   await catalogStore.deleteCatalog(catalogDetails);
// };

const first = ref(0);
const rows = ref(5);

const paginatedRates = computed(() => {
  return filteredRates.value.slice(first.value, first.value + rows.value);
});

const onPageChangeCat = (event) => {
  firsfirsttCat.value = event.first;
  rows.value = event.rows;
};

const selecteRates = ref(null);
const rateDetails = ref(false);

const openRateDetails = (rates) => {
  selecteRates.value = rates;
  rateDetails.value = true;
};

// Search logic
const searchQuery = ref("");

const filteredRates = computed(() => {
  let result = rateStore.rates;

  if (searchQuery.value) {
    result = result.filter((rates) =>
      Object.values(rates).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return result;
});

//Fix Date Format
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Peso Currency Format
function formatPeso(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

//Checks Severity of Status
const getStatusSeverity = (status) => {
  return status === "active" ? "success" : "danger";
};

//Change logic
</script>

<template>
  <main class="paM">
    <SideBar />
    <div class="container">
      <div class="headers">
        <h1 class="text-5xl font-black">Public Rates</h1>
        <div class="flex items-center gap-5">
          <DarkModeButton />
          <Notification />
          <ProfileAvatar />
        </div>
      </div>
      <div class="searchB">
        <SearchBar class="sBar" v-model="searchQuery" />
        <div class="paBtns">
          <AddButtonAddOns
            class="addBtn"
            data="Add Ons"
            @addAddOns="addCatalogHandler"
          />
          <AddButtonDiscount
            class="addBtn"
            data="Discount"
            @addDiscount="addDiscountHandler"
          />
        </div>
      </div>
      <div class="tabDisAdd">
        <div class="tableContainer">
          <table class="dTable">
            <thead>
              <tr class="header-style">
                <th>ID</th>
                <th>CATEGORY</th>
                <th>RATE</th>
                <th>MODE</th>
                <th>ACTIVE</th>
                <th>CREATED AT</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                class="paRow"
                v-for="rates in paginatedRates"
                :key="rates.id"
                @click="openRatesDetails(rates)"
              >
                <td>{{ rates.rateId }}</td>
                <td>{{ rates.category }}</td>
                <td>{{ formatPeso(rates.rate) }}</td>
                <td>
                  {{ rates.mode }}
                </td>
                <td>
                  {{ rates.isActive }}
                </td>
                <td>{{ formatDate(rates.createdAt) }}</td>
                <td @click.stop>
                  <T3ButtonCatalog />
                </td>
              </tr>
            </tbody>
          </table>
          <Paginator
            :first="first"
            :rows="rows"
            :totalRecords="totalRates"
            :rowsPerPageOptions="[5, 10, 20, 30]"
            @page="onPageChangeCat"
            class="rowPagination"
          />
        </div>
      </div>

      <div v-if="ratesDetails" class="modal">
        <div class="modal-content font-[Poppins]">
          <h2 class="text-xl font-bold m-auto justify-center flex">
            Rate Details
          </h2>
          <Divider />
          <div class="flex flex-col gap-2">
            <p>
              <strong>Catalog Name:</strong> {{ selectedCatalog?.itemName }}
            </p>
            <p><strong>Price:</strong> {{ selectedCatalog?.price }}</p>
            <p><strong>Status:</strong> {{ selectedCatalog?.status }}</p>
            <p><strong>Created At:</strong> {{ selectedCatalog?.createdAt }}</p>
            <Divider />
            <button class="closeDetails mt-5 w-[100%]" @click="closeModal">
              Close
            </button>
          </div>
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
  max-height: 37%;
  height: 550px;
  overflow-y: auto;
  border-radius: 7px;
  margin-bottom: 20px;
}

.tableContainer::-webkit-scrollbar,
.tabDisAdd::-webkit-scrollbar {
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
  position: sticky;
  top: 0;
  z-index: 1;
}

.paRow {
  width: 100%;
  font-size: 15px;
  height: 50px;
  min-height: auto;
  border-bottom: 1px solid #194d1d;
  text-align: center;
  cursor: pointer;
}

.paRow:hover {
  background-color: #e6f4e8;
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

:deep(.tabDisAdd) {
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
</style>
