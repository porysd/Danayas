<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import DatePicker from "primevue/datepicker";
import { useRouter } from "vue-router";
import FloatLabel from "primevue/floatlabel";
import img from "../assets/danayas_day.jpg";
import img1 from "../assets/danayas_night.jpg";
import img2 from "../assets/danayas_event.jpg";
import img3 from "../assets/danayas_event1.jpg";
import HomePackage from "../components/HomePackage.vue";
import Reviews from "../components/Reviews.vue";
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";
import { useBookingStore } from "../stores/bookingStore";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Dialog from "primevue/dialog";

const bookingStore = useBookingStore();
const router = useRouter();

onMounted(() => {
  bookingStore.fetchUserBookings();
});

// Image and Text on first section
let images = [img, img1, img2, img3];
const texts = [
  "Danayas Resort",
  "Danayas Resort",
  "Events & Venues",
  "Events & Venues",
];

const currentIndex = ref(0);
const currentImage = ref(images[currentIndex.value]);
const currentText = ref(texts[currentIndex.value]);
let interval = null;

const changeImage = () => {
  currentIndex.value = (currentIndex.value + 1) % images.length;
  currentImage.value = images[currentIndex.value];
  currentText.value = texts[currentIndex.value];
};

onMounted(() => {
  interval = setInterval(changeImage, 6000);
});

onUnmounted(() => {
  clearInterval(interval);
  return { currentImage };
});

// From and to Date logic

const showDatePicker = ref(false);
const checkInDate = ref(null);
const checkOutDate = ref(null);

const handleCheckAvailability = () => {
  if (checkInDate.value && checkOutDate.value) {
    router.push("/booking");
  } else {
    showDatePicker.value = !showDatePicker.value;
  }
};

// Process booking days
const mapBookingsToEvents = (bookings) => {
  return bookings
    .filter((b) => b.bookStatus === "reserved")
    .map((b) => {
      let backgroundColor;
      let textColor = "white";
      let title;

      switch (b.mode) {
        case "day-time": // if someone booked day status it will give Night Available
          backgroundColor = "#6A5ACD";
          textColor = "white";
          title = "Night Available";
          break;
        case "night-time": // if someone booked night status it will give Day Available
          backgroundColor = "#FFD580";
          textColor = "black";
          title = "Day Available";
          break;
        case "whole-day": // if someone booked day and night status and whole day status it will give Fully Booked
          backgroundColor = "#FF6B6B";
          title = "Fully Booked";
          break;
        default:
          backgroundColor = "#90EE94";
          textColor = "#15803D";
      }

      return {
        id: b.bookingId,
        title: title,
        start: b.checkInDate,
        // end: b.checkOutDate,
        backgroundColor: backgroundColor,
        textColor: textColor,
        allDay: true,
      };
    });
};

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay",
  },
  initialView: "dayGridMonth",
  editable: false,
  selectable: false,
  selectMirror: false,
  dayMaxEvents: false,
  weekends: true,
  events: computed(() => mapBookingsToEvents(bookingStore.bookings)),
});

// MAp Dialog

const showMapDialog = ref(false);

const openMapDialog = () => {
  showMapDialog.value = true;
};
</script>

