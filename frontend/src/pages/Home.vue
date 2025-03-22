<template>
<div section="home">
    <div class ="container">
        <div class="danayas-slide" :style="{ backgroundImage: `url(${currentImage})` }"></div>
         <div class = "datePicker-background">
          <label for="CheckIn" id = "from">FROM </label> 
            <input type="date" class="check-in">
            <label for="CheckOut" id = "to">TO</label>
            <input type ="date" class="check-out"scope>
            <button @click = "showDatePicker =!showDatePicker"class="Availability" style="margin: auto 0 auto 30px; width: 200px; height: 55px; border-radius: 18px; color :white; text-align: center; background-color:#194D1D;">Check Availability </button>
          </div>

  <div class="datePicker" style="background-color: #C7E3B6; width: 70rem; margin-left: 150px;  border-radius: 20px; display: flex; align-items: center;">
    <calendar-date v-if="showDatePicker" class="cally" style="background-color: white; border: 1px solid #d1d5db; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; padding: 10px;">
          <svg aria-label="Previous" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
          </svg>
         <svg aria-label="Next" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
         </svg>
       <calendar-month></calendar-month>
    </calendar-date>
    <calendar-date v-if="showDatePicker" class="cally" style="background-color: white; border: 1px solid #d1d5db; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; padding: 10px;">
          <svg aria-label="Previous" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
          </svg>
         <svg aria-label="Next" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
         </svg>
       <calendar-month></calendar-month>
    </calendar-date>
     <div v-if="showDatePicker" class= "Status"> 
      <h1 style="text-align: center;">Status</h1>
     <span  class="dot" id="Available" style="background-color:#4BB344;"> <label for="dot" style="margin-left:50px;"> AVAILABLE</label></span>
      <span class="dot" id="FullyBooked" style="background-color:#FF2D55;"> <label for="dot" style="margin-left:50px; width: 145px; font-size: 16px;"> FULLY BOOKED</label></span>
      <span class="dot" id= "DayAvailble"style = "background-color: #3EDFFF;"> <label for="dot" style="margin-left:50px; width: 145px;"> DAY AVAILABLE</label></span>
      <span class="dot" id ="NightAvailble" style="background-color: #1714BA;"> <label for="dot" style="margin-left:50px; text-align: center; width: 145px;"> NIGHT AVAILABLE</label></span>

      <button id= "Availablity" style="background-color: #194D1D; text-align: center; color: white; border-radius: 20px; font-size: 16px; width: 200px; height: 50px;"> CHECK AVAILABILITY</button>
      </div>

     
    </div>
    </div>
   
</div>

         <div class = "text-wrap">
                <p id="p.text"style ="font-size:20px;"> the ordinary  and experience the best comfort zone at Danayas Resort <br>
                     where every sunrise bring serenity and tells every story.” </p>
         </div>

    <div class = " features-background ">
        <div class ="feature-image">
         <img src="../assets/danayas.jpg" alt="feature1" style="width:40rem; height: 480px; border-radius: 30px;"></div>
             <div class ="text">
                <h1 style="color:#000;font-weight:bold;font-family:Libre Baskerville; font-size: 28px;">FEATURES</h1>
                <hr class = "line" style="width: 500px;  margin-bottom:1rem;"></hr>
                <p>Relax and rejuvenate your body and soul experience the best of luxury and comfort <br>
                     Immerse yourself in the seamless fusion of timeless architecture and modern design,<br> where each home
                     tells a story of its own</p>
            </div>
      </div>
                
    <div class ="DiscountBackground">
        <div class ="discount-text">
            <h1 id ="title">DISCOUNT FOR HOLIDAY AND EVENTS?</h1>
            <p id = "discountText">I'm a paragraph. Click here to add your own text 
            and<br>edit me. I'm a great place for you to tell a story and let <br> your users know a 
            little more about you.</p>
        </div>
   </div>
       
 <section class="Danayas-packages">
    <div class = "DanayasPackages">
        <div>
            <hr><h1 id = "titlePackage" style="font-size: 35px;">Danayas Packages</h1><hr>
        </div>   
       <p id = "text-packages">“Immerse yourself in the seamless fusion of timeless architecture and modern design, 
        where each home tells a story of its own”</p>
        <button class ="SeePackages" id="SeeAll">SEE ALL PACKAGES</button>
    </div>
     <div class = "Packages">
        <div class="Package1  ">
            <img src="../assets/danayas_day.jpg" alt="card2" class="card1">
            <div id = "titlePackage"> Package 1</div>
            <div  class ="P1">I'm a paragraph. Click here to add your own  text and edit me I’m a great place for you to tell a story and let your users know a little more about you.</div>
            <div class = detailsBtn><button id="detailsBtn">See all details</button></div>
        </div>  
        
        <div class="Package2  ">
            <img src="../assets/danayas_day.jpg" alt="card2" class="card1">
            <div id = "titlePackage"> Package 1</div>
            <div  class ="P1">I'm a paragraph. Click here to add your own  text and edit me I’m a great place for you to tell a story and let your users know a little more about you.</div>
            <div class = detailsBtn><button id="detailsBtn">See all details</button></div>
         </div>
    </div> 
