<script setup>
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";
</script>

<template>
  <NavBar />
  <div class="row">
    <div class="column">
      <img src="../assets/img1.jpg" alt="" />
      <img src="../assets/img2.jpg" alt="" />
      <img src="../assets/img3.jpg " alt="" />
      <img src="../assets/img4.jpg" alt="" />
      <img src="../assets/img5.jpg" alt="" />
      <img src="../assets/img6.jpg" alt="" />
      <img src="../assets/img7.jpg" alt="" />
      <img src="../assets/img8.jpg" alt="" />
      <img src="../assets/img9.jpg" alt="" />
      <img src="../assets/img10.jpg" alt="" />
    </div>
    <div class="column">
      <img src="../assets/img10.jpg" alt="" />
      <img src="../assets/img3.jpg " alt="" />
      <img src="../assets/img6.jpg" alt="" />
      <img src="../assets/img9.jpg" alt="" />
      <img src="../assets/img5.jpg" alt="" />
      <img src="../assets/img2.jpg" alt="" />
      <img src="../assets/img4.jpg" alt="" />
      <img src="../assets/img7.jpg" alt="" />
      <img src="../assets/img8.jpg" alt="" />
      <img src="../assets/img1.jpg" alt="" />
    </div>
    <div class="column">
      <img src="../assets/img1.jpg" alt="" />
      <img src="../assets/img2.jpg" alt="" />
      <img src="../assets/img3.jpg " alt="" />
      <img src="../assets/img4.jpg" alt="" />
      <img src="../assets/img5.jpg" alt="" />
      <img src="../assets/img6.jpg" alt="" />
      <img src="../assets/img7.jpg" alt="" />
      <img src="../assets/img8.jpg" alt="" />
      <img src="../assets/img9.jpg" alt="" />
      <img src="../assets/img10.jpg" alt="" />
    </div>
  </div>
  <Footer />
</template>

<style scoped>
.row {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  padding: 0 4px;
  width: 100%;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin: 15px;
}

/* Create four equal columns that sits next to each other */
.column {
  -ms-flex: 25%; /* IE10 */
  flex: 25%;
  max-width: 25%;
  padding: 0 px;
  width: 100%;
}

.column img {
  margin-top: 8px;
  vertical-align: middle;
  width: 100%;
  border-radius: 8px;
}
img:hover {
  transition: box-shadow 0.3s ease-in-out; /* Adds a smooth transition */
  box-shadow: 0px 4px 11px #000;
}

/* Responsive layout - makes a two column-layout instead of four columns */
@media screen and (max-width: 800px) {
  .column {
    -ms-flex: 50%;
    flex: 50%;
    max-width: 50%;
  }
}

/* Responsive layout - makes the two columns stack on top of each other instead of next to each other */
@media screen and (max-width: 600px) {
  .column {
    -ms-flex: 100%;
    flex: 100%;
    max-width: 100%;
  }
}
</style>
