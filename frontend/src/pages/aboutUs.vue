<script setup>
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";
</script>

<template>
  <NavBar />
  <div class="ContainerAbout">
    <img
      src="../assets/danayas_day.jpg"
      alt="package_image"
      id="about"
      class="aboutUs"
    />
    <h1 class="AboutText" style="text-align: center">About Us</h1>
  </div>

  <div class="AboutSection">
    <div class="mb-10 mt-10">
      <h2
        class="font-[Poppins] font-black text-center top-[-2 rem] font-bold relative text-5xl mb-3"
      >
        Vision & Mission
      </h2>
      <hr
        class="line w-40 border-3 relative top-[-0rem] flex flex-auto m-auto justify-center content-center mb-4"
      />
      <p class="m-auto text-center w-200 mt-10">
        Established in the historic quarter, where cultural legacy meets the
        sought-after culinary scene, Brook St. is the best kept secret of town,
        just across the sea front. Its urban renaissance is infusing new vibes
        and brings back creatives, trend setters and smart investors.
      </p>
    </div>
    <div class="imgbr">
      <img class="h-[383px] w-full" src="../assets/aboutbr.jpg" alt="" />
    </div>
    <div class="mb-20 mt-20">
      <h2
        class="font-[Poppins] font-black text-center top-[-2 rem] font-bold relative text-5xl mb-3"
      >
        Our Story
      </h2>

      <hr
        class="line w-40 border-4 relative top-[-0rem] flex flex-auto m-auto justify-center content-center mb-4"
      />

      <p class="text2 m-auto mt-10 text-center w-200">
        Every website has a story, and your visitors want to hear yours. This
        space is a great opportunity to give a full background on who you are,
        what your team does, and what your site has to offer. Double click on
        the text box to start editing your content and make sure to add all the
        relevant details you want site visitors to know.  If you’re a business,
        talk about how you started and share your professional journey. Explain
        your core values, your commitment to customers, and how you stand out
        from the crowd. Add a photo, gallery, or video for even more engagement.
      </p>
    </div>
    <div class="location">
      <article>
        <div class="location-text">
          <h1
            style="
              font-weight: bold;
              font-size: 50px;
              text-align: center;
              position: relative;
            "
          >
            Location
          </h1>
          <p>
            Established in the historic quarter, where cultural legacy meets the
            sought-after culinary scene, Brook St. is the best kept secret of
            town, just across the sea front. Its urban renaissance is infusing
            new vibes and brings back creatives, trend setters and smart
            investors.
          </p>
        </div>

        <div id="Gmap">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1929.608118783353!2d121
            .12431473799222!3d14.7003600939651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397bb19868e1b37%3A0x429ae5ae7c94d0f2!2s7%20Jones%20Dulong%20Bayan
            %202%2C%20San%20Mateo%2C%20Rizal%20Philippines!5e0!3m2!1sen!2sph!4v1741699299438!5m2!1sen!2sph"
            width="1108"
            height="607"
            style="border: 0; border-radius: 10px; margin-top: 40px"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </article>
    </div>
    <div class="staffData">
      <h1
        style="
          margin-top: 10rem;
          font-weight: bold;
          font-size: 50px;
          text-align: center;
          position: relative;
        "
      >
        Meet The Team
      </h1>
      <hr
        class="line w-40 border-4 relative top-[-0rem] mb-[5rem] flex flex-auto m-auto justify-center content-center"
      />
      <div class="staff-container">
        <div class="staff-box">
          <img class="img" src="../assets/staff.jpg" alt="staff" />
          <div class="img-container">
            <h4><b>Shaian May Tendenilla</b></h4>
            <p>Position: Manager</p>
          </div>
        </div>
        <div class="staff-box">
          <img class="img" src="../assets/staff1.jpg" alt="staff1" />
          <div class="img-container">
            <h4><b>Shaian May Tendenilla</b></h4>
            <p>Position: Manager</p>
          </div>
        </div>
        <div class="staff-box">
          <img class="img" src="../assets/staff.jpg" alt="staff" />
          <div class="img-container">
            <h4><b>Shaian May Tendenilla</b></h4>
            <p>Position: Manager</p>
          </div>
        </div>
        <div class="staff-box">
          <img class="img" src="../assets/staff1.jpg" alt="staff1" />
          <div class="img-container">
            <h4><b>Shaian May Tendenilla</b></h4>
            <p>Position: Manager</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<style scoped>
.ContainerAbout {
  position: relative;
  width: 85rem;
  justify-content: center;
  align-items: center;
  height: 400px;
  margin: auto;
  border-radius: 25px;
  overflow: hidden;
}

.aboutUs {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.AboutText {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 80px;
  font-weight: bold;
  color: white;
  text-shadow: 0px 4px 4px rgb(12, 70, 39);
  text-align: center;
}

#Gmap {
  display: flex;
  margin: 0;
  margin-left: 45rem;
  box-shadow: 1px 10px 10px #7bab81;
  border-radius: 20px;
  width: 40%;
  justify-content: center;
  align-items: center;

  top: -6rem;
  position: relative;
  transition: 0.3s;
}
#Gmap:hover {
  box-shadow: 0 8px 16px 0 rgba(14, 180, 47, 0.2);
}
.location-text {
  display: inline-block;
  bottom: -20rem;
  width: 30pc;
  position: relative;
  margin-left: 40px;
}
.location {
  margin-top: -2rem;
  margin-bottom: 5rem;
  width: fit-content; /* Ensures the width matches content */
  margin-left: auto;
  margin-right: auto;
  display: flex; /* Ensures content inside stays centered */
  justify-content: center;
  align-items: center;
}
.staff-box {
  box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  width: 25%;
  padding: 30px;
  margin-bottom: 20px;
  display: inline-block;
  gap: 20rem;
  margin-left: 170px;
  border-radius: 20px;
}
.staffData {
  position: relative;
  margin: auto;
  justify-content: center;
  align-items: center;
  top: -5rem;
}
.staff-box:hover {
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
}
.img {
  position: relative;
  height: 50vh;
  width: 100%;
  display: inline-block;
  border-radius: 8px;
}
.staff-container {
  margin-left: 9rem;
}
</style>
