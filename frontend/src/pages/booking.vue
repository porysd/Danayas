<script setup>
import { onMounted, ref } from "vue";
import Stepper from "primevue/stepper";
import StepList from "primevue/steplist";
import StepPanels from "primevue/steppanels";
import StepItem from "primevue/stepitem";
import Step from "primevue/step";
import StepPanel from "primevue/steppanel";
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import RadioButton from "primevue/radiobutton";
import BookPackage from "../components/BookPackage.vue";
import FileUpload from "primevue/fileupload";
import Dialog from "primevue/dialog";
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";

const bookMode = ref("");
const paymentTerms = ref("");

const header = ref([
  "Check-in & Check-out Date",
  "Select Package & Rate",
  "Guest Information",
  "Booking Confirmation",
]);

const currentStep = ref(0);

const nextBtn = () => {
  if (currentStep.value < header.value.length - 1) {
    currentStep.value++;
  }
};

const prevBtn = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const showTermsAndCondition = ref(false);
const showContinueModal = ref(false);

const openTermsAndCondition = () => {
  showTermsAndCondition.value = true;
};

const OpenContinueModal = () => {
  showContinueModal.value = true;
  showTermsAndCondition.value = false;

  closeTimeOut = setTimeout(() => {
    showContinueModal.value = false;
  }, 3000);
};

const newBooking = ref({
  userId: "",
  createdBy: "",
  firstName: "",
  lastName: "",
  contactNo: "",
  emailAddress: "",
  address: "",
  packageId: "",
  eventType: "",
  checkInDate: "",
  checkOutDate: "",
  mode: "",
  arrivalTime: "",
  catering: "",
  numberOfGuest: "",
  discountPromoId: "",
  bookingAddOns: "",
  paymentTerms: "",
  totalPaid: "",
  totalAmountDue: "",
  bookStatus: "",
  reservationType: "",
});

const addBookingHandler = async (booking) => {
  const formattedBooking = {
    ...booking,
    userId: booking.userId ? Number(booking.userId) : null,
    createdBy: booking.createdBy ? Number(booking.createdBy) : null,
    packageId: Number(booking.packageId),
    numberOfGuest: Number(booking.numberOfGuest),
    discountPromoId: Number(booking.discountPromoId),
    totalAmountDue: booking.totalAmountDue ? Number(booking.totalAmountDue) : 0,
    catering:
      booking.catering === "true"
        ? true
        : booking.catering === "false"
        ? false
        : Boolean(booking.catering),
  };

  try {
    const response = await fetch("http://localhost:3000/bookings/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedBooking),
    });

    const text = await response.text();
    console.log("Raw response:", text);

    const data = JSON.parse(text);

    if (!response.ok)
      throw new Error(`Failed to add booking: ${JSON.stringify(data)}`);
    console.log("Booking added successfully:", data);
  } catch (error) {
    console.error("Error adding booking:", error);
  }
};

// FOR CALENDAR
const bookings = ref([]);

onMounted(async () => {
  const limit = 50;
  let page = 1;
  let hasMoreData = true;

  while (hasMoreData) {
    const bResponse = await fetch(
      `http://localhost:3000/bookings?limit=${limit}&page=${page}`
    );
    if (!bResponse.ok) throw new Error("Failed to fetch bookings");
    const bookingData = await bResponse.json();

    if (bookingData.items.length === 0) {
      hasMoreData = false;
    } else {
      bookings.value.push(...bookingData.items);
      page++;
    }
  }
});

const getBookingStyle = (slotDate) => {
  const jsDate = new Date(slotDate.year, slotDate.month - 1, slotDate.day);

  const formattedDate = jsDate.toISOString().split("T")[0];

  const booking = bookings.value.find((b) =>
    b.checkInDate.startsWith(formattedDate)
  );

  if (!booking) {
    return {
      backgroundColor: "#4BB344",
      color: "white",
      width: "40px",
      height: "40px",
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "50%",
    };
  }

  let backgroundColor;
  switch (booking.mode) {
    case "day-time":
      backgroundColor = "#3EDFFF";
      break;
    case "night-time":
      backgroundColor = "#1714BA";
      break;
    case "whole-day":
      backgroundColor = "#FF2D55";
      break;
    default:
      backgroundColor = "#4BB344";
  }

  return {
    backgroundColor,
    color: "white",
    width: "40px",
    height: "40px",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
  };
};
</script>

