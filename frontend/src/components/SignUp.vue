<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import ProgressSpinner from "primevue/progressspinner";
import { useAuthStore } from "../stores/authStore";
import InputText from "primevue/inputtext";
import Button from "primevue/button";

const authStore = useAuthStore();
const router = useRouter();
const emit = defineEmits(["sign-up-success", "showLogin"]);

const newUser = ref({
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  contactNo: "",
  address: "",
  password: "",
  confirmPass: "",
  role: "customer",
});

const errorMessage = ref("");
const loading = ref(false);
const showModal = ref(false);
const signUpStatus = ref(null);
const showSignUpModal = ref(false);
const termsAccepted = ref(false);

const SignUp = async () => {
  errorMessage.value = "";

  const contactRegex =
    /^(?:\+63\d{10}|\+63 \d{3} \d{3} \d{4}|09\d{9}|09\d{2} \d{3} \d{4})$/;

  if (
    !newUser.value.username ||
    !newUser.value.firstName ||
    !newUser.value.lastName ||
    !newUser.value.contactNo ||
    !newUser.value.email ||
    !newUser.value.address ||
    !newUser.value.password
  ) {
    alert("Please fill up all fields.");
    return;
  }

  if (!contactRegex.test(newUser.value.contactNo)) {
    alert(
      "Invalid contact number format. Use +639171234567, +63 917 123 4567, 09171234567, or 0917 123 4567."
    );
    return;
  }

  if (newUser.value.password !== newUser.value.confirmPass) {
    alert("Passwords do not match.");
    return;
  }

  if (!termsAccepted.value) {
    alert("Please accept the terms and conditions.");
    return;
  }

  await addNewUser({ ...newUser.value });
};

const addNewUser = async (userData) => {
  const { confirmPass, ...data } = userData;

  console.log("Sign up payload:", data);

  showModal.value = true;
  loading.value = true;
  signUpStatus.value = null;

  try {
    const response = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "Failed to sign up");
    }

    signUpStatus.value = "success";

    emit("sign-up-success");

    setTimeout(() => {
      showModal.value = false;
      showSignUpModal.value = false;
      emit("showLogin");
    }, 1500);
  } catch (err) {
    console.error("Sign-up error:", err);
    signUpStatus.value = "error";
    errorMessage.value =
      err.message || "Something went wrong. Try again later.";
    setTimeout(() => {
      showModal.value = false;
    }, 1500);
  } finally {
    loading.value = false;
  }
};

const OpenSignUpModal = () => {
  showSignUpModal.value = true;
};

const CloseSignUpModal = () => {
  showSignUpModal.value = false;
};
</script>

