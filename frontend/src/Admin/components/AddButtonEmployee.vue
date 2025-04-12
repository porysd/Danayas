<script setup>
import { ref, defineProps, defineEmits } from "vue";
import ToggleSwitch from "primevue/toggleswitch";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const showAddEmployeeModal = ref(false);
const newEmployee = ref({
  firstName: "",
  lastName: "",
  email: "",
  contactNo: "",
  address: "",
  password: "",
  role: "staff",
});

defineProps(["data"]);
const emit = defineEmits(["addEmployee"]);

const openAddEmployeeModal = () => {
  showAddEmployeeModal.value = true;
};

const closeAddEmployeeModal = () => {
  showAddEmployeeModal.value = false;
};

const addEmployee = () => {
  if (
    !newEmployee.value.firstName ||
    !newEmployee.value.lastName ||
    !newEmployee.value.email ||
    !newEmployee.value.password
  ) {
    alert("Please fill in all required fields.");
    return;
  }
  console.log("Sending Employee Data:", newEmployee.value);
  emit("addEmployee", {
    firstName: newEmployee.value.firstName,
    lastName: newEmployee.value.lastName,
    email: newEmployee.value.email,
    contactNo: newEmployee.value.contactNo,
    address: newEmployee.value.address,
    password: newEmployee.value.password,
    role: newEmployee.value.role || "staff",
  });

  toast.add({
    severity: "success",
    summary: "Success",
    detail: "Successfully Addedd Employee",
    life: 3000,
  });

  closeAddEmployeeModal();
};
</script>

<template>
  <div>
    <button
      class="adminButton text-white font-bold bg-[#194D1D] dark:bg-[#18181b] hover:bg-[#2B6D30]"
      @click="openAddEmployeeModal"
    >
      <i class="aIcon pi pi-plus"></i> Add {{ data }}
    </button>

    <Dialog
      v-model:visible="showAddEmployeeModal"
      modal
      :style="{ width: '60rem', minHeight: '33rem' }"
    >
      <template #header>
        <div class="flex flex-col items-center justify-center w-full">
          <h2 class="text-2xl font-bold font-[Poppins]">ADD EMPLOYEE:</h2>
        </div>
      </template>

      <div class="addEmp">
        <div class="addEmpInput">
          <label>Username:</label>
          <input v-model="newEmployee.username" placeholder="Username" />
        </div>
        <div class="addEmpInput">
          <label>Email Address:</label>
          <input
            v-model="newEmployee.email"
            id="newemailAddess"
            placeholder="Email Address"
          />
        </div>
      </div>

      <div class="addEmp">
        <div class="addEmpInput">
          <label>First Name:</label>
          <input
            v-model="newEmployee.firstName"
            id="firstName"
            placeholder="First Name"
          />
        </div>
        <div class="addEmpInput">
          <label>Last Name:</label>
          <input
            v-model="newEmployee.lastName"
            id="lastName"
            placeholder="Last Name"
          />
        </div>
      </div>

      <div class="addEmp">
        <div class="addEmpInput">
          <label>Contact No:</label>
          <input
            v-model="newEmployee.contactNo"
            id="contactNo"
            placeholder="Contact Number"
          />
        </div>
        <div class="addEmpInput">
          <label>Address:</label>
          <input
            v-model="newEmployee.address"
            id="address"
            placeholder="Address"
          />
        </div>
      </div>

      <div class="addEmp">
        <div class="addEmpInput">
          <label>Password:</label>
          <input
            v-model="newEmployee.password"
            id="password"
            type="password"
            placeholder="Password"
          />
        </div>
        <div class="addEmpInput">
          <label>Confirm Password:</label>
          <input
            v-model="newEmployee.password"
            id="confirmPassword"
            type="password"
            placeholder="Confirm Password"
          />
        </div>
      </div>

      <h2 class="font-black text-xl mb-5 w-[80%] text-left m-auto mt-5">
        Permissions:
      </h2>

      <div class="role-container">
        <div class="role1">
          <label class="switch">
            Admin
            <ToggleSwitch v-model="checked" />
          </label>

          <!--<label class="switch">
            Employee Management
            <ToggleSwitch v-model="checked" />
          </label>

          <label class="switch">
            Packages and Promos
            <ToggleSwitch v-model="checked" />
          </label>

          <label class="switch">
            Discount and Add Ons
            <ToggleSwitch v-model="checked" />
          </label>-->
        </div>

        <div class="role2">
          <label class="switch">
            Staff
            <ToggleSwitch v-model="checked" />
          </label>

          <!--<label class="switch">
          Booking Management
          <ToggleSwitch v-model="checked" />
        </label>

        <label class="switch">
          Transaction
          <ToggleSwitch v-model="checked" />
        </label>-->
        </div>
      </div>

      <div class="flex justify-center gap-2 mt-6">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="closeAddEmployeeModal"
          class="font-bold w-full"
        />
        <Button
          type="button"
          label="Save"
          severity="primary"
          @click="addEmployee"
          class="font-bold w-full"
        />
      </div>
    </Dialog>
  </div>
  <Toast />
</template>

<style scoped>
.adminButton {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.addEmployeeDialog::-webkit-scrollbar {
  display: none;
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

.role-container {
  display: flex;
  justify-content: space-between;
  margin: auto;
  gap: 70px;
  width: 80%;
  margin-bottom: 20px;
}

.role1,
.role2 {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.switch input {
  margin-left: auto;
}
</style>
