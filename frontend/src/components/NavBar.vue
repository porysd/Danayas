
<template>
  
  <nav section class="nav-bar">
    <div class="logo">
      <img src="../assets/logo.png" alt="logo" id="logo" />
    </div>
    <div class="nav-links"> 

      <ul>
        <li>
          <router-link to="/">Home</router-link>
        </li>
        <li>
          <router-link to="/packages">Packages</router-link>
        </li>
        <li>
          <router-link to="/booking">Booking</router-link>
        </li>
        <li>
          <router-link to="/faqs">FAQs</router-link>
        </li>
        <li>
          <router-link to="/gallery">Gallery</router-link>
        </li>
        <li>
          <router-link to="/aboutUs">About Us</router-link>
        </li>
        <li>
          <router-link to="/contactUs">Contact Us</router-link>
        </li>
       
        <div class ="signup-btn-container">
          <button class = "Login-btn">Login</button>
          <button class="signup-btn" style="background-color: lightgreen;">Sign Up</button>
        </div>
        
      </ul>
    </div>

  </nav>
  <main>
    <router-view />
  </main>

</template>

<script>
import { RouterView} from 'vue-router';
import img from '../assets/logo.png';
export default {
    name: 'NavBar',
    img,
    components: {
      RouterView,
    },
};
</script>



<style scoped>

  #logo {
    width: 150px;
    height: 150px;
    display:flex;
    float:right;
    margin-top: 10px;
    margin-right: 75rem;
  


  }
  .nav-bar {
    background-color: none;
    list-style:none;
    margin-left:30rem;
    margin-right: 2rem;
  }
  a:hover {
  background-image: linear-gradient(
  to right,
  #54d6a4,
  #54d6ab 50%,
  #000 50%
);
    background-size: 200% 100%;
    background-position: 100%;
    padding: 5px 0;
    position: relative;
    background-clip: text;
    -webkit-background-clip: text;
   -webkit-text-fill-color: transparent;
    transition: all 0.3s ease-out; 
  }
  
  

  .signup-btn {
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  font-family: 'Fraunces', serif;
  border-radius: 6px;
  display:flex;
  filter: drop-shadow(0px 4px 4px rgb(47,46,46));
  align-items: center;
  justify-content: center;
  height: auto;
  white-space: nowrap;
  margin-left: 10px;

  }
  .signup-btn-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 4.3rem;
    gap: 10px;
    margin-right: 10rem;
  }
  .Login-btn {
    background:none; /* Adjust button color */
    color: rgb(4, 4, 4);
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    font-family: 'Fraunces', serif;
    border-radius: 6px;
    display:flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: auto;
    white-space: nowrap;
    margin-left: 3rem;
  }
  nav ul {
    display: flex;
    list-style: none;
    padding: 0;
  

  }
  nav ul li {
    margin-right: 1px;

  }

  nav ul li a {
    text-decoration: none;
    color: black;
    display: flex;
    font-family: 'Fraunces', serif;
    align-items: left;
    font-size: 18px;
    margin-right: 100%;
    margin:0rem;
    height: 22px;
    width: 6rem;
    margin-top:5rem;
    justify-content: space-evenly;

  }
  main {
    padding: 1em;
  }
</style>
