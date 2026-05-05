import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppInitData } from "@/dataHelper/auth.dataHelper";
import type { ApiEnvelope } from "@/types/api";
import { MasterDataItem, masterDataApi } from "@/api/masterDataApi";
import { teamsApi, OrgUnitItem } from "@/api/teamsApi";

const MASTER_DATA_STALE_TIME = 1000 * 60 * 60; // 1 hour

/**
 * Helper to retrieve master data from the app-init cache.
 */
const useInitCache = () => {
  const queryClient = useQueryClient();
  const initResponse = queryClient.getQueryData<ApiEnvelope<AppInitData>>(["app-init"]);
  return initResponse;
};

/**
 * Hook to fetch a list of sectors, preferring the app-init cache.
 */
export const useSectorsQuery = (enabled = true) => {
  const cache = useInitCache();
  return useQuery({
    queryKey: ["master-data-sectors"],
    queryFn: async () => {
      const response = await masterDataApi.list("sectors");
      return response.items;
    },
    initialData: cache?.masterData?.sectors as unknown as MasterDataItem[] | undefined,
    enabled,
    staleTime: MASTER_DATA_STALE_TIME,
  });
};

/**
 * Hook to fetch a list of locations, preferring the app-init cache.
 */
export const useLocationsQuery = (enabled = true) => {
  const cache = useInitCache();
  return useQuery({
    queryKey: ["master-data-locations"],
    queryFn: async () => {
      const response = await masterDataApi.list("locations");
      return response.items;
    },
    initialData: cache?.masterData?.locations as unknown as MasterDataItem[] | undefined,
    enabled,
    staleTime: MASTER_DATA_STALE_TIME,
  });
};

/**
 * Hook to fetch organizational units, preferring the app-init cache.
 */
export const useUnitsQuery = (enabled = true) => {
  const cache = useInitCache();
  return useQuery({
    queryKey: ["org-units"],
    queryFn: async () => {
      const response = await teamsApi.listUnits();
      return response.items;
    },
    initialData: cache?.masterData?.units as unknown as OrgUnitItem[] | undefined,
    enabled,
    staleTime: MASTER_DATA_STALE_TIME,
  });
};

/**
 * Hook to fetch a list of countries, preferring the app-init cache.
 */
export const useCountriesQuery = (enabled = true) => {
  const cache = useInitCache();
  return useQuery({
    queryKey: ["master-data-countries"],
    queryFn: async () => {
      const response = await masterDataApi.list("countries");
      return response.items;
    },
    initialData: cache?.masterData?.countries,
    enabled,
    staleTime: MASTER_DATA_STALE_TIME,
  });
};
