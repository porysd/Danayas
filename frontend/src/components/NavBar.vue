<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import Login from "../components/Login.vue";
import SignUp from "../components/SignUp.vue";
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";
import { useLogStore } from "../stores/auditLogStore";
import Avatar from "primevue/avatar";
import Badge from "primevue/badge";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const authStore = useAuthStore();
const userStore = useUserStore();
const logStore = useLogStore();
const router = useRouter();

const isLoggedIn = computed(() => authStore.isLoggedIn);
const showMenu = ref(false);
const hideMenu = ref(null);

function handleSignUpSuccess() {
  isLoggedIn.value = true; // User is logged in after sign up
}

function handleLoginSuccess() {
  isLoggedIn.value = true; // User is logged in after login
}

const logout = () => {
  authStore.logout();
  router.replace("/");
};

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
  console.log("Auth initialized:", authStore.user, authStore.role);

  const userId = authStore.user?.userId;

  if (!userId) {
    console.error("No userId found in authStore.user");
    return;
  }

  if (userId) {
    await logStore.fetchAllLogs();
  }

  console.log("Fetching user details for userId:", userId);
  const fetchedUser = await userStore.getUserById(userId);

  console.log("Fetched user:", fetchedUser);

  userData.value = {
    firstName: fetchedUser.firstName,
    lastName: fetchedUser.lastName,
  };
  console.log("Populated userData:", userData.value);
});

const Initials = computed(() => {
  try {
    const first = userData.value.firstName?.charAt(0) || "";
    const last = userData.value.lastName?.charAt(0) || "";
    return first + last;
  } catch (err) {
    console.log("cannot fin d the character", err);
    return "";
  }
});

const bookingReservedLogs = computed(() =>
  logStore.logs.filter((log) => {
    if (log.action === "update" && log.tableName === "BOOKINGS" && log.data) {
      try {
        const data = JSON.parse(log.data);
        return data.bookStatus === "reserved";
      } catch {
        return false;
      }
    }
    return false;
  })
);

watch(
  bookingReservedLogs,
  (logs) => {
    logs.forEach((log) => {
      toast.value?.add({
        severity: "success",
        summary: "Booking Confirmed",
        detail: `Your booking #${log.recordId} is now reserved.`,
        life: 4000,
      });
    });
  },
  { immediate: true }
);
</script>

<template>
  <nav class="nav-bar">
    <div class="logo">
      <a href="/">
        <img
          src="../Admin/assets/drevslogo.png"
          alt="logo"
          id="logo"
          class="drevsLogo"
        />
      </a>
    </div>

    <button class="menu-toggle" @click="toggleMenu">☰</button>

    <div class="nav-links">
      <ul>
        <li>
          <router-link to="/" active-class="active-route">HOME</router-link>
        </li>
        <li>
          <router-link to="/packages" active-class="active-route"
            >PACKAGES</router-link
          >
        </li>
        <li class="dropper">
          <button class="dropBtn">BOOKING</button>
          <div class="dropdown-content">
            <router-link to="/booking" active-class="active-route"
              >PRIVATE BOOKING</router-link
            >
            <router-link to="/public-entry" active-class="active-route"
              >PUBLIC BOOKING</router-link
            >
          </div>
        </li>
        <li>
          <router-link to="/faqs" active-class="active-route">FAQs</router-link>
        </li>
        <li>
          <router-link to="/gallery" active-class="active-route"
            >GALLERY</router-link
          >
        </li>
        <li>
          <router-link to="/about-us" active-class="active-route"
            >ABOUT US</router-link
          >
        </li>
        <li>
          <router-link to="/contact-us" active-class="active-route"
            >CONTACT US</router-link
          >
        </li>
      </ul>
    </div>

    <div class="signup-btn-container">
      <template v-if="isLoggedIn">
        <router-link to="/logs" active-class="active-route " class="logs"
          >HISTORY
          <Badge
            v-if="bookingReservedLogs.length > 0"
            :value="bookingReservedLogs.length"
            severity="success"
            style="margin-left: 6px"
        /></router-link>
        <div class="profilepage">
          <Avatar
            :label="Initials"
            class="mr-2"
            size="large"
            style="
              background-color: #41ab5d;
              box-shadow: 0px 4px 4px #41ab5d;
              color: white;
            "
            shape="circle"
            @click.stop="showMenu = !showMenu"
          />
          <div v-if="showMenu" ref="hideMenu" class="dropdown-menu">
            <ul>
              <li class="hover:bg-gray-100 dark:hover:bg-gray-700">
                <router-link to="/profile-page">My Profile</router-link>
              </li>
              <li
                @click="logout"
                class="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Log Out
              </li>
            </ul>
          </div>
        </div>
      </template>
      <template v-else>
        <Login @login-success="handleLoginSuccess" />
        <SignUp @sign-up-success="handleSignUpSuccess" />
      </template>
    </div>
  </nav>

  <Toast />
  <main>
    <router-view />
  </main>
</template>

<style scoped>
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
}

#logo {
  width: 120px;
  height: auto;
  display: block;
  margin-left: 5rem;
  margin-right: 8rem;
}

.drevsLogo {
  display: block;
  filter: drop-shadow(0 0 2px #000000);
}

.nav-links ul {
  display: flex;
}

.nav-links ul li {
  margin-right: 20px;
}

.nav-links ul li a,
.dropbtn {
  text-decoration: none;
  color: rgb(73, 62, 62);
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links ul li,
.logs:hover,
.dropbtn:hover {
  color: #00ab5e;
  text-decoration: none;
  position: relative;
}
a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 2px;
  background-color: #00ab5e;
  transition: width 0.3s ease;
}
a:hover::after {
  width: 100%;
}

.active-route {
  color: #54d6a4;
  font-size: 13px;
}
.logs {
  bottom: -10px;
  position: relative;
  margin-right: 10px;
  font-weight: 500;
  font-size: 16px;
  color: rgb(52, 48, 48);
}

.logs:hover,
.dropper:hover {
}

.signup-btn-container {
  display: flex;
  gap: 10px;
  font-size: 16px;
  margin-right: 100px;
}

.Login-btn,
.signup-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.Login-btn {
  background: none;
  color: black;
}

.signup-btn {
  background: #319033;
}

.menu-toggle {
  display: none;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
}

/* Responsive Design */
@media screen and (max-width: 768px) {
  .nav-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: white;
    padding: 10px 0;
  }

  .nav-links.active {
    display: block;
  }

  .nav-links ul {
    flex-direction: column;
    align-items: center;
  }

  .nav-links ul li {
    margin-bottom: 10px;
  }

  .menu-toggle {
    display: block;
  }
}

.dropdown-menu {
  position: absolute;

  right: 8.5rem;
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

.dropbtn {
  background-color: #04aa6d;
  color: white;
  padding: 16px;
  font-size: 16px;
  border: none;
}

.dropper {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f1f1f1cd;
  min-width: 200px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.dropper-content a:hover {
  background-color: #ddd;
}

.dropper:hover .dropdown-content {
  display: block;
}

.dropper:hover .dropbtn {
  background-color: #3e8e41;
}
</style>
