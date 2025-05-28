<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
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
import Message from "primevue/message";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";
import TermsCondition from "../components/TermsCondition.vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import { usePublicEntryStore } from "../stores/publicEntryStore.js";
import { useBlockedStore } from "../stores/blockedDateStore.js";

const toast = useToast();
const router = useRouter();

const bookingStore = useBookingStore();
const transactionStore = useTransactionStore();
const paymentStore = usePaymentStore();
const discountStore = useDiscountStore();
const publicStore = usePublicEntryStore();
const blockStore = useBlockedStore();

onMounted(() => {
  bookingStore.fetchUserBookings();
  discountStore.fetchAllDiscounts();
  publicStore.fetchAllPublic();
  blockStore.fetchAllBlocked();
});

const header = ref([
  "Entry Date",
  "Contact & Guest Information",
  "Payment Information",
  "Booking Confirmation",
]);

// Add Booking
const newBooking = ref({
  firstName: "" || null,
  lastName: "" || null,
  contactNo: "" || null,
  address: "" || null,
  discountId: "" || null,
  mode: "",
  paymentTerms: "",
  entryDate: "",
  numAdults: 0,
  numKids: 0,
  adultGuestNames: [],
  kidGuestNames: [],
  discountId: "" || null,
});

const paymentDetails = ref({
  paymentMethod: "gcash",
  reference: "" || null,
  imageUrl: "" || null,
  senderName: "" || null,
  tenderedAmount: "" || null,
});

const onFileSelect = (event) => {
  const file = event.files[0]; // Get the first selected file
  if (file) {
    paymentDetails.value.imageUrl = file; // Update the imageUrl in paymentDetails
  }
};

// Find the discount by ID or name
const discount = discountStore.discounts.find(
  (d) =>
    d.id === newBooking.value.discountId ||
    d.name.toLowerCase() === newBooking.value.discountId?.toLowerCase()
);

const addBookingHandler = async (newBooking, paymentDetails) => {
  try {
    const formatBooking = {
      ...newBooking.value,
      entryDate: formatDate(newBooking.value.entryDate),
      discountId: discount?.discountId || null,
    };

    // 1: Create Booking
    const newPublic = await publicStore.addPublic(formatBooking);
    if (!newPublic || !newPublic.publicEntryId) {
      throw new Error("Failed to create booking: No publicEntryId returned.");
    }

    const publicEntryId = newPublic.publicEntryId;

    // const paymentPayload = {
    //   paymentMethod: paymentDetails.value.paymentMethod,
    //   senderName: paymentDetails.value.senderName,
    //   tenderedAmount: paymentDetails.value.tenderedAmount,
    // };
    // if (paymentDetails.value.paymentMethod === "gcash") {
    //   paymentPayload.reference = paymentDetails.value.reference;
    //   paymentPayload.imageUrl = paymentDetails.value.imageUrl;
    // }

    // 2: Create Payment with id
    const fullPaymentDetails = {
      ...paymentDetails.value,
      publicEntryId,
    };

    console.log("Full payment details being sent:", fullPaymentDetails);
    await paymentStore.addPayment(fullPaymentDetails);

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Booking and Payment successfully created!",
      life: 3000,
    });

    await publicStore.fetchAllPublic();
  } catch (err) {
    console.error("Error adding booking", err);
  }
};

//STEP: 1
const stepOneBtn = (activateCallback) => {
  // const { checkInDate, checkOutDate, mode } = newBooking.value;
  // if (!checkInDate || !checkOutDate || !mode) {
  //   alert("Please fill up all fields");
  // } else {
  //   activateCallback("2");
  // }
  activateCallback("2");
};

const minDate = new Date();

const disabledDates = computed(() => {
  const disabled = [];

  // Blocked dates
  blockStore.blocked.forEach((bd) => {
    if (bd.blockedDates) {
      disabled.push(new Date(bd.blockedDates));
    }
  });

  // Fully booked dates (whole-day or both day-time and night-time)
  const bookingsByDate = {};
  bookingStore.bookings.forEach((b) => {
    if (b.checkInDate) {
      const date = b.checkInDate;
      if (!bookingsByDate[date]) bookingsByDate[date] = new Set();
      bookingsByDate[date].add(b.mode);
    }
  });
  publicStore.public.forEach((p) => {
    if (p.entryDate) {
      const date = p.entryDate;
      if (!bookingsByDate[date]) bookingsByDate[date] = new Set();
      bookingsByDate[date].add(p.mode);
    }
  });

  Object.entries(bookingsByDate).forEach(([date, modes]) => {
    if (
      modes.has("whole-day") ||
      (modes.has("day-time") && modes.has("night-time"))
    ) {
      disabled.push(new Date(date));
    }
  });

  return disabled;
});

