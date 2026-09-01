<script setup lang="ts">
import requirePermission from "~/middleware/require-permission";
import type { Database } from "~/types/database";
const route = useRoute();

definePageMeta({
  layout: "default",
  title: "Location details",
  heading: "Location details", // static — cannot reference `slug` here
  subtext: "Manage workspaces for this location.",
  ssr: false,
  middleware: "require-permission", // string, matching the filename
  requiredPermission: "manage_locations",
});

const slug = route.params.locationSlug as string;

if (slug) {
  route.meta.heading = `Location: ${slug}`;
  route.meta.subtext = `Manage workspaces at ${slug}`;
}

const isAddWorkspaceModalOpen = ref(false); //sets add workspace modal to closed

//specifies header button for this page
route.meta.headerActions = [
  {
    label: "Back to Locations",
    onClick: () => {
      navigateTo('/locations')
    },
    variant: "secondary",
  },
    {
    label: "Add Workspace",
    onClick: () => {
      isAddWorkspaceModalOpen.value = true;
    },
    variant: "primary",
  },
];

const supabase = useSupabaseClient<Database>();
const locationId = ref<number | null>(null);

const { data: location } = useLazyAsyncData(async () => {
  const { data, error } = await supabase
    .from("locations")
    .select("id, location")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data;
});

watch(
  location,
  (value) => {
    locationId.value = value?.id ?? null;
  },
  { immediate: true },
);

const {
  data: workspaces,
  pending: workspacesPending,
  refresh: refreshWorkspaces,
} = useLazyAsyncData(
  async () => {
    if (locationId.value == null) return [];

    const { data, error } = await supabase
      .from("workspaces")
      .select("id, name, type, capacity, status, location_id")
      .eq("location_id", locationId.value)
      .order("name");

    if (error) throw error;
    return data ?? [];
  },
  { watch: [locationId] },
);

const activeWorkspaceCount = computed(
  () =>
    (workspaces.value ?? []).filter(
      (workspace) => (workspace.status ?? "active") !== "disabled",
    ).length,
);

const formatWorkspaceStatus = (status: string | null) =>
  status === "disabled" ? "Disabled" : "Active";

async function toggleWorkspace(workspace: {
  id: string;
  status: string | null;
}) {
  const nextStatus =
    (workspace.status ?? "active") === "disabled" ? "active" : "disabled";

  const { error } = await supabase
    .from("workspaces")
    .update({ status: nextStatus })
    .eq("id", workspace.id);

  if (error) {
    console.error("Failed to update workspace status", error);
    return;
  }

  await refreshWorkspaces();
}
</script>

<template>
  <section class="space-y-6">
    <article class="rounded-2xl border border-border bg-alt-bg p-5">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 class="font-semibold">Workspaces at this location</h3>
          <p class="text-sm text-muted">
            {{ (workspaces ?? []).length }} total •
            {{ activeWorkspaceCount }} active
          </p>
        </div>
      </div>

      <div v-if="workspacesPending" class="space-y-3">
        <div class="h-14 animate-pulse rounded-xl bg-muted/10"></div>
        <div class="h-14 animate-pulse rounded-xl bg-muted/10"></div>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="workspace in workspaces"
          :key="workspace.id"
          class="flex flex-col gap-3 rounded-xl border border-border bg-bg p-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h4 class="font-semibold text-heading">
              {{ workspace.name || "Unnamed workspace" }}
            </h4>
            <p class="text-sm text-muted">
              {{ workspace.type }} • Capacity {{ workspace.capacity || 1 }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <span
              :class="
                (workspace.status ?? 'active') === 'disabled'
                  ? 'rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700'
                  : 'rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700'
              "
            >
              {{ formatWorkspaceStatus(workspace.status) }}
            </span>

            <button
              type="button"
              class="secondary"
              @click="toggleWorkspace(workspace)"
            >
              {{
                (workspace.status ?? "active") === "disabled"
                  ? "Enable"
                  : "Disable"
              }}
            </button>
          </div>
        </div>

        <div
          v-if="!workspaces?.length"
          class="rounded-xl border border-dashed border-border bg-bg p-6 text-center text-sm text-muted"
        >
          No workspaces added yet for this location.
        </div>
      </div>
    </article>

    <AddWorkspaceModal
      v-model="isAddWorkspaceModalOpen"
      :location-id="locationId"
      @added="refreshWorkspaces"
    />
  </section>
</template>
