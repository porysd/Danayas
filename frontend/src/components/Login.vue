<script setup>
import { ref, defineEmits } from "vue";
import { useRouter } from "vue-router";
import SignUp from "./SignUp.vue";
import ProgressSpinner from "primevue/progressspinner";
import { useAuthStore } from "../stores/authStore";
import Button from "primevue/button";
import InputText from "primevue/inputtext";

const authStore = useAuthStore();
const router = useRouter();
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const loading = ref(false);
const showModal = ref(false);
const loginStatus = ref(null);

const emit = defineEmits(["login-success"]);

const showLogInModal = ref(false);

const openLogInModal = () => {
  showLogInModal.value = true;
};

const closeModal = () => {
  showLogInModal.value = false;
};

const login = async () => {
  errorMessage.value = "";
  if (!email.value || !password.value) {
    errorMessage.value = "Please enter both username and password.";
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
    if (response.ok) {
      const { accessToken, refreshToken, user } = data;

      authStore.setUser(user);
      console.log("User data:", authStore.user);
      authStore.setAccessToken(accessToken);
      authStore.setRefreshToken(refreshToken);

      loginStatus.value = "success";
      setTimeout(() => {
        showModal.value = false;
        showLogInModal.value = false;
        emit("login-success");
        router.replace("/home");
      }, 1500);
    } else {
      loginStatus.value = "error";
      errorMessage.value = data.message || "Invalid credentials.";
      setTimeout(() => {
        showModal.value = false;
        loading.value = false;
      }, 1500);
    }
  } catch (err) {
    console.error("Error", err);
    errorMessage.value = "Something went wrong. Try again later.";
    showModal.value = false;
    loading.value = false;
  }

  showLogInModal.value = false;
};
</script>
<template>
  <button class="login-btn" @click="openLogInModal">Login</button>

  <div v-if="showLogInModal" class="modal">
    <div
      class="loginBox bg-white/30 backdrop-blur-md shadow-2xl rounded-2xl flex flex-col items-center gap-6 w-full max-w-md"
    >
      <i
        class="pi pi-times"
        @click="closeModal"
        style="
          color: green;
          align-self: flex-end;
          font-size: 1.3rem;
          cursor: pointer;
          margin-right: 15px;
          margin-top: 10px;
          margin-bottom: 10px;
          margin-left: 20rem;
          font-weight: bold;
        "
      ></i>
      <div class="loginCred">
        <h1
          class="Login text-center mb-4 mt-1 text-4xl font-bold text-gray-800"
          style="letter-spacing: 5px"
        >
          LOGIN
        </h1>
        <h6 class="text-gray-600 text-sm mb-4">
          Welcome back! Please login to your account.
        </h6>
      </div>
      <form @submit.prevent="login" class="w-[85%]">
        <div class="loginCred flex flex-col gap-2 w-full">
          <label for="username" class="text-sm text-gray-600 font-bold"
            >Email:</label
          >
          <InputText
            v-model="email"
            type="text"
            id="username"
            name="username"
            placeholder="Email"
            required
          />
        </div>
        <div class="loginCred flex flex-col gap-2 w-full mt-2" id="password">
          <label for="password" class="text-sm text-gray-600 font-bold"
            >Password:</label
          >
          <InputText
            v-model="password"
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            required
          />
        </div>

        <div class="forgot-password">
          <a href="#">Forgot Password?</a>
        </div>

        <div class="modal-actions">
          <Button class="submitBtn" type="submit" value="Login">Login</Button>
        </div>

        <hr class="hr-text" data-content="OR" />
      </form>
      <div class="signup-wrapper" v-if="showLogInModal">
        <SignUp />
      </div>
    </div>
  </div>

  <div
    v-if="showModal"
    class="loadModal fixed top-0 left-0 w-full h-full bg-opacity-50 flex justify-center items-center"
  >
    <div
      class="bg-white p-6 rounded-lg text-center w-80 h-80 justify-center flex flex-col m-auto"
    >
      <ProgressSpinner v-if="loading" style="width: 80px; height: 80px" />
      <i
        v-else-if="loginStatus === 'success'"
        class="pi pi-check-circle text-green-600"
        style="font-size: 4rem"
      ></i>
      <i
        v-else-if="loginStatus === 'error'"
        class="pi pi-times-circle text-red-600"
        style="font-size: 4rem"
      ></i>
      <p
        v-if="loginStatus === 'success'"
        class="text-green-600 font-bold text-xl"
      >
        Login Successful! Welcome to Danayas Resorts Events Venue
      </p>
      <p v-if="loginStatus === 'error'" class="text-red-600 font-bold text-xl">
        Invalid Credentials
      </p>
    </div>
  </div>
</template>

<style scoped>
.forgot-password {
  margin-left: 1rem;
  font-size: 0.875rem;
  color: #333;
  margin-top: 10px;
}
.forgot-password a {
  text-decoration: none;
  color: green;
}
.forgot-password a:hover {
  text-decoration: underline;
}
.signup-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.hr-text {
  line-height: 1rem;
  position: relative;
  outline: 0;
  border: 0;
  font-weight: bolder;
  font-size: 1.3rem;
  margin-top: 20px;
  margin-bottom: 5px;
  color: rgb(2, 2, 2);
  text-align: center;
  height: 1.5em;
}

.hr-text::before {
  content: "";
  position: absolute;
  background: #000000;
  left: 0;
  font-weight: bolder;
  top: 50%;
  width: 100%;
  height: 1px;
}

.hr-text::after {
  content: attr(data-content);
  position: relative;
  display: inline-block;
  color: rgb(0, 0, 0);
  padding: 0 0.5em;
  line-height: 1.5em;
  background-color: #eef9eb;
}

.Login {
  text-shadow: 0px 1px, 1px 0px, 1px 1px;
}
.login-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
.login-btn:hover {
  color: rgb(42, 228, 38);
  transition: all 0.3s ease-in-out;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(193, 175, 175, 0.5);
  width: 100vw;
  height: 100vh;
  display: flex !important;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  visibility: visible !important;
}

.loginBox {
  background-color: #eef9eb;
  padding: 10px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

label {
  display: block;
  text-align: left;
}

.modal-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 25px;
  margin-bottom: 5px;
  margin-left: 10px;
  margin-right: 10px;
}

.submitBtn {
  width: 250px;
  padding: 8px 15px;

  color: white;
  border: none;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
}

.loadModal {
  z-index: 999;
}
</style>
