/**
 * Internal UI status for partners, representing their lead or relationship stage.
 */
export type PartnerUiStatus = "Lead" | "Partner" | "Active";

/**
 * Interface representing a contact person associated with a partner organization.
 */
export interface PartnerContactItem {
  /** Unique ID of the contact */
  id: string;
  /** Full name of the contact person */
  fullName: string;
  /** Job title or professional designation */
  title?: string | null;
  /** Professional email address */
  email?: string | null;
  /** Contact phone number */
  phone?: string | null;
  /** Flag indicating if this is the primary point of contact */
  isPrimary?: boolean;
}

export interface PartnerApiItem {
  id: string;
  partnerCode: string;
  partnerName: string;
  countryId: number;
  countryName: string;
  sectorId: number;
  sectorName: string;
  status: number;
  score?: number | null;
  website?: string | null;
  notes?: string | null;
  createdAt: string;
  contacts?: PartnerContactItem[];
}

export interface PartnerDetailInteractionItem {
  id: string;
  interactionType: number;
  interactionAt?: string | null;
  summary?: string | null;
}

/**
 * Represents a partner organization with detailed fields for interaction tracking.
 */
export interface PartnerDetailApiItem extends PartnerApiItem {
  /** Supplemental background notes */
  notes?: string | null;
  /** Collection of recent meeting or communication summaries */
  recentInteractions?: PartnerDetailInteractionItem[];
}

export interface PartnerCreatePayload {
  partner_code: string;
  partner_name: string;
  country_id: number;
  sector_id: number;
  status?: number;
  website?: string;
  notes?: string;
}

export interface PartnerPatchPayload {
  partner_code?: string;
  partner_name?: string;
  country_id?: number;
  sector_id?: number;
  status?: number;
  score?: number;
  website?: string;
  notes?: string;
}

export interface PartnerOptionItem {
  id: string;
  label: string;
}

export interface PartnerOptionsResponse {
  countries: PartnerOptionItem[];
  sectors: PartnerOptionItem[];
}

export interface PartnerContactPayload {
  fullName: string;
  title?: string;
  email?: string;
  phone?: string;
  isPrimary?: boolean;
}

export interface PartnerUiItem {
  id: string;
  name: string;
  category: string;
  country: string;
  representative: string;
  score: number;
  status: PartnerUiStatus;
  projects: number;
  partnerCode: string;
}

/**
 * Maps numeric API status codes to internal UI status keys.
 * @param status - Numeric status code from API.
 * @returns Normalized status string for UI display.
 */
export const mapPartnerStatus = (status: number): PartnerUiStatus => {
  if (status === 2) return "Active";
  if (status === 1) return "Partner";
  return "Lead";
};

/**
 * Returns the numeric API value for a given UI status key.
 * @param status - Internal UI status string.
 * @returns Equivalent numeric code for API compatibility.
 */
export const getPartnerStatusValue = (status: PartnerUiStatus): number => {
  if (status === "Active") return 2;
  if (status === "Partner") return 1;
  return 0;
};

/**
 * Maps a single partner API item to the structure used by frontend components.
 * @param item - Raw partner data from the API.
 * @returns Formatted partner object for UI components.
 */
export const mapPartnerToUi = (item: PartnerApiItem): PartnerUiItem => {
  return {
    id: item.id,
    name: item.partnerName,
    category: item.sectorName || "N/A",
    country: item.countryName || "N/A",
    representative: item.contacts?.find((contact) => contact.isPrimary)?.fullName || "Đang cập nhật",
    score: Number(item.score ?? 4.5),
    status: mapPartnerStatus(item.status),
    projects: 0,
    partnerCode: item.partnerCode,
  };
};

export const mapPartnerItemsToUi = (items: PartnerApiItem[]): PartnerUiItem[] => items.map(mapPartnerToUi);

export const getNextPartnerStatus = (status: number): number | null => {
  if (status >= 2) {
    return null;
  }

  return status + 1;
};