<template>
  <button class="SignUp-btn" @click="OpenSignUpModal">Sign Up</button>

  <div v-if="showSignUpModal" class="modal">
    <div class="SignUpBox bg-white/30 backdrop-blur-md shadow-2xl">
      <div class="signup">
        <i
          class="pi pi-times"
          @click="CloseSignUpModal"
          style="
            color: green;
            align-self: flex-end;
            font-size: 1.3rem;
            cursor: pointer;
            margin-right: 20px;
            margin-top: 20px;
            margin-bottom: 10px;
            margin-left: 50rem;
            font-weight: bold;
          "
        ></i>

        <div class="SignCred">
          <h1
            class="Login text-center mb-4 mt-1 text-4xl font-bold text-gray-800"
            style="letter-spacing: 5px"
          >
            SIGN UP
          </h1>
          <h6 class="text-gray-600 font-bold text-sm mb-4 text-center">
            Create an account to enjoy all the features of our website.
          </h6>
        </div>

        <form @submit.prevent="SignUp">
          <div class="SignCred">
            <div class="bookAddress">
              <div>
                <label for="usename" class="text-sm text-gray-600 font-bold"
                  >Username:</label
                >
                <InputText
                  type="text"
                  class="packEvents"
                  v-model="newUser.username"
                />
              </div>
            </div>

            <div class="packEvent">
              <div>
                <label for="firstname" class="text-sm text-gray-600 font-bold"
                  >Firstname:</label
                >
                <InputText
                  type="text"
                  class="packEvents"
                  v-model="newUser.firstName"
                />
              </div>
              <div>
                <label for="lastname" class="text-sm text-gray-600 font-bold"
                  >Lastname:</label
                >
                <InputText
                  type="text"
                  class="packEvents"
                  v-model="newUser.lastName"
                />
              </div>
              <div>
                <label for="contactNo" class="text-sm text-gray-600 font-bold"
                  >Contact No:</label
                >
                <InputText
                  type="tel"
                  class="packEvents"
                  v-model="newUser.contactNo"
                />
              </div>

              <div>
                <label for="email" class="text-sm text-gray-600 font-bold"
                  >Email:</label
                >
                <InputText
                  type="text"
                  class="packEvents"
                  v-model="newUser.email"
                />
              </div>
            </div>

            <div class="bookAddress">
              <div>
                <label for="address" class="text-sm text-gray-600 font-bold"
                  >Address:</label
                >
                <InputText
                  type="text"
                  class="packEvents"
                  v-model="newUser.address"
                />
              </div>
            </div>

            <div class="packEvent">
              <div>
                <label for="password" class="text-sm text-gray-600 font-bold"
                  >Password:</label
                >
                <InputText
                  type="password"
                  class="packEvents"
                  v-model="newUser.password"
                  placeholder="Password"
                />
              </div>
              <div>
                <label for="password" class="text-sm text-gray-600 font-bold"
                  >Confirm password:</label
                >
                <InputText
                  type="password"
                  class="packEvents"
                  v-model="newUser.confirmPass"
                  placeholder="Password"
                />
              </div>
            </div>

            <div class="checkbox">
              <input type="checkbox" id="signupCheck" v-model="termsAccepted" />
              <label for="signupCheck">I accept all terms & conditions</label>
            </div>

            <div class="modal-actions">
              <Button class="submitBtn" type="submit" value="Login"
                >Sign Up</Button
              >
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div
    v-if="showModal"
    class="loadModal fixed top-0 left-0 w-full h-full bg-opacity-50 flex justify-center items-center"
  >
    <div
      class="bg-white p-6 rounded-lg text-center w-80 h-80 flex flex-col justify-center items-center m-auto"
    >
      <ProgressSpinner v-if="loading" style="width: 80px; height: 80px" />
      <i
        v-else-if="signUpStatus === 'success'"
        class="pi pi-check-circle text-green-600"
        style="font-size: 4rem"
      ></i>
      <i
        v-else-if="signUpStatus === 'error'"
        class="pi pi-times-circle text-red-600"
        style="font-size: 4rem"
      ></i>

      <p
        v-if="signUpStatus === 'success'"
        class="text-green-600 font-bold text-xl"
      >
        Sign Up Successful! Welcome to Danayas Resorts Events Venue
      </p>
      <p v-if="signUpStatus === 'error'" class="text-red-600 font-bold text-xl">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Your full CSS from the original remains here */
.checkbox input[type="checkbox"] {
  height: 16px;
  width: 16px;
  accent-color: #fff;
  cursor: pointer;
}
.checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  margin-left: 32rem;
}
.signUp {
  font-weight: bold;
  color: #194d1d;
  text-align: center;
  margin-bottom: 3rem;
  text-shadow: 0px 1px, 1px 0px, 1px 1px;
}
.SignUp-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  background-color: #41ab5d;
  color: white;
}
.SignUp-btn:hover {
  background-color: #194d1d;
  color: white;
  transition: all 0.3s ease-in-out;
}
.modal {
  z-index: 9999;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  background: rgba(193, 175, 175, 0.5);
  align-items: center;
  justify-content: center;
}
.SignUpBox {
  background: #eef9eb;
  border-radius: 10px;
}
input {
  width: 100%;
  padding: 8px;
  background-color: #f0f0f0;
  border-radius: 5px;
  margin-top: 5px;
}
.modal-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 30px;
  margin-bottom: 20px;
}
.submitBtn {
  width: 15rem;
  height: auto;
  font-size: 1.2rem;
  font-family: "Poppins";
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
}
.packEvent,
.bookAddress {
  margin-top: 7px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
.packEvent div {
  display: flex;
  flex-direction: column;
  width: 40%;
}
.bookAddress div {
  display: flex;
  flex-direction: column;
  width: 81%;
}
.loadModal {
  z-index: 999;
}
</style>
