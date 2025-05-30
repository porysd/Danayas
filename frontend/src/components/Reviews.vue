<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import image1 from "../assets/feedback1.jpg";
import image2 from "../assets/feedback2.jpg";
import image3 from "../assets/feedback3.jpg";
import image4 from "../assets/danayas.jpg";

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
</script>

<template>
  <div id="wrapper">
    <div class="reviewHeader content-center align-center m-auto w-[50%] h-auto">
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
        <div class="carousel-item" v-for="(item, index) in items" :key="index">
          <img :src="item.image" :alt="'Slide ' + (index + 1)" />
        </div>
      </div>

      <div class="controls">
        <button @click="prevSlide" id="BtnControls1">❮</button>
        <button @click="nextSlide" id="BtnControls2">❯</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
#wrapper {
  display: flex;
  width: 100%;
  height: auto;
  position: relative;
  flex-wrap: nowrap;
  justify-content: center;
  align-content: center;
  align-items: center;
}

.reviewHeader {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex-wrap: nowrap;
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
  flex-wrap: nowrap;
  justify-content: center;
  align-content: center;
  align-items: center;
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
  flex-wrap: nowrap;
  justify-content: center;
  align-content: center;
  align-items: center;
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
  flex-wrap: nowrap;
  justify-content: center;
  align-content: center;
  align-items: center;
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
</style>
