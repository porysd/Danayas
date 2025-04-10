<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const username = ref("");
const password = ref("");

const adUser = "admin";
const adPass = "admin123";

const login = () => {
  if (username.value === adUser || password.value === adPass) {
    alert("Login Successful!");
    router.replace("/");
  } else if (!username.value || !password.value) {
    alert("Please enter both username and password.");
    return;
  } else {
    alert("Invalid username or password. Please try again.");
  }
};

// Modal for Sign In

const showSignInModal = ref(false);

const openSignInModal = () => {
  showSignInModal.value = true;
};

const closeModal = () => {
  showSignInModal.value = false;
};
</script>

<template>
  <button class="login-btn" @click="openSignInModal">Sign In</button>

  <div v-if="showSignInModal" class="modal">
    <div class="loginBox">
      <h1
        class="signIn text-center text-5xl font-black font-[Poppins] mb-4 mt-10 text-[#194D1D]"
      >
        Login
      </h1>

      <form @submit.prevent="login">
        <div class="loginCred">
          <label for="username">Username:</label>
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
          <label for="password">Password:</label>
          <input
            v-model="password"
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            required
          />
        </div>
        <div style="margin-left: 8.5rem; display: flex">
          <h6>Forgot Password?</h6>
        </div>

        <div class="modal-actions">
          <button class="submitBtn" type="submit">Log in</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.signIn {
  text-shadow: 0px 1px, 1px 0px, 1px 1px;
}
.login-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(134, 125, 125, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.loginBox {
  padding: 40px;
  width: 350px;
  text-align: center;
  border-radius: 10px;
  background-color: white;
}

.loginCred {
  padding: 8px;
  width: 50vh;
  border-radius: 10px;
  margin-top: 10px;
  filter: drop-shadow(0px 0px 5px rgba(97, 95, 95, 0.5));
}
label {
  display: block;
  text-align: left;
}

input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  background-color: white;
  border-radius: 5px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  margin-top: 35px;
  margin-bottom: 15px;
}

.cancelBtn {
  width: 140px;
  padding: 8px 15px;
  background: #ccc;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.submitBtn {
  width: 140px;
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
