<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Login from "../components/Login.vue";
import SignUp from "../components/SignUp.vue";

const isLoggedIn = ref(localStorage.getItem("token") !== null); // Checks if logged in
const router = useRouter();

function handleSignUpSuccess() {
  isLoggedIn.value = true; // User is logged in after sign up
}

function handleLoginSuccess() {
  isLoggedIn.value = true; // User is logged in after login
}
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

    <div class="nav-links" :class="{ active: isMenuOpen }">
      <ul>
        <li>
          <router-link to="/" active-class="active-route">Home</router-link>
        </li>
        <li>
          <router-link to="/packages" active-class="active-route"
            >Packages</router-link
          >
        </li>
        <li>
          <router-link to="/booking" active-class="active-route"
            >Booking</router-link
          >
        </li>
        <li>
          <router-link to="/faqs" active-class="active-route">FAQs</router-link>
        </li>
        <li>
          <router-link to="/gallery" active-class="active-route"
            >Gallery</router-link
          >
        </li>
        <li>
          <router-link to="/about-us" active-class="active-route"
            >About Us</router-link
          >
        </li>
        <li>
          <router-link to="/contact-us" active-class="active-route"
            >Contact Us</router-link
          >
        </li>
      </ul>
    </div>

    <div class="signup-btn-container">
      <template v-if="isLoggedIn">
        <router-link to="/logs" active-class="active-route">Logs</router-link>
        <div class="profilepage">
          <router-link to="/profile-page" active-class="active-route">
            <i
              class="pi pi-user"
              style="
                font-size: 1.5rem;
                align-items: center;
                position: relative;
                justify-content: center;
                align-content: center;
                display: flex;
              "
            ></i
          ></router-link>
        </div>
      </template>
      <template v-else>
        <Login @login-success="handleLoginSuccess" />
        <SignUp @sign-up-success="handleSignUpSuccess" />
      </template>
    </div>
  </nav>

  <main>
    <router-view />
  </main>
</template>

<style scoped>
.profilepage {
  width: 40px;
  padding: 5px;
  border-radius: 50%;
  background-color: #54d6a4;
  height: 40px;
  border-radius: 50%;
  position: relative;
}
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border: none;
  position: relative;
}

#logo {
  width: 120px;
  height: auto;
  display: block;
  margin-left: 5rem;
}

.drevsLogo {
  display: block;
  filter: drop-shadow(0 0 2px #000000);
}

.nav-links ul {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-links ul li {
  margin-right: 20px;
}

.nav-links ul li a {
  text-decoration: none;
  color: black;
  font-size: 18px;
  transition: color 0.3s;
}

.nav-links ul li a:hover {
  color: #00ab5e;
  text-decoration: underline;
}

.active-route {
  color: #54d6a4;
}

.signup-btn-container {
  display: flex;
  gap: 10px;
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
</style>
