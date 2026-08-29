import type { Database } from "~/types/database";
type LocationSummary = {
  location: string;
  types: number;
  totalUnits: number;
};

export function useLocations() {
  const supabase = useSupabaseClient<Database>();

  //fetch locations data
  const {
    data: locations,
    pending,
    error: locationsError,
  } = useLazyAsyncData(async () => {
    const { data, error } = await supabase.from("locations").select(`
    id,
    location,
    workspaces (
      id,
      type,
      name,
      location_id
    )
  `);
    if (error) throw error;
    return data;
  });

  //summarize locations dtata for each location
  const locationSummary = computed<LocationSummary[]>(() =>
    (locations.value ?? []).map((location) => ({
      location: location.location,
      types: new Set(location.workspaces.map((workspace) => workspace.type))
        .size,
      totalUnits: location.workspaces.length,
    })),
  );

  return {locations, pending, locationSummary, locationsError}
}
