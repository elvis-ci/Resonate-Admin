<script setup lang="ts">
import { currencyFormatter, formatWorkspaceType } from "~/utils/formatters";
import type { WorkspaceRow } from "~/composables/useWorkspaces";

definePageMeta({
  title: "Workspaces",
  heading: "Manage workspaces",
  subtext: "Browse and filter workspace units across all locations.",
  ssr: true,
});

const {
  scopedLocations,
  scopedLocationsPending,
  scopedLocationsError,
  refresh,
} = useScopedLocation();
const route = useRoute();
const isAddWorkspaceModalOpen = ref(false);
const isEditWorkspaceModalOpen = ref(false);
const selectedWorkspace = ref<WorkspaceRow | null>(null);
const {
  searchQuery,
  selectedLocation,
  selectedWorkspaceType,
  selectedStatus,
  selectedAvailability,
  workspaceTypes,
  workspaceTypesByLocation,
  bookedWorkspaceIdSet,
  filteredWorkspaces,
  formatNextAvailableTime,
} = useWorkspaces(scopedLocations);

const addWorkspaceLocationId = computed(() => {
  if (selectedLocation.value) return Number(selectedLocation.value);
  return scopedLocations.value?.length === 1
    ? (scopedLocations.value[0]?.id ?? null)
    : null;
});

function editWorkspace(workspace: WorkspaceRow) {
  selectedWorkspace.value = workspace;
  isEditWorkspaceModalOpen.value = true;
}

function handleWorkspaceSaved() {
  isEditWorkspaceModalOpen.value = false;
  selectedWorkspace.value = null;
  refresh();
}

route.meta.headerActions = [
  {
    label: "Add workspace",
    onClick: () => {
      isAddWorkspaceModalOpen.value = true;
    },
    variant: "primary",
  },
];

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

  if (success) {
    await refresh();
  }
}
watch(
  scopedLocations,
  (value) => {
    const first = value?.[0];
    if (value?.length === 1 && first) {
      selectedLocation.value = String(first.id);
    } else {
      selectedLocation.value = "";
    }
  },
  { immediate: true },
);
</script>

<template>
  <section class="space-y-6 pb-4 max-w-screen">
    <article
      class="max-h-screen py-4 overflow-hidden rounded-2xl border border-border bg-alt-bg"
    >
      <div class="border border-border bg-alt-bg p-5">
        <div
          class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"
        >
          <label class="block w-full xl:max-w-md">
            <span class="mb-2 block text-sm font-medium text-heading"
              >Search workspace unit</span
            >
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search by unit name..."
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <div
            class="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:max-w-3xl"
          >
            <label class="space-y-2 text-sm">
              <span class="font-medium text-heading">Location</span>
              <select
                v-model="selectedLocation"
                class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option v-if="(scopedLocations?.length ?? 0) > 1" value="">
                  All locations
                </option>
                <option
                  v-for="location in scopedLocations"
                  :key="location.id"
                  :value="String(location.id)"
                >
                  {{ location.location }}
                </option>
              </select>
            </label>

            <label class="space-y-2 text-sm">
              <span class="font-medium text-heading">Workspace type</span>
              <select
                v-model="selectedWorkspaceType"
                class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All types</option>
                <option
                  v-for="type in workspaceTypes"
                  :key="type"
                  :value="type"
                >
                  {{ formatWorkspaceType(type) }}
                </option>
              </select>
            </label>

            <label class="space-y-2 text-sm">
              <span class="font-medium text-heading">Status</span>
              <select
                v-model="selectedStatus"
                class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All statuses</option>
                <option value="active">active</option>
                <option value="disabled">inactive</option>
              </select>
            </label>

            <label class="space-y-2 text-sm">
              <span class="font-medium text-heading">Availability</span>
              <select
                v-model="selectedAvailability"
                class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All availability</option>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <p v-if="scopedLocationsError" class="p-5 text-sm text-red-700">
        Unable to load workspaces. Please try again.
      </p>

      <div class="max-h-[80vh] overflow-auto pb-4">
        <table class="w-full min-w-[1100px] text-left text-sm">
          <thead
            class="sticky top-0 z-10 border-b border-border bg-border text-xs uppercase tracking-wider text-muted"
          >
            <tr>
              <th scope="col" class="px-5 py-3 font-semibold">Unit</th>
              <th scope="col" class="px-5 py-3 font-semibold">Location</th>
              <th scope="col" class="px-5 py-3 font-semibold">
                Workspace type
              </th>
              <th scope="col" class="px-5 py-3 font-semibold">Capacity</th>
              <th scope="col" class="px-5 py-3 font-semibold">Base price</th>
              <th scope="col" class="px-5 py-3 font-semibold">Booking price</th>
              <th scope="col" class="px-5 py-3 font-semibold">Status</th>
              <th scope="col" class="px-5 py-3 font-semibold">Availability</th>
              <th scope="col" class="px-5 py-3 font-semibold">
                Next available time
              </th>
              <th scope="col" class="px-5 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-if="scopedLocationsPending"
              v-for="index in 5"
              :key="index"
              class=""
            >
              <td v-for="index in 10" :key="index" class="h-15 px-2">
                <div class="h-[50%] bg-muted/20 animate-pulse rounded-sm"></div>
              </td>
            </tr>

            <tr
              v-else-if="filteredWorkspaces.length"
              v-for="workspace in filteredWorkspaces"
              :key="workspace.id"
              class="hover:bg-card-bg2/60 odd:bg-card-bg even:bg-card-bg2/40"
            >
              <td class="px-5 py-4 font-semibold text-heading">
                {{ workspace.name || "Unnamed workspace" }}
              </td>
              <td class="px-5 py-4 text-body">{{ workspace.locationName }}</td>
              <td class="px-5 py-4 text-body">
                {{ formatWorkspaceType(workspace.type) }}
              </td>
              <td class="px-5 py-4 text-body">{{ workspace.capacity || 1 }}</td>
              <td class="px-5 py-4 text-body">
                {{ currencyFormatter.format(workspace.base_price ?? 0) }}
              </td>
              <td class="px-5 py-4 text-body">
                {{ currencyFormatter.format(workspace.booking_price ?? 0) }}
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
                  {{ workspace.status === "inactive" ? "Inactive" : "Active" }}
                </span>
              </td>
              <td class="px-5 py-4">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-semibold"
                  :class="
                    bookedWorkspaceIdSet.has(workspace.id)
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-sky-100 text-sky-700'
                  "
                >
                  {{
                    bookedWorkspaceIdSet.has(workspace.id)
                      ? "Booked"
                      : "Available"
                  }}
                </span>
              </td>
              <td class="px-5 py-4 text-body">
                {{ formatNextAvailableTime(workspace.id) }}
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    class="secondary rounded-lg px-3 py-2"
                    @click="editWorkspace(workspace)"
                  >
                    Edit
                  </button>
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
                </div>
              </td>
            </tr>
            <tr v-else class="">
              <td class="h-15 px-2">
                <div class="p-10 text-center text-sm text-muted">
                  No workspace units match the current filters.
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <AddWorkspaceModal
      v-model="isAddWorkspaceModalOpen"
      :location-id="addWorkspaceLocationId"
      :locations="scopedLocations ?? []"
      :workspace-types-by-location="workspaceTypesByLocation"
      :all-workspace-types="workspaceTypes"
      :selected-workspace-type="selectedWorkspaceType || null"
      @added="refresh"
    />

    <EditWorkspaceModal
      v-model="isEditWorkspaceModalOpen"
      :workspace="selectedWorkspace"
      :workspace-types="workspaceTypes"
      @saved="handleWorkspaceSaved"
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
