<script setup>
defineProps(["data"]);
</script>

<template>
  <button
    class="adminButton text-white font-bold bg-[#194D1D] hover:bg-[#2B6D30]"
  >
    <i class="aIcon pi pi-plus"></i> Add {{ data }}
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

.aIcon {
  margin-right: 5px;
  font-size: 13px;
}
</style>
