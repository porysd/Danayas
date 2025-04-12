<script setup>
import { ref } from "vue";
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";

const isMenuOpen1 = ref(false);
const isMenuOpen2 = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const cancelModal = ref(false);
const showpendingmodal = ref(false);

const showcancelModal = () => {
  cancelModal.value = true;
};
const closemodal = () => {
  cancelModal.value = false;
};
const OpenPendingModal = () => {
  cancelModal.value = false;
  showpendingmodal.value = true;
};
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
    <h1 class="AboutText" style="text-align: center">Logs</h1>
  </div>

  <div class="Logs-Container">
    <hr class="Header" data-content=" On Going" />
    <div class="logsBox">
      <div class="w-full relative inline-block">
        <div class="flex justify-end mr-3">
          <button
            @click.stop="isMenuOpen1 = !isMenuOpen1"
            class="pi pi-ellipsis-v"
            style="font-size: 1.5rem"
          ></button>

          <div
            v-if="isMenuOpen1"
            class="absolute right-2 mt-4 w-35 shadow-md z-50 bg-[#fcf5f5] p-4 rounded"
          >
            <button class="hover:bg-[#C1F2B0]">Reschedule</button>
            <button class="hover:bg-[#C1F2B0]" @click="showcancelModal">
              Cancel
            </button>

            <div v-if="cancelModal" class="modal">
              <div
                class="DelBox p-10 bg-[#eef9eb]"
                style="
                  border: 1px solid #38dc87;
                  border-radius: 10px;
                  box-shadow: 0px 0px 10px rgba(28, 216, 34, 0.5);
                  align-items: center;
                  justify-content: center;
                  text-align: center;
                  font-weight: 600;
                  font-size: large;
                "
              >
                <h2>Are you sure you want to cancel your reservation?</h2>
                <div class="Button">
                  <button
                    class="btn1 hover:bg-[#FF8080]"
                    @click="OpenPendingModal"
                  >
                    YES
                  </button>

                  <button class="btn2 hover:bg-[#194d1d]" @click="closemodal">
                    NO
                  </button>
                </div>
              </div>
            </div>
            <div v-if="showpendingmodal" class="modal">
              <div
                class="pendingBox p-10 bg-[#eef9eb] w-120"
                style="
                  border: 1px solid #38dc87;
                  border-radius: 10px;
                  box-shadow: 0px 0px 10px rgba(28, 216, 34, 0.5);
                  align-items: center;
                  justify-content: center;
                  text-align: center;
                  font-weight: 600;
                  font-size: large;
                "
              >
                <h2 style="word-wrap: break-word">
                  Your refund will be processed and sent to your email from 3 to
                  5 working days.
                </h2>
                <div class="flex justify-center">
                  <button
                    class="btn1 hover:bg-[#41AB5D] mt-[2rem]"
                    @click="showpendingmodal = false"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="information">
        <p>Package name:</p>
        <p>Date:</p>
        <p>Personal Information:</p>
      </div>
    </div>
  </div>

  <div class="Logs-Container">
    <hr class="Header" data-content="History" />
    <div class="logsBox">
      <div class="w-full relative inline-block">
        <div class="flex justify-end mr-3">
          <button
            @click.stop="isMenuOpen2 = !isMenuOpen2"
            class="pi pi-ellipsis-v"
            style="font-size: 1.5rem"
          ></button>

          <div
            v-if="isMenuOpen2"
            class="absolute right-2 mt-4 w-35 shadow-md z-50 bg-[#fcf5f5] p-4 rounded"
          >
            <button class="hover:bg-[#FF8080]">Delete</button>
          </div>
        </div>
      </div>

      <div class="information">
        <p>Package name:</p>
        <p>Date:</p>
        <p>Personal Information:</p>
      </div>
    </div>
  </div>
  <Footer />
</template>

<style scoped>
.Logs-Container {
  margin-top: 5rem;
  margin-bottom: 2rem;
}
.btn1,
.btn2 {
  background-color: #41ab5d;
  padding: 10px;
  width: 6rem;
  border-radius: 10px;
}
.btn1:hover {
  background: #ff8080;
}
.btn2:hover {
  background: lightgreen;
}

.Button {
  display: flex;
  gap: 50px;
  align-items: center;
  justify-content: center;
  margin: auto;
  margin-top: 20px;
}
.modal {
  z-index: 999;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  background: rgba(193, 175, 175, 0.5);
  align-items: center;
  justify-content: center;
}
img {
  width: 30px;
  height: 30px;
  position: static;
}
.information {
  position: relative;
  display: inline-block;
  width: full;
  font-size: 1.2rem;
  align-items: center;
  justify-content: center;
  width: 15rem;
  display: flex;
  flex-direction: column;
  justify-content: start;
  margin-right: 70rem;
}

.logsBox {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 10rem;
  justify-content: center;
  align-items: center;
  margin: auto;
  border-radius: 10px;
  width: 90%;
  background: transparent;
  border: 1px solid #41ab5d;
}

.Header {
  line-height: 1rem;
  position: relative;
  outline: 0;
  border: 0;
  font-weight: bolder;
  font-size: 1.3rem;
  margin-top: 20px;
  margin-bottom: 5px;
  color: rgb(2, 2, 2);
  text-align: center;
  height: 1.5rem;
  margin-bottom: 2rem;
}

.Header::before {
  content: "";
  position: absolute;
  background: #000000;
  left: 0;
  margin-left: 10rem;
  font-weight: bolder;
  top: 50%;
  width: 70rem;
  height: 1.2px;
}

.Header::after {
  content: attr(data-content);
  position: relative;
  color: rgb(0, 0, 0);
  padding: 0 0.5em;
  background-color: #ffffff;
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
</style>
