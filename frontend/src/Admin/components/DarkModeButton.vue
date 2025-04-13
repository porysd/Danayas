<script setup>
import { ref, onMounted } from 'vue';
import OverlayBadge from 'primevue/overlaybadge';

const isDarkMode = ref(false);

onMounted(() => {
    isDarkMode.value = document.documentElement.classList.contains('my-app-dark');
})

function toggleDarkMode() {
    document.documentElement.classList.toggle('my-app-dark');
    isDarkMode.value = !isDarkMode.value;
}
</script>

<template>

    <main>
        <div>
            <button class="" @click="toggleDarkMode">
                <i class="" :class="isDarkMode ? 'pi pi-moon' : 'pi pi-sun'" style="font-size: 1.3rem;"/>
            </button>
        </div>
    </main>


</template>

<style scoped>


</style>