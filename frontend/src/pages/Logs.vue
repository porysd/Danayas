<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";
import Dialog from "primevue/dialog";
import { useBookingStore } from "../stores/bookingStore";
import { useUserStore } from "../stores/userStore";
import { formatDates } from "../utility/dateFormat";
import { formatPeso } from "../utility/pesoFormat";
import { usePackageStore } from "../stores/packageStore";
import { useAuthStore } from "../stores/authStore";
import { useRefundStore } from "../stores/refundStore";
import Tag from "primevue/tag";
import Button from "primevue/button";
import Logger from "../components/Logger.vue";
import { useToast } from "primevue/usetoast";
import { useCatalogStore } from "../stores/catalogStore";
import { usePaymentStore } from "../stores/paymentStore";

const catalogStore = useCatalogStore();
const toast = useToast();

const bookingStore = useBookingStore();
const refundStore = useRefundStore();

const userStore = useUserStore();
const packageStore = usePackageStore();
const authStore = useAuthStore();
const paymentStore = usePaymentStore();

const userBookings = ref([]);
const historyBookings = ref([]);

const openMenuBookingId = ref(null);
const showAcknowledgement = ref(false);
const pendingRefund = ref(null);

onMounted(async () => {
  await packageStore.fetchAllPackages();
  await packageStore.fetchAllPromos();
  await bookingStore.fetchUserBookings();
  await refundStore.fetchRefunds();
  await catalogStore.fetchAllCatalogs();
  await paymentStore.fetchPayments();

  try {
    const userId = authStore.user?.userId;
    if (!userId) {
      console.error("User ID not found in authStore");
      return;
    }

    const fetchedUser = await userStore.getUserById(userId);

    if (fetchedUser?.userId) {
      const id = fetchedUser.userId;

      const bookings = bookingStore.bookings.filter(
        (booking) =>
          booking.userId === id &&
          [
            "pending",
            "reserved",
            "rescheduled",
            "pending-cancellation",
          ].includes(booking.bookStatus)
      );

      userBookings.value = [...bookings];

      const bookingDone = bookingStore.bookings.filter(
        (booking) =>
          booking.userId === id &&
          ["cancelled", "completed"].includes(booking.bookStatus)
      );

      historyBookings.value = [...bookingDone];

      const allUserBookings = bookingStore.bookings.filter(
        (booking) => booking.userId === id
      );

      const pending = refundStore.refunds.find((refund) => {
        const linkedEntry = allUserBookings.find(
          (entry) => entry.bookingId && entry.bookingId === refund.bookingId
        );
        return (
          linkedEntry &&
          refund.refundMethod === "gcash" &&
          refund.refundStatus === "completed" &&
          (refund.acknowledge === null ||
            refund.acknowledge === "" ||
            refund.acknowledge === undefined)
        );
      });

      if (pending) {
        pendingRefund.value = pending;
        showAcknowledgement.value = true;
      }
    } else {
      console.error("User ID not found in fetched data.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

const getAddOns = (booking) => {
  // Try both possible property names
  const addOnIds = booking.catalogAddOnIds || booking.bookingAddOns || [];
  if (!Array.isArray(addOnIds) || !addOnIds.length) return [];
  return addOnIds
    .map((id) =>
      catalogStore.catalog.find(
        (addOn) => String(addOn.catalogAddOnId) === String(id)
      )
    )
    .filter(Boolean);
};

const rescheduleHandler = async (updatedDate) => {
  await bookingStore.updateBookingDates(updatedDate);
};

const cancelHandler = async (cancelStatus) => {
  await bookingStore.updateBookingStatus(cancelStatus);
  // await refundStore.updateRefund(cancelStatus);
};

const paymentHandler = async (paymentData) => {
  await paymentStore.addPayment(paymentData);
};

const refundHandler = async (acknowledgeValue) => {
  try {
    if (!pendingRefund.value) {
      throw new Error("No pending refund to acknowledge.");
    }
    const updatedRefund = {
      ...pendingRefund.value,
      acknowledge: acknowledgeValue,
    };

    await refundStore.updateRefund(updatedRefund);
    await refundStore.fetchRefunds();

    toast.add({
      severity: "success",
      summary: "Acknowledged",
      detail: `You selected: ${acknowledgeValue}`,
      life: 3000,
    });

    console.log("Acknowledgement Payload: ", updatedRefund);
    showAcknowledgement.value = false;
    pendingRefund.value = null;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to update acknowledgement.",
      life: 3000,
    });
    console.error(error);
  }
};

const getPackageName = (packageId) => {
  const pkg =
    packageStore.packages.find((p) => p.packageId === packageId) ||
    packageStore.promos.find((p) => p.packageId === packageId);
  return pkg ? pkg.name : "Unknown Package";
};

const getPackageData = (packageId) => {
  return (
    packageStore.packages.find((p) => p.packageId === packageId) ||
    packageStore.promos.find((p) => p.packageId === packageId) ||
    null
  );
};

const showAction = ref(false);

const selected = ref(null);
const details = ref(false);

const openDetails = (receipt) => {
  selected.value = receipt;
  details.value = true;
};

const getStatusSeverity = (status) => {
  switch (status) {
    case "pending":
      return "warn";
    case "reserved":
      return "info";
    case "rescheduled":
      return "secondary";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    case "unpaid":
      return "danger";
    case "partially-paid":
      return "info";
    case "paid":
      return "success";
    default:
      return "secondary";
  }
};

const getRefundRemarks = (booking) => {
  const refund = refundStore.refunds.find(
    (r) => r.bookingId && r.bookingId === booking.bookingId
  );
  return refund?.remarks || null;
};

const getInvalidRemarks = (booking) => {
  const invalid = paymentStore.invalid.find(
    (p) => p.bookingId && p.bookingId === booking.bookingId
  );

  const hasValid = paymentStore.payments.some(
    (p) =>
      p.bookingId === booking.bookingId &&
      (p.paymentStatus === "valid" ||
        p.bookingPaymentStatus === "paid" ||
        p.bookingPaymentStatus === "partially-paid")
  );
  return !hasValid ? invalid?.remarks || null : null;
};

const hasInvalidPayment = (booking) => {
  const hasInvalid = paymentStore.payments.some(
    (p) => p.bookingId === booking.bookingId && p.paymentStatus === "invalid"
  );

  const hasValid = paymentStore.payments.some(
    (p) =>
      p.bookingId === booking.bookingId &&
      (p.paymentStatus === "valid" ||
        p.paymentStatus === "pending" ||
        p.bookingPaymentStatus === "paid" ||
        p.bookingPaymentStatus === "partially-paid")
  );

  return hasInvalid && !hasValid ? booking : null;
};

const handleLoggerClick = (booking) => {
  if (booking.bookStatus === "reserved") {
    openMenuBookingId.value = booking.bookingId;
    return;
  }

  if (hasInvalidPayment(booking) && booking.bookStatus === "pending") {
    openMenuBookingId.value = booking.bookingId;
    return;
  }

  toast.add({
    severity: "warn",
    summary: "Not allowed",
    detail: "You cannot open actions for this booking.",
    life: 3000,
  });
  openMenuBookingId.value = null;
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
  </div>

  <div class="w-[70%] m-auto justify-center">
    <div v-if="userBookings.length > 0"></div>
    <div v-else>
      <p class="flex justify-center m-auto">No bookings found for this user.</p>
    </div>

    <div
      class="logsBox"
      v-for="booking in userBookings"
      :key="booking.bookingId"
      @click="openDetails(booking)"
    >
      <div
        class="w-full top-5 text-right"
        @click.stop
        style="position: relative"
      >
        <Logger
          :booking="booking"
          :payAgain="hasInvalidPayment(booking) ? booking : null"
          :refund="booking"
          :showAction="showAction && openMenuBookingId === booking.bookingId"
          @click="handleLoggerClick(booking)"
          @rescheduleBooking="rescheduleHandler"
          @cancelBooking="cancelHandler"
          @payPayment="paymentHandler"
        />
      </div>

      <div class="information">
        <p>Package: {{ getPackageName(booking.packageId) }}</p>
        <p>
          Personal Information: {{ booking.firstName }}
          {{ booking.lastName }}
        </p>

        <p>
          Date: {{ formatDates(booking.checkInDate) }} to
          {{ formatDates(booking.checkOutDate) }}
        </p>

        <p>
          Payment Status:
          <Tag
            :severity="getStatusSeverity(booking.bookingPaymentStatus)"
            :value="getInvalidRemarks(booking) || booking.bookingPaymentStatus"
          />
        </p>
        <p>Total Amount: {{ formatPeso(booking.totalAmount) }}</p>
      </div>
      <div class="flex justify-end -top-8 gap-2" style="position: relative">
        <Tag
          class="mb"
          :severity="getStatusSeverity(booking.bookStatus)"
          :value="getRefundRemarks(booking) || booking.bookStatus"
        />
      </div>
    </div>
  </div>

  <div class="Logs-Container">
    <hr class="Header" data-content=" History " />
  </div>

  <div class="w-[70%] m-auto justify-center">
    <div v-if="historyBookings.length > 0"></div>
    <div v-else>
      <p class="flex justify-center m-auto">No bookings found for this user.</p>
    </div>

    <div
      class="logsBox"
      v-for="booking in historyBookings"
      :key="booking.bookingId"
      @click="openDetails(booking)"
    >
      <div class="w-full mt-10 text-right">
        <!-- <Logger
          :booking="booking"
          @rescheduleBooking="rescheduleHandler"
          @cancelBooking="cancelHandler"
        /> -->
      </div>

      <div class="information">
        <p>Package: {{ getPackageName(booking.packageId) }}</p>
        <p>
          Personal Information: {{ booking.firstName }}
          {{ booking.lastName }}
        </p>

        <p>
          Date: {{ formatDates(booking.checkInDate) }} to
          {{ formatDates(booking.checkOutDate) }}
        </p>

        <p>
          Payment Status:
          <Tag
            :severity="getStatusSeverity(booking.bookingPaymentStatus)"
            :value="booking.bookingPaymentStatus"
          />
        </p>
        <p>Total Amount: {{ formatPeso(booking.totalAmount) }}</p>
      </div>
      <div class="flex justify-end -top-8 gap-2" style="position: relative">
        <Tag
          class="mb"
          :severity="getStatusSeverity(booking.bookStatus || booking.status)"
          :value="
            getRefundRemarks(booking) ||
            booking.cancelReason ||
            booking.bookStatus
          "
        />
      </div>
    </div>
  </div>

  <Dialog v-model:visible="details">
    <div
      class="flex-col flex justify-center items-center font-medium h-auto w-[100%] mt-5"
    >
      <div class="p-5 rounded-lg w-[70rem] h-auto mt-10 mb-10 gap-20">
        <div class="flex">
          <div>
            <img src="../Admin/assets/drevslogo.png" alt="" class="w-40 h-40" />
          </div>

          <div class="flex flex-col justify-center m-auto text-2xl">
            <h1
              class="font-black text-5xl flex align-center justify-center"
              style="font-style: 'Times New Roman'"
            >
              Danayas Resort Events Venue
            </h1>
            <h2>#27 Jones St. Extension, Dulong Bayan 2, San Mateo Rizal</h2>
            <h2 class="text-center">09912166870</h2>
          </div>
        </div>

        <div class="flex gap-130 relative">
          <div class="mb-2 p-2 rounded-sm">
            <div>
              <h1 class="font-bold font-[Poppins] mt-[2rem]">BILLED TO:</h1>
            </div>
            <div class="">
              <p>{{ selected?.firstName }} {{ selected?.lastName }}</p>
            </div>
            <div class="">
              <p>
                {{ selected?.address }}
              </p>
            </div>
          </div>
          <div class="mb-2 p-2 rounded-sm">
            <div>
              <h1 class="font-bold font-[Poppins] mt-[2rem]">INVOICE NO.:</h1>
            </div>
            <div class="">
              <p>DATE:</p>
            </div>
          </div>
        </div>

        <Divider />

        <div class="flex gap-100 relative">
          <div class="mb-2 p-2 rounded-sm">
            <div>
              <h1 class="font-bold font-[Poppins] mt-[2rem]">
                Guest Information:
              </h1>
            </div>
            <div class="">
              <p>Name: {{ selected?.firstName }} {{ selected?.lastName }}</p>
            </div>
            <div class="">
              <p>Contact No.: {{ selected?.contactNo }}</p>
            </div>
            <div class="">
              <p>Email Address: {{ selected?.email }}</p>
            </div>
            <div class="">
              <p>Address: {{ selected?.address }}</p>
            </div>
          </div>
          <div class="mb-2 p-2 rounded-sm">
            <div class="flex gap-2">
              <p>
                Date: {{ formatDates(selected?.checkInDate) }} to
                {{ formatDates(selected?.checkOutDate) }}
              </p>
            </div>
            <div class="flex gap-2">
              <p>Check-in: {{ formatDates(selected?.checkInDate) }}</p>
            </div>
            <div class="flex gap-2">
              <p>Check-out: {{ formatDates(selected?.checkOutDate) }}</p>
              <button class=""></button>
            </div>
            <div class="">
              <p>Mode: {{ selected?.mode }}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col">
          <table>
            <thead>
              <tr class="">
                <th>Item</th>
                <th>REF ID</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="">{{ getPackageName(selected?.packageId) }}</td>
                <td class="text-center">
                  {{ selected?.packageId }}
                </td>
                <td class="text-center">
                  {{ formatPeso(getPackageData(selected?.packageId)?.price) }}
                </td>
                <td class="text-center">
                  {{ formatPeso(getPackageData(selected?.packageId)?.price) }}
                </td>
              </tr>
            </tbody>
            <tbody v-if="getAddOns(selected).length">
              <tr
                v-for="addOn in getAddOns(selected)"
                :key="addOn.catalogAddOnId"
              >
                <td>{{ addOn.itemName }}</td>
                <td class="text-center">{{ addOn.catalogAddOnId }}</td>
                <td class="text-center">{{ formatPeso(addOn.price) }}</td>
                <td class="text-center">{{ formatPeso(addOn.price) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="w-full justify-items-end">
            <div class="mt-5 text-right w-[30%] mr-5">
              <h1>
                SubTotal:
                {{ formatPeso(selected?.totalAmount) }}
              </h1>
              <h1 class="mt-10">TAX(0%) : 0</h1>
              <Divider />
              <h1>
                <strong>Payment Status: </strong
                >{{ selected?.bookingPaymentStatus }}
              </h1>
              <h1>
                <strong>TOTAL: </strong>{{ formatPeso(selected?.totalAmount) }}
              </h1>
            </div>
          </div>
          <div class="">
            <h1 class="mb-1 font-12 font-bold">Payment Information</h1>
            <h2>Account Name: Jason Isaac Mendoza</h2>
            <h2>Account No.: 09565187842</h2>
          </div>
        </div>
      </div>
    </div>
  </Dialog>

  <Dialog
    v-model:visible="showAcknowledgement"
    modal
    header="Acknowledge Refund"
    :closable="false"
    :style="{ width: '30vw' }"
  >
    <div class="text-center space-y-4">
      <p>
        Do you acknowledge that you received the refund with Danaya’s Resort and
        Events Venue?
      </p>

      <div class="flex justify-center gap-4">
        <Button
          label="Yes"
          icon="pi pi-check"
          @click="refundHandler('yes')"
          severity="success"
        />
        <Button
          label="No"
          icon="pi pi-times"
          @click="refundHandler('no')"
          severity="danger"
        />
      </div>
    </div>
  </Dialog>

  <Footer />
</template>

<style scoped>
calendar-range {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
textarea {
  background-color: #f7f0f0;
  border: 1px solid green;
  padding: 2px;
  height: 10vh;
  width: 100%;
  break-inside: auto;
  object-fit: cover;
  display: flex;
}
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

.DelBox {
  border: 1px solid #38dc87;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(28, 216, 34, 0.5);
  align-items: center;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  font-weight: 600;
  font-size: large;
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

.information {
  font-weight: 600;
  width: 100%;
  line-height: 1.9rem;
}

.logsBox {
  display: flex;
  flex-direction: column;
  height: 13rem;
  justify-content: center;
  margin: auto;
  padding: 2rem;
  border-radius: 10px;
  width: auto;
  background: transparent;
  border: 1px solid #41ab5d;
  margin-bottom: 2rem;
}

.Header {
  line-height: 1rem;
  position: relative;
  outline: 0;
  border: 0;
  font-weight: bolder;
  font-size: 1.3rem;
  margin-top: 20px;
  margin-bottom: 2rem;
  color: rgb(2, 2, 2);
  text-align: center;
  height: 1.5rem;
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
