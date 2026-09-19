import type { Database } from "~/types/database";
import { toValue, type MaybeRefOrGetter } from "vue";

export type LocationSummary = {
  id: number;
  slug: string;
  location: string;
  city: string;
  types: number;
  totalUnits: number;
};

export function useLocationsInfo() {
  const supabase = useSupabaseClient<Database>();

  const {
    data: locations,
    pending: locationPending,
    error: locationsError,
    refresh,
  } = useLazyAsyncData("all-locations-with-workspaces", async () => {
    const { data, error } = await supabase.from("locations").select(`
      id,
      slug,
      location,
      city,
      workspaces (
        id,
        type,
        name,
        capacity,
        base_price,
        booking_price,
        location_id,
        status
      )
    `);

    if (error) throw error;
    return data;
  });

  const locationSummary = computed<LocationSummary[]>(() =>
    (locations.value ?? []).map((location) => ({
      id: location.id,
      slug: location.slug,
      location: location.location,
      city: location.city,
      types: new Set(location.workspaces.map((workspace) => workspace.type))
        .size,
      totalUnits: location.workspaces.length,
    })),
  );

  return {
    locations,
    locationPending,
    locationSummary,
    locationsError,
    refresh,
  };
}

export function useScopedLocation() {
  const user = useSupabaseUser();
  const supabase = useSupabaseClient<Database>();

  const {
    data: scopedLocations,
    pending: scopedLocationsPending,
    error: scopedLocationsError,
    refresh,
  } = useLazyAsyncData(
    "scoped-location",
    async () => {
      const { data, error } = await supabase.from("locations").select(`
          id,
          slug,
          location,
          city,
          workspaces (
        id,
        type,
        name,
        capacity,
        base_price,
        booking_price,
        location_id,
        status
      )
        `);

      if (error) throw error;

      return data;
    },
    { watch: [user], immediate: true },
  );

  return {
    scopedLocations,
    scopedLocationsPending,
    scopedLocationsError,
    refresh,
  };
}