<script setup></script>

<template>
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

      <ol>
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
      </ol>
    </div>
  </section>
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
