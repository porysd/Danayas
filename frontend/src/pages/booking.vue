<script setup>
import Stepper from "primevue/stepper";
import StepList from "primevue/steplist";
import StepPanels from "primevue/steppanels";
import StepItem from "primevue/stepitem";
import Step from "primevue/step";
import StepPanel from "primevue/steppanel";
import Button from "primevue/button";
</script>

<template>
  <section class="booking">
    <div>
      <img src="../assets/danayas_day.jpg" alt="package_image" id="booking" />
    </div>
    <div class="text-container">
      <h1 class="text">Check-in & Check-out Date</h1>
    </div>

    <div class="card flex justify-center">
      <Stepper value="1" linear class="basis-[50rem]">
        <StepList>
          <Step value="1">Header I</Step>
          <Step value="2">Header II</Step>
          <Step value="3">Header III</Step>
        </StepList>
        <StepPanels>
          <StepPanel v-slot="{ activateCallback }" value="1">
            <div class="flex flex-col h-48">
              <div
                class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center items-center font-medium"
              >
                Content I
              </div>
            </div>
            <div class="flex pt-6 justify-end">
              <Button
                label="Next"
                icon="pi pi-arrow-right"
                @click="activateCallback('2')"
              />
            </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback }" value="2">
            <div class="flex flex-col h-48">
              <div
                class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center items-center font-medium"
              >
                Content II
              </div>
            </div>
            <div class="flex pt-6 justify-between">
              <Button
                label="Back"
                severity="secondary"
                icon="pi pi-arrow-left"
                @click="activateCallback('1')"
              />
              <Button
                label="Next"
                icon="pi pi-arrow-right"
                iconPos="right"
                @click="activateCallback('3')"
              />
            </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback }" value="3">
            <div class="flex flex-col h-48">
              <div
                class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center items-center font-medium"
              >
                Content III
              </div>
            </div>
            <div class="pt-6">
              <Button
                label="Back"
                severity="secondary"
                icon="pi pi-arrow-left"
                @click="activateCallback('2')"
              />
            </div>
          </StepPanel>
        </StepPanels>
      </Stepper>
    </div>

    <div
      class="datePicker"
      style="
        background-color: none;
        width: 70rem;
        margin-left: 150px;
        border-radius: 20px;
        display: flex;
        align-items: center;
      "
    >
      <calendar-date
        class="cally"
        style="
          background-color: #c7e3b6;
          border: 1px solid #d1d5db;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          padding: 10px;
        "
      >
        <svg
          aria-label="Previous"
          slot="previous"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
        >
          <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
        </svg>
        <svg
          aria-label="Next"
          slot="next"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
        >
          <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
        </svg>
        <calendar-month></calendar-month>
      </calendar-date>
      <calendar-date
        class="cally"
        style="
          background-color: #c7e3b6;
          border: 1px solid #d1d5db;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          padding: 10px;
        "
      >
        <svg
          aria-label="Previous"
          slot="previous"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
        >
          <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
        </svg>
        <svg
          aria-label="Next"
          slot="next"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
        >
          <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
        </svg>
        <calendar-month></calendar-month>
      </calendar-date>
    </div>

    <div class="Status-br" style="background-color: #c7e3b6">
      <div class="status">
        <div class="A-F">
          <span class="dot" id="Available" style="background-color: #4bb344">
            <label for="dot" style="margin-left: 50px"> AVAILABLE</label></span
          >
          <span class="dot" id="FullyBooked" style="background-color: #ff2d55">
            <label
              for="dot"
              style="margin-left: 50px; width: 145px; font-size: 16px"
            >
              FULLY BOOKED</label
            ></span
          >
        </div>

        <div class="D-A">
          <span class="dot" id="DayAvailble" style="background-color: #3edfff">
            <label for="dot" style="margin-left: 50px; width: 145px">
              DAY AVAILABLE</label
            ></span
          >
          <span
            class="dot"
            id="NightAvailble"
            style="background-color: #1714ba"
          >
            <label
              for="dot"
              style="margin-left: 50px; text-align: center; width: 145px"
            >
              NIGHT AVAILABLE</label
            ></span
          >
        </div>
      </div>
    </div>

    <div class="check-status">
      <input type="checkbox" class="checkbox" style="border: 3px solid black" />
      <label class="label-status">DAY</label>
      <input type="checkbox" class="checkbox" /><label class="label-status"
        >NIGHT</label
      >
      <input type="checkbox" class="checkbox" /><label class="label-status"
        >22 hours</label
      >
    </div>

    <a href="./BookingSelect.vue">
      <button
        @click=""
        style="
          height: 60px;
          width: 230px;
          color: white;
          border-radius: 10px;
          background-color: #194d1d;
          font-weight: bold;
          font-size: 25px;
          border: none;
          margin-left: 70rem;
          position: relative;
          top: -6.2rem;
          cursor: pointer;
        "
      >
        BOOK
      </button>
    </a>
  </section>
</template>

<style scoped>
.status {
  align-items: center;
  justify-content: center;
  margin-top: 5rem;
  margin-left: 25rem;
}
.checkbox {
  height: 50px;
  width: 50px;
  margin-left: 15px;
}
.label-status {
  position: relative;
  font-size: 20px;
  top: -1rem;
}

.D-A {
  top: -5rem;
  display: block;
  position: relative;
  margin-left: 30rem;
  align-items: center;
}

.A-F {
  margin-right: 10rem;
}

.Status-br {
  display: inline-flex;
  width: 100%;
  height: 30vh;
  top: -7rem;
  position: relative;
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
.cally {
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
  gap: 40px;
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
}

.step {
  text-align: center;
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
  top: 50px;
  background-color: #ccc;
  left: 0;
  z-index: -1;
}

.step:first-child::after {
  display: none;
}

.active {
  color: #4caf50;
  margin-top: 15px;
}

.active img {
  filter: brightness(0) saturate(100%) invert(47%) sepia(98%) saturate(450%)
    hue-rotate(90deg);
}

.process {
  background-color: #c7e3b6;
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
#booking {
  width: 86rem;
  height: 400px;
  margin: auto;
  align-items: center;
  border-radius: 25px;
  object-fit: cover;
}
.text {
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
