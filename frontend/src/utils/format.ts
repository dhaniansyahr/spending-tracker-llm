import { DateTime } from "luxon";

export function formatCurrency(value: number, withCurrency: boolean = true) {
  if (withCurrency) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  }
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatDate(
  value: string | null | undefined | Date,
  format = "yyyy-MM-dd",
  fallback = "-",
): string {
  if (!value) return fallback;

  const dt =
    value instanceof Date
      ? DateTime.fromJSDate(value, { zone: "Asia/Jakarta" })
      : DateTime.fromISO(value, { locale: "id" });

  if (!dt.isValid) return fallback;

  return dt.toFormat(format);
}
