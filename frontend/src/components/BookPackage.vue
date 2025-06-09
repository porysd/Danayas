<script setup>
import { onMounted, defineEmits, computed } from "vue";
import { usePackageStore } from "../stores/packageStore";
import router from "../router";
import { formatPeso } from "../utility/pesoFormat";

const packageStore = usePackageStore();

onMounted(() => {
  packageStore.fetchAllPackages();
  packageStore.fetchAllPromos();
});

// emit/defineEmits = giving a value to a parent (child to parent = BookPackage to Booking)
const emit = defineEmits(["availPackage"]); // availPackage will hold the emit value

// avail is a function for the AVAIL button
const avail = (pkg) => {
  emit("availPackage", pkg); // since availPackage holds the value, the selected package will emit to the parent
};

const props = defineProps({
  mode: String, // could be 'Day', 'Night', or 'Whole Day'
  selectedPackageId: [String, Number],
});

const filteredPackages = computed(() => {
  const seen = new Set();
  return packageStore.packages
    .filter((pkg) => !props.mode || pkg.mode === props.mode)
    .filter((pkg) => {
      if (seen.has(pkg.packageId)) return false;
      seen.add(pkg.packageId);
      return true;
    });
});

const filteredPromos = computed(() =>
  packageStore.promos.filter((pkg) => !props.mode || pkg.mode === props.mode)
);
</script>

<template>
  <div
    class="bookPackage"
    :class="{ selected: selectedPackageId === pkg.packageId }"
    v-for="pkg in filteredPackages"
    :key="pkg.packageId"
  >
    <div id="leftPart"></div>

    <div id="rightPart">
      <h1 class="font-bold text-xl">{{ pkg.name }}</h1>
      <div class="mb-3 mt-2 flex-col">
        <p class="">Inclusion:</p>
        <p class="text-left ml-8 whitespace-pre-wrap">
          {{ pkg.inclusion }}
        </p>
        <p>Pax:</p>
        <p class="text-left ml-8">{{ pkg.maxPax }} pax</p>
        <p>Mode:</p>
        <p class="text-left ml-8">{{ pkg.mode }}</p>
      </div>
      <div class="flex gap-20 w-[100%]">
        <h1 class="font-bold">{{ formatPeso(pkg.price) }}</h1>
        <button
          @click="avail(pkg)"
          class="availBtn border-1 rounded-lg w-40 font-bold bg-[#194d1d] hover:bg-[#2B6D30] text-white cursor-pointer"
        >
          AVAIL
        </button>
      </div>
    </div>
  </div>

  <div
    class="bookPackage"
    :class="{ selected: selectedPackageId == pkg.packageId }"
    v-for="pkg in filteredPromos"
    :key="pkg.packageId"
  >
    <div id="leftPart"></div>

    <div id="rightPart">
      <h1 class="font-bold text-xl">{{ pkg.name }}</h1>
      <div class="mb-3 mt-2">
        <p class="text-left ml-5">Inclusion:</p>
        <p class="text-left ml-8 whitespace-pre-wrap">
          {{ pkg.inclusion }}
        </p>
        <p>Pax:</p>
        <p class="text-left ml-8">{{ pkg.maxPax }} pax</p>
        <p>Mode:</p>
        <p class="text-left ml-8">{{ pkg.mode }}</p>
      </div>
      <div class="flex gap-20 w-[100%]">
        <h1 class="font-bold">{{ formatPeso(pkg.price) }}</h1>
        <button
          @click="avail(pkg)"
          class="border-1 rounded-lg w-20 font-bold bg-[#194d1d] hover:bg-[#2B6D30] text-white cursor-pointer"
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
  border: 2px solid rgb(7, 47, 3);
  border-top-right-radius: 60px;
  border-bottom-left-radius: 60px;
  display: flex;
  width: 40rem;
  margin-bottom: 20px;
  padding: 20px;
}

.bookPackage:hover {
  width: 41rem;
  background-color: #d3f0da;
}

.bookPackage:active,
.availBtn:active {
  border: 2px solid #194d1d;
  background-color: #e6f4ea;
}
.selected {
  background-color: #aaf0c1;
  transform: scale(1.02);
  border: 2px solid rgb(7, 47, 3);
  border-top-right-radius: 60px;
  border-bottom-left-radius: 60px;
}
#rightPart {
  margin-left: 40px;
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

.selected {
  border: 2px solid #194d1d;
  transform: scale(1.02);
  background-color: #a4ffbe;
}
</style>
