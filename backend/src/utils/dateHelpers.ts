export const processBookingData = (bookingData: any) => {
  const toISODate = (dateStr: string) => {
    const [month, day, year] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0)).toISOString();
  };

  const toISODateTime = (dateStr: string, timeStr: string) => {
    const [month, day, year] = dateStr.split("-").map(Number);
    let [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return new Date(Date.UTC(year, month - 1, day, hours, minutes)).toISOString();
  };

  return {
    ...bookingData,
    checkInDate: bookingData.checkInDate ? toISODate(bookingData.checkInDate) : undefined,
    checkOutDate: bookingData.checkOutDate ? toISODate(bookingData.checkOutDate) : undefined,
    arrivalTime: bookingData.arrivalTime ? toISODateTime(bookingData.checkInDate, bookingData.arrivalTime) : undefined,
    createdAt: new Date().toISOString(),
    catering: bookingData.catering === 1 ? 1 : 0,
  };
};