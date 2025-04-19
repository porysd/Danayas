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
import { useDiscountStore } from "../../stores/discountStore.js";
import { useCatalogStore } from "../../stores/catalogStore.js";
import { useAddOnsStore } from "../../stores/addOnsStore.js";

const toast = useToast();
const discountStore = useDiscountStore();
const catalogStore = useCatalogStore();
const addOnsStore = useAddOnsStore();

onMounted(() => {
  discountStore.fetchAllDiscounts();
  catalogStore.fetchAllCatalogs();
  addOnsStore.fetchAllAddOns();
});

const totalDiscounts = computed(() => filteredDiscount.value.length);

const addDiscountHandler = async (discount) => {
  await discountStore.addDiscount(discount);
};

const updateDiscountHandler = async (updateDiscount) => {
  await discountStore.updateDiscount(updateDiscount);
};

const deleteDiscountHandler = async (deleteDiscount) => {
  await discountStore.deleteDiscount(deleteDiscount);
};

// Discount Details Modal
const selectedDiscount = ref(null);
const discountDetails = ref(false);

const openDiscountDetails = (discount) => {
  selectedDiscount.value = discount;
  discountDetails.value = true;
};

const closeModal = () => {
  discountDetails.value = false;
  catalogDetails.value = false;
  addOnsDetails.value = false;
};

const first = ref(0);
const rows = ref(5);

const paginatedDiscount = computed(() => {
  return filteredDiscount.value.slice(first.value, first.value + rows.value);
});

const onPageChangePro = (event) => {
  first.value = event.first;
  rows.value = event.rows;
};

// ADD ONS

const totalAddOns = computed(() => filteredAddOns.value.length);

// const addAddOnsHandler = async (addOnsDetails) => {
//   await addOnsStore.addAddOns(addOnsDetails);
// };

const firstAo = ref(0);
const rowsAo = ref(10);

const paginatedAddOns = computed(() => {
  return filteredAddOns.value.slice(
    firstAo.value,
    firstAo.value + rowsAo.value
  );
});

const onPageChangeAo = (event) => {
  firstAo.value = event.first;
  rowsAo.value = event.rows;
};

const selectedAddOns = ref(null);
const addOnsDetails = ref(false);

const openAddOnsDetails = (addOns) => {
  selectedAddOns.value = addOns;
  addOnsDetails.value = true;
};

// CATALOG

const totalCatalog = computed(() => filteredCatalog.value.length);

const addCatalogHandler = async (catalogDetails) => {
  await catalogStore.addCatalog(catalogDetails);
};

const updateCatalogHandler = async (catalogDetails) => {
  await catalogStore.updateCatalog(catalogDetails);
};

const deleteCatalogHandler = async (catalogDetails) => {
  await catalogStore.deleteCatalog(catalogDetails);
};

const firstCat = ref(0);
const rowsCat = ref(5);

const paginatedCatalogs = computed(() => {
  return filteredCatalog.value.slice(
    firstCat.value,
    firstCat.value + rowsCat.value
  );
});

const onPageChangeCat = (event) => {
  firstCat.value = event.first;
  rowsCat.value = event.rows;
};

const selectedCatalog = ref(null);
const catalogDetails = ref(false);

const openCatalogDetails = (catalog) => {
  selectedCatalog.value = catalog;
  catalogDetails.value = true;
};

