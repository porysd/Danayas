<script setup>
import { ref, onMounted } from 'vue';
import OverlayBadge from 'primevue/overlaybadge';
import Badge from 'primevue/badge';

</script>

<template>

    <main>
        <div>
            <OverlayBadge value="2">
                        <i class="pi pi-bell" style="font-size: 1.5rem;"/>
            </OverlayBadge>
        </div>
    </main>


</template>

<style scoped>


</style>