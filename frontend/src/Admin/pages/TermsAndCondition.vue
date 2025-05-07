<script setup>
import { ref, onMounted, computed } from "vue";
import SearchBar from "../components/SearchBar.vue";
import T3ButtonEmployee from "../components/T3ButtonEmployee.vue";
import AddButtonEmployee from "../components/AddButtonEmployee.vue";
import SideBar from "../components/SideBar.vue";
import Tag from "primevue/tag";
import Notification from "../components/Notification.vue";
import DarkModeButton from "../components/DarkModeButton.vue";
import Divider from "primevue/divider";
import ProfileAvatar from "../components/ProfileAvatar.vue";
import Paginator from "primevue/paginator";
import { formatDates } from "../../utility/dateFormat";
import { useTermsStore } from "../../stores/termStore.js";

const termsStore = useTermsStore();

onMounted(() => {
  termsStore.fetchAlltermAndCondition();
});

const totalTerms = computed(() => filteredTerms.length);

//FAQs Details
const selectedTerm = ref(null);
const details = ref(false);

const openFaqsDetails = (faq) => {
  selectedTerm.value = faq;
  details.value = true;
};

const closeModal = () => {
  details.value = false;
  showFilterModal.value = false;
};

// Paginator or pagination of the tables
const first = ref(0);
const rows = ref(10);

const paginatedTerms = computed(() => {
  return filteredTerms.value.slice(first.value, first.value + rows.value);
});

const onPageChange = (event) => {
  first.value = event.first;
  rows.value = event.rows;
};

// Search and Filter Button Logic
const showMenu = ref(false);
const searchQuery = ref("");

const filteredTerms = computed(() => {
  let result = termsStore.terms;

  if (searchQuery.value !== "") {
    result = result.filter((term) =>
      Object.values(term).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return result;
});
</script>

<template>
  <main class="employeeM bg-[#EEF9EB] dark:bg-[#09090b]">
    <SideBar />
    <div class="container">
      <div class="headers">
        <h1 class="text-5xl font-black">Terms and Conditions</h1>
        <div class="flex items-center gap-5">
          <DarkModeButton />
          <Notification />
          <ProfileAvatar />
        </div>
      </div>
      <div class="searchB">
        <SearchBar class="sBar" v-model="searchQuery" />
        <div class="empBtns">
          <AddButtonEmployee class="addBtn" data="Terms and Conditions" />
        </div>
      </div>

      <div class="tableContainer">
        <table class="dTable">
          <thead>
            <tr class="header-style bg-[#194d1d] dark:bg-[#18181b]">
              <th>ID</th>
              <th>CONTENT</th>
              <th>CREATED</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="eRow border-[#194D1D] dark:border-[#18181b]"
              v-for="term in paginatedTerms"
              :key="term.userId"
              @click="openFaqsDetails(term)"
            >
              <td class="w-[5%]">{{ term.termsId }}</td>
              <td class="w-[30%]">
                {{ term.content }}
              </td>
              <td class="w-[5%]">{{ formatDates(term.createdAt) }}</td>
              <td class="w-[3%]" @click.stop>
                <T3ButtonEmployee :employee="employee" />
              </td>
            </tr>
          </tbody>
        </table>
        <Paginator
          :first="first"
          :rows="rows"
          :totalRecords="totalTerms"
          :rowsPerPageOptions="[5, 10, 20, 30]"
          @page="onPageChange"
          class="rowPagination"
        />
      </div>
    </div>

    <div v-if="details" class="modal">
      <div class="modal-content font-[Poppins]">
        <h2 class="text-xl font-bold m-auto justify-center align-center flex">
          FAQs Details
        </h2>
        <Divider />
        <div class="flex flex-col gap-2">
          <p>
            <strong>Terms and Condition ID:</strong> {{ selectedTerm?.termsId }}
          </p>
          <p><strong>Content:</strong> {{ selectedTerm?.content }}</p>
          <p>
            <strong>Created At:</strong>
            {{ formatDates(selectedTerm?.createdAt) }}
          </p>
          <p>
            <strong>Updated At:</strong>
            {{ formatDates(selectedTerm?.updatedAt) }}
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
