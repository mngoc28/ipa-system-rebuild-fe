import React from "react";
import { Globe } from "lucide-react";

interface CountryFlagProps {
  countryName: string;
  className?: string;
}

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
