/**
 * Represents a room in the end-user room listing
 * This interface matches the API response structure for room list items
 */
export interface RoomListItem {
  id: number;
  title: string;
  room_number: string;
  building_address: string;
  building_name: string;
  province_name: string;
  ward_name: string;
  room_type: number;
  area: string;
  floor_number: number;
  people: number;
  deposit: number;
  cheapest_daily_price: string;
  cheapest_monthly_price: string | null;
  room_image: string;
  amenities: string[];
}

export type SortOption = "price-high" | "price-low" | "newest" | "";
export type RentalType = "daily" | "monthly";
