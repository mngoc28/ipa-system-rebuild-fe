import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";

export interface EventItem {
  id: string;
  delegationId?: string | null;
  title: string;
  eventType: string;
  status: string;
  startAt: string;
  endAt: string;
  locationId?: string | null;
  organizerUserId: string;
  participantUserIds: string[];
  joinStates?: Record<string, "JOINED" | "DECLINED">;
}

export interface EventsQuery {
  from?: string;
  to?: string;
  delegationId?: string;
  organizerId?: string;
  page?: number;
  pageSize?: number;
  eventType?: string;
  status?: string;
  search?: string;
  unitId?: string;
}

const getPrefix = () => {
  const role = useAuthStore.getState().user?.role || "staff";
  const mappedRole = role.toLowerCase() === "admin" ? "director" : role.toLowerCase();
  return `/api/v1/${mappedRole}/events`;
};

export const eventsApi = {
  list: async (query?: EventsQuery) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<EventItem>>>(`${getPrefix()}`, {
      params: query,
    });
    return response.data;
  },
  create: async (payload: {
    delegationId?: string;
    title: string;
    eventType: string;
    status: string;
    startAt: string;
    endAt: string;
    locationId?: string;
    organizerUserId: string;
    participantUserIds: string[];
  }) => {
    const response = await axiosClient.post<ApiEnvelope<EventItem>>(`${getPrefix()}`, payload);
    return response.data;
  },
  patch: async (id: string, payload: Partial<{ title: string; status: string; startAt: string; endAt: string; locationId: string }>) => {
    const response = await axiosClient.patch<ApiEnvelope<{ updated: boolean; event: EventItem }>>(`${getPrefix()}/${id}`, payload);
    return response.data;
  },
  join: async (id: string, joined: boolean) => {
    const response = await axiosClient.post<ApiEnvelope<{ participationStatus: string }>>(`${getPrefix()}/${id}/join`, {
      joined,
    });
    return response.data;
  },
  requestReschedule: async (id: string, payload: { proposedStartAt: string; proposedEndAt: string; reason: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ id: string; status: string }>>(`${getPrefix()}/${id}/reschedule-requests`, payload);
    return response.data;
  },
};
