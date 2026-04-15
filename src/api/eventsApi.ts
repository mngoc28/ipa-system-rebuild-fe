import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";

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

export const eventsApi = {
  list: async (query?: { from?: string; to?: string; delegationId?: string; organizerId?: string; page?: number; pageSize?: number }) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<EventItem>>>("/api/v1/events", {
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
    const response = await axiosClient.post<ApiEnvelope<EventItem>>("/api/v1/events", payload);
    return response.data;
  },
  patch: async (id: string, payload: Partial<{ title: string; status: string; startAt: string; endAt: string; locationId: string }>) => {
    const response = await axiosClient.patch<ApiEnvelope<{ updated: boolean; event: EventItem }>>(`/api/v1/events/${id}`, payload);
    return response.data;
  },
  join: async (id: string, joined: boolean) => {
    const response = await axiosClient.post<ApiEnvelope<{ participationStatus: string }>>(`/api/v1/events/${id}/join`, {
      joined,
    });
    return response.data;
  },
  requestReschedule: async (id: string, payload: { proposedStartAt: string; proposedEndAt: string; reason: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ id: string; status: string }>>(`/api/v1/events/${id}/reschedule-requests`, payload);
    return response.data;
  },
};
