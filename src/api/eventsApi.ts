import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Represents a scheduled event or activity, often linked to a delegation.
 */
export interface EventItem {
  /** Unique event ID */
  id: string;
  /** Optional ID of the associated delegation */
  delegationId?: string | null;
  /** Subject or title of the event */
  title: string;
  /** Categorization (e.g., MEETING, GALA, SITE_VISIT) */
  eventType: string;
  /** Lifecycle status (e.g., PLANNED, ONGOING, COMPLETED) */
  status: string;
  /** ISO start timestamp */
  startAt: string;
  /** ISO end timestamp */
  endAt: string;
  /** Optional ID of the location record */
  locationId?: string | null;
  /** ID of the user organizing the event */
  organizerUserId: string;
  /** List of user IDs invited to the event */
  participantUserIds: string[];
  /** Map of participant IDs to their attendance status */
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

/**
 * API service for event management, attendance, and rescheduling.
 */
export const eventsApi = {
  /**
   * Retrieves a filtered list of events within a time range.
   * @param query - Contextual filters for event discovery.
   * @returns Paginated list of event items.
   */
  list: async (query?: EventsQuery) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<EventItem>>>(`${getPrefix()}`, {
      params: query,
    });
    return response.data;
  },

  /**
   * Registers a new event in the system.
   * @param payload - Comprehensive event details.
   * @returns The created event record.
   */
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

  /**
   * Updates partial data for an existing event.
   * @param id - Target event ID.
   * @param payload - Fields to be updated.
   * @returns Update confirmation.
   */
  patch: async (id: string, payload: Partial<{ title: string; status: string; startAt: string; endAt: string; locationId: string }>) => {
    const response = await axiosClient.patch<ApiEnvelope<{ updated: boolean; event: EventItem }>>(`${getPrefix()}/${id}`, payload);
    return response.data;
  },

  /**
   * Updates the current user's attendance status for an event.
   * @param id - Target event ID.
   * @param joined - Joining if true, declining if false.
   * @returns Updated participation status details.
   */
  join: async (id: string, joined: boolean) => {
    const response = await axiosClient.post<ApiEnvelope<{ participationStatus: string }>>(`${getPrefix()}/${id}/join`, {
      joined,
    });
    return response.data;
  },

  /**
   * Submits a request to change the scheduled time of an event.
   * @param id - Target event ID.
   * @param payload - New proposed times and justification.
   * @returns The newly created reschedule request details.
   */
  requestReschedule: async (id: string, payload: { proposedStartAt: string; proposedEndAt: string; reason: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ id: string; status: string }>>(`${getPrefix()}/${id}/reschedule-requests`, payload);
    return response.data;
  },
};
