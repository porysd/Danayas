<script setup>
import { onMounted, ref } from "vue";
import Dialog from "primevue/dialog";
import { useTermsStore } from "../stores/termStore";

const termsStore = useTermsStore();
const showTermsAndConditionModal = ref(false);
const termsList = ref([]);

onMounted(async () => {
  await termsStore.fetchAlltermAndCondition();
  termsList.value = termsStore.terms;
});

const openTermsAndCondition = () => {
  showTermsAndConditionModal.value = true;
};
const emit = defineEmits(["Terms"]);

const Terms = (trm) => {
  emit("Terms", trm);
};
</script>
<template>
  <div class="card flex justify-center">
    <button
      label="TERMS & CONDITION"
      @click="openTermsAndCondition"
      class="terms-button"
    >
      TERMS & CONDITION
    </button>

    <Dialog
      v-model:visible="showTermsAndConditionModal"
      modal
      :style="{ width: '70rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <hr class="Header" data-content="Terms & Condition" />

      <ol class="list-decimal list-inside space-y-2 text-black">
        <li v-for="trm in termsStore.terms" :key="trm.termsId">
          {{ trm.content }}
        </li>
      </ol>
    </Dialog>
  </div>
</template>
<style scoped>
.terms-button {
  display: flex;
  font-size: 15px;
  color: white;
  width: 30%;

  font-family: Poppins;
  font-weight: bold;
  text-align: center;
  margin-top: 2rem;
}
.Header {
  line-height: 1rem;
  position: relative;
  outline: 0;
  border: 0;
  font-weight: bolder;
  font-size: 1.3rem;
  margin-top: 5px;
  margin-bottom: 30px;
  color: rgb(2, 2, 2);
  text-align: center;
  height: 1.5rem;
}

.Header::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(
    -50%,
    -50%
  ); /* Center the line horizontally and vertically */
  background: #000000;
  width: 50%; /* or a percentage like 80% if you want shorter lines */
  height: 1.2px;
  z-index: -1; /* Optional: keeps the line behind the text */
}

.Header::after {
  content: attr(data-content);
  position: relative;
  color: rgb(0, 0, 0);
  padding: 0 0.5em;
  background-color: #ffffff;
}
.list-decimal {
  border-radius: 10px;
  position: relative;
  top: -20px;
  padding: 2px 5px;
  border: 2px solid green;
}
</style>
