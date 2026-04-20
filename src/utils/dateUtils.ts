import { t } from "i18next";

/**
 * Supported date string formats for output generation.
 */
export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD" | "DD MMM YYYY" | "DD-MM-YYYY" | "YYYYMMDD";

/**
 * Formats a Date object or string into a specified string format.
 * @param date - The source date to format.
 * @param format - The target format pattern.
 * @returns Formatted date string, or empty string if invalid.
 */
export const formatDate = (date: string | Date, format: DateFormat = "DD/MM/YYYY"): string => {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return "";
  }

  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  switch (format) {
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD-MM-YYYY":
      return `${day}-${month}-${year}`;
    case "DD MMM YYYY":
      return `${day} ${monthNames[d.getMonth()]} ${year}`;
    case "YYYYMMDD":
      return `${year}${month}${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

/**
 * Hook or utility providing access to formatting functions.
 */
export const useDateFormatter = () => {
  return {
    /**
     * Proxies to the global formatDate utility.
     * @param date - Source date.
     * @param format - Output format.
     */
    formatDate: (date: string | Date, format: DateFormat = "DD/MM/YYYY") => formatDate(date, format),
  };
};

/**
 * Formats a date specifically for the Vietnam (Asia/Ho_Chi_Minh) timezone.
 * @param date - Source date.
 * @returns Formatted date string (DD-MM-YYYY).
 */
export const formatDateVietnam = (date: string | Date): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (type: string) => fmt.find((p) => p.type === type)?.value || "";
  return `${get("day")}-${get("month")}-${get("year")}`;
};

/**
 * Formats a date and time for the Vietnam (Asia/Ho_Chi_Minh) timezone.
 * @param date - Source date.
 * @returns Formatted timestamp string (DD-MM-YYYY, HH:mm:ss).
 */
export const formatDateTimeVietnam = (date: string | Date): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => fmt.find((p) => p.type === type)?.value || "";
  return `${get("day")}-${get("month")}-${get("year")}, ${get("hour")}:${get("minute")}:${get("second")}`;
};

/**
 * Parses an ISO date string (YYYY-MM-DD) and converts it to VN format (DD-MM-YYYY)
 * without performing timezone shifting (assumes raw date component transfer).
 * @param iso - The ISO date string.
 * @returns VN formatted date or empty string.
 */
export const formatDateVietnamFromISO = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(iso);
  if (!m) return formatDateVietnam(iso);
  const [, y, mo, d] = m;
  return `${d}-${mo}-${y}`;
};

/**
 * Parses a VN date string (DD-MM-YYYY) into a standard ISO format (YYYY-MM-DD).
 * @param vn - The VN date string.
 * @returns ISO date string or null if input is malformed.
 */
export const parseVietnamDateToISO = (vn: string | null | undefined): string | null => {
  if (!vn) return null;
  const m = /^\s*([0-9]{2})-([0-9]{2})-([0-9]{4})\s*$/.exec(vn);
  if (!m) return null;
  const [, d, mo, y] = m;
  const day = Number(d),
    month = Number(mo);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${y}-${mo}-${d}`;
};

/**
 * Maps a numeric day of the week (2-7, 1 for Sunday) to a translated string.
 * @param dayOfWeek - Numeric index of the day.
 * @returns Translated day name.
 */
export const mapDayOfWeek = (dayOfWeek: number) => {
  switch (dayOfWeek) {
    case 2:
      return t("days.monday");
    case 3:
      return t("days.tuesday");
    case 4:
      return t("days.wednesday");
    case 5:
      return t("days.thursday");
    case 6:
      return t("days.friday");
    case 7:
      return t("days.saturday");
    default:
      return t("days.sunday");
  }
};

/**
 * Safely formats a date-time string or object, returning "-" for invalid inputs.
 * @param date - The date to format.
 * @returns Formatted timestamp or placeholder.
 */
export const safeFormatDateTime = (date: string | Date | undefined): string => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const seconds = d.getSeconds().toString().padStart(2, "0");
  return `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;
};
