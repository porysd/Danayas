import { ref, defineProps, defineEmits, onMounted, computed } from "vue";
import { useBookingStore } from "../stores/bookingStore";
import { usePublicEntryStore } from "../stores/publicEntryStore.js";
import { useBlockedStore } from "../stores/blockedDateStore.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const allowedStatus = ["reserved", "pending", "rescheduled"];

// FOR DATEPICKER style
export const getBookingStyle = (slotDate) => {
  const bookingStore = useBookingStore();
  const publicStore = usePublicEntryStore();
  const blockStore = useBlockedStore();

  const formattedDate = `${slotDate.year}-${String(slotDate.month + 1).padStart(
    2,
    "0"
  )}-${String(slotDate.day).padStart(2, "0")}`;

  // Collect all booking/public modes for the date
  const mode = new Set();
  let isBlocked = false;

  bookingStore.bookings
    .filter((b) => allowedStatus.includes(b.bookStatus))
    .forEach((b) => {
      if (b.checkInDate === formattedDate) {
        mode.add(b.mode);
      }
    });

  publicStore.public
    .filter((p) => allowedStatus.includes(p.status))
    .forEach((p) => {
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

// FOR DATEPICKER to DISABLE reserved dates
export const disabledDates = computed(() => {
  const bookingStore = useBookingStore();
  const publicStore = usePublicEntryStore();
  const blockStore = useBlockedStore();
  const disabled = [];

  // Blocked dates
  blockStore.blocked.forEach((bd) => {
    if (bd.blockedDates) {
      disabled.push(new Date(bd.blockedDates));
    }
  });

  // Fully booked dates (whole-day or both day-time and night-time)
  const bookingsByDate = {};
  bookingStore.bookings
    .filter((b) => allowedStatus.includes(b.bookStatus))
    .forEach((b) => {
      if (b.checkInDate) {
        const date = b.checkInDate;
        if (!bookingsByDate[date]) bookingsByDate[date] = new Set();
        bookingsByDate[date].add(b.mode);
      }
    });
  publicStore.public
    .filter((p) => allowedStatus.includes(p.status))
    .forEach((p) => {
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

// FOR FULL CALENDAR
export const mapBookingsToEvents = (
  bookings = [],
  publics = [],
  blockedDates = []
) => {
  const eventByDate = {};

  bookings
    .filter((b) => allowedStatus.includes(b.bookStatus))
    .forEach((b) => {
      const date = b.checkInDate;
      if (!eventByDate[date])
        eventByDate[date] = { modes: new Set(), blocked: null };
      eventByDate[date].modes.add(b.mode);
    });

  publics
    .filter((p) => allowedStatus.includes(p.status))
    .forEach((p) => {
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

export function fullCalendarEvents() {
  const bookingStore = useBookingStore();
  const publicStore = usePublicEntryStore();
  const blockStore = useBlockedStore();

  const calendarEvents = computed(() =>
    mapBookingsToEvents(
      bookingStore.bookings,
      publicStore.public,
      blockStore.blocked
    )
  );

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

  return {
    calendarEvents,
    calendarOptions,
  };
}
