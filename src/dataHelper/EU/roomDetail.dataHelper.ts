import { LucideIcon } from "lucide-react";

// Amenity data structure from API/database
export interface RoomAmenity {
  id: number;
  name: string;
  icon?: string;
}

// Service data structure from API/database
export interface RoomService {
  id: number;
  name: string;
  description: string;
  priceAmount?: number;
  priceUnit?: string;
}

// Partner/company data structure from API/database
export interface PartnerInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
  email?: string;
  workingHours?: string;
  images?: string[];
}

// Complete room detail data structure from API/database
export interface RoomDetail {
  id: number;
  title: string;
  description: string;
  area: string;
  people: number;
  room_type: number;
  floor_number?: number;
  room_number?: string;
  province_name: string;
  province_name_en: string;
  ward_name: string;
  building_address: string;
  cheapest_daily_price?: string;
  cheapest_monthly_price?: string;
  cheapest_hourly_price?: string;
  rating?: number;
  reviews?: number;
  mainImage: string;
  images: string[];
  amenities: RoomAmenity[];
  services: RoomService[];
  partner?: PartnerInfo;
}

// API response for room detail
export interface RoomDetailResponse {
  status: string;
  message: string;
  data: RoomDetail;
}

export interface PartnerInformationProps {
  partnerName: string;
  address: string;
  phone: string;
  email?: string;
  workingHours?: string;
  images?: string[];
}

export interface RoomDetailAmenity {
  id: number;
  name: string;
  icon: LucideIcon;
}

export interface RoomAmenitiesProps {
  amenities: RoomDetailAmenity[];
}

export interface RoomHeroProps {
  title: string;
  mainImage: string;
  address: string;
  wardName: string;
  provinceName: string;
  roomId?: number;
  onBooking?: () => void;
}

export interface RoomImageGalleryProps {
  images: string[];
  onViewAll: () => void;
}

export interface RoomInformationProps {
  description: string;
  area: string;
  capacity: number;
  roomType: number;
}

export interface RoomPricingProps {
  dailyPrice: string;
  monthlyPrice: string;
  hourlyPrice: string;
  onBookNow?: () => void;
  onContactOwner?: () => void;
}

export interface RoomPricingSectionProps {
  dailyPrice?: string;
  monthlyPrice?: string;
  onBookNow?: () => void;
}

export interface RoomDetailService {
  id: number;
  name: string;
  description: string;
  priceAmount?: number;
  priceUnit?: string;
}

export interface RoomServicesProps {
  services: RoomDetailService[];
}

export interface SimilarRoom {
  id: number;
  title: string;
  image: string;
  price: string;
  area: string;
  province_name: string;
  ward_name: string;
}

export interface SimilarRoomsProps {
  sameWardRooms: SimilarRoom[];
  sameProvinceRooms: SimilarRoom[];
  currentWard: string;
  currentProvince: string;
}