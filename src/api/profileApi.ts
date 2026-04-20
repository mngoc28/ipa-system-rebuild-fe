import axiosClient from "./axiosClient";
import { useAuthStore } from "@/store/useAuthStore";

interface AvatarUpdateResponse {
  success: boolean;
  message: string;
  data: {
    avatar_url: string;
    id: string;
  };
}

interface ProfileUpdateData {
  fullName?: string;
  email?: string;
  phone?: string;
  unit?: string;
}

interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  data: ProfileUpdateData;
}

const getAdminPrefix = () => {
  const role = useAuthStore.getState().user?.role || "staff";
  // Admins use the director cluster for shared modules per api.php
  const mappedRole = role.toLowerCase() === "admin" ? "director" : role.toLowerCase();
  return `/api/v1/${mappedRole}`;
};

export const profileApi = {
  /**
   * Update the avatar for the currently logged-in user
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
   * Update the profile info for the currently logged-in user
   */
  updateProfile: async (data: { fullName?: string; email?: string; phone?: string }): Promise<ProfileUpdateResponse> => {
    const response = await axiosClient.patch<ProfileUpdateResponse>(
      "/api/v1/profile",
      data
    );
    return response.data;
  },

  /**
   * Update the avatar for another user (Admin only)
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
