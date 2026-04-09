import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";

const IMAGE_BASE_URL = CLOUDINARY_HEADER_IMAGE_URL;

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