<template>
  <NavBar />
  <div class="home-section">
    <div class="homeSlider">
      <div
        class="danayas-slide"
        :style="{ backgroundImage: `url(${currentImage})` }"
      >
        <h2 class="homeText slide-text">{{ currentText }}</h2>
      </div>
    </div>
    <div class="datePickerbackground">
      <div class="booking-container">
        <span class="label" style="font-size: 20px; font-weight: 700"
          >FROM</span
        >
        <div class="date-picker-wrapper">
          <FloatLabel variant="on">
            <DatePicker
              v-model="checkInDate"
              inputId="checkIn"
              showIcon
              iconDisplay="input"
              class="custom-date-picker"
              style="width: 20rem; height: 3rem; border: none"
            />
            <label for="checkIn">CHECK-IN</label>
          </FloatLabel>
        </div>
        <span class="label" style="font-size: 20px; font-weight: 700">TO</span>

        <div class="date-picker-wrapper">
          <FloatLabel variant="on">
            <DatePicker
              v-model="checkOutDate"
              inputId="checkOut"
              showIcon
              iconDisplay="input"
              class="custom-date-picker"
              style="width: 20rem; height: 3rem; border: none"
            />
            <label for="checkOut">CHECKOUT</label>
          </FloatLabel>
        </div>

        <button @click="handleCheckAvailability" class="availability-btn">
          Check Availability
        </button>
      </div>
    </div>

    <div
      v-if="showDatePicker"
      class="datePicker"
      style="
        background-color: #c7e3b6;
        width: 1065px;
        height: 23rem;
        border-radius: 20px;
        display: flex;
        margin: auto;
        align-items: center;
      "
    >
      <FullCalendar class="fullCalendar" :options="calendarOptions">
        <template #eventContent="{ event, timeText }">
          <b>{{ timeText }}</b> <i>{{ event.title }}</i>
        </template>
      </FullCalendar>

      <div class="Status">
        <h1
          style="
            text-align: center;
            font-size: 20px;
            font-weight: 750;
            margin-bottom: 10px;
          "
        >
          STATUS:
        </h1>
        <span class="dot" id="Available" style="background-color: #90ee90">
          <label for="dot" style="margin-left: 50px"> AVAILABLE</label></span
        >
        <span class="dot" id="FullyBooked" style="background-color: #ff6b6b">
          <label
            for="dot"
            style="margin-left: 50px; width: 145px; font-size: 16px"
          >
            FULLY BOOKED</label
          ></span
        >
        <span class="dot" id="DayAvailble" style="background-color: #ffd580">
          <label for="dot" style="margin-left: 50px; width: 145px">
            DAY AVAILABLE</label
          ></span
        >
        <span class="dot" id="NightAvailble" style="background-color: #6a5acd">
          <label for="dot" style="margin-left: 50px; width: 145px">
            NIGHT AVAILABLE</label
          ></span
        >
        <button
          id="Availablity"
          @click="$router.push('/booking')"
          style="
            background-color: #41ab5d;
            text-align: center;
            color: white;
            border-radius: 20px;
            font-size: 16px;
            width: 200px;
            height: 50px;
          "
        >
          CHECK AVAILABILITY
        </button>
      </div>
    </div>

    <!-- Spacer to allow scrolling -->
    <div style="height: 10px"></div>

    <div
      class="textWrap"
      v-animateonscroll="{
        enterClass:
          'animate-enter fade-in-10 slide-in-from-l-8 animate-duration-1000',
        leaveClass: 'animate-leave fade-out-0',
      }"
    >
      <p id="p-text" class="text-black" style="font-size: 20px">
        "Step into the enchanting world of Danayas Resorts Events Venue,
        <br />
        where every corner tells a story of simplicity and elegance"
      </p>
    </div>
    <div style="height: 12x"></div>

    <div
      class="features-background bg-[#C1F2B0] dark:bg-[#333] !important"
      v-animateonscroll="{
        enterClass:
          'animate-enter fade-in-10 slide-in-from-l-8 animate-duration-1000',
        leaveClass: 'animate-leave fade-out-0',
      }"
    >
      <div
        class="featureSection content-center justify-center m-auto flex flex-auto border-xl"
      >
        <div class="feature-image">
          <img
            src="../assets/danayas.jpg"
            alt="feature1"
            style="width: 75rem; height: 480px; border-radius: 30px"
          />
        </div>
        <div class="text text-black dark:text-white">
          <h1
            class="dark:text-white"
            style="
              font-weight: bold;
              font-family: Libre Baskerville;
              letter-spacing: 10px;
              font-size: 40px;
              color: #194d1d;
              text-shadow: 0px 0px 4px rgb(255, 255, 255);
            "
          >
            FEATURES
          </h1>
          <hr
            class="line dark:bg-white"
            style="width: 500px; margin-bottom: 1rem"
          />
          <p style="font-size: 20px; font-family: 'poppins'">
            Danayas Resorts Events Venue offers affordable events packages
            including comfortable guest accommodations, event spaces for
            weddings. conferences, and celebrations, in a serene, stree-free
            environment. With versatile spaces and excellent services, it's the
            perfect choice for hosting memorable occasions.
          </p>
          <button
            style="
              color: #ffffff;
              border-radius: 6px;
              width: 200px;
              height: 50px;
              text-align: center;
              margin-right: 40%;
              margin-top: 15px;
              font-size: 20px;
              font-weight: 400;
              padding: 5px;
              text-align: center;
              word-wrap: break-word;
              cursor: pointer;
            "
            @click="$router.push('/about-us')"
            class="bg-[#41ab5d] hover:bg-[#194d1d]"
          >
            Learn more
          </button>
        </div>
      </div>
    </div>

    <div
      class="DiscountBackground"
      v-animateonscroll="{
        enterClass:
          'animate-enter fade-in-10 slide-in-from-l-8 animate-duration-1000',
        leaveClass: 'animate-leave fade-out-0',
      }"
    >
      <div class="DiscountSection flex content-center justify-center m-auto">
        <div class="discount-text mr-180">
          <h1 id="title">DISCOUNT FOR HOLIDAY AND EVENTS?</h1>
          <p id="discountText">
            I'm a paragraph. Click here to add your own text and<br />edit me.
            I'm a great place for you to tell a story and let <br />
            your users know a little more about you.
          </p>
        </div>
      </div>
    </div>

    <section class="DanayasPackages">
      <div class="packageSection content-center justify-center m-auto">
        <h1
          style="
            font-size: 60px;
            font-weight: Bold;
            text-align: center;
            color: #194d1d;
            text-shadow: 0px 2px 2px rgb(40, 135, 21);
          "
        >
          Danayas Packages
        </h1>
        <p
          style="
            font-size: 20px;
            font-weight: 400;
            color: black;
            text-align: center;
            margin-bottom: 2rem;
            word-wrap: break-word;
            margin-top: 10px;
          "
        >
          “Danayas Resorts Events Venue offers flexible options that cater to
          your unique needs and budget.<br />
          Enjoy added perks and special promos that make your dream occasion
          extra ordinary.”
        </p>
        <div class="SeeAllBtn content-center justify-center m-auto">
          <button @click="$router.push('/packages')">SEE ALL PACKAGES</button>
        </div>
        <div class="packageComponent">
          <HomePackage />
        </div>
      </div>
    </section>

    <div
      class="DanayasAddress"
      style="
        background-color: #c1f2b0;
        margin: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 5rem;
        padding: 3rem;
      "
    >
      <div class="AddressBackgound" style="text-align: center">
        <div
          class="Danayas Adddress"
          style="
            font-family: 'Poppins';
            font-weight: bold;
            font-size: 65px;
            color: #194d1d;
            text-align: center;
            margin-bottom: 0rem;
            margin-top: 1px;
            text-shadow: 0px 4px 4px rgb(255, 255, 255);
          "
        >
          Danayas Address
        </div>
        <div
          id="Address-p"
          style="
            font-size: 20px;
            font-weight: 400;
            color: black;
            margin-bottom: 2rem;
          "
        >
          #27 Jones St. Extension Dulong Bayan 2, San Mateo <br />
          Rizal Philippines
        </div>
        <div
          class="googleMap"
          v-animateonscroll="{
            enterClass:
              'animate-enter fade-in-10 slide-in-from-l-8 animate-duration-1000',
            leaveClass: 'animate-leave fade-out-0',
          }"
          style="margin-bottom: 30px"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1929.608118783353!2d121
            .12431473799222!3d14.7003600939651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397bb19868e1b37%3A0x429ae5ae7c94d0f2!2s7%20Jones%20Dulong%20Bayan
            %202%2C%20San%20Mateo%2C%20Rizal%20Philippines!5e0!3m2!1sen!2sph!4v1741699299438!5m2!1sen!2sph"
            width="1100"
            height="600"
            style="border: 0; border-radius: 10px; margin-top: 3px"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <button @click="openMapDialog" class="MapBtn" id="MapBtn">
          VIEW LARGE MAP
        </button>
      </div>
    </div>

    <div id="wrapper">
      <Reviews />
    </div>
  </div>

  <Dialog
    v-model:visible="showMapDialog"
    header="Danayas Resorts Events Venue Address"
    :modal="true"
    :closable="true"
    :style="{ width: '80vw' }"
  >
    <div
      class="googleMap"
      v-animateonscroll="{
        enterClass:
          'animate-enter fade-in-10 slide-in-from-l-8 animate-duration-1000',
        leaveClass: 'animate-leave fade-out-0',
      }"
    >
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1929.608118783353!2d121
            .12431473799222!3d14.7003600939651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397bb19868e1b37%3A0x429ae5ae7c94d0f2!2s7%20Jones%20Dulong%20Bayan
            %202%2C%20San%20Mateo%2C%20Rizal%20Philippines!5e0!3m2!1sen!2sph!4v1741699299438!5m2!1sen!2sph"
        width="1200"
        height="510"
        style="border: 0; border-radius: 10px"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  </Dialog>
  <Footer />
