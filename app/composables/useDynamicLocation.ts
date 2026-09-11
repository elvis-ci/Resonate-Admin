import type { Database } from "~/types/database";

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

export function useDymanicLocationInfo(slug: MaybeRefOrGetter<string>) {
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
