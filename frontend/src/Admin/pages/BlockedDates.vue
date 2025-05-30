<script setup>
import { ref, onMounted, computed } from "vue";
import SearchBar from "../components/SearchBar.vue";
import T3ButtonBlocked from "../components/T3ButtonBlocked.vue";
import AddButtonBlocked from "../components/AddButtonBlocked.vue";
import SideBar from "../components/SideBar.vue";
import ProfileAvatar from "../components/ProfileAvatar.vue";
import Notification from "../components/Notification.vue";
import DarkModeButton from "../components/DarkModeButton.vue";
import Paginator from "primevue/paginator";
import Divider from "primevue/divider";
import Tag from "primevue/tag";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { useBlockedStore } from "../../stores/blockedDateStore.js";
import { formatDates, formatDate } from "../../utility/dateFormat.js";

import { formatPeso } from "../../utility/pesoFormat.js";

const toast = useToast();
const blockedStore = useBlockedStore();

onMounted(() => {
  blockedStore.fetchAllBlocked();
});

const total = computed(() => filtered.value.length);

const addHandler = async (blockedDetails) => {
  await blockedStore.addBlocked(blockedDetails);
};

const updateHandler = async (blockedDetails) => {
  await blockedStore.updateBlocked(blockedDetails);
};

const deleteHandler = async (blockedDetails) => {
  await blockedStore.deleteBlockedDates(blockedDetails);
};

const first = ref(0);
const rows = ref(5);

const paginated = computed(() => {
  return filtered.value.slice(first.value, first.value + rows.value);
});

const onPageChangeCat = (event) => {
  first.value = event.first;
  rows.value = event.rows;
};

const selected = ref(null);
const details = ref(false);

const openRateDetails = (blocked) => {
  selected.value = blocked;
  details.value = true;
};

const closeModal = () => {
  details.value = false;
};

// Search logic
const searchQuery = ref("");

const filtered = computed(() => {
  let result = blockedStore.blocked;

  if (searchQuery.value) {
    result = result.filter((blocked) =>
      Object.values(blocked).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return result;
});

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
        <h1 class="text-5xl font-black">Blocked Dates</h1>
        <div class="flex items-center gap-5">
          <DarkModeButton />
          <Notification />
          <ProfileAvatar />
        </div>
      </div>
      <div class="searchB">
        <SearchBar class="sBar" v-model="searchQuery" />
        <div class="paBtns">
          <AddButtonBlocked
            class="addBtn"
            data="Blocked Date"
            @addBlocked="addHandler"
          />
        </div>
      </div>
      <div class="tabDisAdd">
        <div class="tableContainer">
          <table class="dTable">
            <thead>
              <tr class="header-style">
                <th>ID</th>
                <th>BLOCKED DATE</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>CREATED BY</th>
                <th>CREATED AT</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                class="paRow"
                v-for="blocks in paginated"
                :key="blocks.id"
                @click="openRateDetails(blocks)"
              >
                <td>{{ blocks.blockedDatesId }}</td>
                <td>{{ formatDate(blocks.blockedDates) }}</td>
                <td>{{ blocks.category }}</td>
                <td>
                  <Tag
                    :severity="getStatusSeverity(blocks.status)"
                    :value="blocks.status === 'active' ? 'Active' : 'Cancelled'"
                  />
                </td>
                <td>
                  {{ blocks.createdBy }}
                </td>
                <td>{{ formatDates(blocks.createdAt) }}</td>
                <td @click.stop>
                  <T3ButtonBlocked
                    :blocks="blocks"
                    @updateBlocked="updateHandler"
                    @deleteBlocked="deleteHandler"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <Paginator
            :first="first"
            :rows="rows"
            :totalRecords="total"
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
            <p><strong>Category:</strong> {{ selecteRates?.category }}</p>
            <p><strong>Price Rate:</strong> {{ selecteRates?.rate }}</p>
            <p><strong>Mode:</strong> {{ selecteRates?.mode }}</p>
            <p><strong>Active:</strong> {{ selecteRates?.active }}</p>
            <p>
              <strong>Created At:</strong>
              {{ formatDates(selecteRates?.createdAt) }}
            </p>
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
