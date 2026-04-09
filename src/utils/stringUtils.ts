import clsx, { type ClassValue } from "clsx";
import slugify from "slugify";

export const generateSlug = (title: string) => {
  return slugify(title, {
    lower: true,
    strict: true,
    locale: "vi",
    remove: /[*+~.()'"!:@]/g,
  });
};

export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}
