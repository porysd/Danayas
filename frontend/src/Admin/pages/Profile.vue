<script setup>
import SideBar from "../components/SideBar.vue";
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "../../stores/authStore";
import { useUserStore } from "../../stores/userStore";

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
  <main class="myProfile">
    <SideBar />
    <div class="container">
      <div class="profilePage">
        <div>
          <label>Username:</label>
          <input
            type="text"
            v-model="userData.username"
            :disabled="!isEditing"
          />
        </div>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            v-model="userData.firstName"
            :disabled="!isEditing"
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            v-model="userData.lastName"
            :disabled="!isEditing"
          />
        </div>
        <div>
          <label>Contact Number:</label>
          <input
            type="tel"
            v-model="userData.contactNo"
            :disabled="!isEditing"
          />
        </div>
        <div>
          <label>Email Address:</label>
          <input type="email" v-model="userData.email" :disabled="!isEditing" />
        </div>
        <div>
          <label>Address:</label>
          <input
            type="text"
            v-model="userData.address"
            :disabled="!isEditing"
          />
        </div>

        <button class="modifyBtn" @click="toggleEdit" :disabled="isLoading">
          {{ isEditing ? (isLoading ? "Saving..." : "Save") : "Modify" }}
        </button>
      </div>
      <div class="profilePage">
        <div>
          <label>Old Password:</label>
          <input type="password" placeholder="Enter your old password" />
        </div>
        <div>
          <label>New Password:</label>
          <input type="password" placeholder="Enter your new password" />
        </div>
        <div>
          <label>Confirm New Password:</label>
          <input type="password" placeholder="Confirm your new password" />
        </div>

        <button class="modifyBtn">Modify</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.myProfile {
  background-color: #eef9eb;
}
.container {
  margin-left: 280px;
  margin-top: 30px;
  padding: 20px;
  width: 80%;
  height: 92%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  display: flex;
  gap: 30px;
  justify-content: space-between;
}

.profilePage {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff7c;
}

.profilePage label {
  font-size: 16px;
  font-weight: 500;
}

.profilePage input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  height: 40px;
  font-size: 14px;
  width: 100%;
  transition: border-color 0.3s ease;
}

.profilePage input:focus {
  border-color: #2b6d30;
  outline: none;
}

.modifyBtn {
  padding: 12px;
  background-color: #194d1d;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.modifyBtn:hover {
  background-color: #2b6d30;
}
</style>
