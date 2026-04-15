export type PartnerUiStatus = "Lead" | "Partner" | "Active";

export interface PartnerContactItem {
  id: string;
  fullName: string;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
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

export interface PartnerDetailApiItem extends PartnerApiItem {
  notes?: string | null;
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

export const mapPartnerStatus = (status: number): PartnerUiStatus => {
  if (status === 2) return "Active";
  if (status === 1) return "Partner";
  return "Lead";
};

export const getPartnerStatusValue = (status: PartnerUiStatus): number => {
  if (status === "Active") return 2;
  if (status === "Partner") return 1;
  return 0;
};

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
