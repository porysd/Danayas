<script setup>
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";
import Accordion from "primevue/accordion";
import AccordionPanel from "primevue/accordionpanel";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";
import { useFaqsStore } from "../stores/faqsStore";
import { onMounted } from "vue";

const faqsStore = useFaqsStore();

onMounted(async () => {
  await faqsStore.fetchAllFAQs();
});
</script>

<template>
  <NavBar />
  <section class="FAQs">
    <div class="containerFAQs">
      <img
        src="../assets/danayas_day.jpg"
        alt="faqs_image"
        id="FAQs"
        class="faqsImage"
      />
      <h1 class="Ftext" style="text-align: center">FAQs</h1>
    </div>
    <div style="text-align: center; position: relative; top: -10rem"></div>

    <div class="faqs-sec">
      <div>
        <h1
          style="
            margin-top: 30px;
            text-align: center;
            font-size: 20px;
            color: black;
            font-weight: bold;
            font-family: 'Poppins', sans-serif;
          "
          class="text-title"
        >
          WE VALUE YOUR CONCERN!
        </h1>
      </div>

      <Accordion value="0">
        <AccordionPanel
          v-for="faqs in faqsStore.faqs"
          :key="faqs.question"
          :value="faqs.answer"
        >
          <AccordionHeader>{{ faqs.question }}</AccordionHeader>
          <AccordionContent>
            <p class="m-0">{{ faqs.answer }}</p>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>
  </section>
  <Footer />
</template>
<style scoped>
ol li {
  padding: 15px;
  position: relative;
  border-radius: 5px;
  background-color: azure;
  list-style-position: inside;
  margin-left: 15px;
}

.faqs-sec div {
  position: relative;
  padding: 10px;
  filter: drop-shadow(1px 1px 1px gray);
  width: 70rem;
  margin: auto;
}
.containerFAQs {
  position: relative;
  justify-content: center;
  align-items: center;
  width: 85rem;
  height: 400px;
  margin: auto;
  border-radius: 25px;
  overflow: hidden;
}
.faqsImage {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
.Ftext {
  position: absolute;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 80px;
  font-weight: bold;
  color: white;
  text-shadow: 0px 4px 4px rgb(12, 70, 39);
  text-align: center;
}
</style>
