<script setup>

</script>
<template>
  <footer >
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
          <router-link to="/terms&condition">TERMS & CONDITIONS</router-link>
        </li>
        </ul>
    </div>

    <div  class = "contactInfo">
        <div class="address">
            <h2>ADDRESS</h2>
            <p> #27 Jones St. Extension Dulong Bayan 2, San Mateo Rizal</p>
        </div>
        <div class="ContactNo"> 
            <h2>CONTACT NO.</h2>
            <p> +6391 216 6870</p>
        </div>
        <div class="followUs">
             <h2>FOLLOW US ON</h2>
        <a href="https://www.facebook.com/people/Danayas-Resorts-Events-Venue/61552657702549/?sk=photos&_rdc=1&_rdr#" target="_blank">
            <img src="..//assets/facebook.logo.avif" alt="Facebook" width="50 "style ="border-radius: 50%; object-fit: cover;">
            </a>
       </div>

      
        </div>
        <div class = "C-reserved">
                <p id="reserved">&copy; 2025 DANAYAS RESORT EVENTS VENUE ALL RIGHTS RESERVED</p>
        </div>
       
    </div>
    
  </footer>
   </template>

<style scoped>
li{
    text-decoration: none;
    list-style: none;
    text-align: center;
    display: inline-block;

    

}
ul li a{
    text-decoration: none;
    display: block;
    text-align: center;
    margin-top: 2rem;
    color: black;
    display: flex;
    font-family: 'Fraunces', serif;
    font-size: 15px;
    color: white;
    margin-top:6rem;

  }
  .text ul{
    gap:6rem;
    display: flex;
    justify-content:center;
  }
  .footerBr{
    background-color: #194D1D;
    width: 100%;
    height: 450px;
    margin: 0;
    padding: 0;
    border-radius: 9px;
   
  }
  .contactInfo{
    text-align: center;
    display: inline-flex;
    gap: 10rem;
    margin: auto;
    color: white;
    margin-top: 5rem;
    justify-content:center;
    margin-left: 11rem;

  }

  a{
    border-radius: 100%;
  }
  #reserved{
    color: white;
    text-align: center;
    margin-top: 5.5rem;
    width: 100%;
  }
  footer {
    background-color: #194D1D;
    width: 100%;
    height: 450px;
    margin: 0;
    padding: 0;
    border-radius: 9px;
    color: white;
}


</style>