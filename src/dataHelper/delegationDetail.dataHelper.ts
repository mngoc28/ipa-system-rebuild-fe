export interface DelegationApiItem {
  id: string;
  code: string;
  name: string;
  direction: "INBOUND" | "OUTBOUND" | string;
  priority: "HIGH" | "MEDIUM" | "LOW" | string;
  countryId: string;
  hostUnitId: string;
  ownerId: string;
  status: string;
  startDate: string;
  endDate: string;
  objective?: string;
  description?: string;
  updatedAt?: string;
}

export interface DelegationMemberItem {
  id: string;
  fullName: string;
  title?: string;
  organizationName?: string;
  contactEmail?: string;
  contactPhone?: string;
  memberType: string;
}

export interface DelegationDetailResponse {
  delegation: DelegationApiItem;
  members: DelegationMemberItem[];
  contacts: unknown[];
  tags: unknown[];
  outcome: unknown;
}

export interface CreateDelegationPayload {
  code?: string;
  name: string;
  direction: "INBOUND" | "OUTBOUND";
  priority: "HIGH" | "MEDIUM" | "LOW";
  countryId: string;
  hostUnitId: string;
  ownerUserId: string;
  startDate: string;
  endDate: string;
  objective: string;
  description: string;
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
