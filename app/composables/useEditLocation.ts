import type { Database } from "~/types/database";

export function useEditLocation(slug: MaybeRefOrGetter<string>) {
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