<template>
  <NavBar />
  <section class="booking">
    <div class="containerBook">
      <img
        src="../assets/danayas_day.jpg"
        alt="package_image"
        class="bookImg"
        id="booking"
      />
      <h1 class="bookText">{{ header[currentStep] }}</h1>
    </div>

    <div
      class="stepHeader card flex justify-center w-[`100`%] m-auto align-center mt-6"
    >
      <Stepper value="1" linear class="basis-[95rem]">
        <StepList class="h-50 bg-[#c7e3b6] w-[95rem]">
          <Step value="1">
            <i
              class="pi pi-calendar z-10 absolute top-5 right-67"
              style="font-size: 3rem"
            ></i>
            <div class="absolute bottom-0 left-[-1] right-53 top-25">
              Check-In & <br />Check-Out Date
            </div>
          </Step>
          <Step value="2">
            <i
              class="pi pi-credit-card z-10 absolute top-5 right-67"
              style="font-size: 3rem"
            ></i>
            <div class="absolute bottom-0 left-[-1] right-54 top-25">
              Select <br />
              Package & Rate
            </div>
          </Step>
          <Step value="3">
            <i
              class="pi pi-user z-10 absolute top-5 right-67"
              style="font-size: 3rem"
            ></i>
            <div class="absolute bottom-0 left-[-1] right-58 top-25">
              Guest <br />Information
            </div>
          </Step>
          <Step value="4">
            <i
              class="pi pi-check z-10 absolute top-5 right-5"
              style="font-size: 3rem"
            ></i>
            <div class="absolute bottom-0 -left-10 -right-12 top-25">
              Booking <br />Confirmation
            </div>
          </Step>
        </StepList>

        <StepPanels>
          <StepPanel v-slot="{ activateCallback }" value="1">
            <div class="flex h-auto">
              <div class="date m-auto h-auto">
                <div
                  class="datePicker"
                  style="
                    background-color: none;
                    width: 100%;
                    margin: auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 2rem;
                    margin-top: 5rem;
                    gap: 5rem;
                  "
                >
                  <DatePicker
                    v-model="date"
                    inline
                    class="dateChart w-full sm:w-[30rem]"
                  >
                    <template #date="slotProps">
                      <span>
                        <strong
                          :style="getBookingStyle(slotProps.date)"
                          class="date-box"
                        >
                          {{ slotProps.date.day }}
                        </strong>
                      </span>
                    </template>
                  </DatePicker>
                  <DatePicker
                    v-model="date"
                    inline
                    class="dateChart w-full sm:w-[30rem]"
                  >
                    <template #date="slotProps">
                      <span>
                        <strong
                          :style="getBookingStyle(slotProps.date)"
                          class="date-box"
                        >
                          {{ slotProps.date.day }}
                        </strong>
                      </span>
                    </template>
                  </DatePicker>
                </div>

                <div
                  class="flex m-auto justify-center content-center text-3xl font-[Poppins] font-black mb-5 mt-8"
                >
                  <h1>Date Status:</h1>
                </div>

                <div
                  class="Status-br mb-20"
                  style="
                    background-color: #c7e3b6;
                    height: 10rem;
                    display: flex;
                    width: 100%;
                    justify-content: center;
                    align-items: center;
                    gap: 30rem;
                  "
                >
                  <div
                    class="status-left"
                    style="
                      display: flex;
                      flex-direction: column;
                      align-items: flex-start;
                      margin: auto;
                      margin-left: 25rem;
                      gap: 2rem;
                    "
                  >
                    <span
                      class="dot"
                      id="Available"
                      style="background-color: #4bb344"
                    >
                      <label for="dot" style="margin-left: 50px"
                        >AVAILABLE</label
                      >
                    </span>
                    <span
                      class="dot"
                      id="DayAvailable"
                      style="background-color: #3edfff"
                    >
                      <label for="dot" style="margin-left: 50px; width: 145px"
                        >DAY AVAILABLE</label
                      >
                    </span>
                  </div>

                  <div
                    class="status-right"
                    style="
                      display: flex;
                      flex-direction: column;
                      align-items: flex-start;
                      margin: auto;
                      margin-right: 35rem;
                      gap: 2rem;
                    "
                  >
                    <span
                      class="dot"
                      id="FullyBooked"
                      style="background-color: #ff2d55"
                    >
                      <label
                        for="dot"
                        style="margin-left: 50px; width: 145px; font-size: 16px"
                        >FULLY BOOKED</label
                      >
                    </span>
                    <span
                      class="dot"
                      id="NightAvailable"
                      style="background-color: #1714ba"
                    >
                      <label for="dot" style="margin-left: 50px; width: 145px"
                        >NIGHT AVAILABLE</label
                      >
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-5 ml-20">
              <div class="flex items-center gap-2">
                <RadioButton
                  v-model="bookMode"
                  inputId="dayMode"
                  name="bookingMode"
                  value="day-time"
                  size="large"
                />
                <label for="dayMode" class="text-xl font-[Poppins]"
                  >DAY TIME</label
                >
              </div>
              <div class="flex items-center gap-2">
                <RadioButton
                  v-model="bookMode"
                  inputId="nightMode"
                  name="bookingMode"
                  value="night-time"
                  size="large"
                />
                <label for="nightMode" class="text-xl font-[Poppins]"
                  >NIGHT TIME</label
                >
              </div>
              <div class="flex items-center gap-2">
                <RadioButton
                  v-model="bookMode"
                  inputId="wholeDay"
                  name="bookingMode"
                  value="whole-day"
                  size="large"
                />
                <label for="wholeDay" class="text-xl font-[Poppins]"
                  >WHOLE DAY</label
                >
              </div>

              <button
                @click="
                  activateCallback('2');
                  nextBtn();
                "
                class="bg-[#194d1d] text-white w-50 h-15 font-black font-[Poppins] text-xl rounded-xl cursor-pointer ml-[45rem]"
              >
                CONTINUE
              </button>
            </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback }" value="2">
            <div class="flex h-auto m-auto justify-center content-center">
              <div
                class="flex-col flex justify-center items-center font-medium h-auto w-[50rem] mt-5"
              >
                <div class="flex flex-col overflow-auto h-[65rem]">
                  <h1
                    class="text-left w-[100%] flex font-black text-4xl font-[Poppins] mt-10"
                  >
                    Select Package
                  </h1>
                  <BookPackage />
                  <BookPackage />
                  <BookPackage />
                </div>
              </div>
              <div
                class="flex-col flex justify-center items-center font-medium h-auto w-[40rem] mt-5"
              >
                <div
                  class="bg-[#c7e3b6] p-5 rounded-lg w-[30rem] h-[55rem] mt-10"
                >
                  <h1
                    class="font-black font-[Poppins] text-2xl p-5 flex align-center justify-center m-auto"
                  >
                    Booking Summary:
                  </h1>

                  <div class="bg-[#fcfcfc] rounded-sm p-2 mb-2">
                    <div class="flex gap-[20rem]">
                      <p>Date:</p>
                      <div class="inline-block">
                        <button class="">Edit</button>
                      </div>
                    </div>
                    <div class="flex gap-[19rem]">
                      <p>Check-in:</p>
                      <button><i class="pi pi-calendar"></i></button>
                    </div>
                    <div class="flex gap-[18rem]">
                      <p>Check-out:</p>
                      <button class="">
                        <i class="pi pi-calendar"></i>
                      </button>
                    </div>
                  </div>

                  <div class="bg-[#fcfcfc] p-2 rounded">
                    <p>Mode:</p>
                  </div>

                  <div class="flex flex-col gap-2">
                    <h1 class="text-lg font-bold font-[Poppins]">
                      Package Selected:
                    </h1>
                    <div class="flex bg-[#fcfcfc] p-1 rounded-sm">
                      <p>Package Name:</p>
                    </div>
                    <div class="bg-[#CDDA54] p-1 rounde-sm">
                      <p>VAT Charged:</p>
                    </div>
                    <div class="bg-[#4BB344] p-1 rounded-sm">
                      <p>TOTAL CHARGED:</p>
                    </div>
                  </div>
                  <div class="btn flex pt-6">
                    <Button
                      label="Continue"
                      iconPos="right"
                      @click="
                        activateCallback('3');
                        nextBtn();
                      "
                    />
                    <Button
                      label="Back"
                      severity="secondary"
                      @click="
                        activateCallback('1');
                        prevBtn();
                      "
                    />
                  </div>
                </div>
              </div>
            </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback }" value="3">
            <div class="flex h-auto m-auto justify-center content-center">
              <div
                class="flex-col flex justify-center items-center font-medium h-auto w-[50rem] mt-5"
              >
                <div class="flex flex-col overflow-auto h-[65rem]">
                  <h1
                    class="text-left w-[100%] flex font-black text-4xl font-[Poppins] mt-10"
                  >
                    Personal Information:
                  </h1>
                  <div class="mt-10">
                    <div class="personalInfo">
                      <div>
                        <label>First Name:</label>
                        <input class="packEvents" placeholder="First Name" />
                      </div>
                      <div>
                        <label>Last Name:</label>
                        <input class="packEvents" placeholder="Last Name" />
                      </div>
                      <div>
                        <label>Contact No.:</label>
                        <input class="packEvents" placeholder="Contact No" />
                      </div>
                      <div>
                        <label>Email Address</label>
                        <input class="packEvents" placeholder="Email Address" />
                      </div>
                    </div>

                    <div class="bookAddress">
                      <div>
                        <label>Address:</label>
                        <input class="packEvents" placeholder="Address" />
                      </div>
                    </div>

                    <div class="guestInfo">
                      <div>
                        <label>Arrival Time:</label>
                        <input class="packEvents" placeholder="Arrival Time" />
                      </div>
                      <div>
                        <label>Event Type:</label>
                        <input
                          class="packEvents"
                          placeholder="ex. Birthday, Wedding, any celebration"
                        />
                      </div>
                      <div>
                        <label>Number of Guest:</label>
                        <input
                          type="number"
                          class="packEvents"
                          placeholder="Number of Guest"
                        />
                      </div>
                      <div>
                        <label for="catering">Catering</label>
                        <select name="catering" id="catering">
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      <div>
                        <label>Discount Code:</label>
                        <input class="packEvents" placeholder="" />
                      </div>
                      <div>
                        <label for="addOns">Add Ons:</label>
                        <select name="addOns" id="addOns">
                          <option value="videoke">Videoke</option>
                          <option value="rooms">Rooms</option>
                          <option value="nipaHut">Nipa Hut</option>
                          <option value="chairs">Chairs</option>
                          <option value="table">Table</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div class="mt-10">
                    <h1 class="ml-20 text-xl font-bold font-[Poppins]">
                      Payment Terms:
                    </h1>

                    <div class="flex items-center gap-5 ml-20 mt-5">
                      <div class="flex items-center gap-2">
                        <RadioButton
                          v-model="paymentTerms"
                          inputId="installment"
                          name="paymentTerm"
                          value="installment"
                          size="large"
                        />
                        <label for="dayMode" class="text-xl font-[Poppins]"
                          >Installment</label
                        >
                      </div>
                      <div class="flex items-center gap-2">
                        <RadioButton
                          v-model="paymentTerms"
                          inputId="full-payment"
                          name="paymentTerm"
                          value="full-payment"
                          size="large"
                        />
                        <label for="nightMode" class="text-xl font-[Poppins]"
                          >Full Payment</label
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="flex-col flex justify-center items-center font-medium h-auto w-[40rem] mt-5"
              >
                <div class="bg-[#c7e3b6] p-5 rounded-lg w-[30rem] h-auto mt-10">
                  <h1
                    class="font-black font-[Poppins] text-2xl p-5 flex align-center justify-center m-auto"
                  >
                    Booking Summary:
                  </h1>

                  <div class="bg-[#fcfcfc] mb-2 p-2 rounded-sm">
                    <div class="flex gap-[20rem]">
                      <p>Date:</p>
                      <button>Edit</button>
                    </div>
                    <div class="flex gap-[19rem]">
                      <p>Check-in:</p>
                      <button><i class="pi pi-calendar"></i></button>
                    </div>
                    <div class="flex gap-[18rem]">
                      <p>Check-out:</p>
                      <button class="">
                        <i class="pi pi-calendar"></i>
                      </button>
                    </div>
                  </div>

                  <div class="bg-[#fcfcfc] p-2 rounded-sm">
                    <p>Mode:</p>
                  </div>

                  <div class="flex flex-col gap-2">
                    <h1 class="text-lg font-bold font-[Poppins]">
                      Package Selected:
                    </h1>
                    <div class="flex bg-[#fcfcfc] p-1 rounded-sm">
                      <p>Package Name:</p>
                      <p>Price</p>
                    </div>
                    <div class="bg-[#CDDA54] p-1 rounded-sm">
                      <p>VAT Charged:</p>
                    </div>
                    <div class="bg-[#4BB344] p-1 rounded-sm">
                      <p>TOTAL CHARGED:</p>
                    </div>
                    <div>
                      <h1 class="text-lg font-bold font-[Poppins]">Payment:</h1>
                      <h1 class="text-lg font-sm font-[Poppins] text-center">
                        DANAYAS RESORTS EVENTS VENUE: <br />
                        09xx xxx xxxx
                      </h1>
                      <h1 class="text-lg font-bold font-[Poppins]">
                        Payment Terms:
                      </h1>
                      <div class="bg-[#4BB344]">
                        <p>TOTAL CHARGED:</p>
                      </div>
                      <h1 class="text-m font-[Poppins]">
                        GCASH Reference Code:
                      </h1>
                      <div class="bg-[#fcfcfc] mb-2 rounded">
                        <div>
                          <input class="p-2" placeholder="FEJIJKA4381FK9" />
                        </div>
                      </div>
                      <div class="gcashUpload">
                        <h1 class="text-xl font-bold font-[Poppins] mb-3 mt-3">
                          Proof of Payment:
                        </h1>
                        <FileUpload
                          ref="fileupload"
                          mode="basic"
                          name="demo[]"
                          url="/api/upload"
                          accept="image/*"
                          :maxFileSize="1000000"
                          @upload="onUpload"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="flex pt-6 gap-2 flex-col">
                    <Button
                      label="Continue"
                      iconPos="right"
                      @click="
                        activateCallback('4');
                        nextBtn();
                      "
                    />
                    <Button
                      label="Back"
                      severity="secondary"
                      @click="
                        activateCallback('2');
                        prevBtn();
                      "
                    />
                  </div>
                </div>
              </div>
            </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback }" value="4">
            <div
              class="flex-col flex justify-center items-center font-medium h-auto w-[100%] mt-5"
            >
              <div
                class="bg-[#C1F2B0] p-5 rounded-lg w-[70rem] h-[55rem] mt-10 mb-10"
              >
                <h1
                  class="font-black font-[Poppins] text-3xl p-5 flex align-center justify-center m-auto"
                >
                  Booking Summary:
                </h1>

                <div class="bg-[#fcfcfc] mb-2 p-2 rounded-sm">
                  <div class="flex gap-2">
                    <p>Date:</p>
                    <button>Edit</button>
                  </div>
                  <div class="flex gap-2">
                    <p>Check-in:</p>
                    <button><i class="pi pi-calendar"></i></button>
                  </div>
                  <div class="flex gap-2">
                    <p>Check-out:</p>
                    <button class="">
                      <i class="pi pi-calendar"></i>
                    </button>
                  </div>
                  <div class="">
                    <p>Mode:</p>
                  </div>
                  <div class="">
                    <p>Arrival Time:</p>
                  </div>
                  <div class="">
                    <p>Catering:</p>
                  </div>
                </div>

                <div>
                  <h1 class="text-lg font-bold font-[Poppins]">
                    Guest Information:
                  </h1>
                  <div class="bg-[#fcfcfc] mb-2 p-2 rounded-sm">
                    <div class="">
                      <p>Name:</p>
                    </div>
                    <div class="">
                      <p>Contact No.:</p>
                    </div>
                    <div class="">
                      <p>Email Address:</p>
                    </div>
                    <div class="">
                      <p>Address:</p>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col gap-2">
                  <h1 class="text-lg font-bold font-[Poppins]">
                    Package Selected:
                  </h1>
                  <div class="flex bg-[#fcfcfc] p-1 rounded-sm">
                    <p>Package Name:</p>
                    <p>Price</p>
                  </div>
                  <div class="bg-[#CDDA54] p-1 rounded-sm">
                    <p>VAT Charged:</p>
                  </div>
                  <div class="bg-[#4BB344] p-1 rounded-sm">
                    <p>TOTAL CHARGED:</p>
                  </div>
                </div>

                <div>
                  <h1 class="text-lg font-bold font-[Poppins]">Payment:</h1>
                  <h1 class="text-m font-[Poppins]">Name of the Sender:</h1>
                  <div class="bg-[#fcfcfc] mb-2 p-1 rounded-sm">
                    <div>
                      <input class="p-2" placeholder="Juan Dela Cruz" />
                    </div>
                  </div>
                </div>

                <div class="flex pt-6 flex-col gap-2">
                  <Button
                    label="BOOK"
                    iconPos="right"
                    @click="openTermsAndCondition"
                  />

                  <Button
                    label="BACK"
                    severity="secondary"
                    @click="
                      activateCallback('3');
                      prevBtn();
                    "
                  />
                </div>
              </div>
            </div>
          </StepPanel>
        </StepPanels>
      </Stepper>
    </div>

    <Dialog
      v-model:visible="showTermsAndCondition"
      modal
      header="Terms & Condition"
      :style="{ width: '70rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <div class="mb-6">
        <p class="mb-8">
          "Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
          ab illo inventore veritatis et quasi architecto beatae vitae dicta
          sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
          aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
          qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui
          dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed
          quia non numquam eius modi tempora incidunt ut labore et dolore magnam
          aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum
          exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex
          ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in
          ea voluptate velit esse quam nihil molestiae consequatur, vel illum
          qui dolorem eum fugiat quo voluptas nulla pariatur?
        </p>
        <p class="mb-8">
          At vero eos et accusamus et iusto odio dignissimos ducimus qui
          blanditiis praesentium voluptatum deleniti atque corrupti quos dolores
          et quas molestias excepturi sint occaecati cupiditate non provident,
          similique sunt in culpa qui officia deserunt mollitia animi, id est
          laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita
          distinctio. Nam libero tempore, cum soluta nobis est eligendi optio
          cumque nihil impedit quo minus id quod maxime placeat facere possimus,
          omnis voluptas assumenda est, omnis dolor repellendus. Temporibus
          autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe
          eveniet ut et voluptates repudiandae sint et molestiae non recusandae.
          Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis
          voluptatibus maiores alias consequatur aut perferendis doloribus
          asperiores repellat.
        </p>
        <p class="mb-8">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <p class="mb-8">
          "Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
          ab illo inventore veritatis et quasi architecto beatae vitae dicta
          sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
          aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
          qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui
          dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed
          quia non numquam eius modi tempora incidunt ut labore et dolore magnam
          aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum
          exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex
          ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in
          ea voluptate velit esse quam nihil molestiae consequatur, vel illum
          qui dolorem eum fugiat quo voluptas nulla pariatur?
        </p>
        <p>
          At vero eos et accusamus et iusto odio dignissimos ducimus qui
          blanditiis praesentium voluptatum deleniti atque corrupti quos dolores
          et quas molestias excepturi sint occaecati cupiditate non provident,
          similique sunt in culpa qui officia deserunt mollitia animi, id est
          laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita
          distinctio. Nam libero tempore, cum soluta nobis est eligendi optio
          cumque nihil impedit quo minus id quod maxime placeat facere possimus,
          omnis voluptas assumenda est, omnis dolor repellendus. Temporibus
          autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe
          eveniet ut et voluptates repudiandae sint et molestiae non recusandae.
          Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis
          voluptatibus maiores alias consequatur aut perferendis doloribus
          asperiores repellat.
        </p>
      </div>
      <div class="checkboxConfirmation">
        <input type="checkbox" id="signupCheck" />
        <label for="bookingCheck">I accept all terms & conditions</label>
      </div>
      <button class="Bookingbtn" @click="OpenContinueModal">Continue</button>
    </Dialog>

    <div v-if="showContinueModal" class="modal">
      <div class="BookingBox">
        <div class="signup"></div>
        <h1>Package pending..</h1>
      </div>
    </div>
  </section>
  <Footer />
