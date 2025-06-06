<script setup>
import { onMounted, defineEmits, ref } from "vue";
import { usePackageStore } from "../stores/packageStore.js";
import { formatPeso } from "../utility/pesoFormat.js";
import Message from "primevue/message";
import { useAuthStore } from "../stores/authStore.js";
import { useRouter } from "vue-router";
import booking from "../pages/booking.vue";

const packageStore = usePackageStore();
const authStore = useAuthStore();
const router = useRouter();

const packageSelected = ref(null);

onMounted(() => {
  packageStore.fetchAllPackages();
  packageStore.fetchAllPromos();
});
const emit = defineEmits(["availPackage"]);

const avail = (pkg) => {
  emit("availPackage", pkg);
};

const packageAvail = (pkg) => {
  console.log("isLoggedIn", authStore.isLoggedIn);
  if (authStore.isLoggedIn) {
    router.push({
      path: "/booking",
      query: { packageId: pkg.packageId },
    });
  } else {
    alert("Please SignUp or Login First");
  }
};
</script>

<template>
  <hr class="Header" data-content="PACKAGES" />

  <div class="Packages">
    <div v-if="packageStore.loading" class="loading">Loading packages...</div>
    <div v-else-if="packageStore.packages.length === 0" class="no-packages">
      No packages available
    </div>
    <div
      v-else
      class="Package1"
      v-for="pkg in packageStore.packages"
      :key="pkg.packageId"
    >
      <img
        :src="`http://localhost:3000${pkg.imageUrl}`"
        alt="card2"
        class="card1"
      />
      <div class="titlePackage">{{ pkg.name }}</div>
      <div class="inclu">{{ pkg.inclusion }}</div>
      <ul class="inclu">
        <ul>
          <h3 class="font-bold">Mode: {{ pkg.mode }}</h3>
        </ul>
        <h1 class="font-bold mt-[10px]">Price: {{ formatPeso(pkg.price) }}</h1>
        <h1 class="font-bold mt-[10px]">Pax: {{ pkg.maxPax }}</h1>
      </ul>

      <div class="detailsBtn">
        <button id="detailsBtn" @click="packageAvail(pkg)">AVAIL</button>
      </div>
    </div>
  </div>
  <hr class="Header" data-content="PACKAGES PROMO" />

  <div class="Packages">
    <div v-if="packageStore.loading" class="loading">Loading packages...</div>
    <div v-else-if="packageStore.promos.length === 0" class="no-packages">
      No packages available
    </div>
    <div
      v-else
      class="Package1"
      v-for="pkg in packageStore.promos"
      :key="pkg.packageId"
    >
      <img
        :src="`http://localhost:3000${pkg.imageUrl}`"
        alt="card2"
        class="card1"
      />
      <div class="titlePackage">{{ pkg.name }}</div>
      <div class="inclu">
        <div class="P1">{{ pkg.inclusion }}</div>
        <ul>
          <h3 class="font-bold">Mode: {{ pkg.mode }}</h3>
        </ul>
        <h1 class="font-bold mt-[10px]">Price: {{ formatPeso(pkg.price) }}</h1>
        <h1 class="font-bold mt-[10px]">Pax: {{ pkg.maxPax }}</h1>
      </div>

      <div class="detailsBtn">
        <button id="detailsBtn" @click="packageAvail(pkg)">AVAIL</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inclu {
  color: rgb(21, 21, 21);
  font-weight: normal;
  font-size: 14px;
  overflow-y: auto;
  flex-grow: 1;
  flex-direction: column;
  padding: 10px;
  word-wrap: break-word;
  white-space: pre-wrap;
}
.Header {
  line-height: 1rem;
  position: relative;
  outline: 0;
  border: 0;
  font-weight: bolder;
  font-size: 1.3rem;
  margin-top: 20px;
  margin-bottom: 2rem;
  color: rgb(2, 2, 2);
  text-align: center;
  height: 1.5rem;
  bottom: -40px;
}

.Header::before {
  content: "";

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(
    -50%,
    -50%
  ); /* Center the line horizontally and vertically */
  background: #000000;
  width: 80%; /* or a percentage like 80% if you want shorter lines */
  height: 1.2px;
  z-index: -1; /* Optional: keeps the line behind the text */
}

.Header::after {
  content: attr(data-content);
  position: relative;
  color: rgb(0, 0, 0);
  padding: 0 0.5em;
  background-color: #ffffff;
}

p {
  flex-direction: column;
}
.Packages {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  font-family: "Poppins";
  color: #000;
}

.titlePackage {
  text-align: center;
  margin-bottom: 10px;
  font-weight: bolder;
  margin: auto;
  font-size: 20px;
  color: #000;
}

.Package1 {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: auto;
  width: 350px;
  filter: drop-shadow(0px 4px 4px);
  background-color: rgb(255, 255, 255);
  border-radius: 20px;
  box-sizing: border-box;
  overflow: hidden;
  gap: 10px;
}

.card1 {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 20px;
}
.P1 {
  color: rgb(21, 21, 21);
  font-weight: normal;
  font-size: 14px;
  overflow-y: auto;
  flex-grow: 1;
  flex-direction: column;
  padding: 10px;
  word-wrap: break-word;
  white-space: pre-wrap;
}
.detailsBtn {
  width: 100%;
  background-color: #194d1d;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  display: flex;
  padding: 10px;
  align-items: center;
  justify-content: center;
  position: relative;
  bottom: 0;
  box-sizing: border-box;
}
#detailsBtn {
  background: transparent;
  border: none;
  color: rgb(252, 252, 254);
  cursor: pointer;
}
</style>
