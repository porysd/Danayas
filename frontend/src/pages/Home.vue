<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import DatePicker from "primevue/datepicker";
import FloatLabel from "primevue/floatlabel";
import img from "../assets/danayas_day.jpg";
import img1 from "../assets/danayas_night.jpg";
import img2 from "../assets/danayas_event.jpg";
import img3 from "../assets/danayas_event1.jpg";
import image1 from "../assets/feedback1.jpg";
import image2 from "../assets/feedback2.jpg";
import image3 from "../assets/feedback3.jpg";
import image4 from "../assets/danayas.jpg";
import "cally";
import HomePackage from "../components/HomePackage.vue";
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";

let images = [img, img1, img2, img3];
const texts = [
  "Danayas Resort",
  "Danayas Resort",
  "Events & Venues",
  "Events & Venues",
];

const currentIndex = ref(0);
const currentImage = ref(images[currentIndex.value]);
const currentText = ref(texts[currentIndex.value]);
let interval = null;

const changeImage = () => {
  currentIndex.value = (currentIndex.value + 1) % images.length;
  currentImage.value = images[currentIndex.value];
  currentText.value = texts[currentIndex.value];
};

onMounted(() => {
  interval = setInterval(changeImage, 6000);
});

onUnmounted(() => {
  clearInterval(interval);

  return { currentImage };
});

const carousel = ref(null);
const rotation = ref(0);
const rotation2 = ref(0);
let timeTillSwap = ref(0);
let autoRotate = null;

const items = [
  { id: 1, image: image1 },
  { id: 2, image: image2 },
  { id: 3, image: image3 },
  { id: 4, image: image4 },
];

// Function to interpolate values smoothly
function tween(a, b, t) {
  return a + (b - a) * t;
}

// Move to Previous Slide
const prevSlide = () => {
  rotation.value += 90;
  timeTillSwap.value = 600;
  resetAutoRotate();
};

// Move to Next Slide
const nextSlide = () => {
  rotation.value -= 90;
  timeTillSwap.value = 600;
  resetAutoRotate();
};

// Animation Loop
const animate = () => {
  if (!carousel.value) return;

  if (timeTillSwap.value <= 0) {
    timeTillSwap.value = 200;
  }
  timeTillSwap.value--;

  rotation2.value = tween(rotation2.value, rotation.value, 0.1);

  carousel.value.style.transform = `perspective(45cm) rotateY(${rotation2.value}deg)`;

  requestAnimationFrame(animate);
};

// Auto-Rotate Function
const startAutoRotate = () => {
  autoRotate = setInterval(() => {
    nextSlide();
  }, 4000); // Change slide every 3 seconds
};

// Reset Auto-Rotate when clicking a button
const resetAutoRotate = () => {
  clearInterval(autoRotate);
  startAutoRotate();
};

// Lifecycle Hooks
onMounted(() => {
  animate();
  startAutoRotate();
});

onUnmounted(() => {
  clearInterval(autoRotate);
});
//calendar apperance

const date = ref("");
const showDatePicker = ref(false);

// Dark mode
const isDarkMode = ref(false);

onMounted(() => {
  isDarkMode.value = document.documentElement.classList.contains("my-app-dark");
});

function toggleDarkMode() {
  document.documentElement.classList.toggle("my-app-dark");
  isDarkMode.value = !isDarkMode.value;
}
</script>

