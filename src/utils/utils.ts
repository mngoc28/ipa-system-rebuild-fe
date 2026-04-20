import React from "react";

/**
 * Standard background and text color utility classes for booking lifecycle statuses.
 */
export const statusColor: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  cancelled: "bg-red-50 text-red-700",
  completed: "bg-green-50 text-green-700",
};

/**
 * Maps a numeric news status to its translation key and corresponding UI color.
 * @param status - Numeric status code (0: draft, 1: published, 2: archived).
 * @returns Object containing translation key and Tailwind color classes.
 */
export function statusNews(status: number): {status: string, color: string} {
  switch (status) {
    case 0: return {status: "news.status_draft", color: "bg-yellow-50 text-yellow-700"};
    case 1: return {status: "news.status_published", color: "bg-blue-50 text-blue-700"};
    case 2: return {status: "news.status_archived", color: "bg-red-50 text-red-700"};
    default: return {status: "news.status_draft", color: "bg-yellow-50 text-yellow-700"};
  }
}

/**
 * Converts a numeric booking status from the API into a semantic string identifier.
 * @param status - Numeric API status code.
 * @returns Semantic status string ("pending", "confirmed", etc.).
 */
export function mapBookingStatus(status: number): "pending" | "confirmed" | "cancelled" | "completed" {
  switch (status) {
    case 0: return "pending";
    case 1: return "confirmed";
    case 2: return "cancelled";
    case 3: return "completed";
    default: return "pending";
  }
}

/**
 * Map booking status string to number for API.
 * @param status "pending" | "confirmed" | "cancelled" | "completed"
 * @returns number
 */
export function mapStatusToNumber(status: string): number {
  switch (status) {
    case "pending": return 0;
    case "confirmed": return 1;
    case "cancelled": return 2;
    case "completed": return 3;
    default: return 0;
  }
}

/**
 * Formats a numeric value into a Vietnamese Dong (VND) currency string.
 * Handles both number and numeric string inputs.
 * @param v - The raw value to format.
 * @returns Formatted currency string (e.g. "1.000.000 ₫") or "-" if invalid.
 */
export function formatPrice(v?: number | string | null): string {
  if (v == null) return "-";
  const n = typeof v === "number" ? v : parseFloat(v);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
}

/**
 * Converts a numeric user account status to a translation-friendly string key.
 * @param status - User status code (0: pending, 1: active, 2: blocked).
 * @returns Status identifier string.
 */
export function statusNumberToText(status?: number | string): string {
  const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
  switch (statusNum) {
    case 0:
      return "pending";
    case 1:
      return "active";
    case 2:
      return "blocked";
    default:
      return "pending";
  }
}

/**
 * Reverse maps display labels (in Vietnamese) to their corresponding numeric status codes.
 * Note: This is usually for parsing localized Excel imports or manual inputs.
 * @param status - The Vietnamese status label.
 * @returns The numeric status code.
 */
export function statusTextToNumber(status: string): number {
  switch (status) {
    case "Đang chờ":
      return 0;
    case "Hoạt động":
      return 1;
    case "Đã khóa":
      return 2;
    default:
      return 0;
  }
}

/**
 * Retrieves the appropriate CSS class string for a user's status tag.
 * @param status - User status numeric code or string.
 * @returns Tailwind CSS utility classes for background and text.
 */
export function getStatusClass(status?: number | string) {
  const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
  switch (statusNum) {
    case 0:
      return "bg-yellow-50 text-yellow-700";
    case 1:
      return "bg-green-50 text-green-700";
    case 2:
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

/**
 * Formats a Date object specifically for HTML5 datetime-local input fields.
 * @param date - The Date object to format.
 * @returns String in YYYY-MM-DDTHH:mm format.
 */
export const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Formats a numeric input string with US-style thousand separators (commas).
 * @param val - The raw numeric string from an input.
 * @returns Formatted string (e.g. "1,000,000").
 */
export function formatCurrencyInput(val: string): string {
  if (!val || val === '') return '';
  const num = parseFloat(val);
  return isNaN(num) ? val : num.toLocaleString('en-US');
}

/**
 * Validates and sanitizes a currency input string by removing non-numeric characters.
 * @param value - The raw input value containing potential separators.
 * @returns Cleaned numeric string or null if the input contains invalid characters.
 */
export function validateCurrencyInput(value: string): string | null {
  const cleaned = value.replace(/,/g, '');
  if (cleaned === '' || /^\d*\.?\d*$/.test(cleaned)) {
    return cleaned;
  }
  return null;
};

/**
 * Wraps search term occurrences within a string with a highlighted span.
 * @param text - The full text to search within.
 * @param search - The term to highlight.
 * @returns React node with highlighted spans and text fragments.
 */
export function highlightText(text: string, search: string): React.ReactNode {
  if (!search) return text;
  const regex = new RegExp(`(${search})`, "gi");
  return text.split(regex).map((part, i) =>
    part.toLowerCase() === search.toLowerCase()
      ? React.createElement('span', { key: i, style: { background: '#ffe066', fontWeight: 600 } }, part)
      : part
  );
}

/**
 * Standard utility array for mapping news status codes to their display labels.
 */
export const statusNewsArray = [
  { value: 0, label: "news.status_draft" },
  { value: 1, label: "news.status_published" },
  { value: 2, label: "news.status_archived" },
];

/**
 * Helper to safely append an image or a 'delete' command to FormData.
 * @param formData - The target form data object.
 * @param key - The field name in the binary payload.
 * @param value - The File object, a 'delete' flag, or null/undefined to skip.
 */
export function appendImageField(formData: FormData, key: string, value?: File | 'delete' | null) {
  if (value instanceof File) {
    formData.append(key, value);
  } else if (value === 'delete') {
    formData.append(key, 'delete');
  }
}