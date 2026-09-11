<script setup lang="ts">
import type { Database } from "~/types/database";
import { formatWorkspaceType } from "~/utils/formatWorkspaceType.ts";

definePageMeta({
  title: "Workspaces",
  heading: "Manage workspaces",
  subtext: "Browse and filter workspace units across all locations.",
});

const { locations, pending, locationsError, refresh } = useLocations();
const supabase = useSupabaseClient<Database>();
const searchQuery = ref("");
const selectedLocation = ref("");
const selectedWorkspaceType = ref("");
const selectedStatus = ref("");
const selectedAvailability = ref("");

const availabilityCheckedAt = new Date();
const { data: workspaceBookings, pending: availabilityPending } =
  useLazyAsyncData("workspace-availability", async () => {
    const { data, error } = await supabase
      .from("workspace_bookings")
      .select("workspace_id, start_at, end_at")
      .eq("status", "confirmed")
      .gte("end_at", availabilityCheckedAt.toISOString())
      .order("start_at");

    if (error) throw error;
    return data ?? [];
  });

const bookedWorkspaceIdSet = computed(() => {
  const now = availabilityCheckedAt.getTime();
  return new Set(
    (workspaceBookings.value ?? [])
      .filter((booking) => {
        const start = booking.start_at
          ? new Date(booking.start_at).getTime()
          : Number.POSITIVE_INFINITY;
        const end = booking.end_at
          ? new Date(booking.end_at).getTime()
          : Number.NEGATIVE_INFINITY;
        return start <= now && end > now;
      })
      .map((booking) => booking.workspace_id),
  );
});

const nextAvailableTimeByWorkspace = computed(() => {
  const now = availabilityCheckedAt.getTime();
  const nextAvailableTimes = new Map<string, number>();
  const bookingsByWorkspace = new Map<
    string,
    { start: number; end: number }[]
  >();

  for (const booking of workspaceBookings.value ?? []) {
    if (!booking.start_at || !booking.end_at) continue;
    const start = new Date(booking.start_at).getTime();
    const end = new Date(booking.end_at).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) continue;
    const bookings = bookingsByWorkspace.get(booking.workspace_id) ?? [];
    bookings.push({ start, end });
    bookingsByWorkspace.set(booking.workspace_id, bookings);
  }

  for (const [workspaceId, bookings] of bookingsByWorkspace) {
    let nextAvailableAt = now;
    for (const booking of bookings) {
      if (booking.end <= nextAvailableAt) continue;
      if (booking.start > nextAvailableAt) break;
      nextAvailableAt = booking.end;
    }
    nextAvailableTimes.set(workspaceId, nextAvailableAt);
  }

  return nextAvailableTimes;
});

const nextAvailableTimeFormatter = new Intl.DateTimeFormat("en-NG", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatNextAvailableTime(workspaceId: string) {
  const nextAvailableAt = nextAvailableTimeByWorkspace.value.get(workspaceId);
  if (!nextAvailableAt || nextAvailableAt <= availabilityCheckedAt.getTime())
    return "Available now";
  return nextAvailableTimeFormatter.format(new Date(nextAvailableAt));
}

const workspaceRows = computed(() =>
  (locations.value ?? []).flatMap((location) =>
    (location.workspaces ?? []).map((workspace) => ({
      ...workspace,
      locationId: location.id,
      locationName: location.location,
    })),
  ),
);

const workspaceTypes = computed(() =>
  [...new Set(workspaceRows.value.map((workspace) => workspace.type))].sort(),
);

const filteredWorkspaces = computed(() => {
  const search = searchQuery.value.trim().toLowerCase();

  return workspaceRows.value.filter((workspace) => {
    const status = workspace.status ?? "active";
    const matchesSearch =
      !search || (workspace.name ?? "").toLowerCase().includes(search);
    const matchesLocation =
      !selectedLocation.value ||
      String(workspace.locationId) === selectedLocation.value;
    const matchesType =
      !selectedWorkspaceType.value ||
      workspace.type === selectedWorkspaceType.value;
    const matchesStatus =
      !selectedStatus.value || status === selectedStatus.value;
    const availability = bookedWorkspaceIdSet.value.has(workspace.id)
      ? "booked"
      : "available";
    const matchesAvailability =
      !selectedAvailability.value ||
      availability === selectedAvailability.value;

    return (
      matchesSearch &&
      matchesLocation &&
      matchesType &&
      matchesStatus &&
      matchesAvailability
    );
  });
});

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

  if(success) {await refresh()}
}


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
                <option value="">All locations</option>
                <option
                  v-for="location in locations"
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

      <div v-if="pending || availabilityPending" class="space-y-3 p-5">
        <div
          v-for="index in 5"
          :key="index"
          class="h-12 animate-pulse rounded-xl bg-muted/10"
        />
      </div>
      <p v-else-if="locationsError" class="p-5 text-sm text-red-700">
        Unable to load workspaces. Please try again.
      </p>

      <div
        v-else-if="filteredWorkspaces.length"
        class="sticky top-0 max-h-[80vh] overflow-auto pb-4"
      >
        <table class="w-full min-w-[920px] text-left text-sm">
          <thead
            class="border-b border-border sticky top-0 z-10 bg-border text-xs uppercase tracking-wider text-muted"
          >
            <tr>
              <th scope="col" class="px-5 py-3 font-semibold">Unit</th>
              <th scope="col" class="px-5 py-3 font-semibold">Location</th>
              <th scope="col" class="px-5 py-3 font-semibold">
                Workspace type
              </th>
              <th scope="col" class="px-5 py-3 font-semibold">Capacity</th>
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
                    workspace.status === "inactive" ? "Activate" : "Deactivate"
                  }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="p-10 text-center text-sm text-muted">
        No workspace units match the current filters.
      </div>
    </article>

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
