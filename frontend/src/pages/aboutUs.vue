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
      style="position: relative; bottom: -10rem; margin-bottom: 100px"
    >
      <img
        v-animateonscroll="{
          enterClass:
            'animate-enter fade-in-10 slide-in-from-r-9 animate-duration-1000',
          leaveClass: 'animate-leave fade-out-0',
        }"
        src="../assets/Team1.jpg"
        class="w-2/5 rounded-[20px] mb-4"
        style="border-radius: 20px"
      />
      <div
        class="flex flex-col justify-center items-center text-center w-4/5"
        v-animateonscroll="{
          enterClass:
            'animate-enter fade-in-10 slide-in-from-l-8 animate-duration-1000',
          leaveClass: 'animate-leave fade-out-0',
        }"
      >
        <h2 class="font-[Poppins] font-black relative text-5xl mb-3">
          Vision & Mission
        </h2>

        <hr class="w-40 border-2" />

        <p class="mt-10 mb-20">
          At Danayas Resorts, we strive to be the leading destination for
          unforgettable events, renowned for our exceptional service, beautiful
          settings, and seamless experiences. Our mission is to provide a
          personalized and memorable venue where every gathering, from weddings
          to corporate retreats, is executed with the highest standards of care
          and attention. We are committed to creating lifelong memories for our
          guests by offering innovative solutions, maintaining a focus on
          customer satisfaction, and continuously improving our services. With
          every event, we aim to exceed expectations and celebrate life’s most
          cherished moments.
        </p>
      </div>
    </div>
  </div>

  <div
    class="flex gap-20 w-full max-w-6xl px-4 content-center align-center justify-center m-auto bottom-[-10rem] relative"
  >
    <div
      class="flex flex-col justify-center items-center text-center w-4/5"
      v-animateonscroll="{
        enterClass:
          'animate-enter fade-in-10 slide-in-from-l-8 animate-duration-1000',
        leaveClass: 'animate-leave fade-out-0',
      }"
    >
      <h2 class="font-[Poppins] font-black relative text-5xl mb-3">
        Our Story
      </h2>

      <hr class="w-40 border-2 mb-4" />

      <p class="mt-10 mb-10">
        Danayas Resorts began as a small family-run retreat with a vision to
        offer a unique place where people could celebrate life’s most
        significant moments. Over the years, it grew into a leading events
        venue, known for its commitment to exceptional service and unforgettable
        experiences. Today, Danayas continues to provide personalized, seamless
        events, from weddings to corporate retreats, ensuring every guest leaves
        with lasting memories. With a dedicated team and a passion for
        excellence, Danayas remains a trusted partner in celebrating life's
        milestones.
      </p>
    </div>
    <img
      v-animateonscroll="{
        enterClass:
          'animate-enter fade-in-10 slide-in-from-r-9 animate-duration-1000',
        leaveClass: 'animate-leave fade-out-0',
      }"
      src="../assets/BG1.jpg"
      class="w-2/5 rounded-[20px] mb-4"
      style="border-radius: 20px"
    />
  </div>

  <div
    class="staffData gap-20 w-full max-w-6xl px-4 justify-center m-auto flex flex-col items-center"
  >
    <div class="flex flex-col justify-center items-center text-center w-full">
      <h2 class="font-[Poppins] font-black text-5xl mb-3">Meet The Team</h2>
      <hr class="w-40 border-2" />
    </div>

    <!-- Ensure this container stays in a row -->
    <div class="staff-image flex justify-center block gap-2">
      <div
        class="staff-card"
        v-animateonscroll="{
          enterClass:
            'animate-enter fade-in-10 zoom-in-50 slide-in-from-t-20 animate-duration-1000',
        }"
      >
        <img src="../assets/Junnil.jpg" alt="Shaina" />
        <div class="staff-overlay">
          <h3>Shaina May Tendenilla</h3>
          <a
            href="https://www.facebook.com/profile.php?id=61552657702549"
            target="_blank"
          >
            <img
              src="../assets/facebookneon.jpg"
              alt="Facebook"
              style="
                border-radius: 50%;
                object-fit: cover;
                margin: auto;
                margin-top: 5px;
                width: 40px;
                height: 40px;
              "
            />
          </a>
        </div>
      </div>

      <div
        class="staff-card"
        v-animateonscroll="{
          enterClass:
            'animate-enter fade-in-10 zoom-in-50 slide-in-from-t-20 animate-duration-1000',
        }"
      >
        <img src="../assets/Angela.jpg" alt="Shaina" />
        <div class="staff-overlay">
          <h3>Shaina May Tendenilla</h3>
          <a
            href="https://www.facebook.com/profile.php?id=61552657702549"
            target="_blank"
          >
            <img
              src="../assets/facebookneon.jpg"
              alt="Facebook"
              style="
                border-radius: 50%;
                object-fit: cover;
                margin: auto;
                margin-top: 5px;
                width: 40px;
                height: 40px;
              "
            />
          </a>
        </div>
      </div>

      <div
        class="staff-card"
        v-animateonscroll="{
          enterClass:
            'animate-enter fade-in-10 zoom-in-50 slide-in-from-t-20 animate-duration-1000',
        }"
      >
        <img src="../assets/Hiraku.jpg" alt="Shaina" />
        <div class="staff-overlay">
          <h3>Shaina May Tendenilla</h3>
          <a
            href="https://www.facebook.com/profile.php?id=61552657702549"
            target="_blank"
          >
            <img
              src="../assets/facebookneon.jpg"
              alt="Facebook"
              style="
                border-radius: 50%;
                object-fit: cover;
                margin: auto;
                margin-top: 5px;
                width: 40px;
                height: 40px;
              "
            />
          </a>
        </div>
      </div>

      <div
        class="staff-card"
        v-animateonscroll="{
          enterClass:
            'animate-enter fade-in-10 zoom-in-50 slide-in-from-t-20 animate-duration-1000',
        }"
      >
        <img src="../assets/Jaimee.jpg" alt="Shaina" />
        <div class="staff-overlay">
          <h3>Shaina May Tendenilla</h3>
          <a
            href="https://www.facebook.com/profile.php?id=61552657702549"
            target="_blank"
          >
            <img
              src="../assets/facebookneon.jpg"
              alt="Facebook"
              style="
                border-radius: 50%;
                object-fit: cover;
                margin: auto;
                margin-top: 5px;
                width: 40px;
                height: 40px;
              "
            />
          </a>
        </div>
      </div>
      <div
        class="staff-card"
        v-animateonscroll="{
          enterClass:
            'animate-enter fade-in-10 zoom-in-50 slide-in-from-t-20 animate-duration-1000',
        }"
      >
        <img src="../assets/Darya.jpg" alt="Shaina" />
        <div class="staff-overlay">
          <h3>Darya</h3>
          <a
            href="https://www.facebook.com/profile.php?id=61552657702549"
            target="_blank"
          >
            <img
              src="../assets/facebookneon.jpg"
              alt="Facebook"
              style="
                border-radius: 50%;
                object-fit: cover;
                margin: auto;
                margin-top: 5px;
                width: 40px;
                height: 40px;
              "
            />
          </a>
        </div>
      </div>
      <div
        class="staff-card"
        v-animateonscroll="{
          enterClass:
            'animate-enter fade-in-10 zoom-in-50 slide-in-from-t-20 animate-duration-1000',
        }"
      >
        <img src="../assets/Jhanicka.jpg" alt="Shaina" />
        <div class="staff-overlay">
          <h3>Shaina May Tendenilla</h3>
          <a
            href="https://www.facebook.com/profile.php?id=61552657702549"
            target="_blank"
          >
            <img
              src="../assets/facebookneon.jpg"
              alt="Facebook"
              style="
                border-radius: 50%;
                object-fit: cover;
                margin: auto;
                margin-top: 5px;
                width: 40px;
                height: 40px;
              "
            />
          </a>
        </div>
      </div>
      <div
        class="staff-card"
        v-animateonscroll="{
          enterClass:
            'animate-enter fade-in-10 zoom-in-50 slide-in-from-t-20 animate-duration-1000',
        }"
      >
        <img src="../assets/Jhannus.jpg" alt="Shaina" />
        <div class="staff-overlay">
          <h3>Shaina May Tendenilla</h3>
          <a
            href="https://www.facebook.com/profile.php?id=61552657702549"
            target="_blank"
          >
            <img
              src="../assets/facebookneon.jpg"
              alt="Facebook"
              style="
                border-radius: 50%;
                object-fit: cover;
                margin: auto;
                margin-top: 5px;
                width: 40px;
                height: 40px;
              "
            />
          </a>
        </div>
      </div>
      <div
        class="staff-card"
        v-animateonscroll="{
          enterClass:
            'animate-enter fade-in-10 zoom-in-50 slide-in-from-t-20 animate-duration-1000',
        }"
      >
        <img src="../assets/Hiraku.jpg" alt="Shaina" />
        <div class="staff-overlay">
          <h3>Shaina May Tendenilla</h3>
          <a
            href="https://www.facebook.com/profile.php?id=61552657702549"
            target="_blank"
          >
            <img
              src="../assets/facebookneon.jpg"
              alt="Facebook"
              style="
                border-radius: 50%;
                object-fit: cover;
                margin: auto;
                margin-top: 5px;
                width: 40px;
                height: 40px;
              "
            />
          </a>
        </div>
      </div>
      <div
        class="staff-card"
        v-animateonscroll="{
          enterClass:
            'animate-enter fade-in-10 zoom-in-50 slide-in-from-t-20 animate-duration-1000',
        }"
      >
        <img src="../assets/Hiraku.jpg" alt="Shaina" />
        <div class="staff-overlay">
          <h3>Shaina May Tendenilla</h3>
          <a
            href="https://www.facebook.com/profile.php?id=61552657702549"
            target="_blank"
          >
            <img
              src="../assets/facebookneon.jpg"
              alt="Facebook"
              style="
                border-radius: 50%;
                object-fit: cover;
                margin: auto;
                margin-top: 5px;
                width: 40px;
                height: 40px;
              "
            />
          </a>
        </div>
      </div>
      <div
        class="staff-card"
        v-animateonscroll="{
          enterClass:
            'animate-enter fade-in-10 zoom-in-50 slide-in-from-t-20 animate-duration-1000',
        }"
      >
        <img src="../assets/Hiraku.jpg" alt="Shaina" />
        <div class="staff-overlay">
          <h3>Shaina May Tendenilla</h3>
          <a
            href="https://www.facebook.com/profile.php?id=61552657702549"
            target="_blank"
          >
            <img
              src="../assets/facebookneon.jpg"
              alt="Facebook"
              style="
                border-radius: 50%;
                object-fit: cover;
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
  flex: 1 25%;
  position: relative;
  height: 500px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: flex-basis 0.5s, width 0.5s;
  width: 100%;
  max-width: 100px;
  max-width: 100%;
}
.staff-card:hover {
  flex-basis: 100%;
  width: 100%;
  z-index: 2;
}

.staff-card img {
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
  justify-content: center;
  align-items: center;
  align-content: center;
  margin: auto;
  margin-top: 17rem;
}
.staff-image {
  display: flex;
}

.img {
  position: relative;
  height: 50vh;
  width: 100%;
  display: inline-block;
}
</style>
