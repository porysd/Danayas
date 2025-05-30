<script setup>
import { ref, defineProps, defineEmits } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import Textarea from "primevue/textarea";
import FileUpload from "primevue/fileupload";

const toast = useToast();
const showModal = ref(false);
const newFAQs = ref({
  content: "",
});

defineProps(["data"]);
const emit = defineEmits(["addFAQs"]);

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const addFAQs = () => {
  emit("addFAQs", { ...newFAQs.value });

  closeModal();
};
</script>

<template>
  <button
    class="adminButton text-white font-bold bg-[#194D1D] hover:bg-[#2B6D30]"
    @click="openModal"
  >
    <i class="aIcon pi pi-plus"></i> Add {{ data }}
  </button>

  <Dialog v-model:visible="showModal" modal :style="{ width: '25rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-2xl font-bold font-[Poppins]">
          ADD TERMS AND CONDITIONS:
        </h2>
      </div>
    </template>

    <div class="packageDetails">
      <div class="addPack flex flex-col justify-center m-auto content-center">
        <div class="addPackInput">
          <label>Terms and Condition:</label>
          <Textarea
            v-model="newFAQs.content"
            autoResize
            rows="5"
            cols="30"
            placeholder="Question"
          />
        </div>
      </div>
    </div>

    <div class="flex justify-center gap-2 mt-6">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="closeModal"
        class="font-bold w-full"
      />
      <Button
        type="button"
        label="Save"
        severity="primary"
        @click="addFAQs"
        class="font-bold w-full"
      />
    </div>
  </Dialog>
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

.addPack {
  gap: 10px;
}

.addPack input,
.addPack select {
  padding: 10px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  border-radius: 5px;
  height: 40px;
}

.addPack div {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
