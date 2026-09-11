//source of truth for admin level and location_id. This is used to determine what data the authenticated admin can see. It is fetched from the database on page load and cached in a shared async data store.

import type { Database } from "~/types/database";
export type AdminProfile = {
  full_name: string | null;
  role: string;
  location_id: number | null;
};

export function useAdminProfile() {
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const { data: profile, pending: profilePending } =
    useLazyAsyncData<AdminProfile | null>(
      "current-profile",
      async () => {
        if (!user.value?.sub) return null;
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, role, location_id")
          .eq("id", user.value.sub)
          .single();
        if (error) throw error;
        return data;
      },
      { watch: [user], immediate: true },
    );

  const isSuperAdmin = computed(() => profile.value?.role === "super_admin");

  const { data: adminLocationName } = useLazyAsyncData<string | null>(
    "current-admin-location-name",
    async () => {
      if (!profile.value?.location_id) return null;
      const { data } = await supabase
        .from("locations")
        .select("location")
        .eq("id", profile.value.location_id)
        .single();
      return data?.location ?? null;
    },
    { watch: [profile] },
  );

  const scopeLabel = computed(() => {
    if (isSuperAdmin.value) return "All locations";
    if (adminLocationName.value) return adminLocationName.value;
    return null;
  });

  return { profile, profilePending, isSuperAdmin, adminLocationName, scopeLabel };
}
