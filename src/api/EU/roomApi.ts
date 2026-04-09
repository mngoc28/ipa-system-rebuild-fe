import axiosClient from "@/api/axiosClient";
import { ApiResponse } from "@/api/types";
import { RoomListItem } from "@/dataHelper/EU/room.dataHelper";
import { LatestRoomResponse } from "@/dataHelper/room.dataHelper";
import { AxiosResponse } from "axios";

export const roomApi = {
    getRoomList: (partner_id?: number): Promise<AxiosResponse<RoomListItem[]>> => {
        const params = partner_id ? { partner_id } : {};
        return axiosClient.get<RoomListItem[]>("rooms/search", { params });
    },

    getRoomDetail: (id: number): Promise<AxiosResponse<any>> => {
        return axiosClient.get(`rooms/${id}`);
    },

    // Public API: Fetch latest rooms for home page (consistent pattern with newsApi)
    getLatestRooms: (params?: { limit?: number }): Promise<ApiResponse<LatestRoomResponse[]>> =>
        axiosClient.get("home/rooms/getLatest", { params }),
};