<template>
  <NavBar />
  <div class="home-section">
    <div class="homeSlider">
      <div
        class="danayas-slide"
        :style="{ backgroundImage: `url(${currentImage})` }"
      >
        <h2 class="homeText slide-text">{{ currentText }}</h2>
      </div>
    </div>
    <div class="datePickerbackground">
      <div class="booking-container">
        <span class="label" style="font-size: 20px; font-weight: 700"
          >FROM</span
        >
        <div class="date-picker-wrapper">
          <FloatLabel variant="on">
            <DatePicker
              v-model="checkInDate"
              inputId="checkIn"
              showIcon
              iconDisplay="input"
              class="custom-date-picker"
              style="width: 20rem; height: 3rem; border: none"
            />
            <label for="checkIn">CHECK-IN</label>
          </FloatLabel>
        </div>
        <span class="label" style="font-size: 20px; font-weight: 700">TO</span>

        <div class="date-picker-wrapper">
          <FloatLabel variant="on">
            <DatePicker
              v-model="checkOutDate"
              inputId="checkOut"
              showIcon
              iconDisplay="input"
              class="custom-date-picker"
              style="width: 20rem; height: 3rem; border: none"
            />
            <label for="checkOut">CHECKOUT</label>
          </FloatLabel>
        </div>

        <button
          @click="showDatePicker = !showDatePicker"
          class="availability-btn"
        >
          Check Availability
        </button>
      </div>
    </div>

    <div
      v-if="showDatePicker"
      class="datePicker"
      style="
        background-color: #c7e3b6;
        width: 1065px;
        height: 23rem;
        border-radius: 20px;
        display: flex;
        margin: auto;
        align-items: center;
      "
    >
      <DatePicker
        v-model="date"
        inline
        class="w-full sm:w-[20rem] mr-10 ml-10"
      />
      <DatePicker v-model="date" inline class="w-full sm:w-[20rem]" />

      <div class="Status">
        <h1 style="text-align: center; font-size: 20px; font-weight: 600">
          Status
        </h1>
        <span class="dot" id="Available" style="background-color: #4bb344">
          <label for="dot" style="margin-left: 50px"> AVAILABLE</label></span
        >
        <span class="dot" id="FullyBooked" style="background-color: #ff2d55">
          <label
            for="dot"
            style="margin-left: 50px; width: 145px; font-size: 16px"
          >
            FULLY BOOKED</label
          ></span
        >
        <span class="dot" id="DayAvailble" style="background-color: #3edfff">
          <label for="dot" style="margin-left: 50px; width: 145px">
            DAY AVAILABLE</label
          ></span
        >
        <span class="dot" id="NightAvailble" style="background-color: #1714ba">
          <label
            for="dot"
            style="margin-left: 50px; text-align: center; width: 145px"
          >
            NIGHT AVAILABLE</label
          ></span
        >
        <button
          id="Availablity"
          style="
            background-color: #41ab5d;
            text-align: center;
            color: white;
            border-radius: 20px;
            font-size: 16px;
            width: 200px;
            height: 50px;
          "
        >
          CHECK AVAILABILITY
        </button>
      </div>
    </div>

    <!-- Spacer to allow scrolling -->
    <div style="height: 10px"></div>

    <div
      class="textWrap"
      v-animateonscroll="{
        enterClass:
          'animate-enter fade-in-10 slide-in-from-l-8 animate-duration-1000',
        leaveClass: 'animate-leave fade-out-0',
      }"
    >
      <p id="p-text" class="text-black" style="font-size: 20px">
        The ordinary and experience the best comfort zone at Danayas Resort
        <br />
        where every sunrise brings serenity and tells every story.”
      </p>
    </div>
    <div style="height: 12x"></div>

    <div
      class="features-background bg-[#C1F2B0] dark:bg-[#333] !important"
      v-animateonscroll="{
        enterClass:
          'animate-enter fade-in-10 slide-in-from-l-8 animate-duration-1000',
        leaveClass: 'animate-leave fade-out-0',
      }"
    >
      <div
        class="featureSection content-center justify-center m-auto flex flex-auto border-xl"
      >
        <div class="feature-image">
          <img
            src="../assets/danayas.jpg"
            alt="feature1"
            style="width: 75rem; height: 480px; border-radius: 30px"
          />
        </div>
        <div class="text text-black dark:text-white">
          <h1
            class="dark:text-white"
            style="
              font-weight: bold;
              font-family: Libre Baskerville;
              font-size: 40px;
              color: #194d1d;
              text-shadow: 0px 4px 4px rgb(255, 255, 255);
            "
          >
            FEATURES
          </h1>
          <hr
            class="line dark:bg-white"
            style="width: 500px; margin-bottom: 2rem"
          />
          <p style="font-size: 22px; font-family: 'poppins'">
            Relax and rejuvenate your body and soul experience the best of
            luxury and comfort Immerse yourself in the seamless fusion of
            timeless architecture and modern design, where each home tells a
            story of its own
          </p>
          <button
            style="
              background-color: #41ab5d;
              color: #ffffff;
              border-radius: 6px;
              width: 200px;
              height: 50px;
              text-align: center;
              margin-right: 40%;
              margin-top: 15px;
              margin-bottom: 10px;
              font-size: 20px;
              font-weight: 400;
              padding: 5px;
              text-align: center;
              word-wrap: break-word;
            "
            @click="toggleDarkMode"
          >
            Learn more
          </button>
        </div>
      </div>
    </div>

    <div
      class="DiscountBackground"
      v-animateonscroll="{
        enterClass:
          'animate-enter fade-in-10 slide-in-from-l-8 animate-duration-1000',
        leaveClass: 'animate-leave fade-out-0',
      }"
    >
      <div class="DiscountSection flex content-center justify-center m-auto">
        <div class="discount-text mr-180">
          <h1 id="title">DISCOUNT FOR HOLIDAY AND EVENTS?</h1>
          <p id="discountText">
            I'm a paragraph. Click here to add your own text and<br />edit me.
            I'm a great place for you to tell a story and let <br />
            your users know a little more about you.
          </p>
        </div>
      </div>
    </div>

    <section class="DanayasPackages">
      <div class="packageSection content-center justify-center m-auto">
        <H1
          style="
            font-size: 70px;
            font-weight: Bold;
            text-align: center;
            color: #194d1d;
            text-shadow: 0px 2px 2px rgb(40, 135, 21);
          "
          >Danayas Packages</H1
        >
        <p
          style="
            font-size: 20px;
            font-weight: 400;
            color: black;
            text-align: center;
            margin-bottom: 20px;
            word-wrap: break-word;
            margin-top: 10px;
          "
        >
          “Immerse yourself in the seamless fusion of timeless architecture
          and<br />
          modern design, where each home tells a story of its own”
        </p>
        <div class="SeeAllBtn content-center justify-center m-auto">
          <button>SEE ALL PACKAGES</button>
        </div>
        <div class="packageComponent">
          <HomePackage />
        </div>
      </div>
    </section>

    <div
      class="DanayasAddress"
      style="
        background-color: #c1f2b0;
        margin: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 10rem;
        padding: 5rem;
      "
    >
      <div class="AddressBackgound" style="text-align: center">
        <div
          class="Danayas Adddress"
          style="
            font-family: 'Poppins';
            font-weight: bold;
            font-size: 65px;
            color: #194d1d;
            text-align: center;
            margin-bottom: 1rem;
            margin-top: 1px;
            text-shadow: 0px 4px 4px rgb(255, 255, 255);
          "
        >
          Danayas Address
        </div>
        <div
          id="Address-p"
          style="font-size: 20px; font-weight: 400; color: black"
        >
          #27 Jones St. Extension Dulong Bayan 2, San Mateo <br />
          Rizal Philippines
        </div>
        <div style="height: 5px"></div>
        <div
          class="googleMap"
          v-animateonscroll="{
            enterClass:
              'animate-enter fade-in-10 slide-in-from-l-8 animate-duration-1000',
            leaveClass: 'animate-leave fade-out-0',
          }"
          style="margin-bottom: 30px"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1929.608118783353!2d121
            .12431473799222!3d14.7003600939651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397bb19868e1b37%3A0x429ae5ae7c94d0f2!2s7%20Jones%20Dulong%20Bayan
            %202%2C%20San%20Mateo%2C%20Rizal%20Philippines!5e0!3m2!1sen!2sph!4v1741699299438!5m2!1sen!2sph"
            width="1108"
            height="700"
            style="border: 0; border-radius: 10px; margin-top: 40px"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <button onclick="ViewMap" class="MapBtn" id="MapBtn">
          VIEW LARGE MAP
        </button>
      </div>
    </div>
    <div id="wrapper">
      <div
        class="reviewHeader content-center align-center m-auto w-[50%] h-auto"
      >
        <h1
          style="
            text-align: center;
            font-weight: bold;
            font-size: 65px;
            font-family: 'Poppins';
            margin-top: 3rem;
            color: #194d1d;

            margin-bottom: 20px;
            text-shadow: 0px 2px 2px rgb(40, 135, 21);
          "
        >
          Guest Reviews
        </h1>
        <p
          style="
            text-align: center;
            font-size: 20px;
            font-weight: 400;
            margin-bottom: 50px;
            margin-top: 10px;
          "
        >
          YOUR OPINIONS MATTERS
        </p>

        <div id="carousel" ref="carousel">
          <div
            class="carousel-item"
            v-for="(item, index) in items"
            :key="index"
          >
            <img :src="item.image" :alt="'Slide ' + (index + 1)" />
          </div>
        </div>

        <div class="controls">
          <button @click="prevSlide" id="BtnControls1">❮</button>
          <button @click="nextSlide" id="BtnControls2">❯</button>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<style scoped>
