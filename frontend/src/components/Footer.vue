<script setup>
import TermsCondition from "./TermsCondition.vue";
</script>

<template>
  <footer>
    <div>
      <div class="text">
        <ul>
          <li>
            <router-link to="/aboutUs">ABOUT US</router-link>
          </li>
          <li>
            <router-link to="/contactUs">CONTACT US</router-link>
          </li>
          <li>
            <router-link to="/faqs">FAQs</router-link>
          </li>
          <li>
            <TermsCondition />
          </li>
        </ul>
      </div>

      <div class="contactInfo">
        <div class="address">
          <h2>ADDRESS</h2>
          <p>#27 Jones St. Extension Dulong Bayan 2, San Mateo Rizal</p>
        </div>
        <div class="ContactNo">
          <h2>CONTACT NO.</h2>
          <p>+6391 216 6870</p>
        </div>
        <div class="followUs">
          <h2>FOLLOW US ON</h2>
          <a
            href="https://www.facebook.com/people/Danayas-Resorts-Events-Venue/61552657702549/?sk=photos&_rdc=1&_rdr#"
            target="_blank"
          >
            <img
              src="..//assets/facebook.logo.avif"
              alt="Facebook"
              style="
                border-radius: 50%;
                object-fit: cover;
                display: flex;
                justify-content: center;
                align-items: center;
                margin: auto;
                margin-top: 5px;
                width: 40px;
                height: 40px;
              "
            />
          </a>
        </div>
      </div>
      <div class="C-reserved">
        <p id="reserved">
          &copy; 2025 DANAYAS RESORT EVENTS VENUE ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
li {
  text-decoration: none;
  text-align: center;
  display: inline-block;
}
ul li a {
  text-decoration: none;
  display: block;
  text-align: center;
  margin-top: 2rem;
  color: black;
  display: flex;
  font-size: 15px;
  color: white;
  font-family: Poppins;
  font-weight: bold;
}

.text ul {
  gap: 6rem;
  display: flex;
  justify-content: center;
}
.footerBr {
  border: 1px solid white;
  width: 100%;
  margin-top: 5rem;
}
.contactInfo {
  text-align: center;
  align-items: center;
  display: flex;
  gap: 10rem;
  margin: auto;
  color: white;
  margin-top: 5rem;
  justify-content: center;
  font-family: Poppins;
}

a {
  border-radius: 100%;
}
#reserved {
  color: white;
  text-align: center;
  margin-top: 5.5rem;
  width: 100%;
  font-family: Poppins;
}
footer {
  background-color: #194d1d;
  color: white;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 1rem 0;
  margin-top: 10rem;
  font-family: "Fraunces", serif;
}
</style>
