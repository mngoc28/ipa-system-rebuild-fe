import axiosClient from "./axiosClient";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Response shape for avatar upload/update operations.
 */
interface AvatarUpdateResponse {
    success: boolean;
    message: string;
    avatar_url: string;
    id: string;
}

/**
 * Payload fields for updating a user's personal profile information.
 */
interface ProfileUpdateData {
    fullName?: string;
    email?: string;
    phone?: string;
    unit?: string;
}

/**
 * Response shape for profile detail update operations.
 */
type ProfileUpdateResponse = {
    success: boolean;
    message: string;
} & ProfileUpdateData;

const getAdminPrefix = () => {
  const role = useAuthStore.getState().user?.role || "staff";
  // Admins use the director cluster for shared modules per api.php
  const mappedRole = role.toLowerCase() === "admin" ? "director" : role.toLowerCase();
  return `/api/v1/${mappedRole}`;
};

/**
 * API service for personal profile management and avatar administration.
 */
export const profileApi = {
  /**
   * Updates the profile picture for the currently authenticated user.
   * @param file - The image file to be uploaded.
   * @returns Metadata of the newly set avatar including its URL.
   */
  updateAvatar: async (file: File): Promise<AvatarUpdateResponse> => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await axiosClient.post<AvatarUpdateResponse>(
      "/api/v1/profile/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  /**
   * Modifies identity and contact details for the currently logged-in user.
   * @param data - Subset of profile fields to be updated.
   * @returns Confirmation and echoed profile details.
   */
  updateProfile: async (data: { fullName?: string; email?: string; phone?: string }): Promise<ProfileUpdateResponse> => {
    const response = await axiosClient.patch<ProfileUpdateResponse>(
      "/api/v1/profile",
      data
    );
    return response.data;
  },

  /**
   * Administratively updates the avatar for any system user.
   * @param userId - Unique ID of the target user.
   * @param file - The new avatar image file.
   * @returns Metadata of the newly set avatar.
   */
  updateUserAvatar: async (userId: string, file: File): Promise<AvatarUpdateResponse> => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await axiosClient.post<AvatarUpdateResponse>(
      `${getAdminPrefix()}/users/${userId}/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};