.packageComponent {
  margin-top: 30px;
}
.SeeAllBtn {
  background-color: #41ab5d;
  color: #ffffff;
  border-radius: 6px;
  width: 300px;
  height: 50px;
  text-align: center;
  font-size: 20px;
  font-weight: 400;
  padding: 10px;
  word-wrap: break-word;
}
.SeeAllBtn:hover {
  background-color: #194d1d;
}
.MapBtn {
  background-color: #41ab5d;
  color: #ffffff;
  border-radius: 6px;
  width: 300px;
  height: 50px;
  text-align: center;
  font-size: 20px;
  font-weight: 400;
  padding: 10px;
  word-wrap: break-word;
}
.MapBtn:hover {
  background-color: #194d1d;
}
.homeSlider {
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

.danayas-slide {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-size: cover;
  background-position: center;
  transition: background-image 1s ease-in-out;
}

.homeText {
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
#from,
#to {
  margin-top: 10px;
  font-weight: normal;
  font-size: 16px;
}

.p-floatlabel {
  background-color: white;
}

#wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: auto;
  position: relative;
}

.reviewHeader {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

#carousel {
  position: relative;
  height: 300px;
  transform-style: preserve-3d;
  transition: transform 0.5s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
}

.carousel-item {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
}
.carousel-item:nth-child(1) {
  transform: translateZ(250px) rotateY(0deg);
}

