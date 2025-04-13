<script setup>
import { ref, defineProps } from "vue";

defineProps(["data"]);
</script>

<template>
  <div class="Packages">
    <div class="Package1">
      <img src="../assets/danayas_day.jpg" alt="card2" class="card1" />
      <div class="titlePackage">Package {{ data }}</div>
      <div class="P1">
        I'm a paragraph. Click here to add your own text and edit me I’m a great
        place for you to tell a story and let your users know a little more
        about you.
      </div>
      <div class="detailsBtn">
        <button id="detailsBtn">AVAIL</button>
      </div>
    </div>

    <div style="height: 10px"></div>
    <div class="Package2">
      <img src="../assets/danayas_day.jpg" alt="card2" class="card1" />
      <div class="titlePackage">Package 1</div>
      <div class="P1">
        I'm a paragraph. Click here to add your own text and edit me I’m a great
        place for you to tell a story and let your users know a little more
        about you.
      </div>
      <div class="detailsBtn">
        <button id="detailsBtn">AVAIL</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.Packages {
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  color: #000;
  margin-bottom: 30px;
}
.Package2:hover {
  transition: box-shadow 0.3 ease-in-out;
  box-shadow: 0px 4px 11px #3f3f3f;
}
.Package1:hover {
  transition: box-shadow 0.3 ease-in-out;
  box-shadow: 0px 4px 11px #3f3f3f;
}

.titlePackage {
  text-align: center;
  margin-bottom: 10px;
  font-weight: bolder;
  margin: auto;
  font-size: 40px;
  color: #000;
  font-family: "Fraunces", serif;
}
#text-packages {
  text-align: center;
  display: flex;
  margin-left: 10rem;
  font-size: 25px;
  width: 800px;
  margin: auto;
  height: 128px;
  font-weight: regular;
  font-family: "fraunces", "serif";
  justify-items: center;
}
#SeeAll {
  background-color: #194d1d;
  color: #ffffff;
  width: 299px;
  border: 1px seagreen;
  height: 50px;
  filter: drop-shadow(0px 4px 4px rgb(47, 46, 46));
  font-family: Libre Baskerville;
  border-radius: 6px;
}
.Package1 {
  background: #fcfcfc;
  width: 400px;

  height: auto;
  border-radius: 20px;
  filter: drop-shadow(0px 4px 4px rgb(47, 46, 46));
  align-items: center;
}
.Package2 {
  background: #fcfcfc;
  width: 400px;
  height: auto;
  border-radius: 20px;
  filter: drop-shadow(0px 4px 4px rgb(47, 46, 46));
  align-items: center;

  margin-left: 15rem;
}
.card1 {
  width: auto;
  height: auto;
  border-radius: 30px;
}
.P1 {
  color: rgb(21, 21, 21);
  font-weight: regular;
  font-family: "fraunces", serif;
  font-size: 20px;
  word-wrap: break-word;
}
.detailsBtn {
  width: 400px;
  margin: none;
  height: 40px;
  border: none;
  text-align: center;
  word-wrap: break-word;
  background-color: #41ab5d;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  margin-top: 10px;
}
.detailsBtn:hover {
  background-color: #194d1d;
}
#detailsBtn {
  background: transparent;
  border: none;
  color: rgb(252, 252, 254);
  margin-top: 10px;
  font-size: 15px;
}
.card1,
.P1 {
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 10px;
}
#titlePackage {
  font-size: 20px;
  font-weight: bold;
  margin-top: 10px;
}
</style>
