<script setup>
import { onMounted, ref, computed } from "vue";
import Stepper from "primevue/stepper";
import StepList from "primevue/steplist";
import StepPanels from "primevue/steppanels";
import StepItem from "primevue/stepitem";
import Step from "primevue/step";
import StepPanel from "primevue/steppanel";
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import FloatLabel from "primevue/floatlabel";
import RadioButton from "primevue/radiobutton";
import BookPackage from "../components/BookPackage.vue";
import FileUpload from "primevue/fileupload";
import Dialog from "primevue/dialog";
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";
import { useBookingStore } from "../stores/bookingStore";
import { usePaymentStore } from "../stores/paymentStore";
import { useToast } from "primevue/usetoast";
import { usePackageStore } from "../stores/packageStore";
import { useDiscountStore } from "../stores/discountStore";
import { formatPeso } from "../utility/pesoFormat";
import { formatDate } from "../utility/dateFormat";
import { formatDates } from "../utility/dateFormat";
import { useTransactionStore } from "../stores/transactionStore";
import Select from "primevue/select";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const toast = useToast();

const bookingStore = useBookingStore();
const transactionStore = useTransactionStore();
const paymentStore = usePaymentStore();
const packageStore = usePackageStore();
const discountStore = useDiscountStore();

onMounted(() => {
  bookingStore.fetchUserBookings();
  discountStore.fetchAllDiscounts();
});

const header = ref([
  "Check-in & Check-out Date",
  "Select Package & Rate",
  "Guest Information",
  "Booking Confirmation",
]);

// Add Booking
const newBooking = ref({
  firstName: "" || null,
  lastName: "" || null,
  contactNo: "" || null,
  emailAddress: "" || null,
  address: "" || null,
  packageId: "",
  eventType: "" || null,
  checkInDate: "",
  checkOutDate: "",
  mode: "",
  arrivalTime: "" || null,
  catering: "" || null,
  numberOfGuest: "" || null,
  discountId: "" || null,
  bookingAddOns: [] || null,
  paymentTerms: "",
});

const paymentDetails = ref({
  mode: "gcash",
  reference: "",
  imageUrl: "",
  senderName: "",
});

// Find the discount by ID or name
const discount = discountStore.discounts.find(
  (d) =>
    d.id === newBooking.value.discountId ||
    d.name.toLowerCase() === newBooking.value.discountId?.toLowerCase()
);

const addBookingHandler = async (newBooking, paymentDetails) => {
  try {
    // 1: Create Booking
    const formatBooking = {
      ...newBooking.value,
      checkInDate: formatDate(newBooking.value.checkInDate),
      checkOutDate: formatDate(newBooking.value.checkOutDate),
      discountId: discount?.discountId || null,
    };
    const createdBooking = await bookingStore.addBooking(formatBooking);
    const bookingId = createdBooking.bookingId;

    // 2: Get Transaction ID and create Data
    const newTransaction = await transactionStore.addTransaction({ bookingId });
    const transactionId = newTransaction.transactionId;

    // 3: Connect Transaction to Payment
    const formatPayment = {
      ...paymentDetails.value,
      transactionId,
    };
    await paymentStore.addPayment(formatPayment);

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Booking and Payment successfully created!",
      life: 3000,
    });

    await bookingStore.fetchUserBookings();
  } catch (err) {
    console.error("Error adding booking", err);
  }
};

//STEP: 1
const stepOneBtn = (activateCallback) => {
  const { checkInDate, checkOutDate, mode } = newBooking.value;
  if (!checkInDate || !checkOutDate || !mode) {
    alert("Please fill up all fields");
  } else {
    activateCallback("2");
  }
};

//STEP 2

// ref = reactive state
// selectedPackage is a reactive state that will hold the selected package fromt child (BookPackage)
const selectedPackage = ref(null);

// availPackageHandler = function for the availPackage in BookPackage
const availPackageHandler = (pkg) => {
  selectedPackage.value = pkg; // this will update the reactive state of the selectedPackage = ref(null) into the selected package from the BookPackage
  newBooking.value.packageId = pkg.packageId;
  console.log("Selected Package:", newBooking.value.packageId);
};

const stepTwoBtn = (activateCallback) => {
  if (!newBooking.value.packageId) {
    alert("Please select a package");
  } else {
    activateCallback("3");
  }
};

//STEP 3
const stepThreeBtn = (activateCallback) => {
  if (!newBooking.value.paymentTerms || !paymentDetails.value.reference) {
    alert("Please fill up al the fields");
  } else {
    activateCallback("4");
  }
};

//STEP 4
const isChecked = ref(false);
const showTermsAndCondition = ref(false);
const showContinueModal = ref(false);

const openTermsAndCondition = () => {
  showTermsAndCondition.value = true;
};

const OpenContinueModal = async () => {
  await addBookingHandler(newBooking, paymentDetails);
  showContinueModal.value = true;
  showTermsAndCondition.value = false;

  setTimeout(() => {
    showContinueModal.value = false;
  }, 3000);
};

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

