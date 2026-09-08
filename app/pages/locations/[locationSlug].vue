<script setup lang="ts">
import type { Database } from "~/types/database";
import { normalizeSupabaseError } from "~/utils/errors.ts";
import { formatWorkspaceType } from "~/utils/formatWorkspaceType.ts";

const route = useRoute();

definePageMeta({
  layout: "location",
  title: "Location details",
  heading: "Location details",
  subtext: "Manage workspace types and their units.",
  ssr: false,
  middleware: "require-permission",
  requiredPermission: "manage_locations",
});

//sets dynamic header action button for this page
route.meta.headerActions = [
  {
    label: "Back to locations",
    onClick: () => navigateTo("/locations"),
    variant: "secondary",
  },
];

const isAddWorkspaceModalOpen = ref(false); //modal opening control
const locationSlug = computed(() => String(route.params.locationSlug ?? "")); //gets the locatio slug from the route

const { location, isLocationPending, refreshLocation } =
  usePageLocation(locationSlug);

const locationId = computed(() => location.value?.id ?? null);

// maps all workspaces to a workspace type
const workspaceTypes = computed(() =>
  [
    ...new Set(
      (location.value?.workspaces ?? []).map((workspace) => workspace.type),
    ),
  ].filter(Boolean),
);

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

const {
  isConfirmModalOpen,
  isTogglingWorkspace,
  updateError,
  isCurrentWorkspaceInactive,
  confirmModalTitle,
  confirmModalMessage,
  toggleStatusUpdate,
  confirmStatusUpdate,
} = useWorkspaceStatusConfirmation();

async function handleStatusUpdate() {
  const success = await confirmStatusUpdate();

  if(success) {await refreshLocation()}
}
</script>

<template>
  <section
    class="flex flex-col lg:grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]"
  >
    <aside class="rounded-2xl border border-border bg-card-bg p-3">
      <p
        class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-heading"
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
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
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
      </div>
      <div class="">
        <div
          class="max-h-[calc(100vh-200px)] overflow-auto rounded-xl border border-border"
        >
          <table class="w-full min-w-[620px] text-left text-sm">
            <thead class="sticky top-0 bg-border">
              <tr>
                <th
                  scope="col"
                  class="sticky -top-1 z-10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  ID
                </th>

                <th
                  scope="col"
                  class="sticky -top-1 z-10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  Unit
                </th>

                <th
                  scope="col"
                  class="sticky -top-1 z-10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  Capacity
                </th>

                <th
                  scope="col"
                  class="sticky -top-1 z-10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  Status
                </th>

                <th
                  scope="col"
                  class="sticky -top-1 z-10 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-border">
              <tr
                v-if="isLocationPending"
                v-for="index in 5"
                :key="index"
                class=""
              >
                <td v-for="index in 5" :key="index" class="h-15 px-2">
                  <div
                    class="h-[50%] bg-muted/20 animate-pulse rounded-sm"
                  ></div>
                </td>
              </tr>

              <tr
                v-else-if="selectedWorkspaces.length"
                v-for="workspace in selectedWorkspaces"
                :key="workspace.id"
              >
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
                    @click="toggleStatusUpdate(workspace)"
                    type="button"
                    class="border rounded-lg p-2"
                    :class="
                      workspace.status === 'inactive'
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-300'
                        : 'border-error text-error-text bg-red-200 hover:bg-red-300'
                    "
                  >
                    {{
                      workspace.status === "inactive"
                        ? "Activate"
                        : "Deactivate"
                    }}
                  </button>
                </td>
              </tr>
              <tr
                v-else
                class="rounded-xl border border-dashed border-border bg-bg p-8 text-center text-sm text-muted"
              >
                Select a workspace type to view its units.
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <AddWorkspaceModal
      v-model="isAddWorkspaceModalOpen"
      :location-id="locationId"
      :selectedWorkspaceType="selectedWorkspaceType"
      @added="refreshLocation"
    />

    <ConfirmModal
      v-model="isConfirmModalOpen"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      :confirm-label="isCurrentWorkspaceInactive ? 'Activate' : 'Deactivate'"
      :danger="!isCurrentWorkspaceInactive"
      :is-processing="isTogglingWorkspace"
      :error="updateError"
      @confirm="handleStatusUpdate"
    />
  </section>
</template>
