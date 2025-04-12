<script setup>
import { ref, onMounted, computed } from "vue";
import SearchBar from "../components/SearchBar.vue";
import T3ButtonAddOns from "../components/T3ButtonAddOns.vue";
import T3ButtonDiscount from "../components/T3ButtonDiscount.vue";
import AddButtonAddOns from "../components/AddButtonAddOns.vue";
import AddButtonDiscount from "../components/AddButtonDiscount.vue";
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

const discounts = ref([]);

const getAllDiscount = async () => {
  try {
    discounts.value = [];
    const limit = 50;
    let page = 1;
    let hasMoreData = true;

    while (hasMoreData) {
      const response = await fetch(
        `http://localhost:3000/discounts?limit=${limit}&page=${page}`
      );

      if (!response.ok) throw new Error("Failed to fetch discounts");

      const discountData = await response.json();

      if (discountData.items.length === 0) {
        hasMoreData = false;
      } else {
        discounts.value.push(...discountData.items);
        page++;
      }
    }
  } catch (error) {
    console.error("Error fetching discounts:", error);
  }
};

onMounted(() => getAllDiscount());

const totalDiscounts = computed(() => discounts.value.length);

// Discount Details Modal
const selectedDiscount = ref(null);
const discountDetails = ref(false);

const openDiscountDetails = (discount) => {
  selectedDiscount.value = discount;
  discountDetails.value = true;
};

const closeModal = () => {
  discountDetails.value = false;
};

const addDiscountHandler = async (discount) => {
  const formatDiscount = {
    ...discount,
    percentage: discount.percentage ? Number(discount.percentage) : null,
  };

  try {
    const response = await fetch("http://localhost:3000/discounts", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(formatDiscount),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add discount: ${errorText}`);
    }
    getAllDiscount();
  } catch (err) {
    console.error("Error adding discount", err);
  }
};

const updateDiscountHandler = async (updateDiscount) => {
  try {
    const response = await fetch(
      `http://localhost:3000/discounts/${updateDiscount.discountId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateDiscount),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to edit discount: ${errorText}`);
    }
    getAllDiscount();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Update Failed",
      detail: error.message,
      life: 3000,
    });
  }
};

const deleteDiscountHandler = async (deleteDiscount) => {
  try {
    const response = await fetch(
      `http://localhost:3000/discounts/${deleteDiscount.discountId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("Failed to delete discount");
    discounts.value = discounts.value.filter(
      (c) => c.discountId !== deleteDiscount.discountId
    );
    getAllDiscount();
  } catch (error) {
    console.error("Error deleting discount", error);
  }
};

//Checks Severity of Status
const getStatusSeverity = (status) => {
  return status === "active" ? "success" : "danger";
};

const addOns = ref([
  {
    id: 1,
    name: "Chairs",
    price: "PHP 200.00",
    quantity: 10,
    status: "Active",
    created: "2024-03-01",
  },
]);

const first = ref(0);
const rows = ref(5);

const paginatedDiscount = computed(() => {
  return discounts.value.slice(first.value, first.value + rows.value);
});

const onPageChangePro = (event) => {
  first.value = event.first;
  rows.value = event.rows;
};

// ADD ONS
const bookingAddOns = ref([]);
const getAllBookingAddOns = async () => {
  bookingAddOns.value = [];
  const limit = 50;
  let page = 1;
  let hasMoreData = true;

  while (hasMoreData) {
    const response = await fetch(
      `http://localhost:3000/bookingaddon?limit=${limit}&page=${page}`
    );

    if (!response.ok) throw new Error("Failed to fetch bookings");
    const addOnData = await response.json();

    if (addOnData.items.length === 0) {
      hasMoreData = false;
    } else {
      bookingAddOns.value.push(...addOnData.items);
      page++;
    }
  }
};

onMounted(() => getAllBookingAddOns());

// onMounted(async () => {
//   const limit = 50;
//   let page = 1;
//   let hasMoreData = true;

