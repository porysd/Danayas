<script setup>
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";
</script>

<template>
  <NavBar />

  <div class="contactContainer">
    <img
      src="../assets/danayas_day.jpg"
      alt="package_image"
      class="contactUs"
    />
    <h1 class="ContactText">Contact Us</h1>
  </div>

  <div class="contactus-container px-4">
    <h2 class="font-[Poppins] font-black text-center mt-10 text-5xl">
      Connect With Us!
    </h2>
    <p class="text-center max-w-3xl mx-auto mt-5 text-gray-700">
      At Danayas Resorts, we are here to help you create the perfect event.
      Whether you’re planning a wedding, a corporate retreat, or a family
      gathering, our team is ready to assist with every detail. Feel free to
      reach out to us for inquiries, bookings, or more information about our
      services. We look forward to helping you bring your vision to life and
      making your event a truly unforgettable experience. Contact us today, and
      let’s start planning!
    </p>

    <div
      class="contactSec flex flex-col lg:flex-row gap-10 max-w-7xl mx-auto mt-20 w-[85rem]"
    >
      <div class="flex-1">
        <div class="space-y-4">
          <input class="packInput" type="text" placeholder="Name" />
          <input class="packInput" type="email" placeholder="Email Address" />
          <input class="packInput" type="tel" placeholder="Contact No." />
          <textarea
            class="packInput h-32 resize-none"
            placeholder="Message..."
          ></textarea>
        </div>

        <!-- Social Links -->
        <div class="flex gap-5 mt-6">
          <a
            href="https://www.facebook.com/profile.php?id=61552657702549"
            target="_blank"
          >
            <img
              src="../assets/facebookneon.jpg"
              alt="Facebook"
              class="w-10 h-10 rounded-full object-cover"
            />
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61552657702549"
            target="_blank"
          >
            <img
              src="../assets/facebookneon.jpg"
              alt="Facebook"
              class="w-10 h-10 rounded-full object-cover"
            />
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61552657702549"
            target="_blank"
          >
            <img
              src="../assets/facebookneon.jpg"
              alt="Facebook"
              class="w-10 h-10 rounded-full object-cover"
            />
          </a>
        </div>
        <div
          class="SubmitButton bg-[#194d1d] text-white rounded-br-[30px] hover:bg-green-800 font-medium rounded-tl-[5px] w-[200px] h-[50px] mt-[-3rem] ml-[28rem] text-[20px] p-[10px] text-center break-words cursor-pointer flex justify-center items-center"
        >
          <button>SUBMIT</button>
        </div>
      </div>

      <div class="flex-1">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1929.608118783353!2d121.12431473799222!3d14.7003600939651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397bb19868e1b37%3A0x429ae5ae7c94d0f2!2s7%20Jones%20Dulong%20Bayan%202%2C%20San%20Mateo%2C%20Rizal%20Philippines!5e0!3m2!1sen!2sph!4v1741699299438!5m2!1sen!2sph"
          width="100%"
          height="400"
          class="rounded-xl border-0 w-full"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  </div>

  <Footer />
</template>

<style scoped>
.contactContainer {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 540px;
  width: 85rem;
  margin: auto;
  border-radius: 25px;
  overflow: hidden;
}

.contactUs {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ContactText {
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

.packInput {
  width: 100%;
  padding: 10px;
  border: 1px solid #41ab5d;
  background-color: #fcfcfc;
  border-radius: 10px;
}
</style>