const getBookingStyle = (slotDate) => {
  const formattedDate = `${slotDate.year}-${String(slotDate.month + 1).padStart(
    2,
    "0"
  )}-${String(slotDate.day).padStart(2, "0")}`;

  // Collect all booking/public modes for the date
  const mode = new Set();
  let isBlocked = false;

  bookingStore.bookings.forEach((b) => {
    if (b.checkInDate === formattedDate) {
      mode.add(b.mode);
    }
  });

  publicStore.public.forEach((p) => {
    if (p.entryDate === formattedDate) {
      mode.add(p.mode);
    }
  });

  if (blockStore.blocked.some((bd) => bd.blockedDates === formattedDate)) {
    isBlocked = true;
  }

  let backgroundColor, color;

  if (isBlocked) {
    backgroundColor = "grey";
    color = "white";
  } else if (
    mode.has("whole-day") ||
    (mode.has("day-time") && mode.has("night-time"))
  ) {
    backgroundColor = "#FF6B6B"; // Fully Booked
    color = "white";
  } else if (mode.has("day-time")) {
    backgroundColor = "#6A5ACD"; // Night Available
    color = "white";
  } else if (mode.has("night-time")) {
    backgroundColor = "#FFD580"; // Day Available
    color = "black";
  } else {
  }

  return {
    backgroundColor,
    color,
    width: "40px",
    height: "40px",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "10rem",
    fontSize: "17px",
  };
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
  // if (!newBooking.value.packageId) {
  //   alert("Please select a package");
  // } else {
  //   activateCallback("3");
  // }
  activateCallback("3");
};

watch(
  () => newBooking.value.numAdults,
  (newVal, oldVal) => {
    if (newVal > oldVal) {
      for (let i = oldVal; i < newVal; i++)
        newBooking.value.adultGuestNames.push("");
    } else {
      newBooking.value.adultGuestNames.splice(newVal);
    }
  }
);

watch(
  () => newBooking.value.numKids,
  (newVal, oldVal) => {
    if (newVal > oldVal) {
      for (let i = oldVal; i < newVal; i++)
        newBooking.value.kidGuestNames.push("");
    } else {
      newBooking.value.kidGuestNames.splice(newVal);
    }
  }
);

//STEP 3
const stepThreeBtn = (activateCallback) => {
  // if (!newBooking.value.paymentTerms || !paymentDetails.value.reference) {
  //   alert("Please fill up al the fields");
  // } else {
  //   activateCallback("4");
  // }
  activateCallback("4");
};

const authStore = useAuthStore();
const userStore = useUserStore();

const userData = ref({
  username: "",
  firstName: "",
  lastName: "",
  contactNo: "",
  email: "",
  address: "",
});

onMounted(async () => {
  const userId = authStore.user?.userId;

  if (!userId) {
    console.error("No userId found in authStore.user");
    return;
  }

  const fetchedUser = await userStore.getUserById(userId);

  userData.value = {
    username: fetchedUser.username,
    firstName: fetchedUser.firstName,
    lastName: fetchedUser.lastName,
    contactNo: fetchedUser.contactNo,
    email: fetchedUser.email,
    address: fetchedUser.address,
  };
});

let visible = ref(false);
let visible1 = ref(false);
const termsVisible = ref(false);

const showMessage = () => {
  visible.value = true;
  visible1.value = false;
};

