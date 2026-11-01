export const storeInfo = {
  name: "Alfa Trading Liquors",
  phoneDisplay: "+27 61 285 6951",
  phoneHref: "+27612856951",
  whatsappNumber: "27612856951",
  email: "",
  addressLines: ["67 13th Ave", "Northmead, Benoni", "1501, South Africa"],
  mapsUrl: "https://maps.app.goo.gl/rbS5oTFzEPb9mPBE8",
};

export const openingHours = [
  {
    label: "Monday – Saturday",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    opens: 8 * 60,
    closes: 20 * 60,
  },
  {
    label: "Sunday",
    days: ["Sun"],
    opens: 9 * 60,
    closes: 15 * 60 + 30,
  },
];

export function formatMinutes(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function getOpenStatus(now: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Johannesburg",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);

  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((part) => part.type === "hour")?.value) % 24;
  const minute = Number(parts.find((part) => part.type === "minute")?.value);
  const minutesNow = hour * 60 + minute;

  const todayHours = openingHours.find((entry) => entry.days.includes(weekday));
  if (todayHours && minutesNow >= todayHours.opens && minutesNow < todayHours.closes) {
    return { isOpen: true, label: `Open now · until ${formatMinutes(todayHours.closes)}` };
  }
  return { isOpen: false, label: "Closed now" };
}
