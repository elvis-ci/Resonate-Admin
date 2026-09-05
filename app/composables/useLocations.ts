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

export function useLocations() {
  const supabase = useSupabaseClient<Database>();

  const {
    data: locations,
    pending,
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

export type LocationWorkspace = {
  id: string;
  type: string;
  name: string | null;
  status: string | null;
  capacity: number | null;
};

export type LocationDetail = {
  id: number;
  slug: string;
  location: string;
  city: string;
  workspaces: LocationWorkspace[];
};

export function usePageLocation(slug: MaybeRefOrGetter<string>) {
  const supabase = useSupabaseClient<Database>();

  const {
    data: location,
    pending: isLocationPending,
    error: locationError,
    refresh: refreshLocation,
  } = useAsyncData(
    () => `location-detail-${toValue(slug)}`,
    async () => {
      const locationSlug = toValue(slug);
      if (!locationSlug) return null;

      const { data, error } = await supabase
        .from("locations")
        .select(
          `
          id,
          slug,
          location,
          city,
          workspaces ( id, type, name, status, capacity )
        `,
        )
        .eq("slug", locationSlug)
        .single();

      if (error) throw error;
      return data as LocationDetail;
    },
    { watch: [() => toValue(slug)] },
  );

  return { location, isLocationPending, locationError, refreshLocation };
}

export function getLocationDetail(slug: MaybeRefOrGetter<string>) {
  const supabase = useSupabaseClient<Database>();

  const {
    data: location,
    pending: isLocationPending,
    error: locationError,
  } = useAsyncData(
    () => `location-detail-${toValue(slug)}`,
    async () => {
        const locationSlug = toValue(slug);

      if (!locationSlug) return null;

      const { data, error } = await supabase
        .from("locations")
        .select(
          `
          id,
          slug,
          location,
          city,
          price_multiplier,
          open_time,
          close_time
        `,
        )
        .eq("slug", locationSlug)
        .single();

      if (error) throw error;

      return data;
    },
    { watch: [() => toValue(slug)] },
  );

  return { location, isLocationPending, locationError };
}
