<script setup>
import { onMounted } from "vue";
import { usePackageStore } from "../stores/packageStore.js";
import router from "../router/index.js";

const packageStore = usePackageStore();
onMounted(() => {
  packageStore.fetchAllPackages();
  packageStore.fetchAllPromos();
});
</script>

<template>
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
      <img src="../assets/danayas_day.jpg" alt="card2" class="card1" />
      <div class="titlePackage">{{ pkg.name }}</div>
      <div class="P1">{{ pkg.inclusion }}</div>
      <div class="detailsBtn">
        <button id="detailsBtn">AVAIL</button>
      </div>
    </div>
  </div>

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
      <img src="../assets/danayas_day.jpg" alt="card2" class="card1" />
      <div class="titlePackage">{{ pkg.name }}</div>
      <div class="P1">{{ pkg.inclusion }}</div>
      <div class="detailsBtn">
        <button id="detailsBtn">AVAIL</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  background: #fcfcfc;
  width: 100%;
  max-width: 350px;
  padding: 3px;
  height: 400px;
  border-radius: 20px;
  filter: drop-shadow(0px 4px 4px rgb(47, 46, 46));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.card1 {
  width: auto;
  height: auto;
  border-radius: 30px;
}
.P1 {
  color: rgb(21, 21, 21);
  font-weight: regular;
  font-size: 14px;
  flex-direction: column;
  word-wrap: break-word;
}
.detailsBtn {
  width: 100px;
  height: 40px;
  border: none;
  background-color: #194d1d;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
#detailsBtn {
  background: transparent;
  border: none;
  color: rgb(252, 252, 254);
  cursor: pointer;
}
.card1,
.P1 {
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 10px;
}
</style>
