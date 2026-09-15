//format workspace type 
export function formatWorkspaceType(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// app/utils/formatters.ts
export const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

// Compact form for large values — e.g. ₦20.5M instead of ₦20,500,000.00
export const compactCurrencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 4,
  minimumFractionDigits: 4
}); 

export const timeFormatter = new Intl.DateTimeFormat("en-NG", {
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
});

// End time only needs hour:minute — the weekday/start already establishes the day.
const endTimeFormatter = new Intl.DateTimeFormat("en-NG", {
  hour: "numeric",
  minute: "2-digit",
});

export function formatBookingTimeRange(
  startAt: string | null,
  endAt: string | null,
): string {
  if (!startAt) return "—";
  const start = timeFormatter.format(new Date(startAt));
  if (!endAt) return start;
  const end = endTimeFormatter.format(new Date(endAt));
  return `${start} – ${end}`;
}