</section>

    <section class =" DanayasAddress" style="background-color:#C7E3B6; width: 82rem;
        height: 50rem;
        margin-top: 10rem;
        padding: 5rem;">
    <div class = "AddressBackgound"style ="text-align: center;">     
        <div class = "Danayas Adddress "
        style="font-family:'Poppins'; font-weight:bold;
        font-size: 56px; text-align: center; 
        margin-bottom:1rem; margin-top: 1px;">Danayas Address </div>
        <div id = "Address-p" style="font-size: 20px; font-weight: 400; color: black; "> 7 Jones Dulong Bayan 2, San Mateo, <br> Rizal Philippines</div>
        <div id="googleMap" style="margin-bottom: 30px;"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1929.608118783353!2d121
            .12431473799222!3d14.7003600939651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397bb19868e1b37%3A0x429ae5ae7c94d0f2!2s7%20Jones%20Dulong%20Bayan
            %202%2C%20San%20Mateo%2C%20Rizal%20Philippines!5e0!3m2!1sen!2sph!4v1741699299438!5m2!1sen!2sph" width="1108" height="607" style="border:0; border-radius: 10px; margin-top: 40px;"allowfullscreen="" loading="lazy"  
             referrerpolicy="no-referrer-when-downgrade"></iframe></div>
        <button onclick="ViewMap" class="MapBtn" id="MapBtn"> VIEW LARGE MAP</button>
    </div>
    </section>

    <div id="wrapper">
      <div>
        <h1 style="text-align: center;"> Guest Reviews</h1>
        <p style="text-align: center;">YOUR OPINIONS MATTERS </p>
      </div>
     
    <div id="carousel" ref="carousel">
      <div class="carousel-item" v-for="(item, index) in items" :key="index">
        <img :src="item.image" :alt="'Slide ' + (index + 1)" />
      </div>
    </div>

    <div class="controls" >
      <button @click="prevSlide"id ="BtnControls1">❮</button>
      <button @click="nextSlide"id ="BtnControls2">❯</button>
    </div>
  </div>


</template>


<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import img from '../assets/danayas_day.jpg';
import img1 from '../assets/danayas_night.jpg';
import img2 from '../assets/danayas_event.jpg';
import img3 from '../assets/danayas_event1.jpg';
import image1 from '../assets/feedback1.jpg';
import image2 from '../assets/feedback2.jpg';
import image3 from '../assets/feedback3.jpg';
import image4 from '../assets/danayas.jpg';
import "cally"



    // **Section 1: Automatic Image Slider**
    let images = [img, img1, img2, img3];
    const currentIndex = ref(0);
    const currentImage = ref(images[currentIndex.value]);
    let interval = null;

    const changeImage = () => {
      currentIndex.value = (currentIndex.value + 1) % images.length;
      currentImage.value = images[currentIndex.value];
    };

    onMounted(() => {
      interval = setInterval(changeImage, 6000);
    });

    onUnmounted(() => {
    clearInterval(interval);
    
    return { currentImage };

    });
   
const carousel = ref(null);
const rotation = ref(0);
const rotation2 = ref(0);
let timeTillSwap = ref(0);
let autoRotate = null;

