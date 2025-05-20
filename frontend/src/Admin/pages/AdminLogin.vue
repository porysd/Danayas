<script setup>
import { ref } from "vue";
import { useAuthStore } from "../../stores/authStore.js";
import { useRouter } from "vue-router";
import ProgressSpinner from "primevue/progressspinner";
import InputText from "primevue/inputtext";
import Button from "primevue/button";

const authStore = useAuthStore();

const router = useRouter();
const email = ref("");
const password = ref("");
const loading = ref(false);
const showModal = ref(false);
const loginStatus = ref(null);
const errorMessage = ref("");

const login = async () => {
  errorMessage.value = "";
  if (!email.value || !password.value) {
    errorMessage.value = "Please enter both email and password.";
    return;
  }

  showModal.value = true;
  loading.value = true;
  loginStatus.value = null;

  try {
    const response = await fetch(`http://localhost:3000/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });
    const data = await response.json();
    console.log("Login response data:", data);
    if (response.ok) {
      const { accessToken, refreshToken, user } = data;
      // TODO: add roles
      authStore.setUser(user);
      console.log("User data:", authStore.user);
      authStore.setAccessToken(accessToken);
      authStore.setRefreshToken(refreshToken);

      loginStatus.value = "success";
      setTimeout(() => {
        showModal.value = false;
        router.replace("/admin/admin-dashboard");
      }, 1500);
    } else {
      loginStatus.value = "error";
      errorMessage.value = data.message || "Invalid credentials.";
      setTimeout(() => {
        showModal.value = false;
      }, 1500);
    }
  } catch (error) {
    console.error("Login failed:", error);
    loginStatus.value = "error";
    errorMessage.value = "An error occurred. Please try again later.";
    showModal.value = false;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="loginContainer flex items-center justify-center min-h-screen bg-gradient-to-br from-green-200 to-green-500"
  >
    <div
      class="loginBox bg-white/30 backdrop-blur-md shadow-2xl rounded-2xl p-10 flex flex-col items-center gap-6 w-full max-w-md"
    >
      <h1 class="text-4xl font-extrabold text-gray-800">Employee Login</h1>
      <p class="text-gray-600 text-sm mb-4">
        Welcome back! Please enter your details.
      </p>

      <div class="flex flex-col gap-2 w-full">
        <label for="email" class="text-sm text-gray-700">Email </label>
        <InputText id="email" v-model="email" class="p-3 rounded-lg" />
      </div>

      <div class="flex flex-col gap-2 w-full">
        <label for="password" class="text-sm text-gray-700">Password</label>
        <InputText
          id="password"
          type="password"
          v-model="password"
          class="p-3 rounded-lg"
        />
      </div>

      <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>

      <Button
        label="Sign In"
        icon="pi pi-sign-in"
        class="w-full mt-4 p-3 text-white bg-green-700 hover:bg-green-800 rounded-lg transition-all"
        @click="login"
        :disabled="loading"
      />

      <p class="text-xs text-gray-500 mt-4">© 2025 Danayas Resorts</p>
    </div>
  </div>
  <div
    v-if="showModal"
    class="fixed inset-0 bg-black/50 flex items-center justify-center"
  >
    <div
      class="bg-white p-8 rounded-2xl flex flex-col items-center gap-4 shadow-lg w-80"
    >
      <ProgressSpinner v-if="loading" style="width: 50px; height: 50px" />
      <template v-else>
        <i
          v-if="loginStatus === 'success'"
          class="pi pi-check-circle text-green-500 text-5xl"
        ></i>
        <i
          v-else-if="loginStatus === 'error'"
          class="pi pi-times-circle text-red-500 text-5xl"
        ></i>
        <p
          v-if="loginStatus === 'success'"
          class="text-green-600 font-semibold"
        >
          Login Successful!
        </p>
        <p v-if="loginStatus === 'error'" class="text-red-600 font-semibold">
          Login Failed!
        </p>
      </template>
    </div>
  </div>

  <router-view />
</template>

<style scoped>
.loginContainer {
  background: #eef9eb;
}

.loginBox {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

input {
  border: 1px solid #d1d5db;
  border-radius: 10px;
}

button {
  transition: all 0.3s ease;
}

button:hover {
  background-color: #065f46;
}

label {
  font-weight: 600;
}

.modal {
  backdrop-filter: blur(4px);
}

.error {
  color: red;
  margin-bottom: 10px;
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