const showMessage1 = () => {
  visible1.value = true;
  visible.value = false;
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
    router.push("/logs");
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
const mapBookingsToEvents = (
  bookings = [],
  publics = [],
  blockedDates = []
) => {
  const eventByDate = {};

  bookings.forEach((b) => {
    const date = b.checkInDate;
    if (!eventByDate[date])
      eventByDate[date] = { modes: new Set(), blocked: null };
    eventByDate[date].modes.add(b.mode);
  });

  publics.forEach((p) => {
    const date = p.entryDate;
    if (!eventByDate[date])
      eventByDate[date] = { modes: new Set(), blocked: null };
    eventByDate[date].modes.add(p.mode);
  });

  blockedDates.forEach((bd) => {
    const date = bd.blockedDates;
    if (!eventByDate[date])
      eventByDate[date] = { modes: new Set(), blocked: null };
    eventByDate[date].blocked = bd;
  });

  return Object.entries(eventByDate).map(([date, { modes, blocked }]) => {
    let backgroundColor, textColor, title;

    if (blocked) {
      backgroundColor = "grey";
      textColor = "white";
      title = "Not Available";
    } else if (
      modes.has("whole-day") ||
      (modes.has("day-time") && modes.has("night-time"))
    ) {
      backgroundColor = "#FF6B6B";
      textColor = "white";
      title = "Fully Booked";
    } else if (modes.has("day-time")) {
      backgroundColor = "#6A5ACD";
      textColor = "white";
      title = "Night Available";
    } else if (modes.has("night-time")) {
      backgroundColor = "#FFD580";
      textColor = "black";
      title = "Day Available";
    } else {
      backgroundColor = "#90EE90";
      textColor = "#15803D";
      title = "Available";
    }

    return {
      id: `summary-${date}`,
      title,
      start: date,
      backgroundColor,
      textColor,
      allDay: true,
    };
  });
};

const calendarEvents = computed(() => {
  return mapBookingsToEvents(
    bookingStore.bookings,
    publicStore.public,
    blockStore.blocked
  );
});

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
  events: calendarEvents,
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
            <div class="absolute bottom-0 left-[-1] right-60 top-25">
              Entry Date
            </div>
          </Step>
          <Step value="2">
            <i
              class="pi pi-users z-10 absolute top-5 right-67"
              style="font-size: 3rem"
            ></i>
            <div class="absolute bottom-0 left-[-1] right-50 top-25">
              Contact & <br />
              Guest Information
            </div>
          </Step>
          <Step value="3">
            <i
              class="pi pi-credit-card z-10 absolute top-5 right-67"
              style="font-size: 3rem"
            ></i>
            <div class="absolute bottom-0 left-[-1] right-58 top-25">
              Payment <br />Information
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
                  class="flex m-auto justify-center align-center mt-20 mb-20"
                >
                  <div class="flex gap-40 mr-53 ml-53">
                    <div>
                      <h1 class="mb-10 text-center font-[600] text-lg">
                        Select Entry Date
                      </h1>
                      <div class="flex gap-10">
                        <FloatLabel variant="on">
                          <DatePicker
                            v-model="newBooking.entryDate"
                            showIcon
                            fluid
                            iconDisplay="input"
                            dateFormat="mm-dd-yy"
                            :minDate="minDate"
                            :disabledDates="disabledDates"
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
                            </template></DatePicker
                          >
                          <label for="on_label">Entry Date</label>
                        </FloatLabel>
                      </div>
                    </div>
                    <div class="flex">
                      <div class="ml-10">
                        <h1 class="mb-10 text-center font-[600] c">Mode</h1>
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
                      </div>
                    </div>
                  </div>
                </div>
                <FullCalendar class="fullCalendar" :options="calendarOptions">
                  <template #eventContent="{ event, timeText }">
                    <b>{{ timeText }}</b> <i>{{ event.title }}</i>
                  </template>
                </FullCalendar>
                <div class="mb-20 mt-30 relative -top-24">
                  <div
                    class="bg-[#9edf9c] h-40 w-full flex flex-col md:flex-row align-center gap-10 px-10 py-6 rounded relative"
                  >
                    <h1
                      class="text-3xl font-[Poppins] font-black text-center text-left mb-4 mr-10 relative bottom-[-2rem]"
                    >
                      Date Status:
                    </h1>

                    <div class="flex flex-col gap-10 mr-50">
                      <div class="flex items-center gap-4">
                        <span class="w-6 h-6 rounded-full bg-white"></span>
                        <label class="text-sm font-semibold">AVAILABLE</label>
                      </div>
                      <div class="flex items-center gap-4">
                        <span class="w-6 h-6 rounded-full bg-[#ffd580]"></span>
                        <label class="text-sm font-semibold"
                          >DAY AVAILABLE</label
                        >
                      </div>
                    </div>

                    <div class="flex flex-col gap-4 gap-10">
                      <div class="flex items-center gap-4">
                        <span class="w-6 h-6 rounded-full bg-[#ff6b6b]"></span>
                        <label class="text-sm font-semibold"
                          >FULLY BOOKED</label
                        >
                      </div>
                      <div class="flex items-center gap-4">
                        <span class="w-6 h-6 rounded-full bg-[#6a5acd]"></span>
                        <label class="text-sm font-semibold"
                          >NIGHT AVAILABLE</label
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-5 ml-90">
              <Button
                @click="
                  nextBtn();
                  stepOneBtn(activateCallback);
                "
                class="bg-[#194d1d] relative top-[-9rem] text-white w-50 h-15 font-black font-[Poppins] text-xl rounded-xl cursor-pointer ml-[45rem]"
              >
                CONTINUE
              </Button>
            </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback }" value="2">
            <div class="flex h-auto m-auto justify-center content-center">
              <div
                class="flex-col flex justify-center items-center font-medium h-auto w-[50rem] mt-5"
              >
                >
                <div class="flex flex-col overflow-auto h-[65rem]">
                  <h1
                    class="text-left w-[100%] flex font-black text-4xl font-[Poppins] mt-10"
                  >
                    Contact Information:
                  </h1>
                  <div class="mt-10">
                    <div class="personalInfo">
                      <div>
                        <label>First Name:</label>
                        <input
                          class="packEvents"
                          placeholder="First Name"
                          v-model="userData.firstName"
                        />
                      </div>
                      <div>
                        <label>Last Name:</label>
                        <input
                          class="packEvents"
                          placeholder="Last Name"
                          v-model="userData.lastName"
                        />
                      </div>
                      <div>
                        <label>Contact No.:</label>
                        <input
                          class="packEvents"
                          placeholder="Contact No"
                          v-model="userData.contactNo"
                        />
                      </div>
                      <div>
                        <label>Address</label>
                        <input
                          class="packEvents"
                          placeholder="Email Address"
                          v-model="userData.address"
                        />
                      </div>
                    </div>

                    <div class="guestInfo">
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
                    <h1
                      class="text-left w-full flex font-black text-4xl font-[Poppins] mt-10 mb-10"
                    >
                      Guest Information:
                    </h1>

                    <div class="flex flex-row gap-80 items-start">
                      <!-- Adults -->
                      <div class="flex flex-col mb-20">
                        <label>Number of Adults:</label>
                        <InputNumber
                          v-model="newBooking.numAdults"
                          showButtons
                          buttonLayout="horizontal"
                          style="width: 100%"
                          :min="0"
                          :max="99"
                        >
                          <template #incrementbuttonicon>
                            <span class="pi pi-plus" />
                          </template>
                          <template #decrementbuttonicon>
                            <span class="pi pi-minus" />
                          </template>
                        </InputNumber>

                        <div
                          v-for="(adult, index) in newBooking.adultGuestNames"
                          :key="'adult-' + index"
                          class="mt-2"
                          style="width: 100%"
                        >
                          <InputText
                            v-model="newBooking.adultGuestNames[index]"
                            placeholder="Enter guest name"
                          />
                        </div>
                      </div>

                      <!-- Kids -->
                      <div class="flex flex-col mb-20">
                        <label>Number of Kids:</label>
                        <InputNumber
                          v-model="newBooking.numKids"
                          showButtons
                          buttonLayout="horizontal"
                          style="width: 100%"
                          :min="0"
                          :max="99"
                        >
                          <template #incrementbuttonicon>
                            <span class="pi pi-plus" />
                          </template>
                          <template #decrementbuttonicon>
                            <span class="pi pi-minus" />
                          </template>
                        </InputNumber>

                        <div
                          v-for="(kid, index) in newBooking.kidGuestNames"
                          :key="'kid-' + index"
                          class="mt-2"
                          style="width: 100%"
                        >
                          <InputText
                            v-model="newBooking.kidGuestNames[index]"
                            placeholder="Enter kid's name"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="flex-col flex justify-center items-center font-medium h-auto w-[40rem] mt-5"
              >
                <div
                  class="bg-[#9EDF9C] p-5 rounded-lg w-[30rem] h-[55rem] mt-10"
                >
                  <h1
                    class="font-black font-[Poppins] text-2xl p-5 flex align-center justify-center m-auto"
                  >
                    Booking Summary:
                  </h1>

                  <div class="bg-[#fcfcfc] rounded-sm p-2 mb-2">
                    <div class="flex">
                      <p>
                        Date: {{ formatDates(newBooking.checkInDate) }} to
                        {{ formatDates(newBooking.checkOutDate) }}
                      </p>
                    </div>
                    <div class="w-full flex">
                      <p>Check-in: {{ formatDates(newBooking.checkInDate) }}</p>
                    </div>
                    <div class="w-full flex">
                      <p>
                        Check-out: {{ formatDates(newBooking.checkOutDate) }}
                      </p>
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
                      <p class="whitespace-pre-wrap">
                        {{ selectedPackage?.inclusion }}
                      </p>
                      <p>Mode: {{ selectedPackage?.mode }}</p>
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
                    Payment Details:
                  </h1>

                  <div class="mt-10">
                    <h1 class="text-xl font-bold font-[Poppins]">
                      Payment Terms:
                    </h1>

                    <div class="flex items-center gap-5 mt-5 mb-5">
                      <div class="flex items-center gap-2">
                        <RadioButton
                          v-model="newBooking.paymentTerms"
                          inputId="installment"
                          name="paymentTerm"
                          value="installment"
                          size="large"
                          @click="showMessage"
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
                          @click="showMessage1"
                        />
                        <label for="nightMode" class="text-xl font-[Poppins]"
                          >Full Payment</label
                        >
                      </div>
                    </div>
                    <div class="">
                      <div>
                        <h1 class="text-lg font-bold font-[Poppins]">
                          Payment:
                        </h1>
                        <h1 class="text-lg font-sm font-[Poppins] text-center">
                          DANAYAS RESORTS EVENTS VENUE: <br />
                          09xx xxx xxxx
                        </h1>

                        <div class="mt-10 mb-10">
                          <h1 class="text-lg font-bold font-[Poppins] mb-3">
                            Tendered Amount:
                          </h1>

                          <div>
                            <InputText
                              class="p-2 bg-[#fcfcfc] mb-2 rounded w-100"
                              placeholder="e.g. 2000"
                              v-model="paymentDetails.tenderedAmount"
                            />
                          </div>
                          <h1 class="text-m font-[Poppins] mb-1">
                            GCASH Reference Code:
                          </h1>
                          <div>
                            <InputText
                              class="p-2 bg-[#fcfcfc] mb-2 rounded w-100"
                              placeholder="FEJIJKA4381FK9"
                              v-model="paymentDetails.reference"
                            />
                          </div>
                        </div>
                        <div>
                          <h1
                            class="text-xl font-bold font-[Poppins] mb-5 mt-3"
                          >
                            Proof of Payment:
                          </h1>
                          <h1 class="text-m font-[Poppins]">
                            Name of the Sender:
                          </h1>
                          <div class="bg-[#fcfcfc] mb-2 p-1 rounded-sm">
                            <InputText
                              class="p-2 bg-[#fcfcfc] mb-2 rounded w-100"
                              placeholder="Pocholo Diolola"
                              v-model="paymentDetails.senderName"
                            />
                          </div>
                        </div>
                        <div class="gcashUpload">
                          <FileUpload
                            class="mb-5"
                            ref="fileupload"
                            v-model="paymentDetails.imageUrl"
                            mode="basic"
                            name="imageUrl"
                            url="/api/upload"
                            accept="image/*"
                            :maxFileSize="1000000"
                            @select="onFileSelect"
                          />
                        </div>
                      </div>
                    </div>
                    <Message v-if="visible" severity="error"
                      >You are required to pay a ₱3,000 down payment. The
                      remaining balance must be settled on the reserved date.<br />📌
                      Bookings are non-refundable.<br /><br />
                      <span
                        class="text-blue-600 underline cursor-pointer"
                        @click="termsVisible = true"
                      >
                        View full Terms and Conditions
                      </span></Message
                    >
                    <Message v-if="visible1" severity="error"
                      >You are required to pay the total amount upon booking to
                      secure your reservation.<br />📌 Bookings are
                      non-refundable.
                      <span
                        class="text-blue-600 underline cursor-pointer"
                        @click="termsVisible = true"
                      >
                        View full Terms and Conditions
                      </span></Message
                    >
                  </div>

                  <TermsCondition v-model:visible="termsVisible" />
                </div>
              </div>
              <div
                class="flex-col flex justify-center items-center font-medium h-auto w-[40rem] mt-5"
              >
                <div class="bg-[#9EDF9C] p-5 rounded-lg w-[30rem] h-auto mt-10">
                  <h1
                    class="font-black font-[Poppins] text-2xl p-5 flex align-center justify-center m-auto"
                  >
                    Booking Summary:
                  </h1>

                  <div class="bg-[#fcfcfc] mb-2 p-2 rounded-sm">
                    <div class="flex">
                      <p>
                        Date: {{ formatDates(newBooking.checkInDate) }} to
                        {{ formatDates(newBooking.checkOutDate) }}
                      </p>
                    </div>
                    <div class="w-full flex">
                      <p>Check-in: {{ formatDates(newBooking.checkInDate) }}</p>
                    </div>
                    <div class="w-full flex">
                      <p>
                        Check-out: {{ formatDates(newBooking.checkOutDate) }}
                      </p>
                    </div>
                  </div>

                  <div class="bg-[#fcfcfc] p-2 rounded-sm">
                    <p>Mode: {{ newBooking.mode }}</p>
                  </div>

                  <div class="flex flex-col gap-2">
                    <h1 class="text-lg font-bold font-[Poppins]">
                      Package Selected:
                    </h1>
                    <div class="flex flex-col bg-[#fcfcfc] p-1 rounded-sm">
                      <p>Package Name: {{ selectedPackage?.name }}</p>
                      <p>Inclusion:</p>
                      <p class="whitespace-pre-wrap">
                        {{ selectedPackage?.inclusion }}
                      </p>
                      <p>Mode: {{ selectedPackage?.mode }}</p>
                    </div>

                    <div class="bg-[#4BB344] p-1 rounded-sm">
                      <p>
                        TOTAL CHARGED: {{ formatPeso(selectedPackage?.price) }}
                      </p>
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
                class="bg-[#9EDF9C] p-5 rounded-lg w-[70rem] h-auto mt-10 mb-10"
              >
                <h1
                  class="font-black font-[Poppins] text-3xl p-5 flex align-center justify-center m-auto"
                >
                  Booking Summary:
                </h1>

                <div class="bg-[#fcfcfc] mb-2 p-2 rounded-sm">
                  <div class="flex gap-2">
                    <p>
                      Date: {{ formatDates(newBooking.checkInDate) }} to
                      {{ formatDates(newBooking.checkOutDate) }}
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <p>Check-in: {{ formatDates(newBooking.checkInDate) }}</p>
                  </div>
                  <div class="flex gap-2">
                    <p>Check-out: {{ formatDates(newBooking.checkOutDate) }}</p>
                    <button class=""></button>
                  </div>
                  <div class="">
                    <p>Mode: {{ newBooking.mode }}</p>
                  </div>
                  <div class="">
                    <p>Arrival Time: {{ newBooking.arrivalTime }}</p>
                  </div>
                  <div class="">
                    <p>Catering: {{ newBooking.catering }}</p>
                  </div>
                </div>

                <div>
                  <h1 class="text-lg font-bold font-[Poppins]">
                    Guest Information:
                  </h1>
                  <div class="bg-[#fcfcfc] mb-2 p-2 rounded-sm">
                    <div class="">
                      <p>
                        Name: {{ userData.firstName }} {{ userData.lastName }}
                      </p>
                    </div>
                    <div class="">
                      <p>Contact No.: {{ userData.contactNo }}</p>
                    </div>
                    <div class="">
                      <p>Email Address: {{ userData.email }}</p>
                    </div>
                    <div class="">
                      <p>Address: {{ userData.address }}</p>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col gap-2">
                  <h1 class="text-lg font-bold font-[Poppins]">
                    Package Selected:
                  </h1>
                  <div class="flex flex-col bg-[#fcfcfc] p-1 rounded-sm">
                    <p>Package Name: {{ selectedPackage?.name }}</p>
                    <p>Inclusion:</p>
                    <p class="whitespace-pre-wrap">
                      {{ selectedPackage?.inclusion }}
                    </p>
                    <p>Mode: {{ selectedPackage?.mode }}</p>
                  </div>

                  <div class="bg-[#4BB344] p-1 rounded-sm">
                    <p>
                      TOTAL CHARGED:{{ formatPeso(selectedPackage?.price) }}
                    </p>
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
      <Button
        class="Bookingbtn"
        :disabled="!isChecked"
        @click="OpenContinueModal"
      >
        Continue
      </Button>
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
    background-color: #9edf9c;
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
