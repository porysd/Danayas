<script setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Card from "primevue/card";
import Button from "primevue/button";
import Stepper from "primevue/stepper";
import StepList from "primevue/steplist";
import StepPanels from "primevue/steppanels";
import StepItem from "primevue/stepitem";
import Step from "primevue/step";
import StepPanel from "primevue/steppanel";
import { ref, onMounted, computed } from "vue";

const searchQuery = ref("");
const customers = ref([]);

// Fetch customer data from API on component mount
onMounted(async () => {
  try {
    const limit = 50;
    const page = 1;
    const response = await fetch(
      `http://localhost:3000/users?limit=${limit}&page=${page}`
    );
    if (!response.ok) throw new Error("Failed to fetch users");

    const data = await response.json();
    customers.value = data.items; // Adjust based on the actual response structure
  } catch (error) {
    console.error("Error fetching users:", error);
  }
});

// Computed property for filtered customers based on search query
const filteredCustomers = computed(() => {
  const filter = searchQuery.value.toUpperCase();
  return customers.value.filter((customer) =>
    customer.name.toUpperCase().includes(filter)
  );
});
</script>

<template>
  <div>
    <h2>My Customers</h2>

    <!-- Search input -->
    <input
      type="text"
      v-model="searchQuery"
      @input="filterTable"
      placeholder="Search for names.."
      title="Type in a name"
    />

    <!-- Customers Table -->
    <table id="myTable">
      <thead>
        <tr class="header">
          <th style="width: 60%">Name</th>
          <th style="width: 40%">Country</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(customer, index) in filteredCustomers" :key="index">
          <td>{{ customer.firstName }} {{ customer.lastName }}</td>
          <td>{{ customer.country }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

#myInput {
  background-image: url("/css/searchicon.png");
  background-position: 10px 10px;
  background-repeat: no-repeat;
  width: 100%;
  font-size: 16px;
  padding: 12px 20px 12px 40px;
  border: 1px solid #ddd;
  margin-bottom: 12px;
}

#myTable {
  border-collapse: collapse;
  width: 100%;
  border: 1px solid #ddd;
  font-size: 18px;
}

#myTable th,
#myTable td {
  text-align: left;
  padding: 12px;
}

#myTable tr {
  border-bottom: 1px solid #ddd;
}

#myTable tr.header,
#myTable tr:hover {
  background-color: #f1f1f1;
}
</style>
