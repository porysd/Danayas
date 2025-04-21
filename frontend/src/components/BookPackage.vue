<script setup>
import { onMounted } from "vue";
import { usePackageStore } from "../stores/packageStore";

const packageStore = usePackageStore();

onMounted(() => {
  packageStore.fetchAllPackages();
  packageStore.fetchAllPromos();
});
// Peso Currency Format
function formatPeso(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}
</script>

<template>
  <div
    class="bookPackage"
    v-for="pkg in packageStore.packages"
    :key="pkg.packageId"
  >
    <div id="leftPart"></div>

    <div id="rightPart">
      <h1 class="font-bold text-xl">{{ pkg.name }}</h1>
      <div class="mb-3 mt-2">
        <p class="text-left ml-5">Inclusion:</p>
        <ul class="text-left ml-8">
          {{
            pkg.inclusion
          }}
        </ul>
      </div>
      <div class="flex gap-20 w-[100%]">
        <h1 class="font-bold">{{ formatPeso(pkg.price) }}</h1>
        <button
          class="border-1 rounded-lg w-20 font-bold bg-[#194d1d] text-white"
        >
          AVAIL
        </button>
      </div>
    </div>
  </div>

  <div
    class="bookPackage"
    v-for="pkg in packageStore.promos"
    :key="pkg.packageId"
  >
    <div id="leftPart"></div>

    <div id="rightPart">
      <h1 class="font-bold text-xl">{{ pkg.name }}</h1>
      <div class="mb-3 mt-2">
        <p class="text-left ml-5">Inclusion:</p>
        <ul class="text-left ml-8">
          {{
            pkg.inclusion
          }}
        </ul>
      </div>
      <div class="flex gap-20 w-[100%]">
        <h1 class="font-bold">{{ formatPeso(pkg.price) }}</h1>
        <button
          class="border-1 rounded-lg w-20 font-bold bg-[#194d1d] text-white"
        >
          AVAIL
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bookPackage {
  background-color: white;
  text-align: center;
  margin: auto;
  border: 1px solid black;
  border-radius: 10px;
  display: inline-flex;
  width: 40rem;
  margin-bottom: 20px;
  padding: 10px;
}

#rightPart {
  margin: auto;

  width: auto;
  position: relative;
}

#leftPart {
  position: relative;
  background-color: grey;

  border-radius: 10px;
  width: 300px;
  margin-left: 5px;
}
</style>
