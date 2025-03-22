<script setup>
 


  </script>

<template>
  <section class="booking">
      <div>
        <img src="../assets/danayas_day.jpg" alt="package_image" id="booking" />
      </div>
      <div class="text-container">
        <h1 class="text">Check-in & Check-out Date</h1>
      </div>

  <div class="process">
  <div class="process-logo">
    <ul class="steps">
      <li class="step active">
        <img src="../assets/calendar.png" alt="calendar">
        <h3>Check-in & Check-out Date</h3>
      </li>
      <li class="step">
        <img src="../assets/bed.png" alt="bed">
        <h3>Select Package & Rate</h3>
      </li>
      <li class="step">
        <img src="../assets/profile.png" alt="profile">
        <h3>Guest Information</h3>
      </li>
      <li class="step">
        <img src="../assets/check.png" alt="check">
        <h3>Booking Confirmation</h3>
      </li>
    </ul>
  </div>
</div>
</section>
</template>
<style scoped>
.dot{
  height: 25px;
  width: 25px;
  background-color: #bbb;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px; /* Adds space between dots */
}
 .cally{
  top: -12rem;
  display: block;
  position: relative;
  margin: auto;
  align-items: center;
  height: 50vh;
  margin-bottom: 20px;
}
  
  .process {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    z-index: -1;

}

.process-logo {
    width: 100%;
    position: relative;

    
}


.steps {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap:40px ;
    list-style: none;
    padding: 0;
    margin: 0;
    position: relative;

}

.step {
    text-align:center;
    flex: 1;
    font-weight: bold;
    color: #777;
    
}

.step img {
    width: 40px;
    height: 40px;
    margin: 10px 0;
    border: 1px solid rgb(93, 85, 85);
    border-radius: 50%;
    padding: 10px;

}
.step::after {
    content: "";
    position: absolute;
    width: 1462px;
    height: 5px;
    display: block;
    top:50px;
    background-color: #ccc;
    left: 0;
    z-index: -1;
}




.step:first-child::after {
    display: none;
}

.active {
    color: #4CAF50;
    margin-top: 15px;
}

.active img {
    filter: brightness(0) saturate(100%) invert(47%) sepia(98%) saturate(450%) hue-rotate(90deg);
}


  .process{
    background-color: #C7E3B6;
    height: 323px;
    width: 100%; 
    margin: 0;
    max-width: 100%;
    position: relative;
    top: -9rem;
    display: flex;
    margin-bottom: 10rem;
    padding: 0;
    flex-direction: column;
    align-items: center;
     
  }
  #booking{
    width: 80rem;
    height: 50vh;
    align-items: center;
    margin-left: 100px;
    border-radius: 25px;

  }
  .text{
    top: -17rem;
    color: white;
    margin-left: 19rem;
    font-size: 80px;
    position: relative;
    display: inline-flex;
    text-align: center;
    text-shadow: 0px 4px 4px rgb(12, 70, 39);
  }
  
</style>