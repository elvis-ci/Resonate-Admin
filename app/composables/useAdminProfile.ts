//source of truth for admin level and location_id. This is used to determine what data the authenticated admin can see. It is fetched from the database on page load and cached in a shared async data store. 

import type { Database } from "~/types/database";
export type AdminProfile = {
  role: string;
  location_id: number | null;
};

export function useAdminProfile() {
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const { data: profile, pending } = useLazyAsyncData<AdminProfile | null>(
    "current-profile",
    async () => {
      if (!user.value?.sub) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("role, location_id")
        .eq("id", user.value.sub)
        .single();
      if (error) throw error;
      return data;
    },
    {watch: [user], immediate: true}
  );

  const isSuperAdmin = computed(() => profile.value?.role === "super_admin");
  return { profile, pending, isSuperAdmin };
}
