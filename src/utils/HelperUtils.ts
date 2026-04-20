import { DEFAULT_SORT_DIRECTION, DIRECTION_VALUES } from "@/constant";

/**
 * Safely parses a string into a finite positive number.
 * @param value - The input string to parse.
 * @param fallback - The value to return if parsing fails or result is non-positive.
 * @returns A validated positive number or the fallback.
 */
export const parseNumber = (value: string | null, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Validates and normalizes a sort direction string.
 * @param value - The raw direction string (e.g., from URL params).
 * @returns "asc" or "desc" based on validity, otherwise default direction.
 */
export const parseDirection = (value: string | null): "asc" | "desc" => {
  if (!value) return DEFAULT_SORT_DIRECTION;
  return DIRECTION_VALUES.includes(value as "asc" | "desc") ? (value as "asc" | "desc") : DEFAULT_SORT_DIRECTION;
};
