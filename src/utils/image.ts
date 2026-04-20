import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";

const IMAGE_BASE_URL = CLOUDINARY_HEADER_IMAGE_URL;

/**
 * Standardizes and completes the absolute URL for an image asset.
 * If the path is already external (starts with http), it's returned as-is.
 * Otherwise, it joins the path with the shared Cloudinary/CDN base URL.
 * @param path - The relative or absolute image path.
 * @returns The final absolute URL for the image.
 */
export const getImageUrl = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const normalizedBase = IMAGE_BASE_URL.endsWith("/") ? IMAGE_BASE_URL.slice(0, -1) : IMAGE_BASE_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!normalizedBase) {
    return normalizedPath;
  }

  return `${normalizedBase}${normalizedPath}`;
};

