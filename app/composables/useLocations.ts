import type { Database } from "~/types/database";

export type LocationSummary = {
  id: number;
  slug: string;
  location: string;
  city: string;
  types: number;
  totalUnits: number;
};

export function useLocations() {
  const supabase = useSupabaseClient<Database>();

  const {
    data: locations,
    pending,
    error: locationsError,
    refresh,
  } = useLazyAsyncData(async () => {
    const { data, error } = await supabase.from("locations").select(`
      id,
      slug,
      location,
      city,
      workspaces (
        id,
        type,
        name,
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

  return { locations, pending, locationSummary, locationsError, refresh };
}
