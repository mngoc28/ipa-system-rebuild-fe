import { Partner, PartnerDetail } from "@/dataHelper/EU/partner.dataHelper";
import { ApiResponse } from "@/api/types";
import axiosClient from "../axiosClient";
import { PublicPartnerResponse } from "@/dataHelper/partner.dataHelper";

export const partnerApi = {
    // Fetch partners by province ID
    getPartnersByProvince: (province_id: number): Promise<{ data: Partner[] }> =>
        axiosClient.get(`partners/${province_id}`),

    // Fetch partner details along with their rooms
    getPartnerInfo: (partner_id: number): Promise<{ data: PartnerDetail }> =>
        axiosClient.get(`partners/detail/${partner_id}`),

    // Public API: Fetch random partners for home page (consistent pattern with newsApi)
    getRandomPartners: (params?: { limit?: number }): Promise<ApiResponse<PublicPartnerResponse[]>> =>
        axiosClient.get("home/partners/random", { params }),
};
