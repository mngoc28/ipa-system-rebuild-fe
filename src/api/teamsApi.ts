import axiosClient from "@/api/axiosClient";
import { ApiEnvelope } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";

export type TeamMemberStatus = "In Office" | "On Field" | "On Leave";

export interface TeamMemberItem {
  id: string;
  name: string;
  role: string;
  email: string;
  status: TeamMemberStatus;
  tasks: number;
  performance: number;
  unitName?: string;
  avatarUrl?: string | null;
}

export interface TeamActivityItem {
  user: string;
  action: string;
  time: string;
}

export interface TeamSummary {
  totalMembers: number;
  inOffice: number;
  onField: number;
  onLeave: number;
}

export interface TeamDashboardData {
  members: TeamMemberItem[];
  activities: TeamActivityItem[];
  summary: TeamSummary;
}

export interface OrgUnitItem {
  id: string;
  unitCode: string;
  unitName: string;
  unitType: string;
  parentUnitId?: string | null;
  managerUserId?: string | null;
}

export interface TeamCreateMemberPayload {
  fullName: string;
  email: string;
  username?: string;
  phone?: string;
  positionTitle?: string;
  unitId?: number;
}

export interface MentionMemberItem {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
}

export const teamsApi = {
  getDashboard: async (query?: { unitId?: number; page?: number; pageSize?: number; search?: string }) => {
    const { user } = useAuthStore.getState();
    const rolePrefix = user?.role?.toLowerCase() || 'staff';
    
    const response = await axiosClient.get<ApiEnvelope<TeamDashboardData>>(`/api/v1/${rolePrefix}/teams`, {
      params: query,
    });

    return response.data;
  },
  createMember: async (payload: TeamCreateMemberPayload) => {
    const { user } = useAuthStore.getState();
    const rolePrefix = user?.role?.toLowerCase() || 'staff';

    const response = await axiosClient.post<ApiEnvelope<TeamMemberItem>>(`/api/v1/${rolePrefix}/teams/members`, payload);
    return response.data;
  },
  listUnits: async () => {
    const { user } = useAuthStore.getState();
    const rolePrefix = user?.role?.toLowerCase() || 'staff';

    const response = await axiosClient.get<ApiEnvelope<{ items: OrgUnitItem[] }>>(`/api/v1/${rolePrefix}/teams/units`);
    return response.data;
  },
  getMentionMembers: async (query?: { unitId?: number; search?: string; pageSize?: number }) => {
    const { user } = useAuthStore.getState();
    const rolePrefix = user?.role?.toLowerCase() || 'staff';

    const response = await axiosClient.get<ApiEnvelope<{ items: MentionMemberItem[] }>>(`/api/v1/${rolePrefix}/teams/mentions`, {
      params: query,
    });

    return response.data;
  },
};
