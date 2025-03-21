<script setup>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';


</script>

<template>

    <DataTable class="dTable bg-[#C7E3B6]":value="users" resizableColumns columnResizeMode="expand" showGridlines tableStyle="min-width: 1rem">
        <Column class="cData" field="name" header="NAME"></Column>
        <Column class="cData" field="contact" header="CONTACT NO."></Column>
        <Column class="cData" field="status" header="STATUS"></Column>
        <Column class="cData" field="created" header="CREATED"></Column>
    </DataTable>

</template>

<style scoped>

.dTable {
    width: 50%;
    height: auto;
}

.cData {
    font-style: bold;
}

</style>