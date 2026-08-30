import type { Database } from "~/types/database";

type LocationSummary = {
  id: number;
  slug: string;
  location: string;
  types: number;
  totalUnits: number;
};

export function useLocations() {
  const supabase = useSupabaseClient<Database>();

  const {
    data: locations,
    pending,
    error: locationsError,
  } = useLazyAsyncData(async () => {
    const { data, error } = await supabase.from("locations").select(`
      id,
      slug,
      location,
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
      slug:location.slug,
      location: location.location,
      types: new Set(location.workspaces.map((workspace) => workspace.type))
        .size,
      totalUnits: location.workspaces.length,
    })),
  );

  return { locations, pending, locationSummary, locationsError };
}
