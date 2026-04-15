export interface DelegationApiItem {
  id: number;
  code: string;
  name: string;
  direction: number;
  status: number;
  priority: number;
  country_id: number;
  host_unit_id: number;
  owner_user_id: number;
  start_date: string;
  end_date: string;
  participant_count: number;
  objective: string;
  description: string;
  created_at: string;
  updated_at: string;
  members?: any[];
  events?: any[];
  outcomes?: any[];
}

export interface DelegationsQuery {
  search?: string;
  direction?: number;
  status?: number;
  priority?: number;
  page?: number;
  per_page?: number;
}

export interface CreateDelegationPayload {
  name: string;
  direction: number;
  country_id: number;
  host_unit_id: number;
  start_date: string;
  end_date: string;
  objective?: string;
  description?: string;
  priority?: number;
  status?: number;
}

export const mapDelegationStatus = (status: number): string => {
  switch (status) {
    case 1: return "Chuẩn bị";
    case 2: return "Đang diễn ra";
    case 3: return "Hoàn thành";
    case 4: return "Hủy bỏ";
    default: return "Lên kế hoạch";
  }
};

export const mapDelegationPriority = (priority: number): string => {
  switch (priority) {
    case 3: return "High";
    case 2: return "Medium";
    case 1: return "Low";
    default: return "Medium";
  }
};
