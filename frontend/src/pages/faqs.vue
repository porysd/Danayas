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

    <div
      class="faqs flex flex-col items-center mt-10 px-4 max-w-screen-xl mx-auto"
    >
      <div class="faqs-sec mt-20 w-full">
        <h1
          class="text-center text-[30spx] font-bold text-black font-[Poppins] mb-5"
        >
          WE VALUE YOUR CONCERN!
        </h1>
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
      <div class="contactus-container w-full mt-10">
        <h2 class="font-[Poppins] font-black text-center text-5xl mt-10">
          Connect With Us!
        </h2>
        <p class="text-center max-w-3xl mx-auto mt-5 text-gray-700">
          At Danayas Resorts, we are here to help you create the perfect event.
          Whether you’re planning a wedding, a corporate retreat, or a family
          gathering, our team is ready to assist with every detail. Feel free to
          reach out to us for inquiries, bookings, or more information about our
          services. We look forward to helping you bring your vision to life and
          making your event a truly unforgettable experience. Contact us today,
          and let’s start planning!
        </p>

        <div
          class="contactSec flex flex-col lg:flex-row gap-10 justify-between mt-20"
        >
          <div class="flex-1 space-y-4">
            <input class="packInput w-full" type="text" placeholder="Name" />
            <input
              class="packInput w-full"
              type="email"
              placeholder="Email Address"
            />
            <input
              class="packInput w-full"
              type="tel"
              placeholder="Contact No."
            />
            <textarea
              class="packInput w-full h-32 resize-none"
              placeholder="Message..."
            ></textarea>

            <div class="flex flex-wrap items-center justify-between mt-6 gap-5">
              <div class="flex gap-4">
                <a
                  href="https://www.facebook.com/profile.php?id=61552657702549"
                  target="_blank"
                >
                  <img
                    src="../assets/facebookneon.jpg"
                    alt="Facebook"
                    class="w-10 h-10 rounded-full object-cover"
                  />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61552657702549"
                  target="_blank"
                >
                  <img
                    src="../assets/facebookneon.jpg"
                    alt="Facebook"
                    class="w-10 h-10 rounded-full object-cover"
                  />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61552657702549"
                  target="_blank"
                >
                  <img
                    src="../assets/facebookneon.jpg"
                    alt="Facebook"
                    class="w-10 h-10 rounded-full object-cover"
                  />
                </a>
              </div>

              <button
                class="SubmitButton bg-[#194d1d] text-white rounded-br-[30px] hover:bg-green-800 font-medium rounded-tl-[5px] w-[200px] h-[50px] text-[20px] text-center cursor-pointer flex justify-center items-center"
              >
                SUBMIT
              </button>
            </div>
          </div>

          <div class="flex-1">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.2324149969772!2d121.12693807492596!3d14.699444585798691!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397bb68dde68c6f%3A0xf33fcccb97074bc0!2sDANAYAS%20RESORTS%20EVENTS%20VENUE!5e0!3m2!1sen!2sph!4v1748963820294!5m2!1sen!2sph"
              width="100%"
              height="600"
              class="rounded-xl border-0 w-full"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
    </div>
  </section>
  <Footer />
</template>
<style scoped>
.packInput {
  width: 100%;
  padding: 10px;
  border: 1px solid #41ab5d;
  background-color: #fcfcfc;
  border-radius: 10px;
}
.contactus-container {
  background-color: #9edf9c;
  border: solid 3px rgb(9, 52, 9);
  border-top-left-radius: 100px;
  border-top-right-radius: 100px;
}
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

.p-accordion-header {
  background: #41ab5d;
  color: #fff;
  background: #e9fbe5;

  font-family: "Poppins", sans-serif;
  font-size: 1.2rem;
  border-radius: 10px 10px 0 0;
  margin-bottom: 2px;
}

.p-accordion-content {
  background: #fcfcfc;
  color: #194d1d;
  border: 1px solid black;
  font-size: 1rem;
  border-radius: 0 0 10px 10px;
  padding: 20px;
}

.p-accordion-toggle-icon {
  color: #194d1d;
}
</style>
