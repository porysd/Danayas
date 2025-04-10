<script setup>
import { ref, onMounted } from 'vue';

function tween(a, b, t) {
    return a + (b - a) * t;
}

const rotation = ref(0);
const rotation2 = ref(0);
let timeTillSwap = ref(0);

function left() {
    rotation.value += 90;
    timeTillSwap.value = 600;
}

function right() {
    rotation.value -= 90;
    timeTillSwap.value = 600;
}

function animate() {
    const carousel = document.querySelector('.carousel');

    if (timeTillSwap.value <= 0) {
        timeTillSwap.value = 200;
        rotation.value -= 90;
    }
    timeTillSwap.value -= 1;

    rotation2.value = tween(rotation2.value, rotation.value, 0.1);

    if (carousel) {
        carousel.style.transform = `rotateY(${rotation2.value}deg)`;
    }

    requestAnimationFrame(animate);
}

onMounted(() => {
    requestAnimationFrame(animate);
});

//
</script>

<template>
    <div class="container">
        <div class="carousel">
            <div class="rectangle face1">
              <p>WOW GANDA NAMAN</p>
            </div>
            <div class="rectangle face2"></div>
            <div class="rectangle face3"></div>
            <div class="rectangle face4"></div>
        </div>
    </div>

    <button @click="left">Left</button>
    <button @click="right">Right</button>
</template>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
    perspective: 1000px;
}

.carousel {
    position: relative;
    width: 200px;
    height: 300px;
    transform-style: preserve-3d; 
}

.rectangle {
    width: 200px;
    height: 300px;
    background-color: #F1E9E9;
    position: absolute;
    border-radius: 2rem;
}

.face1 {
    transform: rotateY(0deg) translateZ(250px);
    background-color: #C7E3B6;
}

.face2 {
    transform: rotateY(90deg) translateZ(250px);
    background-color: blue;
    transition: background-color 0.5s;
}

.face3 {
    transform: rotateY(-90deg) translateZ(250px);
    background-color: green;
}

.face4 {
    transform: rotateY(180deg) translateZ(250px);
    background-color: green;
}
</style>