.carousel-item:nth-child(2) {
  transform: translateZ(-250px) rotateY(180deg);
}

.carousel-item:nth-child(3) {
  transform: translateX(-250px) rotateY(-90deg);
}

.carousel-item:nth-child(4) {
  transform: translateX(200px) rotateY(90deg);
}

.carousel-item img {
  width: 100%;
  height: 100%;
  margin-top: 2rem;
  border-radius: 2rem;
  align-items: center;
  justify-content: center;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 250px;
  position: absolute;
  top: 75%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

#BtnControls1,
#BtnControls2 {
  font-size: 50px;
  cursor: pointer;
  color: #194d1d;
  background: none;
  border: none;
  pointer-events: auto;
}

#BtnControls1 {
  position: absolute;
  left: -250px;
}

#BtnControls2 {
  position: absolute;
  right: -250px;
}

h1 {
  color: #0d0d0d;
}

.cally {
  display: inline-flex;
  align-items: center;
  margin-top: 10px;
  padding: 10px;
  margin-left: 6rem;
  margin-bottom: 10px;
}
.dot {
  height: 25px;
  width: 25px;
  background-color: #bbb;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px; /* Adds space between dots */
}
.Status {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 40px;
  margin-right: 20px;
}

.datePickerbackground {
  background-color: #fcfcfc;
  width: 1065px;
  height: 174px;
  top: -80px;
  position: relative;
  display: flex;
  margin: auto;
  filter: drop-shadow(0px 4px 4px rgb(106, 104, 104));
  border-radius: 20px;
  padding: 66px;
}

.textWrap {
  width: 999px;
  height: 128px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  font-family: "Fraunces", serif;
  font-weight: bold;
  color: #f1eaea;
  text-align: center;
  line-height: 1.9;
  margin-bottom: 10rem;
}

.features-background {
  height: 530px;
  width: 85rem;
  margin: auto;
  border-radius: 25px;
  position: relative;
  top: -6rem;
  padding: 20px;
}

.feature-image {
  margin-top: 10px;
  margin-left: 5rem;
}

.text {
  margin-top: 5rem;
  margin-bottom: 13%;
  border-radius: 10px;
  margin-right: 9rem;
  margin-left: 6rem;
  text-align: justify;
  line-height: 1.9;
  width: 1500px;
}
.DiscountBackground {
  background-color: #c1f2b0;
  height: 250px;
  margin-top: 5rem;
  color: #194d1d;

  margin-bottom: 5rem;
}
.discount-text {
  color: #194d1d;
  line-height: 1.2;
  padding: 4rem;
  width: 687px;
}
#title {
  color: #194d1d;
  width: 811px;
  font-weight: bold;
  font-size: 29px;
  font-family: "Poppins";
  margin-top: 2px;
  margin-bottom: 20px;
  text-shadow: 0px 4px 4px rgb(255, 255, 255);
}
#discountText {
  font-weight: normal;
  color: #000;
  width: 811px;
  font-size: 20px;
  font-family: "Fraunces", serif;
  margin-top: 8px;
}
#p.text {
  font-size: larges;
}

.danayas-packages {
  margin: auto;
}

p {
  font-size: 15px;
}

hr {
  border: none;
  border-top: 3px double #333;
  color: #333;
  overflow: visible;
  text-align: center;
  height: 5px;
}

.booking-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px;
  gap: 10px;
  position: relative;
  right: 1.5rem;
}

.date-picker-wrapper {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 14px;
  font-weight: 500;
  margin: 0 8px;
}

.availability-btn {
  background-color: #41ab5d;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 18px;
  font-weight: bold;
  text-align: center;
  width: 180px;
  height: 50px;
  cursor: pointer;
}
.availability-btn:hover {
  background-color: #194d1d;
}

#MapBtn {
  border: none;
  color: rgb(247, 247, 247);
  margin-top: 10px;
  font-size: 15px;
}
@media (max-width: 1024px) {
  .home-section {
    padding: 5% 2%;
    flex-wrap: wrap;
  }

  .slideshow img {
    width: 100%;
    height: auto;
    flex-wrap: wrap;
  }

  .guest-reviews {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .home-section {
    text-align: center;
    flex-wrap: wrap;
  }

  .slideshow img {
    max-width: 100%;
    flex-wrap: wrap;
  }

  .carousel {
    flex-wrap: wrap;
    justify-content: center;
  }
}

:deep(.date-picker-wrapper) {
  .p-datepicker-input {
    border: none;
    background-color: #c7e3b6;
  }
}
</style>