const items = [
  { id: 1, image: image1 },
  { id: 2, image: image2 },
  { id: 3, image: image3},
  { id: 4, image:image4 }
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
//calendar apperance

const date = ref('');
const showDatePicker = ref(false);


</script>


<style scoped>
#wrapper {
  display: grid;
  place-items: center;
  height: 100vh;
  width: 100%;
  perspective: 1000px;
}

#carousel {
  position: relative;
  width: 200px;
  height: 300px;
  transform-style: preserve-3d;
  transition: transform 0.5s;
  margin-top: 10px;
  margin-bottom: 100px;

}

.carousel-item {
  position: absolute;
  width: 200px;
  height: 300px;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
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
  border-radius: 2rem;
}

.controls {
  position: absolute;
    top: 60%;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 24px;

}


#BtnControls1 {
  font-size: 100px;
  cursor: pointer;
  color: #101010;
  border: none;
  background: none;
  font-size: 50px;
  justify-content: space-between;
  margin-left: 20px;
  
}
#BtnControls2 {
  font-size: 100px;
  cursor: pointer;
  color: #101010;
  border: none;
  background: none;
  font-size: 50px;
  margin-left: 70rem;
  display: inline-block;
}



.danayas-slide{
  width: 85rem;
  height: 540px;
  border-radius: 30px;
  background-size: cover;
  background-position: center;
  transition: background-image 1s ease-in-out;
  margin-top: 10px;
  margin: auto;
  position: relative;
}

.home { 
    margin-top: 50px;
}

h1 {
    color: #0d0d0d;
}

.cally{
  display: inline-flex;
  align-items: center;
  margin-top: 10px;
  padding: 10px;
  margin-left: 6rem;
  margin-bottom: 10px;
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
.Status{
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 70px;

}

.datePicker-background{
    background-color: #FCFCFC;
    width: 1065px;
    height: 174px;
    top:-80px;
    margin-left: 200px;
    margin-right: 200px;
    position: relative;
    display: flex;
    filter: drop-shadow(0px 4px 4px rgb(47, 46, 46));
    opacity:95%;
    border-radius: 20px;
}

#from{
    font-size: 18px;
    font-family: 'Fraunces', serif;
    margin-left: 10rem;
    margin-top: 75.10px;
    font-weight: bold;
}

#to{
    font-size: 18px;
    font-family: 'Fraunces', serif;
    font-weight: bold;
    text-align: center;
    margin-top: 75.10px;

    margin-left:10px;
}


.check-in{
    background-color: #A4C3A2;
    width: 250px;
    margin-left: 10px;
    height: 60px;
    font-size: 18px;
    display: flex;
    font-family: 'Fraunces', serif;
    box-shadow:0px 0px 0px 0.2px #1152D4 inset;
    border-radius: 10px;
    margin-top: 50px;
}

.check-out{
    background-color: #A4C3A2;
    width: 250px;
    height: 60px;
    margin-left: 10px;
    font-size: 18px;
    display: flex;
    font-family: 'Fraunces', serif;
    box-shadow:0px 0px 0px 0.2px #1152D4 inset;
    border-radius: 10px;
    margin-top: 50px;
}

.text-wrap{
    width: 999px;
    height: 128px;
    margin-top: 45px;
    font-family: 'Fraunces', serif;
    font-weight: bold;
    color: #000000;
    text-align: center;
    line-height: 1.9;
    margin-left:30%;
    margin-bottom: 35px;
}


.features-background{
    height: 300px;
    margin: auto;
    width: 85rem;
    background-color: #B4D6A3;
    border-radius: 18px;
    margin-top:10%;
    transition: ease-in-out 2s;
    }
    .feature-background:hover{
        width:300px
    }

    
    
.feature-image{
    margin-top: 10px;
    margin-left: 50px;
    box-shadow:10px 10px 4px 2px lightgreen ;
}


.feature-image,.features-background{
    display: flex;
    justify-content: center;
    align-items: center;

}