// Search logic
const searchQuery = ref("");
const filteredDiscount = computed(() => {
  let result = discountStore.discounts;
  if (searchQuery.value) {
    result = result.filter((discount) =>
      Object.values(discount).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return result;
});

const filteredAddOns = computed(() => {
  let result = addOnsStore.addOns;
  if (searchQuery.value) {
    result = result.filter((bookingAddOn) =>
      Object.values(bookingAddOn).some((val) =>
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return result;
});

const filteredCatalog = computed(() => {
  let result = catalogStore.catalog;
  console.log("Catalog Store Data:", catalogStore.catalog);
  if (searchQuery.value) {
    result = result.filter((catalog) =>
      Object.values(catalog).some((val) =>
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
        <h1 class="text-5xl font-black">Discount and Add Ons</h1>
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
            @addAddons="addCatalogHandler"
          />
          <AddButtonDiscount
            class="addBtn"
            data="Discount"
            @addDiscount="addDiscountHandler"
          />
        </div>
      </div>
      <div class="tabDisAdd">
        <Tabs value="0">
          <TabList>
            <Tab value="0">DISCOUNT</Tab>
            <Tab value="1">CATALOG ADD ONS</Tab>
            <Tab value="2">BOOKING ADD ONS</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <div class="tableContainer">
                <table class="dTable">
                  <thead>
                    <tr class="header-style">
                      <th>ID</th>
                      <th>DISCOUNT NAME</th>
                      <th>PERCENTAGE</th>
                      <th>TYPE</th>
                      <th>STATUS</th>
                      <th>CREATED</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="paRow"
                      v-for="discount in paginatedDiscount"
                      :key="discount.id"
                      @click="openDiscountDetails(discount)"
                    >
                      <td>{{ discount.discountId }}</td>
                      <td>{{ discount.name }}</td>
                      <td>{{ discount.percentage * 100 }}%</td>
                      <td>{{ discount.typeFor }}</td>
                      <td>
                        <Tag
                          style="font-size: 12px"
                          :severity="getStatusSeverity(discount.status)"
                          :value="
                            discount.status === 'active' ? 'Active' : 'Inactive'
                          "
                        />
                      </td>
                      <td>{{ formatDate(discount.createdAt) }}</td>
                      <td @click.stop>
                        <T3ButtonDiscount
                          :discount="discount"
                          @updateDiscount="updateDiscountHandler"
                          @deleteDiscount="deleteDiscountHandler"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="first"
                  :rows="rows"
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
                      <th>ID</th>
                      <th>ADD ON NAME</th>
                      <th>PRICE</th>
                      <th>STATUS</th>
                      <th>CREATED</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="paRow"
                      v-for="catalog in paginatedCatalogs"
                      :key="catalog.id"
                      @click="openCatalogDetails(catalog)"
                    >
                      <td>{{ catalog.catalogAddOnId }}</td>
                      <td>{{ catalog.itemName }}</td>
                      <td>{{ formatPeso(catalog.price) }}</td>
                      <td>
                        <Tag
                          style="font-size: 12px"
                          :severity="getStatusSeverity(catalog.status)"
                          :value="
                            catalog.status === 'active' ? 'Active' : 'Inactive'
                          "
                        />
                      </td>
                      <td>{{ formatDate(catalog.createdAt) }}</td>
                      <td @click.stop>
                        <T3ButtonCatalog
                          :catalog="catalog"
                          @updateCatalog="updateCatalogHandler"
                          @deleteCatalog="deleteCatalogHandler"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="firstCat"
                  :rows="rowsCat"
                  :totalRecords="totalCatalog"
                  :rowsPerPageOptions="[5, 10, 20, 30]"
                  @page="onPageChangeCat"
                  class="rowPagination"
                />
              </div>
            </TabPanel>
            <TabPanel value="2">
              <div class="tableContainer">
                <table class="dTable">
                  <thead>
                    <tr class="header-style">
                      <th>BOOKING ADD ON ID</th>
                      <th>BOOKING ID</th>
                      <th>CATALONG ADD ON ID</th>
                      <th>PRICE</th>
                      <th>CREATED</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="paRow"
                      v-for="bookingAddOn in paginatedAddOns"
                      :key="bookingAddOn.id"
                      @click="openAddOnsDetails(bookingAddOn)"
                    >
                      <td>{{ bookingAddOn.bookingAddOnId }}</td>
                      <td>{{ bookingAddOn.bookingId }}</td>
                      <td>{{ bookingAddOn.catalogAddOnId }}</td>
                      <td>{{ formatPeso(bookingAddOn.price) }}</td>
                      <td>{{ formatDate(bookingAddOn.createdAt) }}</td>
                      <td @click.stop>
                        <T3ButtonAddOns
                          :bookingAddOn="bookingAddOn"
                          @updateAddOns=""
                          @cancelAddOns=""
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Paginator
                  :first="firstAo"
                  :rows="rowsAo"
                  :totalRecords="totalAddOns"
                  :rowsPerPageOptions="[5, 10, 20, 30]"
                  @page="onPageChangeAo"
                  class="rowPagination"
                />
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>

      <div v-if="discountDetails" class="modal">
        <div class="modal-content font-[Poppins]">
          <h2 class="text-xl font-bold m-auto justify-center flex">
            Discount Details
          </h2>
          <Divider />
          <div class="flex flex-col gap-2">
            <p><strong>Discount Name:</strong> {{ selectedDiscount?.name }}</p>
            <p>
              <strong>Percentage :</strong> {{ selectedDiscount?.percentage }}
            </p>
            <p><strong>Type :</strong> {{ selectedDiscount?.typeFor }}</p>
            <p><strong>Status :</strong> {{ selectedDiscount?.status }}</p>
            <Divider />
            <button class="closeDetails mt-5 w-[100%]" @click="closeModal">
              Close
            </button>
          </div>
        </div>
      </div>

      <div v-if="catalogDetails" class="modal">
        <div class="modal-content font-[Poppins]">
          <h2 class="text-xl font-bold m-auto justify-center flex">
            Catalog Add-On Details
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

      <div v-if="addOnsDetails" class="modal">
        <div class="modal-content font-[Poppins]">
          <h2 class="text-xl font-bold m-auto justify-center flex">
            Booking Add-On Details
          </h2>
          <Divider />
          <div class="flex flex-col gap-2">
            <p>
              <strong>Booking Add On ID:</strong>
              {{ selectedAddOns?.bookingAddOnId }}
            </p>
            <p><strong>Booking ID:</strong> {{ selectedAddOns?.bookingId }}</p>
            <p>
              <strong>Catalog Add On ID:</strong>
              {{ selectedAddOns?.catalogAddOnId }}
            </p>
            <p><strong>Price:</strong> {{ selectedAddOns?.price }}</p>
            <p><strong>Created At:</strong> {{ selectedAddOns?.createdAt }}</p>
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
