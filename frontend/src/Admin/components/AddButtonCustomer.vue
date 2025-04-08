<script setup>
import { ref, defineProps, defineEmits } from "vue";

import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const showAddCustomerModal = ref(false);
const newCustomer = ref({
  firstName: "",
  lastName: "",
  email: "",
  contactNo: "",
  address: "",
  password: "",
  role: "customer",
});

defineProps(["data"]);
const emit = defineEmits(["addCustomer"]);

const openAddCustomerModal = () => {
  showAddCustomerModal.value = true;
};

const closeAddCustomerModal = () => {
  showAddCustomerModal.value = false;
};

const addCustomer = () => {
  if (
    !newCustomer.value.firstName ||
    !newCustomer.value.lastName ||
    !newCustomer.value.email ||
    !newCustomer.value.password
  ) {
    alert("Please fill in all required fields.");
    return;
  }
  console.log("Sending Customer Data:", newCustomer.value);
  emit("addCustomer", {
    ...newCustomer.value,
  });

  closeAddCustomerModal();
};
</script>

<template>
  <div>
    <button
      class="adminButton text-white font-bold bg-[#194D1D] hover:bg-[#2B6D30]"
      @click="openAddCustomerModal"
    >
      <i class="aIcon pi pi-plus"></i> Add {{ data }}
    </button>

    <Dialog
      v-model:visible="showAddCustomerModal"
      modal
      :style="{ width: '55rem', minHeight: '30rem' }"
    >
      <template #header>
        <div class="flex flex-col items-center justify-center w-full">
          <h2 class="text-2xl font-bold font-[Poppins]">ADD CUSTOMER:</h2>
        </div>
      </template>
      <div class="addEmp">
        <div class="addEmpInput">
          <label>Username:</label>
          <input v-model="newCustomer.username" placeholder="Username" />
        </div>
        <div class="addEmpInput">
          <label>Email Address:</label>
          <input
            v-model="newCustomer.email"
            id="newemailAddess"
            placeholder="Email Address"
          />
        </div>
      </div>

      <div class="addEmp">
        <div class="addEmpInput">
          <label>First Name:</label>
          <input
            v-model="newCustomer.firstName"
            id="firstName"
            placeholder="First Name"
          />
        </div>
        <div class="addEmpInput">
          <label>Last Name:</label>
          <input
            v-model="newCustomer.lastName"
            id="lastName"
            placeholder="Last Name"
          />
        </div>
      </div>

      <div class="addEmp">
        <div class="addEmpInput">
          <label>Contact No:</label>
          <input
            v-model="newCustomer.contactNo"
            id="contactNo"
            placeholder="Contact Number"
          />
        </div>
        <div class="addEmpInput">
          <label>Address:</label>
          <input
            v-model="newCustomer.address"
            id="address"
            placeholder="Address"
          />
        </div>
      </div>

      <div class="addEmp">
        <div class="addEmpInput">
          <label>Password:</label>
          <input
            v-model="newCustomer.password"
            id="password"
            placeholder="Password"
          />
        </div>
        <div class="addEmpInput">
          <label>Confirm Password:</label>
          <input
            v-model="newCustomer.password"
            id="confirmPassword"
            placeholder="Confirm Password"
          />
        </div>
      </div>
      <div class="flex justify-center gap-2 mt-6">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="closeAddCustomerModal"
          class="font-bold w-[21rem]"
        />
        <Button
          type="button"
          label="Save"
          severity="primary"
          @click="addCustomer"
          class="font-bold w-[21rem]"
        />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.adminButton {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.aIcon {
  margin-right: 5px;
  font-size: 13px;
}

.addEmp {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.addEmp div {
  display: flex;
  flex-direction: column;
  width: 40%;
}

.addEmp label {
  display: block;
  text-align: left;
  font-size: 16px;
  font-weight: 400;
  margin-top: 2px;
}

.addEmp input {
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #fcfcfc;
  border-radius: 5px;
  height: 40px;
}

.addEmp div {
  display: flex;
  flex-direction: column;
  width: 40%;
}
</style>
