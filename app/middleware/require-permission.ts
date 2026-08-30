import type { Database } from "~/types/database";

export default defineNuxtRouteMiddleware(async (to) => {
  const requiredPermission = to.meta.requiredPermission as string | undefined;
  if (!requiredPermission) return;

  const supabase = useSupabaseClient<Database>();

  const { data: permissions } = await useAsyncData<string[]>(
    "my-permissions",
    async () => {
      const { data, error } = await supabase.rpc("my_permissions");
      if (error) throw error;
      return data ?? [];
    },
  );

  if (!permissions.value?.includes(requiredPermission)) {
    return navigateTo("/");
  }
});