</template>

<style scoped>
.home-section {
  justify-content: center;
  align-items: center;
  align-content: center;
}

.homeSlider {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  width: 100%;
  height: 560px;
  max-width: 85rem;
  aspect-ratio: 16 / 9;
  margin: auto;
  flex-wrap: wrap;
  border-radius: 25px;
  overflow: hidden;
}

.danayas-slide {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  min-height: 600px;
  flex-wrap: nowrap;
  justify-content: center;
  align-content: center;
  align-items: center;
  background-size: cover;
  background-position: center;
  transition: background-image 1s ease-in-out;
}

.homeText {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 80px;
  font-weight: bold;
  color: white;
  text-shadow: 0px 4px 4px rgb(12, 70, 39);
  text-align: center;
  flex-wrap: nowrap;
  justify-content: center;
  align-content: center;
  align-items: center;
}

.datePickerbackground {
  background-color: #fcfcfc;
  width: 1065px;
  height: 174px;
  top: -80px;
  position: relative;
  display: flex;
  margin: auto;
  filter: drop-shadow(0px 4px 4px rgb(106, 104, 104));
  border-radius: 20px;
  padding: 66px;
}

.booking-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px;
  gap: 10px;
  position: relative;
  right: 1.5rem;
}

.date-picker-wrapper {
  display: flex;
  flex-direction: column;
}

