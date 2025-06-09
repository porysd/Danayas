``
<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";

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
import Divider from "primevue/divider";
import TreeTable from "primevue/treetable";
import Column from "primevue/column";
import Message from "primevue/message";
import Toast from "primevue/toast";
import InputNumber from "primevue/inputnumber";
import { useToast } from "primevue/usetoast";

import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";

import { useBookingStore } from "../stores/bookingStore";
import { usePaymentStore } from "../stores/paymentStore";
import { useDiscountStore } from "../stores/discountStore";
import { usePublicEntryStore } from "../stores/publicEntryStore.js";
import { useBlockedStore } from "../stores/blockedDateStore.js";
import { usePackageStore } from "../stores/packageStore.js";
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";
import { useCatalogStore } from "../stores/catalogStore";
import { useAddOnsStore } from "../stores/addOnsStore";

import { formatPeso } from "../utility/pesoFormat";
import { formatDate, formatDateISO, formatDates } from "../utility/dateFormat";
import {
  getBookingStyle,
  disabledDates,
  fullCalendarEvents,
} from "../composables/calendarStyle";

import TermsCondition from "../components/TermsCondition.vue";

import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import { useTermsStore } from "../stores/termStore";
const termsStore = useTermsStore();

const toast = useToast();
const router = useRouter();
const bookingStore = useBookingStore();
const paymentStore = usePaymentStore();
const discountStore = useDiscountStore();
const publicStore = usePublicEntryStore();
const blockStore = useBlockedStore();
const packageStore = usePackageStore();
const addOnStore = useAddOnsStore();
const catalogStore = useCatalogStore();
const route = useRoute();
const selectedPackage = ref(null);
const selectedmode = ref("");
const { calendarEvents, calendarOptions } = fullCalendarEvents();

onMounted(async () => {
  bookingStore.fetchUserBookings();
  discountStore.fetchAllDiscounts();
  publicStore.fetchAllPublic();
  blockStore.fetchAllBlocked();
  catalogStore.fetchAllCatalogs();
  termsStore.fetchAlltermAndCondition();

  if (packageStore.packages.length === 0 && packageStore.fetchAllPackages) {
    await packageStore.fetchAllPackages();
  }

  const packageId = route.query.packageId;
  if (packageId) {
    const pkg = packageStore.packages.find(
      (p) => String(p.packageId) === String(packageId)
    );
    if (pkg) {
      selectedPackage.value = pkg;
      selectedmode.value = pkg.mode;
      newBooking.value.packageId = pkg.packageId;
      newBooking.value.mode = pkg.mode;
      newBooking.value.catalogAddOnIds = pkg.catalogAddOnIds;

      // if (newBooking.value.mode !== pkg.mode) {
      //   toast.add({
      //     severity: "success",
      //     summary: "Refund Completed ",
      //     detail: "The refund has been completed successfully.",
      //     life: 3000,
      //   });
      // }
    }
  }
});

const availPackageHandler = (pkg) => {
  selectedPackage.value = pkg;
  selectedmode.value = pkg.mode;
  newBooking.value.packageId = pkg.packageId;
  newBooking.value.mode = pkg.mode;
};

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
  catalogAddOnIds: [] || null,
  paymentTerms: "",
});

const paymentDetails = ref({
  paymentMethod: "gcash",
  reference: "",
  imageUrl: "" || null,
  senderName: "",
  tenderedAmount: "",
});

// STEP 1
const stepOneBtn = (activateCallback) => {
  console.log("isLoggedIn", authStore.isLoggedIn);
  const { checkInDate, checkOutDate, mode } = newBooking.value;
  if (!checkInDate || !checkOutDate || !mode || !authStore.isLoggedIn) {
    alert("Please fill up all fields or Login or SignUp first");
  } else {
    activateCallback("2");
  }
  // activateCallback("2");
};

watch(
  () => [newBooking.value.checkInDate, newBooking.value.mode],
  ([checkInDate, mode]) => {
    if (!checkInDate) {
      newBooking.value.checkOutDate = "";
      return;
    }
    const date = new Date(checkInDate);
    if (mode === "night-time" || mode === "whole-day") {
      date.setDate(date.getDate() + 1);
      newBooking.value.checkOutDate = date;
    } else {
      newBooking.value.checkOutDate = checkInDate;
    }
  }
);

watch(
  () => newBooking.value.checkInDate,
  () => {
    newBooking.value.mode = "";
  }
);

watch(
  () => newBooking.value.mode,
  (newMode, oldMode) => {
    if (
      selectedPackage.value &&
      newMode &&
      selectedPackage.value.mode !== newMode
    ) {
      toast.add({
        severity: "warn",
        summary: "Mode Mismatch",
        detail:
          "The selected package is not applicable to the mode you selected. Please select a matching package or mode.",
        life: 4000,
      });
    }
  }
);

