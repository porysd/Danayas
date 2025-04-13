<script setup>
import SideBar from "../components/SideBar.vue";
import { ref, onMounted } from "vue";

const users = ref([]);

// Get user by ID
const allUsers = async (user) => {
  const response = await fetch(`http://localhost:3000/users/${user.userId}`);

  if (!response.ok) throw new Error("Failed to fetch users");
  const users = await response.json();
};

onMounted(() => allUsers());
</script>

<template>
  <main class="myProfile">
    <SideBar />
    <div class="container">
      <div class="profilePage">
        <div>
          <label>Username:</label>
          <input type="text" placeholder="Enter your username" />
        </div>
        <div>
          <label>Email Address:</label>
          <input type="email" placeholder="Enter your email" />
        </div>
        <div>
          <label>First Name:</label>
          <input type="text" placeholder="Enter your first name" />
        </div>
        <div>
          <label>Last Name:</label>
          <input type="text" placeholder="Enter your last name" />
        </div>
        <div>
          <label>Contact Number:</label>
          <input type="tel" placeholder="Enter your contact number" />
        </div>
        <div>
          <label>Address:</label>
          <input type="text" placeholder="Enter your address" />
        </div>

        <button class="modifyBtn">Modify</button>
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
