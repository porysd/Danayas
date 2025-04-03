<script setup></script>

<template>
  <div class="contactContainer">
    <img
      src="../assets/danayas_day.jpg"
      alt="package_image"
      class="contactUs"
    />
    <h1 class="ContactText">Contact Us</h1>
  </div>
  <h2
    class="font-[Poppins] font-black text-center mt-10 font-bold relative text-5xl"
  >
    Connect With Us!
  </h2>
  <p class="text1 m-auto mb-15 text-center w-200 mt-5">
    Established in the historic quarter, where cultural legacy meets the
    sought-after culinary scene, Brook St. is the best kept secret of town, just
    across the sea front. Its urban renaissance is infusing new vibes and brings
    back creatives, trend setters and smart investors.
  </p>

  <div class="contactSec m-auto justify-center content-center mt-20">
    <div class="bookAddress">
      <div>
        <input class="packEvents" placeholder="Name" />
      </div>
      <div>
        <input class="packEvents" placeholder="Email Address" />
      </div>
      <div>
        <input class="packEvents1" placeholder="Contact No." />
      </div>
    </div>

    <div class="bookAddress1">
      <div>
        <input class="packEvents" placeholder="Message.." />
      </div>
    </div>

    <div
      class="SubmitButton"
      style="
        background-color: #194d1d;
        color: #ffffff;
        border-bottom-right-radius: 30px;
        border-top-left-radius: 5px;
        width: 200px;
        height: 50px;
        text-align: center;
        justify-content: center;
        margin-top: 2rem;
        margin-left: 28rem;
        font-size: 20px;
        font-weight: 400;
        padding: 10px;
        text-align: center;
        word-wrap: break-word;
        cursor: pointer;
      "
    >
      <button>SUBMIT</button>
    </div>

    <div
      class="container-map"
      style="
        width: 40%;
        margin-left: 45rem;
        position: relative;
        display: flex;
        top: -32rem;
      "
    >
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1929.608118783353!2d121
            .12431473799222!3d14.7003600939651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397bb19868e1b37%3A0x429ae5ae7c94d0f2!2s7%20Jones%20Dulong%20Bayan
            %202%2C%20San%20Mateo%2C%20Rizal%20Philippines!5e0!3m2!1sen!2sph!4v1741699299438!5m2!1sen!2sph"
        width="1108"
        height="500vh"
        style="border: 0; border-radius: 10px; margin-top: 40px"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  </div>
</template>

<style scoped>
.contactContainer {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 85rem;
  height: 540px;
  margin: auto;
  border-radius: 25px;
  overflow: hidden;
}

.contactUs {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ContactText {
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

.contactSec {
  position: static;
  width: 85rem;
  height: 500px;
}

.bookAddress,
.bookAddress1 {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-right: 30rem;

  justify-content: center;
}

.bookAddress div {
  display: flex;
  flex-direction: column;
  width: 50%;
}

.bookAddress1 div {
  display: flex;
  flex-direction: column;
  height: 10rem;
  width: 50%;
  margin-top: 30px;
}

.bookAddress input {
  padding: 8px;
  border: 1px solid #ccc;
  background-color: #fcf5f5;
  border-radius: 10px;
  height: 40px;
}

.bookAddress1 input {
  border: 1px solid #ccc;
  background-color: #fcf5f5;
  border-radius: 10px;
  height: 100%;
  padding: 8px;
}
</style>
