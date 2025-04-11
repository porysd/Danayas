<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import SignUp from "./SignUp.vue";

const router = useRouter();
const username = ref("");
const password = ref("");

const adUser = "admin";
const adPass = "admin123";

const showLogInModal = ref(false);

const openLogInModal = () => {
  showLogInModal.value = true;
};

const closeModal = () => {
  showLogInModal.value = false;
};
const login = (e) => {
  // e.preventDefault();

  // fetch =
  //   ("http://localhost:3000/auth/login",
  //   {
  //     method: "POST",
  //     body: JSON.stringify({
  //       email: this.state.email,
  //       password: this.state.password,
  //     }),
  //   });

  if (username.value === adUser || password.value === adPass) {
    alert("Login Successful!");
    router.replace("/");
  } else if (!username.value || !password.value) {
    alert("Please enter both username and password.");
    return;
  } else {
    alert("Invalid username or password. Please try again.");
  }

  showLogInModal.value = false;
};

// Modal for login
</script>
<template>
  <button class="login-btn" @click="openLogInModal">Login</button>

  <div v-if="showLogInModal" class="modal">
    <div class="loginBox">
      <i
        class="pi pi-times"
        @click="closeModal"
        style="
          color: green;
          align-self: flex-end;
          font-size: 1.5rem;
          cursor: pointer;
          margin-right: 10px;
          margin-bottom: 10px;
          margin-top: -10px;
          margin-left: 20rem;
          font-weight: bold;
        "
      ></i>
      <div class="loginCred">
        <h1
          class="Login text-center text-3xl font-black font-[Poppins] mb-4 mt-1 text-[#194D1D]"
        >
          Login
        </h1>
        <h6 style="color: green">
          Welcome back! Please login to your account.
        </h6>
      </div>
      <form @submit.prevent="login">
        <div class="loginCred">
          <label for="username" style="color: green">Username:</label>
          <input
            v-model="username"
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            required
          />
        </div>
        <div class="loginCred" id="password">
          <label for="password" style="color: green">Password:</label>
          <input
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
          <button class="submitBtn" type="submit" value="Login">Login</button>
        </div>

        <hr class="hr-text" data-content="OR" />
      </form>
      <div class="signup-wrapper" v-if="showLogInModal">
        <SignUp />
      </div>
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
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(28, 216, 34, 0.5);
  border: 1px solid #38dc87;
}

.loginCred {
  padding: 8px;
  width: 100%;
  justify-content: center;
  border-radius: 10px;
  filter: drop-shadow(0px 4px 4px rgba(97, 95, 95, 0.5));
}
label {
  display: block;
  text-align: left;
}

input {
  width: 100%;
  padding: 8px;
  background-color: #f0f0f0;
  border: 1px solid #38dc87;
  border-radius: 5px;
  margin-top: 5px;
  border-radius: 5px;
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
  background: #194d1d;
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
}
</style>
