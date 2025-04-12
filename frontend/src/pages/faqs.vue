<script setup>
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";
import Accordion from "primevue/accordion";
import AccordionPanel from "primevue/accordionpanel";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";
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

      <!--<ol>
        <div><li>What are the amenities the resort offer?</li></div>
        <div>
          <li>Do you have a special package for special occasion?</li>
        </div>
        <div><li>Can I bring my outside food in your resort?</li></div>
        <div><li>What is the resort's cancellation?</li></div>
        <div><li>Are pet allowed at the resort?</li></div>
        <div><li>Can I extend my time if I want to?</li></div>
        <div><li>Is there any discouunt for birthday celebration?</li></div>
        <div><li>Do you allow a grant evet?</li></div>
        <div>
          <li>Can I add guest even though its surplus on the package limit?</li>
        </div>
        <div>
          <li>
            How much the cost if I avail your package and catering service?
          </li>
        </div>
      </ol>-->

      <Accordion value="0">
        <AccordionPanel value="0">
          <AccordionHeader
            >What are the amenities the resort offer?</AccordionHeader
          >
          <AccordionContent>
            <p class="m-0">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="1">
          <AccordionHeader
            >Do you have a special package for special
            occasion?</AccordionHeader
          >
          <AccordionContent>
            <p class="m-0">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
              aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
              eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci
              velit, sed quia non numquam eius modi.
            </p>
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="2">
          <AccordionHeader
            >Can I bring my outside food in your resort?</AccordionHeader
          >
          <AccordionContent>
            <p class="m-0">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui
              blanditiis praesentium voluptatum deleniti atque corrupti quos
              dolores et quas molestias excepturi sint occaecati cupiditate non
              provident, similique sunt in culpa qui officia deserunt mollitia
              animi, id est laborum et dolorum fuga. Et harum quidem rerum
              facilis est et expedita distinctio. Nam libero tempore, cum soluta
              nobis est eligendi optio cumque nihil impedit quo minus.
            </p>
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="3">
          <AccordionHeader>What is the resort's cancellation?</AccordionHeader>
          <AccordionContent>
            <p class="m-0">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui
              blanditiis praesentium voluptatum deleniti atque corrupti quos
              dolores et quas molestias excepturi sint occaecati cupiditate non
              provident, similique sunt in culpa qui officia deserunt mollitia
              animi, id est laborum et dolorum fuga. Et harum quidem rerum
              facilis est et expedita distinctio. Nam libero tempore, cum soluta
              nobis est eligendi optio cumque nihil impedit quo minus.
            </p>
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="4">
          <AccordionHeader>Are pet allowed at the resort?</AccordionHeader>
          <AccordionContent>
            <p class="m-0">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui
              blanditiis praesentium voluptatum deleniti atque corrupti quos
              dolores et quas molestias excepturi sint occaecati cupiditate non
              provident, similique sunt in culpa qui officia deserunt mollitia
              animi, id est laborum et dolorum fuga. Et harum quidem rerum
              facilis est et expedita distinctio. Nam libero tempore, cum soluta
              nobis est eligendi optio cumque nihil impedit quo minus.
            </p>
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="5">
          <AccordionHeader>Can I extend my time if I want to?</AccordionHeader>
          <AccordionContent>
            <p class="m-0">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui
              blanditiis praesentium voluptatum deleniti atque corrupti quos
              dolores et quas molestias excepturi sint occaecati cupiditate non
              provident, similique sunt in culpa qui officia deserunt mollitia
              animi, id est laborum et dolorum fuga. Et harum quidem rerum
              facilis est et expedita distinctio. Nam libero tempore, cum soluta
              nobis est eligendi optio cumque nihil impedit quo minus.
            </p>
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="6">
          <AccordionHeader
            >Is there any discouunt for birthday celebration?</AccordionHeader
          >
          <AccordionContent>
            <p class="m-0">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui
              blanditiis praesentium voluptatum deleniti atque corrupti quos
              dolores et quas molestias excepturi sint occaecati cupiditate non
              provident, similique sunt in culpa qui officia deserunt mollitia
              animi, id est laborum et dolorum fuga. Et harum quidem rerum
              facilis est et expedita distinctio. Nam libero tempore, cum soluta
              nobis est eligendi optio cumque nihil impedit quo minus.
            </p>
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="7">
          <AccordionHeader>Do you allow a grant evet?</AccordionHeader>
          <AccordionContent>
            <p class="m-0">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui
              blanditiis praesentium voluptatum deleniti atque corrupti quos
              dolores et quas molestias excepturi sint occaecati cupiditate non
              provident, similique sunt in culpa qui officia deserunt mollitia
              animi, id est laborum et dolorum fuga. Et harum quidem rerum
              facilis est et expedita distinctio. Nam libero tempore, cum soluta
              nobis est eligendi optio cumque nihil impedit quo minus.
            </p>
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="7">
          <AccordionHeader
            >Can I add guest even though its surplus on the package
            limit?</AccordionHeader
          >
          <AccordionContent>
            <p class="m-0">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui
              blanditiis praesentium voluptatum deleniti atque corrupti quos
              dolores et quas molestias excepturi sint occaecati cupiditate non
              provident, similique sunt in culpa qui officia deserunt mollitia
              animi, id est laborum et dolorum fuga. Et harum quidem rerum
              facilis est et expedita distinctio. Nam libero tempore, cum soluta
              nobis est eligendi optio cumque nihil impedit quo minus.
            </p>
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="7">
          <AccordionHeader
            >How much the cost if I avail your package and catering
            service?</AccordionHeader
          >
          <AccordionContent>
            <p class="m-0">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui
              blanditiis praesentium voluptatum deleniti atque corrupti quos
              dolores et quas molestias excepturi sint occaecati cupiditate non
              provident, similique sunt in culpa qui officia deserunt mollitia
              animi, id est laborum et dolorum fuga. Et harum quidem rerum
              facilis est et expedita distinctio. Nam libero tempore, cum soluta
              nobis est eligendi optio cumque nihil impedit quo minus.
            </p>
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