:deep(.date-picker-wrapper) {
  .p-datepicker-input {
    border: none;
    background-color: #c7e3b6;
  }
}

#from,
#to {
  margin-top: 10px;
  font-weight: normal;
  font-size: 16px;
  flex-wrap: nowrap;
  justify-content: center;
  align-content: center;
  align-items: center;
}

.p-floatlabel {
  background-color: white;
  flex-wrap: nowrap;
  justify-content: center;
  align-content: center;
  align-items: center;
}

.label {
  font-size: 14px;
  font-weight: 500;
  margin: 0 8px;
}

.availability-btn {
  background-color: #41ab5d;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 18px;
  font-weight: bold;
  text-align: center;
  width: 180px;
  height: 50px;
  cursor: pointer;
}

.availability-btn:hover {
  background-color: #194d1d;
}

:deep(.fullCalendar) {
  margin: 0 auto;
  width: 750px;
  height: 320px;
  font-size: 10px;
  padding: 10px;
  background: white;
  border-radius: 10px;

  .fc {
    font-family: Poppins, sans-serif;
  }

  .fc-toolbar-title {
    font-size: 14px;
  }

  .fc-button {
    background-color: #41ab5d;
    color: white;
    border-radius: 6px;
    padding: 2px 6px;
    font-size: 10px;
    height: 24px;
    min-width: 24px;
  }

  .fc-button .fc-icon {
    font-size: 10px;
  }

  .fc-daygrid-event {
    font-size: 10px;
    padding: 1px 2px;
    white-space: normal;
  }

  .fc-daygrid-more-link {
    font-size: 9px;
  }

  .fc-event-title {
    font-weight: 600;
  }

  .fc-daygrid-event-dot {
    display: none;
  }
}

