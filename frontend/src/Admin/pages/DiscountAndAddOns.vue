<script setup>
import { ref, onMounted } from "vue";
import SearchBar from "../components/SearchBar.vue";
import T3Button from "../components/T3ButtonBooking.vue";
import AddButton from "../components/AddButton.vue";
import FilterButton from "../components/FilterButton.vue";
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

const toast = useToast();

// const discounts = ref({});

// onMounted (async () => {
//     try{

//         const limit = 50;
//         const response = await fetch(`http://localhost:3000/packages/packages?limit=${limit}`);
//         if (!response.ok) throw new Error('Failed to fetch packages');

//         const packagesData = await response.json();
//         packages.value = packagesData.items;

//         } catch (error){
//         console.error('Error fetching packages:', error);
//         }
// });

const discounts = ref([
  {
    id: 1,
    discountName: "Senior Citizen",
    percentage: "10%",
    status: "Active",
    created: "2024-03-01",
    updated: "2024-03-01",
  },
  {
    id: 2,
    discountName: "Senior Citizen",
    percentage: "10%",
    status: "Active",
    created: "2024-03-01",
    updated: "2024-03-01",
  },
  {
    id: 3,
    discountName: "Senior Citizen",
    percentage: "10%",
    status: "Active",
    created: "2024-03-01",
    updated: "2024-03-01",
  },
  {
    id: 4,
    discountName: "Senior Citizen",
    percentage: "10%",
    status: "Active",
    created: "2024-03-01",
    updated: "2024-03-01",
  },
  {
    id: 5,
    discountName: "Senior Citizen",
    percentage: "10%",
    status: "Active",
    created: "2024-03-01",
    updated: "2024-03-01",
  },
  {
    id: 6,
    discountName: "Senior Citizen",
    percentage: "10%",
    status: "Active",
    created: "2024-03-01",
    updated: "2024-03-01",
  },
  {
    id: 7,
    discountName: "Senior Citizen",
    percentage: "10%",
    status: "Active",
    created: "2024-03-01",
    updated: "2024-03-01",
  },
  {
    id: 8,
    discountName: "Senior Citizen",
    percentage: "10%",
    status: "Active",
    created: "2024-03-01",
    updated: "2024-03-01",
  },
  {
    id: 9,
    discountName: "Senior Citizen",
    percentage: "10%",
    status: "Active",
    created: "2024-03-01",
    updated: "2024-03-01",
  },
  {
    id: 10,
    discountName: "Senior Citizen",
    percentage: "10%",
    status: "Active",
    created: "2024-03-01",
    updated: "2024-03-01",
  },
]);

const addOns = ref([
  {
    id: 1,
    name: "Chairs",
    price: "PHP 200.00",
    quantity: 10,
    status: "Active",
    created: "2024-03-01",
  },
  {
    id: 2,
    name: "Chairs",
    price: "PHP 200.00",
    quantity: 10,
    status: "Active",
    created: "2024-03-01",
  },
  {
    id: 3,
    name: "Chairs",
    price: "PHP 200.00",
    quantity: 10,
    status: "Active",
    created: "2024-03-01",
  },
  {
    id: 4,
    name: "Chairs",
    price: "PHP 200.00",
    quantity: 10,
    status: "Active",
    created: "2024-03-01",
  },
  {
    id: 5,
    name: "Chairs",
    price: "PHP 200.00",
    quantity: 10,
    status: "Active",
    created: "2024-03-01",
  },
  {
    id: 6,
    name: "Chairs",
    price: "PHP 200.00",
    quantity: 10,
    status: "Active",
    created: "2024-03-01",
  },
  {
    id: 7,
    name: "Chairs",
    price: "PHP 200.00",
    quantity: 10,
    status: "Active",
    created: "2024-03-01",
  },
  {
    id: 8,
    name: "Chairs",
    price: "PHP 200.00",
    quantity: 10,
    status: "Active",
    created: "2024-03-01",
  },
  {
    id: 9,
    name: "Chairs",
    price: "PHP 200.00",
    quantity: 10,
    status: "Active",
    created: "2024-03-01",
  },
  {
    id: 10,
    name: "Chairs",
    price: "PHP 200.00",
    quantity: 10,
    status: "Active",
    created: "2024-03-01",
  },
]);

//Change logic
</script>

<template>
  <main class="paM">
    <SideBar />
    <div class="container">
      <div class="headers">
        <h1 class="text-5xl font-black">Discount and Add Ons</h1>
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
          <AddButton class="addBtn" data="Add Ons" />
          <AddButton class="addBtn" data="Discount" />
        </div>
      </div>
      <div class="tabDisAdd">
        <Tabs value="0">
          <TabList>
            <Tab value="0">DISCOUNT</Tab>
            <Tab value="1">ADD ONS</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <div class="tableContainer">
                <table class="dTable">
                  <thead>
                    <tr class="header-style">
                      <th>DISCOUNT NAME</th>
                      <th>PERCENTAGE</th>
                      <th>STATUS</th>
                      <th>CREATED</th>
                      <th>UPDATED</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="paRow"
                      v-for="discount in discounts"
                      :key="discount.id"
                    >
                      <td>{{ discount.discountName }}</td>
                      <td>{{ discount.percentage }}</td>
                      <td>{{ discount.status }}</td>
                      <td>{{ discount.created }}</td>
                      <td>{{ discount.updated }}</td>
                      <td><T3Button /></td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="firstPro"
                  :rows="rowsPro"
                  :totalRecords="totalDiscounts"
                  :rowsPerPageOptions="[5, 10, 20, 30]"
                  @page="onPageChangePro"
                  class="rowPagination"
                />
              </div>
            </TabPanel>
            <TabPanel value="1">
              <div class="tableContainer">
                <table class="dTable">
                  <thead>
                    <tr class="header-style">
                      <th>ADD ONS NAME</th>
                      <th>PRICE</th>
                      <th>QUANTITY</th>
                      <th>STATUS</th>
                      <th>CREATED</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="paRow" v-for="addOn in addOns" :key="addOn.id">
                      <td>{{ addOn.name }}</td>
                      <td>{{ addOn.price }}</td>
                      <td>{{ addOn.quantity }}</td>
                      <td>{{ addOn.status }}</td>
                      <td>{{ addOn.created }}</td>
                      <td><T3Button /></td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="firstPro"
                  :rows="rowsPro"
                  :totalRecords="totalAddOns"
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
  height: auto;
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
