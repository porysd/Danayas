<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import Avatar from "primevue/avatar";
import { useAuthStore } from "../../stores/authStore";
import { useUserStore } from "../../stores/userStore";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const userStore = useUserStore();
const router = useRouter();

const logout = () => {
  authStore.logout();
  router.replace("/admin/admin-login");
};

// Show menu in Avatar
const showMenu = ref(false);
const hideMenu = ref(null);

const closeMenu = (event) => {
  if (hideMenu.value && !hideMenu.value.contains(event.target)) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeMenu);
});

onUnmounted(() => {
  document.addEventListener("click", closeMenu);
});

const userData = ref({
  firstName: "",
  lastName: "",
});
onMounted(async () => {
  const userId = authStore.user?.userId;

  if (!userId) {
    console.error("No userId found in authStore.user");
    return;
  }

  const fetchedUser = await userStore.getUserById(userId);

  userData.value = {
    firstName: fetchedUser.firstName,
    lastName: fetchedUser.lastName,
  };
});
const userInitials = computed(() => {
  const firstName = userData.value.firstName || "";
  const lastName = userData.value.lastName || "";
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
});
</script>
<template>
  <Avatar
    :label="userInitials"
    class="mr-2 mb-2 cursor-pointer"
    size="large"
    shape="circle"
    @click.stop="showMenu = !showMenu"
  />
  <div v-if="showMenu" ref="hideMenu" class="dropdown-menu">
    <ul>
      <li class="hover:bg-gray-100 dark:hover:bg-gray-700">
        <router-link to="/admin/profile">My Profile</router-link>
      </li>
      <li class="hover:bg-gray-100 dark:hover:bg-gray-700" @click="logout">
        Log Out
      </li>
    </ul>
  </div>
</template>

<style scoped>
.dropdown-menu {
  position: absolute;
  top: 3.5rem;
  background: #fcfcfc;
  color: #333;
  border-radius: 5px;
  padding: 5px;
  width: 120px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-menu li {
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
