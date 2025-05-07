<script setup>
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";

const authStore = useAuthStore();
const userStore = useUserStore();

const userData = ref({
  username: "",
  firstName: "",
  lastName: "",
  contactNo: "",
  email: "",
  address: "",
});

onMounted(async () => {
  console.log("Auth initialized:", authStore.user, authStore.role);

  const userId = authStore.user?.userId;

  if (!userId) {
    console.error("No userId found in authStore.user");
    return;
  }

  console.log("Fetching user details for userId:", userId);
  const fetchedUser = await userStore.getUserById(userId);

  console.log("Fetched user:", fetchedUser);

  userData.value = {
    username: fetchedUser.username,
    firstName: fetchedUser.firstName,
    lastName: fetchedUser.lastName,
    contactNo: fetchedUser.contactNo,
    email: fetchedUser.email,
    address: fetchedUser.address,
  };

  console.log("Populated userData:", userData.value);
});

const isEditing = ref(false);
const isLoading = ref(false);

const toggleEdit = async () => {
  isEditing.value = !isEditing.value;

  if (!isEditing.value) {
    isLoading.value = true;
    try {
      const userUpdate = await userStore.updateUser(userData.value);
      console.log("Saved:", userUpdate);
    } catch (error) {
      console.error("Error saving user data:", error);
    } finally {
      isLoading.value = false;
    }
  }
};
</script>
<template>
  <NavBar />
  <div class="ContainerAbout">
    <img
      src="../assets/danayas_day.jpg"
      alt="package_image"
      id="about"
      class="aboutUs"
    />
    <h1 class="AboutText" style="text-align: center">Profile</h1>
  </div>
  <div class="profile">
    <i
      class="pi pi-user"
      style="
        font-size: 5rem;
        align-items: center;
        position: relative;
        justify-content: center;
        align-content: center;
        display: flex;
      "
    ></i>
  </div>

  <div class="profile-Container">
    <div class="modify-Pass">
      <div>
        <h1 class="Name">
          Hi, {{ userData.firstName }} {{ userData.lastName }}!
        </h1>
      </div>

      <div class="modify-container">
        <div>
          <label>Username:</label>
          <input
            class="packEvents"
            id="username"
            v-model="userData.username"
            :disabled="!isEditing"
          />
        </div>
        <div>
          <label>Email Address:</label>
          <input
            class="packEvents"
            id="address"
            v-model="userData.email"
            :disabled="!isEditing"
          />
        </div>

        <div>
          <label>First Name:</label>
          <input
            class="packEvents"
            id="firstname"
            v-model="userData.firstName"
            :disabled="!isEditing"
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            class="packEvents"
            id="lastname"
            v-model="userData.lastName"
            :disabled="!isEditing"
          />
        </div>
        <div>
          <label>Contact Number:</label>
          <input
            type="tel"
            class="packEvents"
            v-model="userData.contactNo"
            :disabled="!isEditing"
          />
        </div>
        <div>
          <label>Address: </label>
          <input
            class="packEvents"
            v-model="userData.address"
            :disabled="!isEditing"
          />
        </div>
        <button class="modifyBtn" @click="toggleEdit" :disabled="isLoading">
          {{ isEditing ? (isLoading ? "Saving..." : "Save") : "Modify" }}
        </button>
      </div>
      <div class="ChangePass">
        <h1 class="TitlePass">Change Password</h1>
        <div class="Pass-container">
          <div>
            <label> Old Password:</label>
            <input class="packEvents" placeholder="Current Password" />
          </div>
          <div>
            <label>New Password</label>
            <input class="packEvents" placeholder="New Password" />
          </div>
          <div>
            <label>Confirm Password:</label>
            <input class="packEvents" placeholder="Confirm Password" />
          </div>
          <button class="ChangePassBtn">Modify</button>
        </div>
      </div>
    </div>
  </div>

  <Footer />
</template>

<style scoped>
.modify-Pass {
  position: relative;
  bottom: -12rem;
}
#name {
  width: 250px;
}
.Name {
  font-weight: bold;
  font-family: "Poppins";
  font-size: 30px;
  margin-right: 50rem;
  top: -10rem;
  align-items: center;
  justify-content: center;
  align-content: center;
  display: flex;
  color: rgb(0, 92, 0);

  position: relative;
}
.profile {
  border-radius: 50%;
  width: 150px;
  height: 150px;
  margin: auto;
  background-color: rgb(127, 241, 150);
  align-items: center;
  justify-content: center;
  align-content: center;
  position: relative;
  box-shadow: 0px 4px 4px #41ab5d;
  bottom: -3rem;
}
.TitlePass {
  font-weight: bold;
  font-family: "Poppins";
  font-size: 30px;
  top: -3rem;
  position: relative;
  margin-right: 58rem;
  align-items: center;
  justify-content: center;
  align-content: center;
  display: flex;
  color: rgb(0, 92, 0);
}
.ChangePassBtn {
  border: 1px solid green;
  width: 80rem;
  height: 4rem;
  background-color: #41ab5d;
  padding: 10px;
  border-radius: 10px;
  bottom: -1rem;
  margin-top: 1rem;
  color: white;
  font-weight: 600;
  font-family: "Poppins";
}

.Pass-container {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  align-items: center;
  margin: auto;
  position: relative;
  bottom: -2rem;
  top: -2rem;
  margin-left: 20px;
}
.modifyBtn {
  border: 1px solid green;
  width: 80rem;
  height: 4rem;
  background-color: #41ab5d;
  padding: 10px;
  border-radius: 15px;
  margin-top: 10px;
  color: white;
  font-weight: 600;
  font-family: "Poppins";
}
.modify-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: auto;
  justify-content: center;
  align-content: center;
  align-items: center;
  top: -4rem;
  position: relative;
}
label {
  display: inline-block;
  position: absolute;
  font-size: 1.5rem;
  font-weight: 600;
  color: green;
}
input {
  border-radius: 10px;
  border: 1px solid green;
  background-color: aliceblue;
  padding: 10px;
  width: 10px;
  width: 21rem;
  margin-left: 13rem;
}
.profile-Container {
  border: none;
  height: 53rem;
  background: #eef9eb;
  box-shadow: 0px 0px 10px rgba(28, 216, 34, 0.5);
  border: 1px solid #38dc87;
  width: 85rem;
  align-items: center;
  justify-self: center;
  margin: auto;
  margin-top: -1rem;
  border-radius: 15px;
  border-top-left-radius: 100px;
  border-top-right-radius: 100px;
  border-bottom-right-radius: 100px;
  border-bottom-left-radius: 100px;
}
img {
  width: 30px;
  height: 30px;
  position: static;
}
.ContainerAbout {
  position: relative;
  width: 85rem;
  justify-content: center;
  align-items: center;
  height: 400px;
  margin: auto;
  border-radius: 25px;
  overflow: hidden;
}
.aboutUs {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.AboutText {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 80px;
  font-weight: bold;
  color: white;
  text-shadow: 0px 4px 4px rgb(12, 70, 39);
  text-align: center;
}
</style>