watch(
  [
    selectedPackage,
    () => newBooking.value.catalogAddOnIds,
    () => catalogStore.catalog,
  ],
  ([pkg, addOns, catalog]) => {
    // Build add-ons HTML
    let addOnsHtml = "";
    let addOnsTotal = 0;
    if (addOns && addOns.length && catalog && catalog.length) {
      addOnsHtml = addOns
        .map((addOnId) => {
          const addOn = catalog.find(
            (a) => String(a.catalogAddOnId) == String(addOnId)
          );
          if (addOn) {
            addOnsTotal += addOn.price || 0;
            return `<br><strong>Add-On:</strong> ${
              addOn.itemName
            } - ${formatPeso(addOn.price)}`;
          }
          return "";
        })
        .join("");
    }

    nodes.value = [
      {
        key: 1,
        data: {
          description: pkg
            ? `<strong>Package:</strong> ${pkg.name}<br>
               <strong>Inclusion:</strong> ${pkg.inclusion}<br>
               <strong>Mode:</strong> ${pkg.mode}${
                addOnsHtml ? addOnsHtml : ""
              }`
            : "No package selected",
          price: pkg ? formatPeso((pkg.price || 0) + addOnsTotal) : "₱0",
        },
      },
    ];
  }
);

watch(
  () => newBooking.value.paymentTerms,
  (val) => {
    if (val === "full-payment") {
      paymentDetails.value.tenderedAmount = totalAmount.value;
    } else if (val === "installment") {
      paymentDetails.value.tenderedAmount = null;
    }
  }
);
watch(() => {
  () => newBooking.value.numberOfGuest,
    (val) => {
      if (val < 0) {
        newBooking.value.numberOfGuest = Math.abs(val);
      }
    };
});

const minDate = new Date();

const checkOutMinDate = computed(() => {
  if (!newBooking.value.checkInDate) return minDate;
  const checkIn = new Date(newBooking.value.checkInDate);
  if (
    newBooking.value.mode === "night-time" ||
    newBooking.value.mode === "whole-day"
  ) {
    const nextDay = new Date(checkIn);
    nextDay.setDate(checkIn.getDate() + 1);
    return nextDay;
  }
  return checkIn;
});

const maxDate = computed(() => {
  if (!newBooking.value.checkInDate) return null;
  const checkIn = new Date(newBooking.value.checkInDate);
  if (
    newBooking.value.mode === "night-time" ||
    newBooking.value.mode === "whole-day"
  ) {
    const nextDay = new Date(checkIn);
    nextDay.setDate(checkIn.getDate() + 1);
    return nextDay;
  }
  return checkIn;
});

const allowedStatus = ["reserved", "pending", "rescheduled"];

const unavailableModes = computed(() => {
  const date = newBooking.value.checkInDate;
  if (!date) return new Set();

  const formattedDate = formatDateISO(date);

  const modes = new Set();

  bookingStore.bookings
    .filter((b) => allowedStatus.includes(b.bookStatus))
    .forEach((b) => {
      if (b.checkInDate) {
        const bookingDate =
          typeof b.checkInDate === "string"
            ? b.checkInDate.slice(0, 10)
            : new Date(b.checkInDate).toISOString().split("T")[0];

        if (bookingDate === formattedDate) {
          modes.add(b.mode);
        }
      }
    });

  publicStore.public
    .filter((p) => allowedStatus.includes(p.status))
    .forEach((p) => {
      if (p.entryDate) {
        const entryDate =
          typeof p.entryDate === "string"
            ? p.entryDate.slice(0, 10)
            : new Date(p.entryDate).toISOString().split("T")[0];

        if (entryDate === formattedDate) {
          modes.add(p.mode);
        }
      }
    });

  if (modes.has("whole-day")) {
    return new Set(["day-time", "night-time", "whole-day"]);
  }
  return modes;
});

//STEP 2 SELECT PACKAGE & RATE
// ref = reactive state
// selectedPackage is a reactive state that will hold the selected package fromt child (BookPackage)
const stepTwoBtn = (activateCallback) => {
  if (!newBooking.value.packageId) {
    alert("Please select a package");
  } else {
    activateCallback("3");
  }
  //activateCallback("3");
};

const nodes = ref([
  {
    key: 1,
    data: {
      description: "No package selected",
      price: selectedPackage.value
        ? formatPeso(selectedPackage.value.price)
        : "₱0",
    },
  },
]);

// STEP 3 CONTACT INFORMATION
const stepThreeBtn = (activateCallback) => {
  const paymentTerms = newBooking.value.paymentTerms;
  const tenderedAmount = paymentDetails.value.tenderedAmount;
  const pkg = selectedPackage.value;

  if (
    !paymentTerms ||
    !paymentDetails.value.reference ||
    !tenderedAmount ||
    !paymentDetails.value.imageUrl
  ) {
    alert("Please fill in all payment fields.");
    return;
  }

  if (paymentTerms === "installment" && tenderedAmount < 2000) {
    toast.add({
      severity: "warn",
      summary: "Installment Warning",
      detail: "watch must be at least ₱2,000 for installment.",
      life: 4000,
    });
    return; // Block step
  }

  if (
    paymentTerms === "full-payment" &&
    pkg &&
    Number(tenderedAmount) < Number(pkg.price)
  ) {
    toast.add({
      severity: "warn",
      summary: "Full Payment Warning",
      detail: `Tendered amount must be equal to the total price (${formatPeso(
        pkg.price
      )}) for full payment.`,
      life: 4000,
    });
    return;
  }

  activateCallback("4");
};

