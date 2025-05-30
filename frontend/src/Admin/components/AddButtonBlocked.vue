<script setup>
import { ref, defineProps, defineEmits, onMounted, computed } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import DatePicker from "primevue/datepicker";
import { useBookingStore } from "../../stores/bookingStore.js";
import { usePublicEntryStore } from "../../stores/publicEntryStore.js";
import { useBlockedStore } from "../../stores/blockedDateStore.js";
// import { formatDate } from "../../utility/dateFormat";

const bookingStore = useBookingStore();
const publicStore = usePublicEntryStore();
const blockStore = useBlockedStore();

const toast = useToast();
const showBlocked = ref(false);
const newBlocked = ref({
  blockedDates: "",
  category: "",
  others: "" || null,
});

onMounted(() => {
  bookingStore.fetchUserBookings();
  publicStore.fetchAllPublic();
  blockStore.fetchAllBlocked();
});

defineProps(["data"]);
const emit = defineEmits(["addBlocked"]);

const minDate = new Date();

const disabledDates = computed(() => {
  const disabled = [];

  // Blocked dates
  blockStore.blocked.forEach((bd) => {
    if (bd.blockedDates) {
      disabled.push(new Date(bd.blockedDates));
    }
  });

  bookingStore.bookings.forEach((b) => {
    if (b.checkInDate) {
      disabled.push(new Date(b.checkInDate));
    }
  });
  publicStore.public.forEach((p) => {
    if (p.entryDate) {
      disabled.push(new Date(p.entryDate));
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

const openModal = () => {
  showBlocked.value = true;
};

const closeModals = () => {
  showBlocked.value = false;
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}-${day}-${year}`;
};

const confirmAddRate = () => {
  const blockDate = {
    ...newBlocked.value,
    blockedDates: formatDate(newBlocked.value.blockedDates),
  };
  emit("addBlocked", blockDate);
  toast.add({
    severity: "success",
    summary: "Added Blocked Dates",
    detail: "Successfully Added Blocked Dates",
    life: 3000,
  });
  closeModals();
};
</script>

<template>
  <button
    class="adminButton text-white font-bold bg-[#194D1D] hover:bg-[#2B6D30]"
    @click="openModal"
  >
    <i class="aIcon pi pi-plus"></i> Add {{ data }}
  </button>

  <Dialog v-model:visible="showBlocked" modal :style="{ width: '25rem' }">
    <template #header>
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-2xl font-bold font-[Poppins]">ADD BLOCKED DATES:</h2>
      </div>
    </template>

    <div class="packageDetails">
      <div class="addPack flex flex-col justify-center m-auto content-center">
        <div class="addPackInput">
          <label>Blocked Date:</label>
          <DatePicker
            v-model="newBlocked.blockedDates"
            placeholder="Block Date"
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
        </div>
        <div class="addPackInput">
          <div>
            <label>Category:</label>
            <select v-model="newBlocked.category" placeholder="Add Ons Name">
              <option value="maintenance">Maintenance</option>
              <option value="holiday">Holiday</option>
              <option value="internal-use">Internal Use</option>
              <option value="natural-disaster">Natural Disaster</option>
              <option value="others">others</option>
            </select>
          </div>
          <div>
            <template v-if="newBlocked.category === 'others'">
              <label>Others:</label>
              <input
                v-model="newBlocked.others"
                placeholder="Please specify ..."
              />
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-center gap-2 mt-6">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="closeModals"
        class="font-bold w-full"
      />
      <Button
        type="button"
        label="Add Blocked Date"
        severity="primary"
        @click="confirmAddRate"
        class="font-bold w-full"
      />
    </div>
  </Dialog>
  <Toast />
</template>

<style scoped>
.adminButton {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.aIcon {
  margin-right: 5px;
  font-size: 13px;
}

.addPack {
  gap: 10px;
}

.addPack input {
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #fcfcfc;
  border-radius: 5px;
  height: 40px;
}

.addPack div {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
