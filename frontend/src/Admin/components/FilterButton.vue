<script setup>
import { ref, defineModel } from "vue";

const modelValue = defineModel();
</script>

<template>
  <button
    class="adminButton text-white font-bold bg-[#194D1D] dark:bg-[#18181b] hover:bg-[#2B6D30]"
    @click="modelValue = !modelValue"
  >
    Filter <i class="fIcon pi pi-filter"></i>
  </button>
</template>

<style scope>
.adminButton {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.fIcon {
  margin-left: 5px;
  font-size: 13px;
}
</style>
