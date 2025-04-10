<script setup>
import HomePackage from "../components/HomePackage.vue";
import Packages from "../components/Packages.vue";
</script>

<template>
  <section class="PACKAGES">
    <div class="containerPackages">
      <img
        src="../assets/danayas_day.jpg"
        alt="package_image"
        class="packageImg"
        id="package"
      />
      <h1 class="packageText" style="text-align: center">Packages</h1>
    </div>

    <div class="pSec">
      <HomePackage />
      <HomePackage />
    </div>
  </section>
</template>

<style scoped>
.containerPackages {
  position: relative;
  justify-content: center;
  align-items: center;
  width: 85rem;
  height: 400px;
  margin: auto;
  border-radius: 25px;
  overflow: hidden;
}

.packageImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.packageText {
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

.pSec {
  margin-top: 3rem;
  margin-bottom: 3rem;
}
</style>
