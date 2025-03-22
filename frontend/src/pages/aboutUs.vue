
  
  <script setup>
</script>
<template>
  <div class="containerAbout">
        <div><img src="../assets/danayas_day.jpg" alt="package_image" id="about" class="aboutUs"> </div>
       <div> <h1 class="aboutText" style="text-align: center;"> About us</h1></div>
    </div>
    <article>
        <h2 style="font-weight: bold;font-size: 50px; text-align: center; position: relative; top: -10rem;">Vision & Mission</h2>
        <hr class = "line" style="width: 200px;  margin-bottom:1rem; position: relative;top: -12rem; "></hr>
        <p id="text1">Established in the historic quarter, where cultural legacy meets the sought-after culinary scene, Brook St. is the best kept secret of town, just across the sea front. Its urban renaissance is infusing new vibes and brings back creatives, trend setters and smart investors.</p>
    </article>
    <div class = "imgbr">
        <img src="../assets/aboutbr.jpg" alt="" style="margin: 0; left: 0; right: 0; height: 383px; width:100%; margin-top: -2rem; margin-bottom: 20px;" >
    </div>
    <article>
        <h2 style="font-weight: bold;font-size: 50px; text-align: center; position: relative; top: -1rem;">Our Story</h2>
        <hr class = "line" style="width: 200px;  margin-bottom:1rem; position: relative;top: -3rem; "></hr>

        <p id="text2">Every website has a story, and your visitors want to hear yours. This space is a great opportunity to give a full background on who you are, what your team does, and what your site has to offer. Double click on the text box to start editing your content and make sure to add all the relevant details you want site visitors to know.  If you’re a business, talk about how you started and share your professional journey. Explain your core values, your commitment to customers, and how you stand out from the crowd. Add a photo, gallery, or video for even more engagement.</p>
    </article>
    <div class="location">
        <article>
          <div class="location-text">
             <h1 style="font-weight: bold;font-size: 50px; text-align: center; position: relative; " > Location</h1>
            <p>Established in the historic quarter, where cultural legacy meets the sought-after culinary scene, Brook St. is the best kept secret of town, just across the sea front. Its urban renaissance is infusing new vibes and brings back creatives, trend setters and smart investors.</p></div>
            
            <div id="Gmap" style="margin-bottom: 30px;"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1929.608118783353!2d121
            .12431473799222!3d14.7003600939651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397bb19868e1b37%3A0x429ae5ae7c94d0f2!2s7%20Jones%20Dulong%20Bayan
            %202%2C%20San%20Mateo%2C%20Rizal%20Philippines!5e0!3m2!1sen!2sph!4v1741699299438!5m2!1sen!2sph" width="1108" height="607" style="border:0; border-radius: 10px; margin-top: 40px;"allowfullscreen="" loading="lazy"  
             referrerpolicy="no-referrer-when-downgrade"></iframe></div>
        </article>
    </div>
    <div class="staffData">
      <h1 style="font-weight: bold;font-size: 50px; text-align: center; position: relative; top: "> Meet The Team</h1>
      <hr class = "line" style="width: 200px;  margin-bottom:1rem; position: relative;top: -1rem; "></hr>
      <div class="staff-container">


        <div class="staff-box"> <img class="img" src="../assets/staff.jpg" alt="">
        <div class="img-container">
          <h4><b>Shaian May Tendenilla</b></h4>
          <p>Position: Manager</p>
        </div>
      </div>
        <div class="staff-box"> <img class="img" src="../assets/staff1.jpg" alt="" >
          <div class="img-container">
          <h4><b>Shaian May Tendenilla</b></h4>
          <p>Position: Manager</p>
        </div>
      </div>
        <div class="staff-box"> <img class="img" src="../assets/staff.jpg" alt="">
          <div class="img-container">
          <h4><b>Shaian May Tendenilla</b></h4>
          <p>Position: Manager</p>
        </div>
      </div>
        <div class="staff-box"> <img  class="img" src="../assets/staff1.jpg" alt="">
          <div class="img-container">
          <h4><b>Shaian May Tendenilla</b></h4>
          <p>Position: Manager</p>
        </div>
      </div>
    </div>

    </div>
</template>

<style scoped>
 .aboutUs{
    width: 80rem;
    height: 540px;
    align-items: center;
    margin-left: 100px;
    border-radius: 25px;

  }
  .aboutText{
    top: -25rem;
    color: white;
    margin-left: 38rem;
    font-size: 80px;
    position: relative;
    display: inline-flex;
    text-align: center;
    text-shadow: 0px 4px 4px rgb(12, 70, 39);
  }
  hr {
  border: none;
  border-top: 3px solid #333;
  color: #333;
  text-align: center;
  
}
#text1{
  position: relative;
  text-align: center;
  display: flex;
  top: -11rem;
  text-wrap: 10rem;
  margin-left: 10px;
}
#text2{
  position: relative;
  text-align: center;
  display: flex;
  top: -2rem;
  text-wrap: 10rem;
  margin-left: 10px;
}
#Gmap{
  display: inline-flex;
  margin-left: 40rem;
  width: 50%;
  height: 50vh;
  box-shadow:  1px 10px 10px #7bab81;
  border-radius: 20px;
  top: -6rem;
  position: relative;
  transition: 0.3s;
}
#Gmap:hover{
  box-shadow: 0 8px 16px 0 rgba(14, 180, 47, 0.2);
}
.location-text{
  display: inline-block;
  bottom: -20rem;
  width: 30pc;
  position: relative;
  margin-left: 40px
}
.location{
  margin-top: -2rem;
}
.staff-box{
  box-shadow: 0 4px 10px 0 rgba(0,0,0,0.2);
  transition: 0.3s;
  width: 25%;
  padding: 30px;
  margin-bottom: 20px;
  display: inline-block;
  gap:20rem;
  margin-left: 170px;
  border-radius: 20px;

}
.staff-box:hover{
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
}
.img{
  position: relative;
  height: 50vh;
  width: 100%;
  display: inline-block;
  border-radius: 8px;
}
.staff-container{
  margin-left: 9rem;
}

</style>
