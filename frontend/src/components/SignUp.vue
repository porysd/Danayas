<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const newUser = ref({
  username: "",
  firstName: "",
  lastName: "",
  contactNo: "",
  email: "",
  address: "",
  password: "",
  confirmPass: "",
});

const showSignUpModal = ref(false);

const SignUp = () => {
  if (
    !newUser.value.username ||
    !newUser.value.firstName ||
    !newUser.value.lastName ||
    !newUser.value.contactNo ||
    !newUser.value.email ||
    !newUser.value.address ||
    !newUser.value.password ||
    !newUser.value.confirmPass
  ) {
    alert("Please fill up all fields.");
    return;
  }

  if (newUser.value.password !== newUser.value.confirmPass) {
    alert("Your password does not match.");
    return;
  }
};

const addNewUser = async (newUser) => {
  // cosnt userData = {

  // }
  try {
    const response = await fetch("http://localhost:3000/users/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newUser,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add customer: ${errorText}`);
    }
    console.log("Customer added successfully");
    showSignUpModal.value = false;
    router.push("/login");
  } catch (error) {
    console.error("Error adding customer:", error);
    alert(error.message);
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
    <div class="loginBox">
      <div class="sigup">
        <h1 class="signUp">Sign Up</h1>
        <form @submit.prevent="SignUp">
          <div class="SignCred" id="username">
            <input
              v-model="newUser.username"
              type="text"
              id="username"
              placeholder="Username"
              required
            />
          </div>

          <div class="SignCred" id="firstname">
            <input
              v-model="newUser.firstName"
              type="text"
              id="firstname"
              placeholder="Firstname"
              required
            />
          </div>

          <div class="SignCred" id="lastname">
            <input
              v-model="newUser.lastName"
              type="text"
              id="lastname"
              placeholder="Lastname"
              required
            />
          </div>

          <div>
            <div class="SignCred" id="contactNo">
              <input
                v-model="newUser.contactNo"
                type="text"
                id="contactNo"
                placeholder="Contact No."
                required
              />
            </div>
            <div class="SignCred" id="Address">
              <input
                v-model="newUser.email"
                type="text"
                id="emailAddress"
                placeholder="Email Address"
                required
              />
            </div>
          </div>

          <div class="SignCred">
            <input
              v-model="newUser.address"
              type="text"
              id="address"
              placeholder="Address"
              required
            />
          </div>

          <div>
            <div class="SignCred" id="password">
              <input
                v-model="newUser.password"
                type="password"
                id="password"
                placeholder="Password"
                required
              />
            </div>
            <div class="SignCred" id="confirmPass">
              <input
                v-model="newUser.confirmPass"
                type="password"
                id="confirmPass"
                placeholder="Confirm Password"
                required
              />
            </div>
            <div class="checkbox">
              <input type="checkbox" id="signupCheck" />
              <label for="signupCheck">I accept all terms & conditions</label>
            </div>

            <div class="modal-actions">
              <button class="cancelBtn" type="button" @click="CloseSignUpModal">
                Close
              </button>
              <button class="submitBtn" type="submit" @click="addNewUser">
                Sign Up
              </button>
            </div>
          </div>
        </form>
      </div>
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
  margin-left: 21rem;
}
.signUp {
  font-size: 2rem;
  font-weight: bold;
  color: #194d1d;
  text-align: center;
  margin-bottom: 3rem;
}

.SignUp-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  background-color: #194d1d;
  color: white;
}

.modal {
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

.loginBox {
  padding: 20px;
  display: flex;
  height: auto;
  filter: drop-shadow(0px 0px 10px rgba(97, 95, 95, 0.5));
  background: #eef9eb;
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
  padding: 8px;
  margin-top: 25px;
  background-color: #fcf5f5;
  display: flex;
  border-radius: 10px;
  filter: drop-shadow(0px 4px 4px rgba(97, 95, 95, 0.5));
}

.modal-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 30px;
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
  width: 200px;
  padding: 10px;
  background: #194d1d;
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
}
</style>
