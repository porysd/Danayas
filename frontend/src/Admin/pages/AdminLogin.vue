<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import ProgressSpinner from "primevue/progressspinner";
import InputText from "primevue/inputtext";
import Button from "primevue/button";

const router = useRouter();
const username = ref("");
const password = ref("");
const loading = ref(false);
const showModal = ref(false);
const loginStatus = ref(null);
const errorMessage = ref("");

const adUser = "admin";
const adPass = "admin123";

const login = () => {
  errorMessage.value = "";
  if (!username.value || !password.value) {
    errorMessage.value = "Please enter both username and password.";
    return;
  }

  showModal.value = true;
  loading.value = true;
  loginStatus.value = null;

  setTimeout(() => {
    if (username.value === adUser && password.value === adPass) {
      loginStatus.value = "success";
      setTimeout(() => {
        showModal.value = false;
        router.replace("/AdminDashboard");
      }, 1500);
    } else {
      loginStatus.value = "error";
      setTimeout(() => {
        showModal.value = false;
      }, 1500);
    }
    loading.value = false;
  }, 2000);
};
</script>

<template>
  <div
    class="loginContainer flex flex-col md:flex-row items-center justify-center min-h-screen"
  >
    <div
      class="loginBox w-full md:w-5/12 flex flex-col items-center justify-center gap-3 py-5 rounded-xl shadow-lg"
    >
      <h1 class="text-3xl font-bold text-green-800 mb-5 mt-5">
        ADMINISTRATOR SIGN IN
      </h1>

      <div class="flex flex-col gap-2 w-full max-w-md">
        <label for="username">Username</label>
        <InputText id="username" type="text" v-model="username" />
      </div>

      <div class="flex flex-col gap-2 w-full max-w-md">
        <label for="password">Password</label>
        <InputText id="password" type="password" v-model="password" />
      </div>

      <p v-if="errorMessage" class="text-red-600">{{ errorMessage }}</p>

      <div class="flex w-full max-w-md mb-5 mt-5">
        <Button
          label="Login"
          icon="pi pi-user"
          class="w-full"
          @click="login"
          :disabled="loading"
        />
      </div>
    </div>
  </div>

  <div
    v-if="showModal"
    class="fixed top-0 left-0 w-full h-full bg-opacity-50 flex justify-center items-center"
  >
    <div class="bg-white p-6 rounded-lg text-center w-80">
      <ProgressSpinner v-if="loading" style="width: 50px; height: 50px" />
      <i
        v-else-if="loginStatus === 'success'"
        class="pi pi-check-circle text-green-600 text-4xl"
      ></i>
      <i
        v-else-if="loginStatus === 'error'"
        class="pi pi-times-circle text-red-600 text-4xl"
      ></i>
      <p v-if="loginStatus === 'success'" class="text-green-600 font-bold">
        Login Successful! Welcome {{ adUser }}
      </p>
      <p v-if="loginStatus === 'error'" class="text-red-600 font-bold">
        Invalid Credentials
      </p>
    </div>
  </div>

  <router-view></router-view>
</template>

<style scoped>
.loginContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.loginBox {
  padding: 20px;
  background: #fcfcfc;
}

.loginCred {
  margin-bottom: 15px;
}

label {
  display: block;
  text-align: left;
}

input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  background-color: white;
  border-radius: 5px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #194d1d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:disabled {
  background-color: gray;
  cursor: not-allowed;
}

button:hover {
  background-color: #333;
}

.error {
  color: red;
  margin-bottom: 10px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  width: 300px;
}

.success-icon {
  font-size: 50px;
  color: green;
}

.error-icon {
  font-size: 50px;
  color: red;
}

.text-success {
  color: green;
  font-weight: bold;
}

.text-error {
  color: red;
  font-weight: bold;
}
</style>