.Status {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 auto;
}

.dot {
  height: 25px;
  width: 25px;
  background-color: #bbb;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px; /* Adds space between dots */
}

.features-background {
  height: 530px;
  width: 85rem;
  margin: auto;
  border-radius: 25px;
  position: relative;
  top: -6rem;
  padding: 20px;
}

.feature-image {
  margin-top: 10px;
  margin-left: 5rem;
}

.DiscountBackground {
  background-color: #c1f2b0;
  height: 250px;
  color: #194d1d;
  margin-bottom: 2rem;
}

.discount-text {
  color: #194d1d;
  line-height: 1.2;
  padding: 4rem;
  width: 687px;
}

.SeeAllBtn {
  background-color: #41ab5d;
  color: #ffffff;
  border-radius: 6px;
  width: 300px;
  height: 50px;
  text-align: center;
  font-size: 20px;
  font-weight: 400;
  padding: 10px;
  word-wrap: break-word;
  margin-bottom: 2rem;
}

.SeeAllBtn:hover {
  background-color: #194d1d;
}

.MapBtn {
  background-color: #41ab5d;
  color: #ffffff;
  border-radius: 6px;
  width: 300px;
  height: 50px;
  text-align: center;
  font-size: 20px;
  font-weight: 400;
  padding: 10px;
  word-wrap: break-word;
}

.MapBtn:hover {
  background-color: #194d1d;
}

h1 {
  color: #0d0d0d;
}

.textWrap {
  width: 999px;
  height: 128px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  font-family: "Fraunces", serif;
  font-weight: bold;
  color: #f1eaea;
  text-align: center;
  line-height: 1.9;
  margin-bottom: 10rem;
}

.text {
  margin-top: 2rem;
  margin-right: 9rem;
  margin-left: 6rem;
  text-align: justify;
  line-height: 1.9;
  width: 1500px;
}

#title {
  color: #194d1d;
  width: 811px;
  font-weight: bold;
  font-size: 29px;
  font-family: "Poppins";
  margin-top: 2px;
  margin-bottom: 20px;
  text-shadow: 0px 4px 4px rgb(255, 255, 255);
}

#discountText {
  font-weight: normal;
  color: #000;
  width: 811px;
  font-size: 20px;
  font-family: "Fraunces", serif;
  margin-top: 8px;
}
#p.text {
  font-size: larges;
}

.danayas-packages {
  margin: auto;
}

p {
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

#MapBtn {
  border: none;
  color: rgb(247, 247, 247);
  margin-top: 10px;
  font-size: 15px;
}
@media (max-width: 1024px) {
  .home-section {
    min-height: 500px;
    padding: 5% 2%;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    align-content: center;
  }

  .slideshow img {
    width: 100%;
    height: auto;
    flex-wrap: wrap;
  }

  .guest-reviews {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .home-section {
    text-align: center;
    flex-wrap: wrap;
  }

  .slideshow img {
    max-width: 100%;
    flex-wrap: wrap;
  }

  .carousel {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