//   while (hasMoreData) {
//     const bResponse = await fetch(
//       `http://localhost:3000/bookings?limit=${limit}&page=${page}`
//     );
//     if (!bResponse.ok) throw new Error("Failed to fetch bookings");
//     const bookingData = await bResponse.json();

//     if (bookingData.items.length === 0) {
//       hasMoreData = false;
//     } else {
//       bookings.value.push(...bookingData.items);
//       page++;
//     }
//   }
// });

// CATALOG
const catalogs = ref([]);
const getAllCatalog = async () => {
  catalogs.value = [];
  const limit = 50;
  let page = 1;
  let hasMoreData = true;

  while (hasMoreData) {
    const response = await fetch(
      `http://localhost:3000/catalogaddon?limit=${limit}&page=${page}`
    );

    if (!response.ok) throw new Error("Failed to fetch bookings");
    const catalogData = await response.json();

    if (catalogData.items.length === 0) {
      hasMoreData = false;
    } else {
      catalogs.value.push(...catalogData.items);
      page++;
    }
  }
};

onMounted(() => getAllCatalog());

const totalCatalog = computed(() => catalogs.value.length);

const addCatalogHandler = async (catalogAddOn) => {
  const formatCatalogAddOn = {
    ...catalogAddOn,
    price: catalogAddOn.price ? Number(catalogAddOn.price) : null,
  };
  console.log("Sending to backend:", formatCatalogAddOn);
  try {
    const response = await fetch("http://localhost:3000/catalogaddon", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(formatCatalogAddOn),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from API:", errorText);
      throw new Error(`Failed to add catalog add-on: ${errorText}`);
    }
    await getAllCatalog();
  } catch (err) {
    console.error("Error adding catalog add-on", err);
  }
};

const updateCatalogHandler = async (updateCatalog) => {
  try {
    const response = await fetch(
      `http://localhost:3000/catalogaddon/${updateCatalog.catalogAddOnId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateCatalog),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update catalog add-on: ${errorText}`);
    }
    getAllCatalog();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Update Failed",
      detail: error.message,
      life: 3000,
    });
  }
};

const deleteCatalogHandler = async (deleteCatalog) => {
  try {
    const response = await fetch(
      `http://localhost:3000/catalogaddon/${deleteCatalog.catalogAddOnId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("Failed to delete catalog add-on");
    catalogs.value = catalogs.value.filter(
      (c) => c.catalogAddOnId !== deleteCatalog.catalogAddOnId
    );
    getAllCatalog();
  } catch (error) {
    console.error("Error deleting catalog add-on", error);
  }
};

const firstCat = ref(0);
const rowsCat = ref(5);

const paginatedCatalogs = computed(() => {
  return catalogs.value.slice(firstCat.value, firstCat.value + rowsCat.value);
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

const closeCatalogModal = () => {
  catalogDetails.value = false;
};

//Fix Date Format
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

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
            <Tab value="1">ADD ONS</Tab>
            <Tab value="2">CATALOG</Tab>
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
                      <th>ADD ONS NAME</th>
                      <th>PRICE</th>
                      <th>QUANTITY</th>
                      <th>STATUS</th>
                      <th>CREATED</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="paRow"
                      v-for="bookingAddOn in bookingAddOns"
                      :key="bookingAddOn.id"
                    >
                      <td>{{ bookingAddOn.bookingAddOnId }}</td>
                      <td>{{ bookingAddOn.bookingId }}</td>
                      <td>{{ bookingAddOn.catalogAddOnId }}</td>
                      <td>{{ bookingAddOn.price }}</td>
                      <td>{{ bookingAddOn.createdAt }}</td>
                      <td><T3ButtonAddOns /></td>
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
            <TabPanel value="2">
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
                      <td>{{ catalog.price }}</td>
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
                        <T3ButtonAddOns
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
            <button
              class="closeDetails mt-5 w-[100%]"
              @click="closeCatalogModal"
            >
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
