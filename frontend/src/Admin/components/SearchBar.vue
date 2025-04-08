<script setup>
import { ref, defineEmits, defineModel } from "vue";

const searchQuery = ref("");
const emit = defineEmits();

const modelValue = defineModel();
</script>

<template>
  <div
    class="search-bar w-140 rounded-xl bg-[#FCFCFC] dark:bg-[#18181b] p-2 border-1 border-[#E0E0E0]"
  >
    <input
      class="searchPlaceholder ml-2 w-125 text-black dark:text-white"
      v-model="modelValue"
      type="text"
      placeholder="Search..."
    />
    <button>
      <span class="pi pi-search ml-2 text-black dark:text-[#FCFCFC]"></span>
    </button>
  </div>
</template>

<style scoped>
.searchPlaceholder {
  border: 0;
  outline: none;
}
</style>
