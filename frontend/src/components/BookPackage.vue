<script setup>
import { onMounted, defineEmits } from "vue";
import { usePackageStore } from "../stores/packageStore";
import router from "../router";
import { formatPeso } from "../utility/pesoFormat";
import { PackagesTable } from "../../../backend/src/schemas/Packages";

const packageStore = usePackageStore();

onMounted(() => {
  packageStore.fetchAllPackages();
  packageStore.fetchAllPackages();
});

// emit/defineEmits = giving a value to a parent (child to parent = BookPackage to Booking)
const emit = defineEmits(["availPackage"]); // availPackage will hold the emit value

// avail is a function for the AVAIL button
const avail = (pkg) => {
  emit("availPackage", pkg); // since availPackage holds the value, the selected package will emit to the parent
};
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
      <div class="mb-3 mt-2 flex-col">
        <p class="">Inclusion:</p>
        <pre class="text-left ml-8">
          {{ pkg.inclusion }}
        </pre>
        <ul class="text-left ml-8">
          {{
            pkg.mode
          }}
        </ul>
      </div>
      <div class="flex gap-20 w-[100%]">
        <h1 class="font-bold">{{ formatPeso(pkg.price) }}</h1>
        <button
          @click="avail(pkg)"
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
          @click="avail(pkg)"
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
  margin: auto;
  border: 1px solid black;
  border-radius: 10px;
  display: flex;
  width: 40rem;
  margin-bottom: 20px;
  padding: 20px;
}

#rightPart {
  flex: 1;
  position: relative;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

#leftPart {
  position: relative;
  background-color: grey;
  margin-right: 10px;
  border-radius: 10px;
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  margin-left: 5px;
  flex-shrink: 0;
  flex-grow: 0;
}
</style>
