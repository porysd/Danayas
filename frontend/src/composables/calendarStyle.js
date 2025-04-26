import { useBookingStore } from "../stores/bookingStore";

// FOR CALENDAR
export const calendarStyle = (slotDate) => {
  const bookingStore = useBookingStore();

  const getBookingStyle = (slotDate) => {
    const jsDate = new Date(slotDate.year, slotDate.month - 1, slotDate.day);
    const formattedDate = jsDate.toISOString().split("T")[0];

    const booking = bookingStore.bookings.find((b) =>
      b.checkInDate.startsWith(formattedDate)
    );

    if (!booking) {
      return {
        backgroundColor: "#90EE94",
        color: "#15803D",
        width: "40px",
        height: "40px",
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "10rem",
        fontSize: "17px",
      };
    }

    let backgroundColor;
    let color;

    switch (booking.mode) {
      case "day-time":
        backgroundColor = "#FFD5";
        color = "white";
        break;
      case "night-time":
        backgroundColor = "#6A5ACD";
        color = "white";
        break;
      case "whole-day":
        backgroundColor = "#FF6B6B";
        color = "white";
        break;
      default:
        backgroundColor = "#90EE94";
        color = "#15803D";
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
      fontSize: "18px",
    };
  };

  return { calendarStyle };
};
