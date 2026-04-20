import clsx, { type ClassValue } from "clsx";
import slugify from "slugify";

/**
 * Generates a URL-friendly slug from a string, with Vietnamese support.
 * @param title - The source string (usually a project title or delegation name).
 * @returns A strictly formatted lowercase slug.
 */
export const generateSlug = (title: string) => {
  return slugify(title, {
    lower: true,
    strict: true,
    locale: "vi",
    remove: /[*+~.()'"!:@]/g,
  });
};

/**
 * Utility for conditionally joining class names using clsx.
 * @param inputs - Variable list of styles, conditions, or arrays of classes.
 * @returns A single space-separated class name string.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}
