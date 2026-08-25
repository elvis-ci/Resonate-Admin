// Single source of truth for "what can the current user do", backed by the
// my_permissions() RPC (which reads role_permissions server-side). The key
// "my-permissions" makes this a shared fetch — every component calling
// usePermissions() gets the same underlying request/result instead of each one independently hitting the database.
import type { Database } from "~/types/database";

export function usePermissions() {
  const supabase = useSupabaseClient<Database>();

  const { data: permissions, pending } = useLazyAsyncData<string[]>(
    "my-permissions",
    async () => {
      const { data, error } = await supabase.rpc("my_permissions");
      if (error) throw error;
      return data ?? [];
    },
  );

  function can(permissionKey: string): boolean {
    return permissions.value?.includes(permissionKey) ?? false;
  }

  return { can, permissions, pending };
}