const arrivalTimeOptions = computed(() => {
  const times = [];
  if (newBooking.value.mode === "day-time") {
    // 9:00 AM to 5:00 PM (in 30-minute increments)
    let hour = 9,
      minute = 0;
    while (hour < 17 || (hour === 17 && minute === 0)) {
      const h = hour % 12 === 0 ? 12 : hour % 12;
      const ampm = hour < 12 ? "AM" : "PM";
      times.push(`${h}:${minute === 0 ? "00" : "30"} ${ampm}`);
      if (minute === 0) minute = 30;
      else {
        minute = 0;
        hour++;
      }
    }
  } else if (newBooking.value.mode === "night-time") {
    // 7:00 PM to 11:30 PM
    let hour = 19,
      minute = 0;
    while (hour < 24 || (hour === 24 && minute === 0)) {
      const h = hour % 12 === 0 ? 12 : hour % 12;
      times.push(`${h}:${minute === 0 ? "00" : "30"} PM`);
      if (hour === 23 && minute === 30) break;
      if (minute === 0) minute = 30;
      else {
        minute = 0;
        hour++;
      }
    }
    // 12:00 AM to 5:00 AM
    hour = 0;
    minute = 0;
    while (hour < 5 || (hour === 5 && minute === 0)) {
      const h = hour === 0 ? 12 : hour;
      times.push(`${h}:${minute === 0 ? "00" : "30"} AM`);
      if (hour === 5 && minute === 0) break;
      if (minute === 0) minute = 30;
      else {
        minute = 0;
        hour++;
      }
    }
  }
  return times;
});

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

const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/jfif"];

const onFileSelect = (event) => {
  const file = event.files[0]; // Get the first selected file
  if (file) {
    if (!allowedMimeTypes.includes(file.type)) {
      fileError.value =
        "Invalid file type. Only JPEG, PNG, JPG, and JFIF are allowed.";
      paymentDetails.value.imageUrl = null;
      return;
    }

    paymentDetails.value.imageUrl = file;
  }
};

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

// STEP 4 BOOKING CONFIRMATION
const isChecked = ref(false);
const showTermsAndCondition = ref(false);
const showContinueModal = ref(false);

const openTermsAndCondition = () => {
  showTermsAndCondition.value = true;
};

// Find the discount by ID or name
const discount = discountStore.discounts.find(
  (d) =>
    d.id === newBooking.value.discountId ||
    d.name.toLowerCase() === newBooking.value.discountId?.toLowerCase()
);

const selectedDiscount = computed(() => {
  return discountStore.discounts.find(
    (d) => d.discountId === newBooking.value.discountId
  );
});

const addOnsTotal = computed(() => {
  if (!newBooking.value.catalogAddOnIds || !catalogStore.catalog) return 0;
  return newBooking.value.catalogAddOnIds.reduce((sum, addOnId) => {
    const addOn = catalogStore.catalog.find(
      (c) => c.catalogAddOnId === addOnId
    );
    return sum + (addOn?.price || 0);
  }, 0);
});

const totalAmount = computed(() => {
  const pkg = selectedPackage.value;
  const pkgPrice = pkg?.price || 0;
  const discount = selectedDiscount.value?.percentage || 0;
  const discounted = pkgPrice - pkgPrice * (discount / 100);
  const addOns = addOnsTotal.value || 0;

  let extra = 0;
  const guestCount = Number(newBooking.value.numberOfGuest) || 0;
  const maxPax = pkg?.maxPax || 0;
  if (guestCount > maxPax) {
    const extraGuests = guestCount - maxPax;
    if (newBooking.value.mode === "day-time") extra = extraGuests * 100;
    if (
      newBooking.value.mode === "night-time" ||
      newBooking.value.mode === "whole-day"
    )
      extra = extraGuests * 150;
  }

  return Math.max(discounted + addOns + extra, 0);
});

