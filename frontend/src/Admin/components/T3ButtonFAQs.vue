<script setup>
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import Textarea from "primevue/textarea";
import { useToast } from "primevue/usetoast";
import FileUpload from "primevue/fileupload";

const toast = useToast();

const showMenu = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const formData = ref({});

const props = defineProps(["faq"]);
const emit = defineEmits(["updateFAQ", "deleteFAQ"]);

const openEditModal = () => {
  formData.value = { ...props.faq };
  showEditModal.value = true;
  showMenu.value = false;
};

const openDeleteModal = () => {
  formData.value = { ...props.faq };
  showDeleteModal.value = true;
  showMenu.value = false;
};

const closeModals = () => {
  showEditModal.value = false;
  showDeleteModal.value = false;
};

const confirmEditFAQs = () => {
  console.log("Updated FAQ Data:", formData.value);
  emit("updateFAQ", formData.value);
  toast.add({
    severity: "success",
    summary: "Updated FAQs",
    detail: "Successfully Updated FAQs",
    life: 3000,
  });
  closeModals();
};

const confirmDeleteFAQs = () => {
  emit("deleteFAQ", formData.value);
  toast.add({
    severity: "success",
    summary: "Deleted FAQs",
    detail: "Successfully Deleted FAQs",
    life: 3000,
  });
  closeModals();
};

const hideMenu = ref(false);

const closeMenu = (event) => {
  if (hideMenu.value && !hideMenu.value.contains(event.target)) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeMenu);
});

onUnmounted(() => {
  document.addEventListener("click", closeMenu);
});
</script>

<template>
  <div class="relative menu-container inline-block">
    <button
      @click.stop="showMenu = !showMenu"
      class="adminButton pi pi-ellipsis-v"
    ></button>

    <div v-if="showMenu" ref="hideMenu" class="dropdown-menu">
      <ul>
        <li
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openEditModal"
        >
          Update
        </li>
        <li
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="openDeleteModal"
        >
          Delete
        </li>
      </ul>
    </div>

    <Dialog v-model:visible="showEditModal" modal :style="{ width: '25rem' }">
      <template #header>
        <div class="flex flex-col items-center justify-center w-full">
          <h2 class="text-2xl font-bold font-[Poppins]">EDIT FAQs:</h2>
        </div>
      </template>

      <div class="packageDetails">
        <div class="addPack flex flex-col justify-center m-auto content-center">
          <div class="addPackInput">
            <label>Question:</label>

            <Textarea
              v-model="formData.question"
              autoResize
              rows="5"
              cols="30"
            />
          </div>
          <div class="addPackInput">
            <label>Answer:</label>

            <Textarea v-model="formData.answer" autoResize rows="5" cols="30" />
          </div>
        </div>
      </div>

      <div class="flex justify-center gap-2 mt-6">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="closeModals"
          class="font-bold w-full"
        />
        <Button
          type="button"
          label="Save"
          severity="primary"
          @click="confirmEditFAQs"
          class="font-bold w-full"
        />
      </div>
    </Dialog>

    <Dialog v-model:visible="showDeleteModal" modal :style="{ width: '30rem' }">
      <template #header>
        <div class="flex flex-col items-center justify-center w-full">
          <h2 class="text-xl font-bold font-[Poppins]">Delete FAQs</h2>
        </div>
      </template>

      <span
        class="text-lg text-surface-700 dark:text-surface-400 block mb-8 text-center font-[Poppins]"
      >
        Are you sure you want to
        <strong class="text-red-500">DELETE</strong> this FAQs:
        <span class="font-black font-[Poppins]"> {{ faq.question }}</span
        >?
      </span>

      <div class="flex justify-center gap-2 font-[Poppins]">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="closeModals"
          class="font-bold w-full"
        />
        <Button
          type="button"
          label="Delete"
          severity="danger"
          @click="confirmDeleteFAQs"
          class="font-bold w-full"
        />
      </div>
    </Dialog>
    <Toast />
  </div>
</template>

<style scoped>
.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: #fcfcfc;
  color: #333;
  border-radius: 5px;
  padding: 5px;
  width: 120px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-menu li {
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.addPack {
  gap: 10px;
}

.addPack input {
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #fcfcfc;
  border-radius: 5px;
  height: 40px;
}

.addPack div {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
