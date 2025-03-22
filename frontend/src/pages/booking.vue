
  
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
  <div class="datePicker" style="background-color:none; width: 70rem; margin-left: 150px;  border-radius: 20px; display: flex; align-items: center;">
    <calendar-date class="cally" style="background-color: #C7E3B6; border: 1px solid #d1d5db; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; padding: 10px;">
          <svg aria-label="Previous" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
          </svg>
         <svg aria-label="Next" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
         </svg>
       <calendar-month></calendar-month>
    </calendar-date>
    <calendar-date class="cally" style="background-color: #C7E3B6; border: 1px solid #d1d5db; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; padding: 10px;">
          <svg aria-label="Previous" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
          </svg>
         <svg aria-label="Next" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
         </svg>
       <calendar-month></calendar-month>
    </calendar-date>
</div>


<div class= "Status-br" style="background-color: #C7E3B6; ">
  <div class="status">
    <div class="A-F">
      <span  class="dot" id="Available" style="background-color:#4BB344;"> <label for="dot" style="margin-left:50px;"> AVAILABLE</label></span>
      <span class="dot" id="FullyBooked" style="background-color:#FF2D55;"> <label for="dot" style="margin-left:50px; width: 145px; font-size: 16px;"> FULLY BOOKED</label></span>
    </div>
    
      <div class="D-A">
        <span class="dot" id= "DayAvailble"style = "background-color: #3EDFFF;"> <label for="dot" style="margin-left:50px; width: 145px;"> DAY AVAILABLE</label></span>
        <span class="dot" id ="NightAvailble" style="background-color: #1714BA;"> <label for="dot" style="margin-left:50px; text-align: center; width: 145px;"> NIGHT AVAILABLE</label></span>
      </div>
  </div>
  </div>

<div class = "check-status">
  <input type="checkbox" class="checkbox"style="border: 3px solid black">
  <label class="label-status">DAY</label>
  <input type="checkbox" class="checkbox"><label class="label-status">NIGHT</label>
  <input type="checkbox" class="checkbox"><label class="label-status">22 hours</label>
</div>

<a href="./BookingSelect.vue">
  <button @click="" style="height: 60px; width:230px;color: white; border-radius: 10px; background-color: #194D1D;
  font-weight: bold; font-size: 25px; border: none; 
  margin-left: 70rem; position: relative;top:-6.2rem; cursor: pointer;">BOOK</button>
</a>



  </section>
</template>

  
  <style scoped>
  .status{
    align-items:center ;
    justify-content: center;
    margin-top: 5rem;
    margin-left: 25rem;
    
}
  .checkbox{
    height: 50px;
    width: 50px;
    margin-left: 15px;
  }
  .label-status{
     position: relative;
     font-size: 20px;
     top: -1rem;

  }
  
  
  .D-A{
  top: -5rem;
  display: block;
  position: relative;
  margin-left: 30rem;
  align-items: center;
  }

.A-F{
  margin-right: 10rem;

}

  .Status-br{
  display:  inline-flex;
  width: 100%;
  height: 30vh;
  top: -7rem;
  position: relative;

}
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
  