/**
 * Represents the raw delegation data structure from the API.
 */
export interface DelegationApiItem {
  /** Unique identifier */
  id: string;
  /** Internal tracking code */
  code: string;
  /** Name of the delegation */
  name: string;
  /** Direction of the delegation: INBOUND (coming in) or OUTBOUND (going out) */
  direction: "INBOUND" | "OUTBOUND" | string;
  /** Urgency level */
  priority: "HIGH" | "MEDIUM" | "LOW" | string;
  /** ID of the associated country */
  countryId: string;
  /** ID of the unit hosting the delegation */
  hostUnitId: string;
  /** ID of the user managing this delegation */
  ownerId: string;
  /** Current lifecycle status */
  status: string;
  /** Effective start date */
  startDate: string;
  /** Effective end date */
  endDate: string;
  /** Primary objective of the visit */
  objective?: string;
  /** Additional details or context */
  description?: string;
  /** Last update timestamp */
  updatedAt?: string;
}

/**
 * Represents a member participating in a delegation.
 */
export interface DelegationMemberItem {
  /** Member unique ID */
  id: string;
  /** Full name of the member */
  fullName: string;
  /** Professional title/position */
  title?: string;
  /** Name of the organization they belong to */
  organizationName?: string;
  /** Email address for contact */
  contactEmail?: string;
  /** Phone number for contact */
  contactPhone?: string;
  /** Type/Role of the member in the delegation */
  memberType: string;
}

export interface DelegationDetailResponse {
  delegation: DelegationApiItem;
  members: DelegationMemberItem[];
  contacts: unknown[];
  tags: unknown[];
  outcome: unknown;
}

/**
 * Payload for creating a new delegation.
 */
export interface CreateDelegationPayload {
  /** Optional custom code */
  code?: string;
  /** Name of the delegation */
  name: string;
  /** Visit direction */
  direction: "INBOUND" | "OUTBOUND";
  /** Urgency priority */
  priority: "HIGH" | "MEDIUM" | "LOW";
  /** Target country ID */
  countryId: string;
  /** Unit responsible for hosting */
  hostUnitId: string;
  /** User assigned as the primary owner */
  ownerUserId: string;
  /** Expected start date */
  startDate: string;
  /** Expected end date */
  endDate: string;
  /** Goals of the delegation */
  objective: string;
  /** Detailed background info */
  description: string;
  /** List of member IDs to associate */
  members?: string[];
  /** Proposed itinerary/schedule items */
  schedule_items?: Array<{
    date: string;
    title: string;
    note?: string;
  }>;
}

export interface DelegationsQuery {
  status?: string;
  direction?: string;
  countryId?: string;
  ownerId?: string;
  fromDate?: string;
  toDate?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface DelegationUiItem {
  id: string | number;
  code: string;
  name: string;
  country: string;
  partnerOrg: string;
  hostUnit: string;
  type: "inbound" | "outbound" | string;
  priority: "high" | "medium" | "low" | string;
  startDate: string;
  endDate: string;
  status: string;
  description?: string;
  staff: {
    name: string;
    avatar?: string;
  };
}

export interface DelegationTaskItem {
  id: number;
  title: string;
  done: boolean;
}

export interface DelegationDocumentItem {
  id: number;
  name: string;
  size: string;
}

export interface DelegationMinutesItem {
  id: number;
  title: string;
  status: string;
}

export const delegationTasks: DelegationTaskItem[] = [
  { id: 1, title: "Xác nhận lịch đón đoàn tại sân bay", done: true },
  { id: 2, title: "Chốt lịch họp với Ban quản lý Khu CNC", done: false },
  { id: 3, title: "Hoàn tất bộ tài liệu giới thiệu đối tác", done: false },
];

export const delegationDocuments: DelegationDocumentItem[] = [
  { id: 1, name: "Ke_hoach_tiep_doan.pdf", size: "1.2MB" },
  { id: 2, name: "Du_thao_bien_ban_hop_tac.docx", size: "540KB" },
];

export const delegationMinutesItems: DelegationMinutesItem[] = [
  { id: 1, title: "Biên bản họp chuẩn bị", status: "Đã tạo" },
  { id: 2, title: "Biên bản làm việc ngày 15/05", status: "Chờ ký" },
];

/**
 * Maps API status strings to internal UI status keys.
 * @param apiStatus - The status string from the API.
 * @returns Normalized internal status key.
 */
export const mapDelegationStatus = (apiStatus: string) => {
  const normalized = (apiStatus || "").toUpperCase();
  if (normalized === "PENDING_APPROVAL") return "pendingApproval";
  if (normalized === "IN_PROGRESS") return "inProgress";
  if (normalized === "NEEDS_REVISION") return "needsRevision";
  if (normalized === "APPROVED") return "approved";
  if (normalized === "COMPLETED") return "completed";
  if (normalized === "CANCELLED") return "cancelled";
  return "draft";
};

/**
 * Maps a delegation item from API format to the format used in UI components.
 * @param apiDelegation - The raw delegation record from the API.
 * @param fallback - Fallback values for missing fields.
 * @returns A UI-ready delegation object.
 */
export const mapDelegationDetailToUi = (apiDelegation: DelegationApiItem, fallback: DelegationUiItem): DelegationUiItem => {
  return {
    ...fallback,
    id: apiDelegation.id,
    code: apiDelegation.code,
    name: apiDelegation.name,
    country: apiDelegation.countryId || fallback.country,
    partnerOrg: apiDelegation.objective || fallback.partnerOrg,
    hostUnit: apiDelegation.hostUnitId || fallback.hostUnit,
    type: String(apiDelegation.direction).toUpperCase() === "OUTBOUND" ? "outbound" : "inbound",
    priority: String(apiDelegation.priority).toUpperCase() === "HIGH" ? "high" : String(apiDelegation.priority).toUpperCase() === "LOW" ? "low" : "medium",
    startDate: apiDelegation.startDate || fallback.startDate,
    endDate: apiDelegation.endDate || fallback.endDate,
    status: mapDelegationStatus(apiDelegation.status),
    description: apiDelegation.description || fallback.description,
    staff: { name: apiDelegation.ownerId || fallback.staff.name, avatar: fallback.staff.avatar || "" },
  };
};
