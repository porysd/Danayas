<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "./stores/authStore";

const router = useRouter();
const authStore = useAuthStore();

if (!authStore.accessToken) {
  router.replace("/admin/admin-login");
}
</script>

<template>
  <router-view />
</template>

<style>
body {
  background-color: #fcfcfc;
}
</style>
