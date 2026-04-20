import React from "react";
import { Globe } from "lucide-react";

/**
 * Props for the CountryFlag component.
 */
interface CountryFlagProps {
  /** Full name of the country in Vietnamese or English (e.g., "Hàn Quốc" or "Korea"). */
  countryName: string;
  /** Optional CSS classes for additional styling. */
  className?: string;
}

/**
 * Maps a country name to its corresponding ISO 3166-1 alpha-2 code.
 * Supported names are currently in Vietnamese.
 * 
 * @param countryName - The name of the country to look up.
 * @returns The 2-letter country code or null if not found.
 */
export const getCountryCode = (countryName: string): string | null => {
  if (!countryName) return null;
  const flags: Record<string, string> = {
    "Hàn Quốc": "kr",
    "Singapore": "sg",
    "Nhật Bản": "jp",
    "Đức": "de",
    "Úc": "au",
    "Thái Lan": "th",
    "Hoa Kỳ": "us",
    "Pháp": "fr",
    "Đài Loan": "tw",
    "Israel": "il",
    "Vương quốc Anh": "gb",
    "Ấn Độ": "in",
    "Việt Nam": "vn",
    "Trung Quốc": "cn",
    "Canada": "ca",
    "Nga": "ru",
  };
  
  const normalizedName = countryName?.trim();
  if (flags[normalizedName]) return flags[normalizedName];
  const foundKey = Object.keys(flags).find(k => k.toLowerCase() === normalizedName?.toLowerCase());
  return foundKey ? flags[foundKey] : null;
};

/**
 * Displays a small country flag icon based on the provided country name.
 * Uses flagcdn.com as the image source. Falls back to a globe icon if the 
 * country is not recognized.
 * 
 * @param props - Component props following CountryFlagProps interface.
 */
export const CountryFlag: React.FC<CountryFlagProps> = ({ countryName, className = "" }) => {
  const code = getCountryCode(countryName);

  if (!code) {
    return <Globe size={14} className={`text-slate-400 ${className}`} />;
  }

  return (
    <img
      src={`https://flagcdn.com/w20/${code}.png`}
      srcSet={`https://flagcdn.com/w40/${code}.png 2x`}
      width="16"
      alt={countryName}
      className={`inline-block ${className}`}
      loading="lazy"
    />
  );
};
