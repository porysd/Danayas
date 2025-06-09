<script setup>
import { ref, onMounted, computed } from "vue";
import SearchBar from "../components/SearchBar.vue";
import T3ButtonTandC from "../components/T3ButtonTandC.vue";
import AddButtonTandC from "../components/AddButtonTandC.vue";
import SideBar from "../components/SideBar.vue";
import Tag from "primevue/tag";
import Notification from "../components/Notification.vue";
import DarkModeButton from "../components/DarkModeButton.vue";
import Divider from "primevue/divider";
import ProfileAvatar from "../components/ProfileAvatar.vue";
import Paginator from "primevue/paginator";
import { formatDates } from "../../utility/dateFormat";
import { useTermsStore } from "../../stores/termStore.js";
import Dialog from "primevue/dialog";
</script>

<template>
  <main class="employeeM bg-[#EEF9EB] dark:bg-[#09090b]">
    <SideBar />
    <div class="container">
      <div class="headers">
        <h1 class="text-5xl font-black">About Us</h1>
        <div class="flex items-center gap-5">
          <DarkModeButton />
          <Notification />
          <ProfileAvatar />
        </div>
      </div>
      <div class="searchB">
        <SearchBar class="sBar" v-model="searchQuery" />
        <div class="empBtns"></div>
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
              v-for="term in filteredTerms"
              :key="term.userId"
              @click="openFaqsDetails(term)"
            >
              <td class="w-[5%]">{{ term.termsId }}</td>
              <td class="w-[30%]">
                {{ term.content }}
              </td>
              <td class="w-[5%]">{{ formatDates(term.createdAt) }}</td>
              <td class="w-[3%]" @click.stop>
                <T3ButtonTandC
                  :faq="term"
                  @updateFAQ="updateFAQHandler"
                  @deleteFAQ="deleteFAQHandler"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <Dialog v-model:visible="details" modal :style="{ width: '30rem' }">
      <template #header>
        <div class="flex flex-col items-center justify-center w-full">
          <h2 class="text-xl font-bold font-[Poppins]">
            Terms & Conditions Details
          </h2>
        </div>
      </template>
      <div class="font-[Poppins]">
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
    </Dialog>
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
  overflow: auto;
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
</style>
