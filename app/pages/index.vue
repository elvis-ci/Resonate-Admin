<script lang="ts" setup>
import { computed, ref } from "vue";
import type { Database } from "~/types/database";

definePageMeta({
  title: "Overview",
  heading: "Dashboard overview",
  subtext:
    "A snapshot of bookings, activity, and performance across all locations.",
});

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();
const { selected, range } = useDateRangeFilter(); // auto-imported, no manual import needed

// ---- Current admin's profile (role + location) ----
type Profile = { role: string; location_id: number | null };

const { data: profile } = await useAsyncData<Profile | null>(
  "current-admin-profile",
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
  { watch: [user] },
);

// ---- Resolve location name, only if the admin is location-scoped ----
const { data: locationName } = await useAsyncData<string | null>(
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
  if (profile.value?.role === "super_admin") return "All locations";
  if (locationName.value) return locationName.value;
  return null;
});

// ---- All locations, for the super-admin filter dropdown ----
type LocationOption = { id: number; location: string };

const { data: locations } = await useAsyncData<LocationOption[]>(
  "all-locations",
  async () => {
    const { data, error } = await supabase
      .from("locations")
      .select("id, location")
      .order("location");
    if (error) throw error;
    return data ?? [];
  },
);

// null = "All locations". Only meaningful for super_admin — the RPC ignores
// this value entirely for scoped admins and forces their own location server-side.
const selectedLocationId = ref<number | null>(null);

// ---- Dashboard stats RPC ----
type DashboardOverviewRow =
  Database["public"]["Functions"]["dashboard_overview_stats"]["Returns"][number];
type Stats = DashboardOverviewRow | null;

const {
  data: stats,
  pending,
  error,
} = await useAsyncData<Stats>(
  "dashboard-overview-stats",
  async () => {
    const { data, error } = await supabase.rpc("dashboard_overview_stats", {
      range_start: range.value.start.toISOString(),
      range_end: range.value.end.toISOString(),
      filter_location_id: selectedLocationId.value,
    });
    if (error) throw error;
    return data?.[0] ?? null;
  },
  { watch: [range, selectedLocationId] },
);

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

const allZero = computed(() => {
  const s = stats.value;
  if (!s) return false;
  return (
    s.total_revenue === 0 &&
    s.booking_count === 0 &&
    s.avg_booking_value === 0 &&
    s.cancelled_count === 0 &&
    s.no_show_count === 0
  );
});

const dateRangeOptions = ["yesterday", "today", "past_week", "last_30_days"] as const;

const dateRangeLabels: Record<(typeof dateRangeOptions)[number], string> = {
  yesterday: "Yesterday",
  today: "Today",
  past_week: "Past week",
  last_30_days: "Last 30 days",
};
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <!-- Super admin: interactive location filter -->
      <select
        v-if="profile?.role === 'super_admin'"
        v-model="selectedLocationId"
        class="px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary-text border-none focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option :value="null">All locations</option>
        <option v-for="loc in locations" :key="loc.id" :value="loc.id">
          {{ loc.location }}
        </option>
      </select>

      <!-- Scoped admin: static, non-interactive badge -->
      <span
        v-else-if="scopeLabel"
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-alt-bg border border-border text-heading"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="w-3.5 h-3.5"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {{ scopeLabel }}
      </span>

      <div class="flex items-center gap-3">
        <button
          v-for="opt in dateRangeOptions"
          :key="opt"
          type="button"
          :class="[
            'px-4 py-1 rounded-lg border transition-colors',
            selected === opt
              ? 'bg-primary text-white border-primary'
              : 'bg-transparent text-muted border-primary',
          ]"
          @click="selected = opt"
        >
          {{ dateRangeLabels[opt] }}
        </button>
      </div>
    </div>

    <div v-if="error" class="text-red-600">
      An error occurred: {{ error.message || String(error) }}
    </div>

    <div v-if="pending" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="n in 4"
        :key="n"
        class="rounded-2xl border border-border bg-alt-bg p-5 shadow-elev animate-pulse"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 space-y-3">
            <div class="h-3 w-20 rounded bg-muted/20"></div>
            <div class="h-8 w-28 rounded bg-muted/20"></div>
          </div>
          <div class="h-12 w-12 rounded-lg bg-primary/10"></div>
        </div>
      </div>
    </div>

    <div v-else-if="stats" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Revenue -->
      <div class="rounded-2xl border border-border bg-alt-bg p-5 hover:border-primary/30 transition-colors shadow-elev">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-sm font-semibold uppercase tracking-[0.1em] text-muted">Revenue</p>
            <p class="text-3xl font-bold mt-3 text-heading">
              {{ currencyFormatter.format(stats.total_revenue) }}
            </p>
          </div>
          <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-primary">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Bookings -->
      <div class="rounded-2xl border border-border bg-alt-bg p-5 hover:border-primary/30 transition-colors shadow-elev">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-sm font-semibold uppercase tracking-[0.1em] text-muted">Bookings</p>
            <p class="text-3xl font-bold mt-3 text-heading">{{ stats.booking_count }}</p>
          </div>
          <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-primary">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Avg. Booking Value -->
      <div class="rounded-2xl border border-border bg-alt-bg p-5 hover:border-primary/30 transition-colors shadow-elev">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-sm font-semibold uppercase tracking-[0.1em] text-muted">Avg. Value</p>
            <p class="text-3xl font-bold mt-3 text-heading">
              {{ currencyFormatter.format(stats.avg_booking_value) }}
            </p>
          </div>
          <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-primary">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Cancellations & No-shows -->
      <div class="rounded-2xl border border-border bg-alt-bg p-5 hover:border-primary/30 transition-colors shadow-elev">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-sm font-semibold uppercase tracking-[0.1em] text-muted">Cancellations</p>
            <p class="text-3xl font-bold mt-3 text-heading">{{ stats.cancelled_count }}</p>
            <p class="text-xs text-muted mt-1">{{ stats.no_show_count }} no-shows</p>
          </div>
          <div class="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-warning">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8M12 8v8" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="rounded-2xl border border-border bg-alt-bg p-5 text-muted">
      Loading dashboard overview...
    </div>

    <div v-if="!pending && !error && allZero" class="text-muted mt-3">
      No activity in this period.
    </div>
  </section>
</template>