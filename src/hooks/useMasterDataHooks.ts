import { useQuery } from "@tanstack/react-query";
import { masterDataApi } from "@/api/masterDataApi";
import { teamsApi } from "@/api/teamsApi";

const MASTER_DATA_STALE_TIME = 1000 * 60 * 60; // 1 hour

/**
 * Hook to fetch a list of sectors with long-term caching.
 */
export const useSectorsQuery = () => {
  return useQuery({
    queryKey: ["master-data-sectors"],
    queryFn: () => masterDataApi.list("sectors"),
    staleTime: MASTER_DATA_STALE_TIME,
  });
};

/**
 * Hook to fetch a list of locations with long-term caching.
 */
export const useLocationsQuery = () => {
  return useQuery({
    queryKey: ["master-data-locations"],
    queryFn: () => masterDataApi.list("locations"),
    staleTime: MASTER_DATA_STALE_TIME,
  });
};

/**
 * Hook to fetch organizational units with long-term caching.
 */
export const useUnitsQuery = () => {
  return useQuery({
    queryKey: ["org-units"],
    queryFn: () => teamsApi.listUnits(),
    staleTime: MASTER_DATA_STALE_TIME,
  });
};
