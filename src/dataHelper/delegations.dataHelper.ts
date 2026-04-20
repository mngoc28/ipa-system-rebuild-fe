/**
 * Detailed representation of a delegation item from the API.
 */
export interface DelegationApiItem {
    id: number;
    code: string;
    name: string;
    direction: number;
    status: number;
    priority: number;
    country_id: number;
    host_unit_id: number;
    partner_ids?: number[];
    owner_user_id: number;
    start_date: string;
    end_date: string;
    participant_count: number;
    objective: string;
    description: string;
    investment_potential?: number;
    sector_ids?: number[];
    approval_remark?: string | null;
    created_at: string;
    updated_at: string;
    members?: unknown[];
    events?: unknown[];
    outcomes?: unknown[];
    sectors?: Array<{ id: number; name: string; name_vi?: string }>;
    checklist?: unknown[];
    contacts?: Array<{
    id: number;
    name: string;
    role_name?: string;
    email?: string;
    phone?: string;
    is_primary?: boolean;
  }>;
    country?: {
    id: number;
    name_vi: string;
    name_en: string;
    code: string;
  };
    partners?: Array<{
    id: number;
    name: string;
    partner_name?: string;
  }>;
    host_unit?: {
    id: number;
    unit_name: string;
    unit_code: string;
  };
    owner?: {
    id: number;
    full_name: string;
    avatar_url?: string;
  };
    tasks?: Array<{
    id: number;
    due_at: string;
  }>;
}

/**
 * Query parameters for fetching delegations.
 */
export interface DelegationsQuery {
    search?: string;
    direction?: number;
    status?: number;
    priority?: number;
    country_id?: number | string;
    owner_user_id?: number | string;
    page?: number;
    per_page?: number;
}

export interface CreateDelegationPayload {
  name: string;
  direction: number;
  country_id: number;
  partner_ids?: number[];
  host_unit_id: number;
  start_date: string;
  end_date: string;
  objective?: string;
  description?: string;
  priority?: number;
  status?: number;
  investment_potential?: number;
  sector_ids?: number[];
  members?: Array<{ 
    fullName: string; 
    role: string; 
    organizationName?: string;
    gender?: string;
    identityNumber?: string;
    isVip?: boolean;
  }>;
  schedule_items?: Array<{
    date: string;
    title: string;
    note?: string;
    location_id?: number;
    staff_id?: number;
    logistics_note?: string;
  }>;
  checklist_items?: Array<{
    itemName: string;
    assigneeId?: number;
    status: number;
  }>;
  rating?: number;
  outcome?: {
    rating: number;
    summary: string;
    next_steps: string;
  };
  contacts?: Array<{
    contact_name: string;
    contact_job?: string;
    contact_phone?: string;
    contact_email?: string;
  }>;
  approval_remark?: string | null;
}

/**
 * Maps numeric API status codes to internal UI status keys.
 * @param status - Numeric status code from API.
 * @returns Human-readable status key for UI state management.
 */
export const mapDelegationStatus = (status: number): "draft" | "pendingApproval" | "needsRevision" | "approved" | "inProgress" | "completed" | "cancelled" => {
  switch (status) {
    case 0: return "draft";
    case 1: return "pendingApproval";
    case 2: return "needsRevision";
    case 3: return "approved";
    case 4: return "inProgress";
    case 5: return "completed";
    case 6: return "cancelled";
    default: return "draft";
  }
};

/**
 * Gets a localized label for a delegation status.
 * @param status - Internal UI status key.
 * @returns Vietnamese label for the status.
 */
export const getDelegationStatusLabel = (status: string): string => {
  switch (status) {
    case "draft": return "Bản nháp";
    case "pendingApproval": return "Chờ phê duyệt";
    case "needsRevision": return "Cần chỉnh sửa";
    case "approved": return "Đã phê duyệt";
    case "inProgress": return "Đang thực hiện";
    case "completed": return "Hoàn thành";
    case "cancelled": return "Đã hủy";
    default: return "Bản nháp";
  }
};

/**
 * Maps numeric API priority codes to internal UI priority keys.
 * @param priority - Numeric priority code from API.
 * @returns Human-readable priority key.
 */
export const mapDelegationPriority = (priority: number): string => {
  switch (priority) {
    case 3: return "high";
    case 2: return "medium";
    case 1: return "low";
    default: return "medium";
  }
};

/**
 * Returns a flag emoji for a given country name.
 * @param countryName - The name of the country (in Vietnamese).
 * @returns An emoji string or a globe icon if not found.
 */
export const getFlagEmoji = (countryName: string): string => {
  const flags: Record<string, string> = {
    "Hàn Quốc": "🇰🇷",
    "Singapore": "🇸🇬",
    "Nhật Bản": "🇯🇵",
    "Đức": "🇩🇪",
    "Úc": "🇦🇺",
    "Thái Lan": "🇹🇭",
    "Hoa Kỳ": "🇺🇸",
    "Pháp": "🇫🇷",
    "Đài Loan": "🇹🇼",
    "Israel": "🇮🇱",
    "Vương quốc Anh": "🇬🇧",
    "Ấn Độ": "🇮🇳",
    "Việt Nam": "🇻🇳",
    "Trung Quốc": "🇨🇳",
    "Canada": "🇨🇦",
    "Nga": "🇷🇺",
  };
  // Handle uppercase/lowercase discrepancies by doing a case-insensitive check if needed, 
  // but since we only have specific casing, we can normalize safely where necessary.
  // For now, let's also try to match uppercase for robustness.
  const normalizedName = countryName?.trim();
  
  // Try exact match first
  if (flags[normalizedName]) return flags[normalizedName];
  
  // Try case-insensitive lookup
  const foundKey = Object.keys(flags).find(k => k.toLowerCase() === normalizedName?.toLowerCase());
  if (foundKey) return flags[foundKey];

  return "🌐";
};