.text{
    margin-top: 10rem;
    margin-bottom: 13%;
    border-radius: 10px;
    margin-right:9rem;
    margin-left:40px;
    font-family: 'Fraunces', serif;
    font-size: 20px;
    font-weight: semi-bold;
    color: #000000;
    text-align: justify;
    line-height: 1.9;
    width: 1500px;
}
.DiscountBackground{
 background-color: #C7E3B6;
 height:250px; 
 margin-top:20% ;
 margin-bottom: 10%;

} 
.discount-text{
    color: #000;
    line-height: 1.2;   
    margin-left: 30px;
    margin-bottom:10px;
    margin-top: 2px;
    padding: 4rem;
    width: 687px;


}
#title{
    font-weight:semi-bold;
    color: #000;
    width: 811px;
    font-size: 29px;
    font-family: 'Fraunces', serif;
    margin-top: 2px;
    margin-bottom: 20px;

}
p{
     font-family: Libre Baskerville;
     font-size: 24px;
     width: 600px;
     font-weight:regular;
}
#p.text{
    font-size: larges;
}
.DanayasPackages{
    width:999px;
    height: 128px;
    text-align: center;
    padding:20px;
    margin-top: 10rem;
    margin: auto;
    margin-bottom: 10rem;
}
.Packages{
    margin: auto;
    margin-left: 10rem;

}


#titlePackage{
    text-align: center;
    margin-bottom: 10px;
    font-weight: bolder;
    margin: auto;
    font-size:60px;
    color: #000;
    font-family:'Fraunces',serif
}
#text-packages{
    text-align: center;
    display: flex;
    margin-left: 10rem;
    font-size: 25px;
    width: 800px;
    margin: auto;
    height: 128px;
    font-weight:regular;
    font-family: 'fraunces','serif';
    justify-items: center;

}
#SeeAll{
    background-color:#194D1D;
    color:#FFFFFF;
    width: 299px;
    border: 1px seagreen;
    height: 50px;
    filter: drop-shadow(0px 4px 4px rgb(47,46,46));
    font-family: Libre Baskerville;
    border-radius: 6px;
}
.Package1{
    background: #FCFCFC;
    width:350px;
    height: 460px;
    border-radius: 20px;
    filter: drop-shadow(0px 4px 4px rgb(47,46,46));
    align-items: center;
    margin-top: 100px;
    display: inline-block;
    margin-left: 100px;
    
}
.Package2{
    background: #FCFCFC;
    width:350px;
    height: 460px;
    border-radius: 20px;
    filter: drop-shadow(0px 4px 4px rgb(47,46,46));
    align-items: center;
    display: inline-block;
    margin-left: 15rem;
    margin-top: 100px;
}
.card1{
height: 10rem;
width: 330px;
height: 300px;
border-radius: 40px;

}
.P1{
color: rgb(21, 21, 21);
font-weight: regular;
font-family:'fraunces',serif;
font-size: 14px;
word-wrap: break-word;
}
.detailsBtn{
 width: 350px;
 margin: none;
 height: 40px;
 border: none;
 text-align: center;;
 word-wrap: break-word;
 background-color: #194D1D;
 border-bottom-left-radius: 10px;
 border-bottom-right-radius: 10px;
 margin-top: 10%;
 
 
}
#detailsBtn{
    background: transparent;
    border: none;
    color: rgb(252, 252, 254);
    margin-top: 10px;
    font-size: 15px;

}
.card1, .P1{
padding-left: 10px;
padding-right: 10px;
padding-top: 10px;

}
#titlePackage{
    font-size: 20px;
    font-weight: bold;
    margin-top: 10px;

}
.danayas-packages{
    margin: auto;
}

p{
    font-size: 15px;
}

hr {
  border: none;
  border-top: 3px double #333;
  color: #333;
  overflow: visible;
  text-align: center;
  height: 5px;
  
}

hr::after {
  background: #fff;
  content: "§";
  padding: 0 4px;
  position: relative;
  top: -13px;
}
.MapBtn{
 width: 350px;
 margin: none;
 height: 40px;
 text-align: center;;
 word-wrap: break-word;
 background-color: #194D1D;
 border-radius:6px ;
 margin-top: 10%;
 
 
}
#MapBtn{
    border: none;
    color: rgb(247, 247, 247);
    margin-top: 10px;
    font-size: 15px;
}

</style>
