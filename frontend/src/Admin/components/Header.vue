<script setup>
import { ref, defineProps } from "vue";
import DarkModeButton from "../components/DarkModeButton.vue";
import Notification from "../components/Notification.vue";
import ProfileAvatar from "../components/ProfileAvatar.vue";

defineProps(["data"]);
</script>

<template>
  <main>
    <div class="headerContainer">
      <div class="headers">
        <h1 class="text-5xl font-black">{{ data }}</h1>
        <div class="flex items-center gap-4">
          <DarkModeButton />
          <Notification />
          <ProfileAvatar class="profileAvat" />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.headerContainer {
  margin-left: 280px;
  margin-top: 25px;
  padding: 20px;
  background-color: #fcfcfc95;

  width: 80%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: visible;
  max-width: 100%;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.2);
}

.headers {
  display: flex;
  justify-content: space-between;
}
</style>
