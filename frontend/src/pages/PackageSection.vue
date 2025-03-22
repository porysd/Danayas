<script setup>
import Packages from '../components/Packages.vue'
</script>
  
<template>
  <section class="PACKAGES">
    <div class="container-packages">
        <div><img src="../assets/danayas_day.jpg" alt="package_image" id="package"> </div>
       <div> <h1 class="text" style="text-align: center;"> Packages</h1></div>
    </div>

    <div class="pSec">
      <Packages/>
      <Packages/>
    </div>

    <div class="overlayBtn">
      <button id = "overlay"></button>
      
    </div>
  
  </section>
</template>
  

  <style scoped>
  
  .pSec{
    margin-top:-17rem;
    margin-bottom: 60px;
  }
img{
    width: 80rem;
    height: 50vh;
    align-items: center;
    margin-left: 100px;
    border-radius: 25px;

  }
  .text{
    top: -17rem;
    color: white;
    margin-left: 38rem;
    font-size: 80px;
    position: relative;
    display: inline-flex;
    text-align: center;
    text-shadow: 0px 4px 4px rgb(12, 70, 39);
  }
  </style>
  