</template>

<style scoped>
.Bookingbtn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  background-color: #41ab5d;
  color: white;
}

.BookingBox {
  text-align: center;
  justify-content: center;
  align-items: center;
  display: flex;
  height: 300px;
  width: 300px;
  filter: drop-shadow(0px 0px 10px rgba(97, 95, 95, 0.5));
  background: #eef9eb;
  box-shadow: 0px 0px 10px rgba(28, 216, 34, 0.5);
  border: 1px solid #38dc87;
  border-radius: 10px;
}
.modal {
  z-index: 9999;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  background: rgba(193, 175, 175, 0.5);
  align-items: center;
  justify-content: center;
}
.checkboxConfirmation input[type="checkbox"] {
  height: 16px;
  width: 16px;
  accent-color: #fff;
  cursor: pointer;
}
.checkboxConfirmation {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  top: -2rem;
}
.btn {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.date:nth-child(2) {
  width: 100%;
}
.containerBook {
  position: relative;
  justify-content: center;
  align-items: center;
  width: 85rem;
  height: 400px;
  margin: auto;
  border-radius: 25px;
  overflow: hidden;
}

.bookImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bookText {
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

:deep(.stepHeader, .datePicker) {
  --p-stepper-separator-size: 8px;
  --p-stepper-separator-active-background: #194d1d;
  --p-stepper-step-number-active-border-color: #194d1d;
  --p-stepper-step-title-font-weight: 950;

  --p-stepper-step-title-active-color: #194d1d;
  --p-stepper-step-padding: 0px;
  --p-stepper-step-gap: 0px;
  --p-stepper-step-header-padding: 0px;

  --p-stepper-steppanel-background: #fcfcfc;
  .p-steplist {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto;
    padding-left: 13rem;
    padding-right: 13rem;
    padding-bottom: 4rem;
    background-color: #c7e3b6;
  }
  .p-step {
    font-size: 20px;
  }
  .p-step-header {
    display: inline-block;
    margin: 0px;
    padding: 0px;
  }
  .p-step-number {
    border-width: 10px;
    height: 90px;
    width: 90px;
    margin: auto;
    font-size: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .p-steppanels {
    padding: 0px;
  }

  .p-datepicker-panel,
  .p-datepicker-header {
    background-color: #c7e3b6;
    color: #fcfcfc;
  }
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

.dot {
  height: 25px;
  width: 25px;
  background-color: #bbb;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  margin-bottom: 0px;
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

.personalInfo,
.guestInfo,
.bookAddress {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.personalInfo div,
.guestInfo div {
  display: flex;
  flex-direction: column;
  width: 40%;
}

.personalInfo label,
.bookAddress label,
.guestInfo label {
  margin-top: 15px;
  display: block;
  text-align: left;
  font-size: 16px;
  font-weight: bold;
}

.personalInfo input,
.guestInfo select,
.guestInfo input,
.bookAddress input {
  padding: 8px;
  border: 1px solid #41ab5d;
  background-color: #fcfcfc;
  border-radius: 10px;
  height: 40px;
  margin-top: 5px;
}

.bookAddress div {
  display: flex;
  flex-direction: column;
  width: 81%;
}
:deep(.gcashUpload) {
  .p-fileupload {
    margin: auto;
    justify-content: start;
  }
  .p-fileupload-choose-button {
    background: #41ab5d;
  }
}
</style>
