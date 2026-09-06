<script setup lang="ts">
import type { Database } from "~/types/database";

definePageMeta({
  layout: "location",
  title: "Location details",
  heading: "Location details",
  subtext: "Manage workspace types and their units.",
  ssr: false,
  middleware: "require-permission",
  requiredPermission: "manage_locations",
});
const route = useRoute();
const isAddWorkspaceModalOpen = ref(false);
const supabase = useSupabaseClient<Database>();
route.meta.headerActions = [
  {
    label: "Back to locations",
    onClick: () => navigateTo("/locations"),
    variant: "secondary",
  },
  {
    label: "Add workspace",
    onClick: () => (isAddWorkspaceModalOpen.value = true),
    variant: "primary",
  },
];

const locationSlug = computed(() => String(route.params.locationSlug ?? ""));

const { location, isLocationPending, refreshLocation } =
  usePageLocation(locationSlug);

const locationId = computed(() => location.value?.id ?? null);

// workspaces now come straight from the merged fetch — no separate
// query, no dependency chain, no window for a stale "empty" state to
// flash between the two.

const workspaceTypes = computed(() =>
  [
    ...new Set(
      (location.value?.workspaces ?? []).map((workspace) => workspace.type),
    ),
  ].filter(Boolean),
);

function formatWorkspaceType(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const selectedWorkspaces = computed(() =>
  (location.value?.workspaces ?? []).filter(
    (workspace) => workspace.type === selectedWorkspaceType.value,
  ),
);

// User's explicit click overrides the default; null means "no override yet"
const explicitWorkspaceType = ref<string | null>(null);

//sets selected workspace type to the first available type if no explicit selection has been made
const selectedWorkspaceType = computed(() => {
  if (
    explicitWorkspaceType.value &&
    workspaceTypes.value.includes(explicitWorkspaceType.value)
  ) {
    return explicitWorkspaceType.value;
  }
  return workspaceTypes.value[0] ?? "";
});

watch(
  location,
  (value) => {
    route.meta.heading = value?.location || "Loading Location...";
  },
  { immediate: true },
);

async function deactivateWorkspace(workspaceId: string) {
  const { error } = await supabase
    .from("workspaces")
    .update({ status: "inactive" })
    .eq("id", workspaceId);

    if (error) {
      console.error("Error disabling workspace:", error.message);
    } else {
      refreshLocation();
      return
    }
}

async function activateWorkspace(workspaceId: string) {
  const { error } = await supabase
    .from("workspaces")
    .update({ status: "active" })
    .eq("id", workspaceId);

  if (error) {
    console.error("Error activating workspace:", error.message);
  } else {
    refreshLocation();
  }
}

function toggleWorkspace(workspace) {
  if (workspace.status === "inactive") {
    activateWorkspace(workspace.id);
  } else {
    deactivateWorkspace(workspace.id);
  }
}
</script>

<template>
  <section class="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
    <aside class="rounded-2xl border border-border bg-card-bg p-3">
      <p
        class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted"
      >
        Workspace types
      </p>
      <div v-if="isLocationPending" class="space-y-2 p-2">
        <div
          v-for="index in 3"
          :key="index"
          class="h-10 animate-pulse rounded-lg bg-muted/10"
        />
      </div>
      <nav v-else class="space-y-1" aria-label="Workspace types">
        <button
          v-for="type in workspaceTypes"
          :key="type"
          type="button"
          class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors"
          :class="
            selectedWorkspaceType === type
              ? 'bg-primary/10 font-semibold text-primary'
              : 'hover:bg-primary/5'
          "
          @click="explicitWorkspaceType = type"
        >
          <span class="truncate">{{ formatWorkspaceType(type) }}</span>
          <span class="ml-2 rounded-full bg-bg px-2 py-0.5 text-xs text-muted">
            {{
              (location?.workspaces ?? []).filter(
                (workspace) => workspace.type === type,
              ).length
            }}
          </span>
        </button>
        <p v-if="!workspaceTypes.length" class="px-3 py-4 text-sm text-muted">
          No workspace types yet.
        </p>
      </nav>
    </aside>

    <section class="rounded-2xl border border-border bg-alt-bg p-5">
      <div class="mb-5 flex items-center justify-between gap-3">
        <div>
          <p class="text-sm text-muted">Workspace type</p>
          <h2 class="text-lg font-bold text-heading">
            {{ formatWorkspaceType(selectedWorkspaceType) || "Units" }}
          </h2>
        </div>
        <span
          v-if="selectedWorkspaceType"
          class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
        >
          {{ selectedWorkspaces.length }} units
        </span>
      </div>
      <div class="">
        <div
          v-if="isLocationPending"
          class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          <div
            v-for="index in 6"
            :key="index"
            class="h-32 animate-pulse rounded-xl bg-muted/10"
          />
        </div>
        <div
          v-else-if="selectedWorkspaces.length"
          class="max-h-[calc(100vh-200px)] overflow-auto rounded-xl border border-border bg-bg"
        >
          <table class="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr>
                <th
                  scope="col"
                  class="sticky top-0 z-10 bg-alt-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  ID
                </th>

                <th
                  scope="col"
                  class="sticky top-0 z-10 bg-alt-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  Unit
                </th>

                <th
                  scope="col"
                  class="sticky top-0 z-10 bg-alt-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  Capacity
                </th>

                <th
                  scope="col"
                  class="sticky top-0 z-10 bg-alt-bg px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  Status
                </th>

                <th
                  scope="col"
                  class="sticky top-0 z-10 bg-alt-bg px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-border">
              <tr v-for="workspace in selectedWorkspaces" :key="workspace.id">
                <td class="px-4 py-3 font-semibold text-heading">
                  {{ workspace.id }}
                </td>
                <td class="px-4 py-3 font-semibold text-heading">
                  {{ workspace.name || "Unnamed workspace" }}
                </td>

                <td class="px-4 py-3 text-body">
                  {{ workspace.capacity || 1 }}
                </td>

                <td class="px-4 py-3">
                  <span
                    class="rounded-full px-2 py-1 text-xs font-semibold"
                    :class="
                      workspace.status === 'inactive'
                        ? ' bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                    "
                  >
                    {{
                      workspace.status === "inactive" ? "Inactive" : "Active"
                    }}
                  </span>
                </td>

                <td class="px-4 py-3 text-right">
                  <button
                    @click="toggleWorkspace(workspace)"
                    type="button"
                    class="border rounded-lg p-2"
                    :class="
                      workspace.status === 'inactive'
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-300'
                        : 'border-error text-error-text bg-red-200 hover:bg-red-300'
                    "
                  >
                    {{ workspace.status === "inactive" ? "Activate" : "Deactivate" }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-else
          class="rounded-xl border border-dashed border-border bg-bg p-8 text-center text-sm text-muted"
        >
          Select a workspace type to view its units.
        </div>
      </div>
    </section>

    <AddWorkspaceModal
      v-model="isAddWorkspaceModalOpen"
      :location-id="locationId"
      @added="refreshLocation"
    />
  </section>
</template>
