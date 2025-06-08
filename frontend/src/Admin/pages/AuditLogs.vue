<script setup>
import { ref, onMounted, computed } from "vue";
import SearchBar from "../components/SearchBar.vue";
import T3ButtonPublicRate from "../components/T3ButtonPublicRate.vue";
import AddButtonPublicRate from "../components/AddButtonPublicRate.vue";
import T3ButtonCatalog from "../components/T3ButtonCatalog.vue";
import SideBar from "../components/SideBar.vue";
import ProfileAvatar from "../components/ProfileAvatar.vue";
import Notification from "../components/Notification.vue";
import DarkModeButton from "../components/DarkModeButton.vue";
import Paginator from "primevue/paginator";
import Divider from "primevue/divider";
import Tag from "primevue/tag";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { useLogStore } from "../../stores/auditLogStore.js";
import { formatDates } from "../../utility/dateFormat.js";
import { formatPeso } from "../../utility/pesoFormat.js";

const toast = useToast();
const logStore = useLogStore();

onMounted(() => {
  logStore.fetchAllLogs();
});

const total = computed(() => filtered.value.length);

const selected = ref(null);
const details = ref(false);

const openDetails = (logs) => {
  selected.value = logs;
  details.value = true;
};

const closeModal = () => {
  details.value = false;
};

// Search logic
const searchQuery = ref("");

const filtered = computed(() => {
  let result = logStore.logs;

  if (searchQuery.value) {
    result = result.filter((logs) =>
      Object.values(logs).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return result;
});
</script>

<template>
  <main class="paM">
    <SideBar />
    <div class="container">
      <div class="headers">
        <h1 class="text-5xl font-black">Logs</h1>
        <div class="flex items-center gap-5">
          <DarkModeButton />
          <Notification />
          <ProfileAvatar />
        </div>
      </div>
      <div class="searchB">
        <SearchBar class="sBar" v-model="searchQuery" />
      </div>
      <div class="tabDisAdd">
        <div class="tableContainer">
          <table class="dTable">
            <thead>
              <tr class="header-style">
                <th>ID</th>
                <th>USER ID</th>
                <th>ACTION</th>
                <th>TABLE NAME</th>
                <th>REMARKS</th>
                <th>CREATED AT</th>
              </tr>
            </thead>
            <tbody>
              <tr
                class="paRow"
                v-for="logs in filtered"
                :key="logs.id"
                @click="openDetails(logs)"
              >
                <td>{{ logs.auditLogId }}</td>
                <td>{{ logs.userId }}</td>
                <td>{{ logs.action }}</td>
                <td>
                  {{ logs.tableName }}
                </td>

                <td>
                  {{ logs.remarks }}
                </td>
                <td>{{ formatDates(logs.createdAt) }}</td>
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

      <div v-if="details" class="modal">
        <div class="modal-content font-[Poppins]">
          <h2 class="text-xl font-bold m-auto justify-center flex">
            Log Details
          </h2>
          <Divider />
          <div class="flex flex-col gap-2">
            <p><strong>User ID:</strong> {{ selected?.userId }}</p>
            <p><strong>Action:</strong> {{ selected?.action }}</p>
            <p><strong>Table Name:</strong> {{ selected?.tableName }}</p>
            <p><strong>Data:</strong> {{ selected?.data }}</p>
            <p><strong>Renarks:</strong> {{ selected?.remarks }}</p>
            <p><strong>Record Id:</strong> {{ selected?.recordId }}</p>
            <p>
              <strong>Created At:</strong>
              {{ formatDates(selected?.createdAt) }}
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
  width: 50%;
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
