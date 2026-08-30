<script setup lang="ts">
import requirePermission from "~/middleware/require-permission";
import type { Database } from "~/types/database";

definePageMeta({
  layout: "default",
  title: "Location details",
  heading: "Location details",
  subtext: "Edit location settings and manage workspaces.",
  ssr: false,
  middleware: requirePermission,
  requiredPermission: "manage_locations",
});

const supabase = useSupabaseClient<Database>();
const route = useRoute();

const rawLocationId = computed(() =>
  Array.isArray(route.params.locationId)
    ? route.params.locationId[0]
    : route.params.locationId,
);

const locationId = computed<number | null>(() => {
  const value = Number(rawLocationId.value);
  return Number.isFinite(value) ? value : null;
});
const locationName = ref("");
const locationCity = ref("");
const workspaceName = ref("");
const workspaceType = ref("Desk");
const workspaceCapacity = ref(1);
const workspaceTypeOptions = [
  "Desk",
  "Office",
  "Meeting room",
  "Private office",
  "Suite",
];

const {
  data: location,
  pending: locationPending,
  refresh: refreshLocation,
} = useLazyAsyncData(
  async () => {
    if (locationId.value == null) return null;

    const { data, error } = await supabase
      .from("locations")
      .select("id, location, city")
      .eq("id", locationId.value)
      .single();

    if (error) throw error;
    return data;
  },
  { watch: [locationId] },
);

watch(
  location,
  (value) => {
    if (value) {
      locationName.value = value.location ?? "";
      locationCity.value = value.city ?? "";
    }
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

async function saveLocation() {
  if (locationId.value == null) return;

  const { error } = await supabase
    .from("locations")
    .update({
      location: locationName.value.trim(),
      city: locationCity.value.trim(),
    })
    .eq("id", locationId.value);

  if (error) {
    console.error("Failed to save location", error);
    return;
  }

  await refreshLocation();
}

async function addWorkspace() {
  if (locationId.value == null) return;
  if (!workspaceName.value.trim()) return;

  const { error } = await supabase.from("workspaces").insert({
    id: crypto.randomUUID(),
    location_id: locationId.value,
    name: workspaceName.value.trim(),
    type: workspaceType.value,
    capacity: Number(workspaceCapacity.value) || 1,
    status: "active",
    base_price: 0,
    booking_price: 0,
  });

  if (error) {
    console.error("Failed to add workspace", error);
    return;
  }

  workspaceName.value = "";
  workspaceType.value = "Desk";
  workspaceCapacity.value = 1;
  await refreshWorkspaces();
}

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
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-sm text-muted">Location settings</p>
        <h2 class="text-2xl font-bold">{{ locationName || "Location" }}</h2>
      </div>
      <NuxtLink to="/locations" class="secondary">Back to locations</NuxtLink>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <article class="rounded-2xl border border-border bg-alt-bg p-5">
        <div class="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 class="font-semibold">Edit location</h3>
            <p class="text-sm text-muted">
              Update the basic details for this site.
            </p>
          </div>
          <span
            class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary-text"
          >
            {{ locationPending ? "Loading" : "Live" }}
          </span>
        </div>

        <form
          v-if="!locationPending"
          class="space-y-4"
          @submit.prevent="saveLocation"
        >
          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2 text-sm">
              <span class="font-medium text-heading">Location name</span>
              <input
                v-model="locationName"
                type="text"
                class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Soho"
              />
            </label>

            <label class="space-y-2 text-sm">
              <span class="font-medium text-heading">City</span>
              <input
                v-model="locationCity"
                type="text"
                class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="London"
              />
            </label>
          </div>

          <div
            class="flex items-center justify-between rounded-xl border border-border bg-bg p-3"
          >
            <div>
              <p class="font-medium text-heading">Location status</p>
              <p class="text-sm text-muted">Bookings and access are enabled.</p>
            </div>
            <span
              class="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
            >
              Active
            </span>
          </div>

          <div class="flex justify-end">
            <button type="submit" class="primary">Save location</button>
          </div>
        </form>
      </article>

      <article class="rounded-2xl border border-border bg-alt-bg p-5">
        <div class="mb-5">
          <h3 class="font-semibold">Add workspace</h3>
          <p class="text-sm text-muted">
            Create a desk, office, or room for this site.
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="addWorkspace">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-heading">Workspace name</span>
            <input
              v-model="workspaceName"
              type="text"
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Meeting Room A"
            />
          </label>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2 text-sm">
              <span class="font-medium text-heading">Type</span>
              <select
                v-model="workspaceType"
                class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option
                  v-for="type in workspaceTypeOptions"
                  :key="type"
                  :value="type"
                >
                  {{ type }}
                </option>
              </select>
            </label>

            <label class="space-y-2 text-sm">
              <span class="font-medium text-heading">Capacity</span>
              <input
                v-model.number="workspaceCapacity"
                min="1"
                type="number"
                class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>

          <button type="submit" class="primary w-full">Add workspace</button>
        </form>
      </article>
    </div>

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
  </section>
</template>