// FOR CALENDAR
const mapBookingsToEvents = (bookings) => {
  return bookings
    .filter((b) => b.bookStatus === "reserved")
    .map((b) => {
      let backgroundColor;
      let textColor = "white";

      switch (b.mode) {
        case "day-time":
          backgroundColor = "#FFD5";
          textColor = "black";
          break;
        case "night-time":
          backgroundColor = "#6A5ACD";
          break;
        case "whole-day":
          backgroundColor = "#FF6B6B";
          break;
        default:
          backgroundColor = "#90EE94";
          textColor = "#15803D";
      }

      return {
        id: b.bookingId,
        title: b.mode,
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
  dayMaxEvents: true,
  weekends: true,
  events: computed(() => mapBookingsToEvents(bookingStore.bookings)),
});
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
                  class="flex gap-30 m-auto justify-center align-center mt-10"
                >
                  <FloatLabel variant="on">
                    <DatePicker
                      v-model="newBooking.checkInDate"
                      inputId="on_label"
                      showIcon
                      iconDisplay="input"
                    />
                    <label for="on_label">Check-In</label>
                  </FloatLabel>
                  <FloatLabel variant="on">
                    <DatePicker
                      v-model="newBooking.checkOutDate"
                      inputId="on_label"
                      showIcon
                      iconDisplay="input"
                    />
                    <label for="on_label">Check-Out</label>
                  </FloatLabel>
                </div>
                <FullCalendar class="fullCalendar" :options="calendarOptions">
                  <template #eventContent="{ event, timeText }">
                    <b>{{ timeText }}</b> <i>{{ event.title }}</i>
                  </template>
                </FullCalendar>
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
                  <!--<DatePicker
                    v-model="date"
                    inline
                    class="dateChart w-full sm:w-[60rem]"
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
                  </DatePicker>-->
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
                      style="background-color: #90ee94"
                    >
                      <label for="dot" style="margin-left: 50px"
                        >AVAILABLE</label
                      >
                    </span>
                    <span
                      class="dot"
                      id="DayAvailable"
                      style="background-color: #ffd580"
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
                      style="background-color: #ff6b6b"
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
                      style="background-color: #6a5acd"
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
                  v-model="newBooking.mode"
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
                  v-model="newBooking.mode"
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
                  v-model="newBooking.mode"
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
                  nextBtn();
                  stepOneBtn(activateCallback);
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
                <div class="flex flex-col h-[65rem]">
                  <h1
                    class="text-left w-[100%] flex font-black text-4xl font-[Poppins] mt-10 mb-10"
                  >
                    Select Package
                  </h1>
                  <div class="overflow-auto">
                    <BookPackage @availPackage="availPackageHandler" />
                    <!--availPackage comes from the BookPackage and holds the selected-->
                  </div>
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
                    <div class="flex">
                      <p>Date:</p>
                    </div>
                    <div class="w-full flex">
                      <p>Check-in: {{ formatDates(newBooking.checkInDate) }}</p>
                      <button><i class="pi pi-calendar"></i></button>
                    </div>
                    <div class="w-full flex border-1">
                      <p>
                        Check-out: {{ formatDates(newBooking.checkOutDate) }}
                      </p>
                      <div
                        class="relative inline-block text-right border-1"
                        style="right: -20rem"
                      >
                        <i class="pi pi-calendar"></i>
                      </div>
                    </div>
                  </div>

                  <div class="bg-[#fcfcfc] p-2 rounded">
                    <p>Mode: {{ newBooking.mode }}</p>
                  </div>

                  <div class="flex flex-col gap-2">
                    <h1 class="text-lg font-bold font-[Poppins]">
                      Package Selected:
                    </h1>
                    <div class="flex flex-col bg-[#fcfcfc] p-1 rounded-sm">
                      <p>Package Name: {{ selectedPackage?.name }}</p>
                      <p>Inclusion:</p>
                      <pre>{{ selectedPackage?.inclusion }}</pre>
                      <p>Mode:{{ selectedPackage?.mode }}</p>
                    </div>
                    <div class="bg-[#CDDA54] p-1 rounde-sm">
                      <p>VAT Charged:</p>
                    </div>
                    <div class="bg-[#4BB344] p-1 rounded-sm">
                      <p>
                        TOTAL CHARGED: {{ formatPeso(selectedPackage?.price) }}
                      </p>
                    </div>
                  </div>
                  <div class="btn flex pt-6">
                    <Button
                      label="Continue"
                      iconPos="right"
                      @click="
                        nextBtn();
                        stepTwoBtn(activateCallback);
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
                          v-model="newBooking.paymentTerms"
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
                          v-model="newBooking.paymentTerms"
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
                    <div class="flex flex-col bg-[#fcfcfc] p-1 rounded-sm">
                      <p>Package Name: {{ selectedPackage?.name }}</p>
                      <p>Inclusion:</p>
                      <pre>{{ selectedPackage?.inclusion }}</pre>
                      <p>Mode:{{ selectedPackage?.mode }}</p>
                    </div>
                    <div class="bg-[#CDDA54] p-1 rounded-sm">
                      <p>VAT Charged:</p>
                    </div>
                    <div class="bg-[#4BB344] p-1 rounded-sm">
                      <p>
                        TOTAL CHARGED: {{ formatPeso(selectedPackage?.price) }}
                      </p>
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
                          <input
                            class="p-2"
                            placeholder="FEJIJKA4381FK9"
                            v-model="paymentDetails.reference"
                          />
                        </div>
                      </div>
                      <div class="gcashUpload">
                        <h1 class="text-xl font-bold font-[Poppins] mb-3 mt-3">
                          Proof of Payment:
                        </h1>
                        <!--<FileUpload
                          ref="fileupload"
                          v-model="paymentDetails.imageUrl"
                          mode="basic"
                          name="demo[]"
                          url="/api/upload"
                          accept="image/*"
                          :maxFileSize="1000000"
                          @upload="onUpload"
                        />-->
                        <input
                          class="p-2"
                          placeholder="LINK"
                          v-model="paymentDetails.imageUrl"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="flex pt-6 gap-2 flex-col">
                    <Button
                      label="Continue"
                      iconPos="right"
                      @click="
                        nextBtn();
                        stepThreeBtn(activateCallback);
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
                    <p>Package Name: {{ selectedPackage?.name }}</p>
                    <p>Inclusion: {{ selectedPackage?.inclusion }}</p>
                    <p>Mode:{{ selectedPackage?.mode }}</p>
                    <p>Price</p>
                  </div>
                  <div class="bg-[#CDDA54] p-1 rounded-sm">
                    <p>VAT Charged:</p>
                  </div>
                  <div class="bg-[#4BB344] p-1 rounded-sm">
                    <p>
                      TOTAL CHARGED:{{ formatPeso(selectedPackage?.price) }}
                    </p>
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
      <ol class="list-decimal list-inside space-y-2 text-black">
        <li>
          A downpayment Reservation fee of P 2000-3000.00 is required to ensure
          the client's specified schedule.
        </li>

        <li>
          Reservation in case of delay, shall be given an allowance of two (2)
          Days based on agreed time. Without prior notice, the management can
          cancel the reservation and forfeit the down payment after the
          allowable extension time.
        </li>
        <li>
          Reservation fee or down payment is non-refundable in case of
          cancellation.
        </li>
        <li>
          50% of the reservation fee or downpayment can be refundable in cases
          of cancellation due to natural disaster.
        </li>
        <li>
          In case of cancellation, the customer has the option to change the
          date and subject of availability in the area.
        </li>
        <li>
          Full contract payment should be made upon entrance on the day itself
          and excess charges shall be connected upon check—out.
        </li>
        <li>
          It is understood that the management is not responsible for any
          accident, injury, or loss that may occur during the tenure of the
          lease. The Customer waives the right to claim damages against the
          management.
        </li>
        <li>Food and Drinks are not allowed in the Pool hArea</li>
        <li>Swimming when drunk is strictly prohibited.</li>
        <li>Firearms and illegal substances are strictly prohibited</li>
        <li>Children must be always accompanied by adults.</li>
        <li>
          Excess guests will be charged depending on the chosen schedule. In
          Daytime (P100.00/ per head) Overnight (P 150.00/ per head)
        </li>
        <li>Pets are not allowed in the pool premises.</li>
        <li>
          It is our standard procedure to check items and equipment 30 minutes
          upon check—out of guests.
        </li>
        <li>
          Any loss or damage to property during the tenure of the lease shall be
          accounted to the customer.
        </li>
        <li>No refund policy is implemented</li>

        <li>
          <div>Clients must property observe the house rules</div>
        </li>
        <li>
          <div>
            It is understood that the customers agreed on the terms and
            conditions of the Danayas Resorts Events Venue.
          </div>
        </li>
      </ol>

      <div class="checkboxConfirmation" style="margin: auto">
        <input type="checkbox" id="signupCheck" v-model="isChecked" />
        <label for="bookingCheck">I accept all terms & conditions</label>
      </div>
      <button
        class="Bookingbtn"
        :disabled="!isChecked"
        @click="OpenContinueModal"
      >
        Continue
      </button>
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

:deep(.fullCalendar) {
  max-width: 1400px;
  margin: 40px auto;
  height: 600px;

  .fc-button {
    background-color: #41ab5d;
    color: white;
    border-radius: 6px;
  }
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

  .p-datepicker-panel {
    background: #fcfcfc;
  }
  .p-datepicker-header {
    background: #fcfcfc;
  }
  .p-datepicker-day {
    border-radius: 0;
  }
  .p-datepicker-day:hover {
    border-radius: 0;
    font-size: 20px;
  }

  .my-app-dark .p-datepicker-panel,
  .my-app-dark .p-datepicker-header {
    border: none;
    background: #18181b;
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