const addBookingHandler = async (newBooking, paymentDetails) => {
  try {
    const discount = discountStore.discounts.find(
      (d) => d.discountId === newBooking.value.discountId
    );
    // 1: Create Booking
    const formatBooking = {
      ...newBooking.value,
      checkInDate: formatDate(newBooking.value.checkInDate),
      checkOutDate: formatDate(newBooking.value.checkOutDate),
      discountId: null,
    };
    const createdBooking = await bookingStore.addBooking(formatBooking);
    const bookingId = createdBooking.bookingId;

    // 2: Connect Booking to Payment
    const formatPayment = {
      ...paymentDetails.value,
      bookingId,
    };

    try {
      await paymentStore.addPayment(formatPayment);
    } catch (err) {
      await bookingStore.deleteBooking(bookingId);
      toast.add({
        severity: "error",
        summary: "Payment Failed",
        detail: "Payment was not successfull. Booking was not completed",
        life: 4000,
      });

      return;
    }

    if (newBooking.catalogAddOnIds?.length > 0) {
      for (const catalogAddOnId of newBooking.catalogAddOnIds) {
        await addOnStore.addAddOn({ bookingId, catalogAddOnId });
      }
    }

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Booking and Payment successfully created!",
      life: 3000,
    });

    await bookingStore.fetchUserBookings();
  } catch (err) {
    console.error("Error adding booking", err);
    toast.add({
      severity: "error",
      summary: "Booking Failed",
      detail: "An error occurred while creating the booking.",
      life: 4000,
    });
  }
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
        <StepList class="h-50 bg-[##c7e3b6] w-[95rem]">
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
              Contact <br />Information
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
                  <div class="flex gap-40 bg-[#9edf9c] p-5 rounded-xl">
                    <div class="p-5 rounded-xl">
                      <h1
                        class="mb-10 text-center text-xl font-[Poppins] font-[700] text-lg"
                      >
                        Check-in & Check-out
                      </h1>
                      <div class="flex gap-10">
                        <FloatLabel variant="on">
                          <DatePicker
                            v-model="newBooking.checkInDate"
                            inputId="on_label"
                            showIcon
                            iconDisplay="input"
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
                          <label for="on_label">Check-In</label>
                        </FloatLabel>
                        <FloatLabel variant="on">
                          <DatePicker
                            v-model="newBooking.checkOutDate"
                            inputId="on_label"
                            showIcon
                            iconDisplay="input"
                            :minDate="checkOutMinDate"
                            :maxDate="maxDate"
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
                          <label for="on_label">Check-Out</label>
                        </FloatLabel>
                      </div>
                    </div>
                    <div class="bg-[#9edf9c] p-5 rounded-xl">
                      <div class="ml-10">
                        <h1
                          class="mb-10 text-center text-xl font-[Poppins] font-[700]"
                        >
                          Mode
                        </h1>
                        <div class="flex items-center gap-3">
                          <div class="flex-col gap-30">
                            <RadioButton
                              class="mr-3"
                              v-model="newBooking.mode"
                              inputId="dayMode"
                              name="bookingMode"
                              value="day-time"
                              size="large"
                              :disabled="unavailableModes.has('day-time')"
                            />
                            <label for="dayMode" class="text-xl font-[Poppins]"
                              >DAY TIME
                              <p class="text-center mt-2 ml-3">(9am to 5pm )</p>
                            </label>
                          </div>
                          <div class="flex-col">
                            <RadioButton
                              class="mr-3"
                              v-model="newBooking.mode"
                              inputId="nightMode"
                              name="bookingMode"
                              value="night-time"
                              size="large"
                              :disabled="unavailableModes.has('night-time')"
                            />
                            <label
                              for="nightMode"
                              class="text-xl font-[Poppins]"
                              >NIGHT TIME
                              <p class="text-center mt-2 ml-3">(7pm to 5am)</p>
                            </label>
                          </div>

                          <!-- <RadioButton
                            v-model="newBooking.mode"
                            inputId="wholeDay"
                            name="bookingMode"
                            value="whole-day"
                            size="large"
                            :disabled="unavailableModes.has('whole-day')"
                          /> -->
                          <!-- <label for="wholeDay" class="text-xl font-[Poppins]"
                            >WHOLE DAY</label
                          > -->
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
                      <div
                        class="flex absolute items-center gap-4 right-30 top-6"
                      >
                        <span class="w-6 h-6 rounded-full bg-[#686868]"></span>
                        <label class="text-sm font-semibold"
                          >NOT AVAILABLE</label
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
                <div class="flex flex-col h-[65rem]">
                  <h1
                    class="text-left w-[100%] flex font-black text-4xl font-[Poppins] mt-10 mb-10"
                  >
                    Select Package
                  </h1>
                  <div class="overflow-auto">
                    <BookPackage
                      :mode="newBooking.mode"
                      :selectedPackageId="selectedPackage?.packageId"
                      @availPackage="availPackageHandler"
                    />
                    <!--availPackage comes from the BookPackage and holds the selected-->
                  </div>
                </div>
              </div>
              <div
                class="flex-col flex justify-center items-center font-medium h-auto w-[40rem] mt-5"
              >
                <div
                  class="Summary bg-[#9edf9c] p-5 rounded-lg w-[30rem] h-[55rem] mt-10"
                >
                  <h1
                    class="font-black font-[Poppins] text-2xl p-5 flex align-center justify-center m-auto mb-10"
                  >
                    Booking Summary:
                  </h1>

                  <div class="bg-[#fcfcfc] border rounded-sm p-5 mb-2">
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

                  <div
                    v-if="selectedPackage"
                    class="bg-[#fcfcfc] border p-2 rounded"
                  >
                    <p>Mode: {{ newBooking.mode }}</p>
                  </div>

                  <div class="flex flex-col gap-2">
                    <h1 class="text-lg font-bold font-[Poppins]">
                      Package Selected:
                    </h1>
                    <div
                      class="bg-[#fcfcfc] border rounded-sm p-5 mb-2 flex flex-col"
                    >
                      <p>Package Name: {{ selectedPackage?.name }}</p>
                      <p>Inclusion:</p>
                      <p class="whitespace-pre-wrap">
                        {{ selectedPackage?.inclusion }}
                      </p>
                      <p>Mode: {{ selectedPackage?.mode }}</p>

                      <!-- <p>
                        Add Ons:
                        <span
                          v-if="
                            catalogStore.catalog.length &&
                            newBooking.catalogAddOnIds &&
                            newBooking.catalogAddOnIds.length
                          "
                        >
                          <ul>
                            <li
                              v-for="addOnId in newBooking.catalogAddOnIds"
                              :key="addOnId"
                            >
                              {{
                                catalogStore.catalog.find(
                                  (a) =>
                                    String(a.catalogAddOnId) == String(addOnId)
                                )?.itemName || "Unknown Add-On"
                              }}
                              -
                              {{
                                formatPeso(
                                  catalogStore.catalog.find(
                                    (a) =>
                                      String(a.catalogAddOnId) ==
                                      String(addOnId)
                                  )?.price || 0
                                )
                              }}
                            </li>
                          </ul>
                        </span>
                        <span v-else> None </span>
                      </p> -->
                    </div>

                    <div class="bg-[#4BB344] border p-1 rounded-sm">
                      <p>
                        TOTAL CHARGED:
                        {{ formatPeso(totalAmount) }}
                      </p>
                    </div>
                  </div>
                  <div class="btn flex pt-6">
                    <Button
                      label="Continue "
                      iconPos="right"
                      class="border-1"
                      @click="
                        nextBtn();
                        stepTwoBtn(activateCallback);
                      "
                    />
                    <Button
                      label="Back"
                      class="border-1"
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
                <div
                  class="contactInfo p-10 flex flex-col overflow-auto h-[70rem] w-[50rem] border"
                >
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
                        <label>Email Address</label>
                        <input
                          class="packEvents"
                          placeholder="Email Address"
                          v-model="userData.email"
                        />
                      </div>
                    </div>

                    <div class="bookAddress">
                      <div>
                        <label>Address:</label>
                        <input
                          class="packEvents"
                          placeholder="Address"
                          v-model="userData.address"
                        />
                      </div>
                    </div>

                    <div class="guestInfo">
                      <div>
                        <label for="Arrival Time">Arrival Time:</label>
                        <select
                          v-model="newBooking.arrivalTime"
                          class="packEvents"
                          id="arrival"
                          placeholder="Arrival Time"
                          :disabled="!newBooking.mode"
                        >
                          <option value="" disabled>Select Arrival Time</option>
                          <option
                            v-for="time in arrivalTimeOptions"
                            :key="time"
                            :value="time"
                          >
                            {{ time }}
                          </option>
                        </select>
                      </div>

                      <div>
                        <label>Number of Guest:</label>
                        <input
                          v-model="newBooking.numberOfGuest"
                          type="number"
                          min="0"
                          class="packEvents"
                          placeholder="Number of Guest"
                          @input="
                            newBooking.numberOfGuest = Math.abs(
                              newBooking.numberOfGuest
                            )
                          "
                        />
                      </div>
                      <div>
                        <label for="catering">Catering</label>
                        <select
                          v-model="newBooking.catering"
                          name="catering"
                          id="catering"
                        >
                          <option :value="1">Yes</option>
                          <option :value="0">No</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div class="mt-10 items-left">
                    <h1 class="text-xl font-bold font-[Poppins]">
                      Payment Terms:
                    </h1>

                    <div class="flex items-left gap-5 mt-5 mb-5">
                      <div class="flex items-left gap-2">
                        <RadioButton
                          v-model="newBooking.paymentTerms"
                          inputId="installment"
                          name="paymentTerm"
                          value="installment"
                          size="large"
                          @click="showMessage"
                        />
                        <label for="dayMode" class="text-xl font-[Poppins]"
                          >Down Payment</label
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
                    <Message v-if="visible" severity="error"
                      >You are required to pay a ₱2,000 watch. The remaining
                      balance must be settled on the reserved date.<br />📌
                      Bookings are non-refundable.<br /><br />
                      <span
                        class="text-blue-600 underline cursor-pointer"
                        @click="termsVisible = true"
                      >
                        View full Terms and Conditions
                      </span>
                    </Message>
                    <Dialog
                      v-model:visible="termsVisible"
                      modal
                      :style="{ width: '70rem' }"
                      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
                    >
                      <hr class="Header" data-content="Terms & Condition" />
                      <ol
                        class="list-decimal list-inside space-y-2 text-black border-1"
                      >
                        <li>
                          A downpayment Reservation fee of P 2000-3000.00 is
                          required to ensure the client's specified schedule.
                        </li>
                        <li>
                          Reservation in case of delay, shall be given an
                          allowance of two (2) Days based on agreed time.
                          Without prior notice, the management can cancel the
                          reservation and forfeit the watch after the allowable
                          extension time.
                        </li>
                        <li>
                          Reservation fee or watch is non-refundable in case of
                          cancellation.
                        </li>
                        <li>
                          50% of the reservation fee or downpayment can be
                          refundable in cases of cancellation due to natural
                          disaster.
                        </li>
                        <li>
                          In case of cancellation, the customer has the option
                          to change the date and subject of availability in the
                          area.
                        </li>
                        <li>
                          Full contract payment should be made upon entrance on
                          the day itself and excess charges shall be connected
                          upon check—out.
                        </li>
                        <li>
                          It is understood that the management is not
                          responsible for any accident, injury, or loss that may
                          occur during the tenure of the lease. The Customer
                          waives the right to claim damages against the
                          management.
                        </li>
                        <li>
                          Food and Drinks are not allowed in the Pool Area
                        </li>
                        <li>Swimming when drunk is strictly prohibited.</li>
                        <li>
                          Firearms and illegal substances are strictly
                          prohibited
                        </li>
                        <li>Children must be always accompanied by adults.</li>
                        <li>
                          Excess guests will be charged depending on the chosen
                          schedule. In Daytime (P100.00/ per head) Overnight (P
                          150.00/ per head)
                        </li>
                        <li>Pets are not allowed in the pool premises.</li>
                        <li>
                          It is our standard procedure to check items and
                          equipment 30 minutes upon check—out of guests.
                        </li>
                        <li>
                          Any loss or damage to property during the tenure of
                          the lease shall be accounted to the customer.
                        </li>
                        <li>No refund policy is implemented</li>
                        <li>Clients must properly observe the house rules</li>
                        <li>
                          It is understood that the customers agreed on the
                          terms and conditions of the Danayas Resorts Events
                          Venue.
                        </li>
                      </ol>
                    </Dialog>
                    <Message v-if="visible1" severity="error"
                      >You are required to pay the total amount upon booking to
                      secure your reservation.<br />📌 Bookings are
                      non-refundable.
                      <span
                        class="text-blue-600 underline cursor-pointer"
                        @click="termsVisible = true"
                      >
                        View full Terms and Conditions
                      </span>
                    </Message>
                    <Dialog
                      v-model:visible="termsVisible"
                      modal
                      :style="{ width: '70rem' }"
                      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
                    >
                      <hr class="Header" data-content="Terms & Condition" />
                      <ol
                        class="list-decimal list-inside space-y-2 text-black border-1"
                      >
                        <li>
                          A downpayment Reservation fee of P 2000-3000.00 is
                          required to ensure the client's specified schedule.
                        </li>
                        <li>
                          Reservation in case of delay, shall be given an
                          allowance of two (2) Days based on agreed time.
                          Without prior notice, the management can cancel the
                          reservation and forfeit the watch after the allowable
                          extension time.
                        </li>
                        <li>
                          Reservation fee or watch is non-refundable in case of
                          cancellation.
                        </li>
                        <li>
                          50% of the reservation fee or downpayment can be
                          refundable in cases of cancellation due to natural
                          disaster.
                        </li>
                        <li>
                          In case of cancellation, the customer has the option
                          to change the date and subject of availability in the
                          area.
                        </li>
                        <li>
                          Full contract payment should be made upon entrance on
                          the day itself and excess charges shall be connected
                          upon check—out.
                        </li>
                        <li>
                          It is understood that the management is not
                          responsible for any accident, injury, or loss that may
                          occur during the tenure of the lease. The Customer
                          waives the right to claim damages against the
                          management.
                        </li>
                        <li>
                          Food and Drinks are not allowed in the Pool Area
                        </li>
                        <li>Swimming when drunk is strictly prohibited.</li>
                        <li>
                          Firearms and illegal substances are strictly
                          prohibited
                        </li>
                        <li>Children must be always accompanied by adults.</li>
                        <li>
                          Excess guests will be charged depending on the chosen
                          schedule. In Daytime (P100.00/ per head) Overnight (P
                          150.00/ per head)
                        </li>
                        <li>Pets are not allowed in the pool premises.</li>
                        <li>
                          It is our standard procedure to check items and
                          equipment 30 minutes upon check—out of guests.
                        </li>
                        <li>
                          Any loss or damage to property during the tenure of
                          the lease shall be accounted to the customer.
                        </li>
                        <li>No refund policy is implemented</li>
                        <li>Clients must properly observe the house rules</li>
                        <li>
                          It is understood that the customers agreed on the
                          terms and conditions of the Danayas Resorts Events
                          Venue.
                        </li>
                      </ol>
                    </Dialog>
                  </div>
                  <div>
                    <h1 class="text-lg font-bold font-[Poppins]">Payment:</h1>
                    <h1 class="text-lg font-sm font-[Poppins] text-center">
                      DANAYAS RESORTS EVENTS VENUE: <br />
                      09xx xxx xxxx
                    </h1>

                    <h1 class="text-m font-[Poppins]">GCASH Reference Code:</h1>
                    <div
                      class="bg-[#fcfcfc] mb-2 rounded border border-green-500"
                    >
                      <div>
                        <input
                          class="p-2 w-full"
                          placeholder="FEJIJKA4381FK9"
                          v-model="paymentDetails.reference"
                        />
                      </div>
                    </div>
                    <div class="gcashUpload">
                      <h1 class="text-xl font-bold font-[Poppins] mb-3 mt-3">
                        Proof of Payment:
                      </h1>
                      <FileUpload
                        ref="fileupload"
                        v-model="paymentDetails.imageUrl"
                        mode="basic"
                        name="imageUrl"
                        url="/api/upload"
                        accept="image/*"
                        :maxFileSize="1000000"
                        @select="onFileSelect"
                      />
                      <span v-if="fileError" class="text-red-600 font-bold">
                        {{ fileError }}
                      </span>
                      <!--<div class="bg-[#fcfcfc] mb-2 p-1 rounded-sm">
                          <input
                            class="p-2"
                            placeholder="image url"
                            v-model="paymentDetails.imageUrl"
                          />
                        </div>-->
                    </div>
                    <div>
                      <h1 class="text-m font-[Poppins]">Name of the Sender:</h1>
                      <div
                        class="bg-[#fcfcfc] border border-green-500 mb-2 p-1 rounded-sm"
                      >
                        <div>
                          <input
                            class="p-2 w-full"
                            placeholder="Juan Dela Cruz"
                            v-model="paymentDetails.senderName"
                          />
                        </div>
                      </div>
                    </div>
                    <h1 class="text-lg font-bold font-[Poppins]">
                      Tendered Amount:
                    </h1>
                    <div class="mb-2 rounded border border-green-500">
                      <div>
                        <InputNumber
                          class="w-full"
                          placeholder="e.g. 2000"
                          inputId="currency-php"
                          mode="currency"
                          currency="PHP"
                          locale="en-PH"
                          v-model="paymentDetails.tenderedAmount"
                          :readonly="newBooking.paymentTerms === 'full-payment'"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="flex-col flex justify-center items-center font-medium h-auto w-[40rem] mt-5"
              >
                <div
                  class="Summary bg-[#9edf9c] p-5 rounded-lg w-[30rem] h-auto relative mt-0"
                >
                  <h1
                    class="font-black font-[Poppins] text-2xl p-5 flex align-center justify-center m-auto"
                  >
                    Booking Summary:
                  </h1>

                  <div class="bg-[#fcfcfc] border rounded-sm p-5 mb-2">
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

                  <div class="bg-[#fcfcfc] border rounded-sm p-5 mb-2">
                    <p>Mode: {{ newBooking.mode }}</p>
                  </div>

                  <div class="flex flex-col gap-2">
                    <h1 class="text-lg font-bold font-[Poppins]">
                      Package Selected:
                    </h1>
                    <div
                      class="flex flex-col bg-[#fcfcfc] p-1 rounded-sm border p-5 mb-2"
                    >
                      <p>Package Name: {{ selectedPackage?.name }}</p>
                      <p>Inclusion:</p>
                      <p class="whitespace-pre-wrap">
                        {{ selectedPackage?.inclusion }}
                      </p>
                      <p>Mode: {{ selectedPackage?.mode }}</p>

                      <p>Max Pax: {{ selectedPackage?.maxPax }}</p>

                      <p>
                        Number of Guests: {{ newBooking.numberOfGuest }}
                        <span
                          v-if="
                            selectedPackage &&
                            Number(newBooking.numberOfGuest) >
                              selectedPackage.maxPax
                          "
                        >
                          (Extra:
                          {{
                            Number(newBooking.numberOfGuest) -
                            selectedPackage.maxPax
                          }}
                          ×
                          <span v-if="newBooking.mode === 'day-time'"
                            >₱100</span
                          >
                          <span
                            v-else-if="
                              newBooking.mode === 'night-time' ||
                              newBooking.mode === 'whole-day'
                            "
                            >₱150</span
                          >
                          =
                          <span v-if="newBooking.mode === 'day-time'">
                            ₱{{
                              (Number(newBooking.numberOfGuest) -
                                selectedPackage.maxPax) *
                              100
                            }}
                          </span>
                          <span
                            v-else-if="
                              newBooking.mode === 'night-time' ||
                              newBooking.mode === 'whole-day'
                            "
                          >
                            ₱{{
                              (Number(newBooking.numberOfGuest) -
                                selectedPackage.maxPax) *
                              150
                            }}
                          </span>
                          )
                        </span>
                      </p>
                      <p class="mt-5 text-red-400 font-[10px] font-[Poppins]">
                        Note: If about Max Pax you will be charged ₱100 per
                        person.
                      </p>
                      <!-- <p>
                        Add Ons:
                        <span
                          v-if="
                            catalogStore.catalog.length &&
                            newBooking.catalogAddOnIds &&
                            newBooking.catalogAddOnIds.length
                          "
                        >
                          <ul>
                            <li
                              v-for="addOnId in newBooking.catalogAddOnIds"
                              :key="addOnId"
                            >
                              {{
                                catalogStore.catalog.find(
                                  (a) =>
                                    String(a.catalogAddOnId) == String(addOnId)
                                )?.itemName || "Unknown Add-On"
                              }}
                              -
                              {{
                                formatPeso(
                                  catalogStore.catalog.find(
                                    (a) =>
                                      String(a.catalogAddOnId) ==
                                      String(addOnId)
                                  )?.price || 0
                                )
                              }}
                            </li>
                          </ul>
                        </span>
                        <span v-else> None </span>
                      </p> -->
                    </div>

                    <div class="bg-[#4BB344] p-1 border rounded-sm">
                      <p>TOTAL CHARGED: {{ formatPeso(totalAmount) }}</p>
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
              class="flex flex-col justify-center m-auto items-center font-medium drop-shadow-2xl h-auto w-full max-w-[1400px] bg-[#FFFBE6]-50 mt-5"
            >
              <div class="p-5 rounded-lg w-[70rem] h-auto mt-10 mb-10 gap-20">
                <div class="flex">
                  <div>
                    <img
                      src="../Admin/assets/drevslogo.png"
                      alt=""
                      class="w-40 h-40"
                    />
                  </div>

                  <div class="flex flex-col justify-center m-auto text-2xl">
                    <h1
                      class="font-black text-5xl flex align-center justify-center"
                      style="font-style: 'Times New Roman'"
                    >
                      Danayas Resort Events Venue
                    </h1>
                    <h2>
                      #27 Jones St. Extension, Dulong Bayan 2, San Mateo Rizal
                    </h2>
                    <h2 class="text-center">09912166870</h2>
                  </div>
                </div>

                <div class="mb-2 p-2 rounded-sm">
                  <div class="">
                    <Divider />

                    <h1
                      class="font-bold text-[25px] font-[Poppins] mt-[2rem] text-center"
                    >
                      Booking Summary
                    </h1>
                  </div>
                </div>
                <Divider />
                <div class="relative">
                  <div>
                    <h1 class="font-bold font-[Poppins] mt-[2rem] mb-[1rem]">
                      Guest Information:
                    </h1>
                  </div>
                  <div class="flex gap-80">
                    <div>
                      <div class="">
                        <p>
                          Name: {{ userData.firstName }}
                          {{ userData.lastName }}
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
                      <div class="">
                        <p>Address: {{ userData.address }}</p>
                      </div>
                    </div>
                    <div>
                      <div class=" ">
                        <p>
                          Date: {{ formatDates(newBooking.checkInDate) }} to
                          {{ formatDates(newBooking.checkOutDate) }}
                        </p>
                      </div>
                      <div class="flex gap-2">
                        <p>
                          Check-in: {{ formatDates(newBooking.checkInDate) }}
                        </p>
                      </div>
                      <div class="flex gap-2">
                        <p>
                          Check-out:
                          {{ formatDates(newBooking.checkOutDate) }}
                        </p>
                        <button class=""></button>
                      </div>
                      <div class="">
                        <p>Mode: {{ newBooking.mode }}</p>
                      </div>

                      <!-- <p>
                        Add Ons:
                        <span
                          v-if="
                            catalogStore.catalog.length &&
                            newBooking.bookingAddOns &&
                            newBooking.bookingAddOns.length
                          "
                        >
                          <ul>
                            <li
                              v-for="addOnId in newBooking.bookingAddOns"
                              :key="addOnId"
                            >
                              {{
                                catalogStore.catalog.find(
                                  (a) =>
                                    String(a.catalogAddOnId) == String(addOnId)
                                )?.itemName || "Unknown Add-On"
                              }}
                              -
                              {{
                                formatPeso(
                                  catalogStore.catalog.find(
                                    (a) =>
                                      String(a.catalogAddOnId) ==
                                      String(addOnId)
                                  )?.price || 0
                                )
                              }}
                            </li>
                          </ul>
                        </span>
                        <span v-else> None </span>
                      </p> -->
                    </div>
                  </div>
                </div>

                <div class="card">
                  <TreeTable
                    :value="nodes"
                    tableStyle="min-width: 50rem;border:1px solid green"
                  >
                    <Column
                      field="description"
                      header="Description"
                      style="width: 250px"
                      headerStyle="text-align: center"
                    >
                      <template #body="{ node }">
                        <span
                          v-html="node.data.description"
                          style="white-space: pre-line"
                        ></span>
                      </template>
                      <Divider layout="vertical" />
                    </Column>
                    <Column
                      field="price"
                      header="Total Price"
                      style="width: 150px"
                      headerStyle="text-align: center"
                      bodyStyle="text-align: center"
                    />
                    <Divider />
                  </TreeTable>
                </div>
                <div class="w-full justify-items-end">
                  <div class="mt-5 text-right w-[30%] mr-5">
                    <h1>
                      SubTotal (Package):
                      {{ formatPeso(selectedPackage?.price) }}
                    </h1>
                    <h1>Add-Ons: {{ formatPeso(addOnsTotal) }}</h1>
                    <h1 class="mt-10">TAX(0%) : 0</h1>
                    <Divider />
                    <h1>
                      <strong>TOTAL: </strong>{{ formatPeso(totalAmount) }}
                    </h1>
                  </div>
                </div>
                <div class="">
                  <h1 class="mb-1 font-12 font-bold">Payment Information</h1>
                  <h2>Account Name: Jason Isaac Mendoza</h2>
                  <h2>Account No.: 09565187842</h2>
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
      :style="{ width: '70rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <hr class="Header" data-content="Terms & Condition" />

      <ol class="list-decimal list-inside space-y-2 text-black border-1">
        <li v-for="trm in termsStore.terms" :key="trm.termId">
          {{ trm.content }}
        </li>
      </ol>
      <div class="flex items-center gap-2">
        <input type="checkbox" id="signupCheck" v-model="isChecked" />
        <label for="signupCheck">I accept all terms & conditions</label>
      </div>

      <div class="mt-4 text-center">
        <button
          class="Bookingbtn"
          :disabled="!isChecked"
          @click="OpenContinueModal"
        >
          Continue
        </button>
      </div>
    </Dialog>

    <div v-if="showContinueModal" class="modal">
      <div class="BookingBox drop-shadow-lg">
        <h1>Booking pending..</h1>
      </div>
    </div>
  </section>
  <Footer />
  <Toast />
