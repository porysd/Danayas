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
    <div
      class="flex gap-20 w-full max-w-6xl px-4 justify-center content-center align-center m-auto"
      style="position: relative; bottom: -5rem"
    >
      <img
        src="../assets/aboutUs1.jpg"
        class="w-2/5 rounded-[20px] mb-4"
        style="border-radius: 20px"
      />
      <div class="flex flex-col justify-center items-center text-center w-4/5">
        <h2 class="font-[Poppins] font-black font-bold relative text-5xl mb-3">
          Vision & Mission
        </h2>

        <hr class="w-40 border-2 mb-4" />

        <p class="mt-10 mb-20">
          Established in the historic quarter, where cultural legacy meets the
          sought-after culinary scene, Brook St. is the best kept secret of
          town, just across the sea front. Its urban renaissance is infusing new
          vibes and brings back creatives, trend setters and smart investors.
        </p>
      </div>
    </div>
  </div>

  <div
    class="flex gap-20 w-full max-w-6xl px-4 content-center align-center justify-center m-auto bottom-[-10rem] relative"
  >
    <div class="flex flex-col justify-center items-center text-center w-4/5">
      <h2 class="font-[Poppins] font-black font-bold relative text-5xl mb-3">
        Our Story
      </h2>

      <hr class="w-40 border-2 mb-4" />

      <p class="mt-10 mb-10">
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
    <img
      src="../assets/aboutUs1.jpg"
      class="w-2/5 rounded-[20px] mb-4"
      style="border-radius: 20px"
    />
  </div>

  <div
    class="staffData gap-20 w-full max-w-6xl px-4 justify-center content-center align-center m-auto"
  >
    <div
      class="flex flex-col justify-center m-auto items-center text-center w-4/5 mb-10"
    >
      <h2 class="font-[Poppins] font-black font-bold relative text-5xl mb-3">
        Meet The Team
      </h2>

      <hr class="w-40 border-2 mb-4" />
    </div>
    <div
      class="staff-image inline-flex gap-10 m-auto justify-center content-center"
    >
      <div class="staff-card">
        <img src="../assets/staff.jpg" alt="Shaina" />
        <div class="staff-overlay">
          <h3>Shaina May Tendenilla</h3>
          <a
            href="https://www.facebook.com/photo/?fbid=970067787886190&set=a.103485781211066"
            target="_blank"
          >
            <img
              src="..//assets/facebookneon.jpg"
              alt="Facebook"
              style="
                border-radius: 50%;
                object-fit: cover;
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
      <div class="staff-card">
        <img src="../assets/staff.jpg" alt="Shaina" />
        <div class="staff-overlay">
          <h3>Shaina May Tendenilla</h3>
          <a
            href="https://www.facebook.com/photo/?fbid=970067787886190&set=a.103485781211066"
            target="_blank"
          >
            <img
              src="..//assets/facebookneon.jpg"
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

      <div class="staff-card">
        <img src="../assets/staff.jpg" alt="Shaina" />
        <div class="staff-overlay">
          <h3>Shaina May Tendenilla</h3>
          <a
            href="https://www.facebook.com/photo/?fbid=970067787886190&set=a.103485781211066"
            target="_blank"
          >
            <img
              src="..//assets/facebookneon.jpg"
              alt="Facebook"
              style="
                border-radius: 50%;
                object-fit: cover;
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

      <div class="staff-card">
        <img src="../assets/staff.jpg" alt="Shaina" />
        <div class="staff-overlay">
          <h3>Shaina May Tendenilla</h3>
          <a
            href="https://www.facebook.com/photo/?fbid=970067787886190&set=a.103485781211066"
            target="_blank"
          >
            <img
              src="..//assets/facebookneon.jpg"
              alt="Facebook"
              style="
                border-radius: 50%;
                object-fit: cover;
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
    </div>
  </div>
  <Footer />
</template>

<style scoped>
h3 {
  margin-top: 21rem;
  margin-left: 10px;
  font-size: 25px;
  font-weight: 600;
}
.staff-card {
  position: relative;
  width: 280px;
  height: 500px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.staff-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.staff-overlay {
  position: absolute;
  top: 0;
  left: 0;
  filter: blur(10px 10px 4px);
  width: 100%;
  height: 100%;
  background-color: rgba(10, 124, 66, 0.6); /* Black with opacity */
  display: flex;
  flex-direction: column;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}
a {
  position: relative;
  left: -4rem;
}

.staff-card:hover .staff-overlay {
  opacity: 1;
}

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

.staffData {
  position: relative;
  margin: auto;
  justify-content: center;
  align-items: center;
  align-content: center;
  margin-top: 20rem;
}

.img {
  position: relative;
  height: 50vh;
  width: 100%;
  display: inline-block;
  border-radius: 8px;
}
</style>
