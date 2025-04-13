<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import ProgressSpinner from "primevue/progressspinner";

const router = useRouter();

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

const SignUp = () => {
  errorMessage.value = "";

  const {
    username,
    firstName,
    lastName,
    contactNo,
    email,
    address,
    password,
    confirmPass,
  } = newUser.value;

  if (
    !firstName ||
    !lastName ||
    !contactNo ||
    !email ||
    !address ||
    !password
  ) {
    alert("Please fill up all fields.");
    return;
  }

  // if (password !== confirmPass) {
  //   alert("Passwords do not match.");
  //   return;
  // }

  addNewUser({ ...newUser.value });
};

const addNewUser = async (userData) => {
  const { confirmPass, ...signUpUser } = userData;

  showModal.value = true;
  loading.value = true;
  signUpStatus.value = null;

  try {
    const response = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signUpUser),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to sign up");
    }

    setTimeout(() => {
      if (response.ok) {
        signUpStatus.value = "success";
        setTimeout(() => {
          showModal.value = false;
          router.replace("/home");
        }, 1500);
      } else {
        signUpStatus.value = "error";
        errorMessage.value = "Invalid username or password.";
        setTimeout(() => {
          showModal.value = false;
        }, 1500);
      }
      loading.value = false;
    }, 2000);
  } catch (error) {
    console.error("Error", err);
    errorMessage.value = "Something went wrong. Try again later.";
    showModal.value = false;
    loading.value = false;
  }
  showSignUpModal.value = false;
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
    <div class="SignUpBox">
      <div class="signup">
        <i
          class="pi pi-times"
          @click="CloseSignUpModal"
          style="
            color: green;
            align-self: flex-end;
            margin-left: 49rem;
            font-size: 1.5rem;
            cursor: pointer;
            margin-right: 10px;
          "
        ></i>
        <div class="SignCred">
          <h1 class="signUp text-5xl" style="text-align: center">SIGN UP</h1>
          <p
            style="
              text-align: center;
              color: green;
              margin-top: -30px;
              margin-bottom: 10px;
            "
          >
            Create an account to enjoy all the features of our website.
            <br />
          </p>
        </div>

        <form @submit.prevent="SignUp">
          <div class="SignCred">
            <div class="bookAddress">
              <div>
                <label>Username:</label>
                <input
                  class="packEvents"
                  v-model="newUser.username"
                  placeholder="Username"
                />
              </div>
            </div>
            <div class="packEvent">
              <div>
                <label>First Name:</label>
                <input
                  class="packEvents"
                  v-model="newUser.firstName"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label>Last Name:</label>
                <input
                  class="packEvents"
                  v-model="newUser.lastName"
                  placeholder="Last Name"
                />
              </div>
              <div>
                <label>Contact No.:</label>
                <input
                  class="packEvents"
                  v-model="newUser.contactNo"
                  placeholder="Contact No"
                />
              </div>
              <div>
                <label>Email Address</label>
                <input
                  class="packEvents"
                  v-model="newUser.email"
                  placeholder="Email Address"
                />
              </div>
            </div>

            <div class="bookAddress">
              <div>
                <label>Address:</label>
                <input
                  class="packEvents"
                  v-model="newUser.address"
                  placeholder="Address"
                />
              </div>
            </div>

            <div class="packEvent">
              <div>
                <label>Password:</label>
                <input
                  class="packEvents"
                  v-model="newUser.password"
                  placeholder="Password"
                />
              </div>
              <div>
                <label>Confirm Password:</label>
                <input class="packEvents" placeholder="Confirm Password" />
              </div>
            </div>

            <div class="checkbox">
              <input type="checkbox" id="signupCheck" />
              <label for="signupCheck">I accept all terms & conditions</label>
            </div>

            <div class="modal-actions">
              <button class="submitBtn" type="submit">Sign Up</button>
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
      class="bg-white p-6 rounded-lg text-center w-80 h-80 justify-center flex flex-col m-auto"
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
        Invalid Credentials
      </p>
    </div>
  </div>
</template>

<style scoped>
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
  padding: 20px;
  filter: drop-shadow(0px 0px 10px rgba(97, 95, 95, 0.5));
  background: #eef9eb;
  box-shadow: 0px 0px 10px rgba(28, 216, 34, 0.5);
  border: 1px solid #38dc87;
  border-radius: 10px;
}

#username {
  width: 587px;
}

#firstname,
#lastname {
  width: 290px;
  display: inline-flex;
}

#lastname {
  margin-left: 10px;
}

#contactNo,
#Address {
  width: 290px;
  display: inline-flex;
  position: relative;
}

#Address {
  margin-left: 10px;
}

#password,
#confirmPass {
  width: 290px;
  display: inline-flex;
  position: relative;
}

#confirmPass {
  margin-left: 10px;
}

.SignCred {
  padding: 0px;
  width: 100%;
  justify-content: center;
  border-radius: 10px;
  filter: drop-shadow(0px 4px 4px rgba(97, 95, 95, 0.5));
}
label {
  display: block;
  text-align: left;
  color: green;
}
input {
  width: 100%;
  padding: 8px;
  background-color: #f0f0f0;
  border-radius: 5px;
  margin-top: 5px;
  border: 1px solid #38dc87;
}

.modal-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 30px;
  margin-bottom: 20px;
}

.cancelBtn {
  width: 200px;
  padding: 10px;
  background: #ccc;
  border: none;

  border-radius: 5px;
  cursor: pointer;
}

.submitBtn {
  width: 15rem;
  height: auto;
  padding: 15px;
  font-size: 1.2rem;
  font-family: "Poppins";
  background: #194d1d;
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