</template>

<style scoped>
.Header {
  line-height: 1rem;
  position: relative;
  outline: 0;
  border: 0;
  font-weight: bolder;
  font-size: 1.3rem;
  margin-top: 5px;
  margin-bottom: 30px;
  color: rgb(2, 2, 2);
  text-align: center;
  height: 1.5rem;
}
.Summary {
  border: solid 3px rgb(9, 52, 9);
  border-top-left-radius: 100px;
  border-top-right-radius: 10px;
  height: auto;
}
.contactInfo {
  border: solid 2px rgb(9, 52, 9);
  border-radius: 2%;
  position: relative;
  margin-top: 50px;
}

.Header::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(
    -50%,
    -50%
  ); /* Center the line horizontally and vertically */
  background: #000000;
  width: 50%; /* or a percentage like 80% if you want shorter lines */
  height: 1.2px;
  z-index: -1; /* Optional: keeps the line behind the text */
}

.Header::after {
  content: attr(data-content);
  position: relative;
  color: rgb(0, 0, 0);
  padding: 0 0.5em;
  background-color: #ffffff;
}
.list-decimal {
  border-radius: 10px;
  position: relative;
  top: -10px;
  padding: 2px 5px;
  border: 2px solid green;
}

.Bookingbtn {
  padding: 10px 20px;
  border: none;
  width: 30%;

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
  background: #ffffff;
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
  left: 0;
  right: 0;

  position: relative;
  justify-content: left;
}

.personalInfo > div,
.guestInfo > div:not(.multi-select-row) {
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
table,
th,
td {
  border: 1px solid black;
}
</style>
