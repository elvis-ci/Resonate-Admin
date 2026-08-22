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

type Profile = { role: string; location_id: number | null };

const { data: profile, pending: profilePending } = useLazyAsyncData<Profile | null>(
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

type LocationOption = { id: number; location: string };

const { data: locations } = useLazyAsyncData<LocationOption[]>(
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

type DashboardOverviewRow =
  Database["public"]["Functions"]["dashboard_overview_stats"]["Returns"][number];
type Stats = DashboardOverviewRow | null;

const { data: stats, pending, error } = useLazyAsyncData<Stats>(
  "dashboard-overview-stats",
  async () => {
    const { data, error } = await supabase.rpc("dashboard_overview_stats", {
      range_start: range.value.start.toISOString(),
      range_end: range.value.end.toISOString(),
      filter_location_id: selectedLocationId.value ?? undefined,
    });
    if (error) throw error;
    return data?.[0] ?? null;
  },
  { watch: [range, selectedLocationId] },
);

const isSuperAdmin = computed(() => profile.value?.role === "super_admin");

const { data: locationName } = useLazyAsyncData<string | null>(
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
  if (isSuperAdmin.value) return "All locations";
  if (locationName.value) return locationName.value;
  return null;
});

type TrendRow =
  Database["public"]["Functions"]["dashboard_daily_trend"]["Returns"][number];

const { data: trend, pending: trendPending } = useLazyAsyncData<TrendRow[]>(
  "dashboard-daily-trend",
  async () => {
    const { data, error } = await supabase.rpc("dashboard_daily_trend", {
      range_start: range.value.start.toISOString(),
      range_end: range.value.end.toISOString(),
      filter_location_id: selectedLocationId.value ?? undefined,
    });
    if (error) throw error;
    return data ?? [];
  },
  { watch: [range, selectedLocationId] },
);

type LocationBreakdownRow =
  Database["public"]["Functions"]["dashboard_location_breakdown"]["Returns"][number];

const { data: locationBreakdown } = useLazyAsyncData<LocationBreakdownRow[]>(
  "dashboard-location-breakdown",
  async () => {
    // if (!isSuperAdmin.value || selectedLocationId.value !== null) return [];
    const { data, error } = await supabase.rpc("dashboard_location_breakdown", {
      range_start: range.value.start.toISOString(),
      range_end: range.value.end.toISOString(),
    });
    if (error) throw error;
    return data ?? [];
  },
  { watch: [range, selectedLocationId, isSuperAdmin] },
);

const showLocationBreakdown = computed(
  () => isSuperAdmin.value && selectedLocationId.value === null,
);

type WorkspaceBreakdownRow =
  Database["public"]["Functions"]["dashboard_workspace_breakdown"]["Returns"][number];

const { data: workspaceBreakdown } = useLazyAsyncData<WorkspaceBreakdownRow[]>(
  "dashboard-workspace-breakdown",
  async () => {
    const { data, error } = await supabase.rpc("dashboard_workspace_breakdown", {
      range_start: range.value.start.toISOString(),
      range_end: range.value.end.toISOString(),
      filter_location_id: selectedLocationId.value ?? undefined,
    });
    if (error) throw error;
    return data ?? [];
  },
  { watch: [range, selectedLocationId] },
);

type UpcomingBooking = {
  id: number;
  booking_code: string;
  guest_name: string | null;
  start_at: string | null;
  end_at: string | null;
  status: string;
  workspaces: { name: string | null; location_id: number | null } | null;
};

const { data: upcomingBookings } = useLazyAsyncData<UpcomingBooking[]>(
  "upcoming-bookings",
  async () => {
    let query = supabase
      .from("workspace_bookings")
      .select(
        "id, booking_code, guest_name, start_at, end_at, status, workspaces(name, location_id)",
      )
      .eq("status", "confirmed")
      .gte("start_at", new Date().toISOString())
      .order("start_at", { ascending: true })
      .limit(6);

    if (!isSuperAdmin.value && selectedLocationId.value !== null) {
      query = query.eq("location_id", selectedLocationId.value);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as UpcomingBooking[];
  },
  { watch: [selectedLocationId, isSuperAdmin] },
);

// End time only needs hour:minute — the weekday/start already establishes the day.
const endTimeFormatter = new Intl.DateTimeFormat("en-NG", {
  hour: "numeric",
  minute: "2-digit",
});

function formatBookingTimeRange(
  startAt: string | null,
  endAt: string | null,
): string {
  if (!startAt) return "—";
  const start = timeFormatter.format(new Date(startAt));
  if (!endAt) return start;
  const end = endTimeFormatter.format(new Date(endAt));
  return `${start} – ${end}`;
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

const timeFormatter = new Intl.DateTimeFormat("en-NG", {
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
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

// ---- Period-over-period delta helper ----
// Returns null when there's no prior-period baseline to compare against
// (avoids a misleading "+∞%" or "-100%" on a from-zero comparison).
function delta(current: number, prior: number): number | null {
  if (prior === 0) return current === 0 ? 0 : null;
  return ((current - prior) / prior) * 100;
}

const revenueDelta = computed(() =>
  stats.value
    ? delta(stats.value.total_revenue, stats.value.prior_total_revenue)
    : null,
);
const bookingDelta = computed(() =>
  stats.value
    ? delta(stats.value.booking_count, stats.value.prior_booking_count)
    : null,
);
const avgValueDelta = computed(() =>
  stats.value
    ? delta(stats.value.avg_booking_value, stats.value.prior_avg_booking_value)
    : null,
);
// For cancellations/no-shows, a rise is bad — flip the "good" direction downstream.
const cancelledDelta = computed(() =>
  stats.value
    ? delta(stats.value.cancelled_count, stats.value.prior_cancelled_count)
    : null,
);
const noShowDelta = computed(() =>
  stats.value
    ? delta(stats.value.no_show_count, stats.value.prior_no_show_count)
    : null,
);

function formatDelta(pct: number | null): string {
  if (pct === null) return "";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function deltaColor(pct: number | null, lowerIsBetter = false): string {
  if (pct === null || pct === 0) return "text-muted";
  const isFavorable = lowerIsBetter ? pct < 0 : pct > 0;
  return isFavorable ? "text-emerald-600" : "text-red-600";
}

const dateRangeOptions = [
  "yesterday",
  "today",
  "past_week",
  "last_30_days",
] as const;

const dateRangeLabels: Record<(typeof dateRangeOptions)[number], string> = {
  yesterday: "Yesterday",
  today: "Today",
  past_week: "Past week",
  last_30_days: "Last 30 days",
};

const priorPeriod = computed(() => {
  switch (selected.value) {
    case "yesterday":
      return "the day before";
    case "today":
      return "yesterday";
    case "past_week":
      return "previous week";
    case "last_30_days":
      return "the previous 30 days";
    default:
      return "";
  }
});

const chartSeries = computed(() => {
  return [
    {
      name: "Revenue",
      data: (trend.value ?? []).map((r) => ({
        x: new Date(r.day).getTime(),
        y: r.revenue,
      })),
    },
  ];
});

const chartOptions = computed(() => ({
  chart: { toolbar: { show: false }, background: "transparent" },
  xaxis: {
    type: "datetime",
    labels: { format: "MMM d" },
  },
  yaxis: {
    labels: {
      formatter: (val: number) => currencyFormatter.format(val),
    },
  },
  tooltip: {
    x: { format: "EEE, MMM d" },
    y: { formatter: (val: number) => currencyFormatter.format(val) },
  },
  stroke: { curve: "smooth", width: 2 },
  colors: ["#6366f1"], // swap for your --color-primary
  grid: { borderColor: "var(--color-border, #e5e7eb)" },
}));
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <!-- Scope control loading placeholder: profile hasn't resolved yet -->
      <div
        v-if="profilePending"
        class="h-7 w-32 rounded-full bg-alt-bg animate-pulse"
      />

      <!-- Super admin: interactive location filter -->
      <select
        v-else-if="isSuperAdmin"
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
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-alt-bg text-heading"
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

      <select
        v-model="selected"
        class="w-full rounded-lg border border-primary bg-transparent px-3 py-2 text-sm font-semibold text-heading focus:outline-none focus:ring-2 focus:ring-primary/30 md:hidden"
      >
        <option v-for="opt in dateRangeOptions" :key="opt" :value="opt">
          {{ dateRangeLabels[opt] }}
        </option>
      </select>

      <div class="hidden items-center gap-3 md:flex">
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
        class="rounded-2xl bg-alt-bg p-5 shadow-elev animate-pulse"
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
      <div
        class="rounded-2xl bg-card-bg2 p-5 hover:border-primary/30 transition-colors shadow-elev"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p
              class="text-sm font-semibold uppercase tracking-[0.1em] primary text-muted"
            >
              Revenue
            </p>
            <p class="text-2xl font-bold mt-3 ">
              {{ currencyFormatter.format(stats.total_revenue) }}
            </p>
            <p
              v-if="revenueDelta !== null"
              :class="['text-xs font-semibold mt-1', deltaColor(revenueDelta)]"
            >
              {{ formatDelta(revenueDelta) }} from {{ priorPeriod }}
            </p>
          </div>
          <div
            class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-6 h-6 text-primary"
            >
              <path
                d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Bookings -->
      <div
        class="rounded-2xl bg-card-bg2 p-5 hover:border-primary/30 transition-colors shadow-elev"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p
              class="text-sm font-semibold uppercase primary tracking-[0.1em] text-muted"
            >
              Bookings
            </p>
            <p class="text-2xl font-bold mt-3 ">
              {{ stats.booking_count }}
            </p>
            <p
              v-if="bookingDelta !== null"
              :class="['text-xs font-semibold mt-1', deltaColor(bookingDelta)]"
            >
              {{ formatDelta(bookingDelta) }} from {{ priorPeriod }}
            </p>
          </div>
          <div
            class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-6 h-6 text-primary"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Avg. Booking Value -->
      <div
        class="rounded-2xl bg-card-bg2 p-5 hover:border-primary/30 transition-colors shadow-elev"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p
              class="text-sm font-semibold uppercase tracking-[0.1em] primary text-muted"
            >
              Avg. Value
            </p>
            <p class="text-2xl font-bold mt-3">
              {{ currencyFormatter.format(stats.avg_booking_value) }}
            </p>
            <p
              v-if="avgValueDelta !== null"
              :class="['text-xs font-semibold mt-1', deltaColor(avgValueDelta)]"
            >
              {{ formatDelta(avgValueDelta) }} from {{ priorPeriod }}
            </p>
          </div>
          <div
            class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-6 h-6 text-primary"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Cancellations -->
      <div
        class="rounded-2xl bg-card-bg2 p-5 hover:border-primary/30 transition-colors shadow-elev"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p
              class="text-sm font-semibold uppercase tracking-[0.1em] primary text-muted"
            >
              Cancellations
            </p>
            <p class="text-2xl font-bold mt-3 ">
              {{ stats.cancelled_count }}
            </p>
            <p
              v-if="cancelledDelta !== null"
              :class="[
                'text-xs font-semibold mt-1',
                deltaColor(cancelledDelta, true),
              ]"
            >
              {{ formatDelta(cancelledDelta) }} from {{ priorPeriod }}
            </p>
          </div>
          <div
            class="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-6 h-6 text-warning"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8M12 8v8" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="rounded-2xl bg-card-bg2 p-5 text-muted"
    >
      Loading dashboard overview...
    </div>
  </section>

  <section class="mt-6">
    <!-- Revenue trend -->
    <div class="rounded-2xl bg-card-bg2 p-5 shadow-elev ">
      <p
        class="text-sm font-semibold uppercase primary tracking-[0.1em] text-muted mb-4"
      >
        Revenue trend
      </p>
      <div v-if="trendPending" class="h-[200px] rounded bg-muted/10 animate-pulse" />
      <ClientOnly v-else>
        <apexchart
          type="area"
          height="200"
          :options="chartOptions"
          :series="chartSeries"
        />
      </ClientOnly>
      <div
        v-if="!pending && !error && allZero"
        class="text-center text-muted mt-3"
      >
        No activity in this period.
      </div>
    </div>
  </section>

  <!-- Location + workspace breakdowns -->
  <section class="mt-6">
    <div
      class="grid gap-6"
      :class="showLocationBreakdown ? 'lg:grid-cols-2' : ''"
    >
      <!-- By location (super admin, "All locations" view only) -->
      <div
        v-if="
          showLocationBreakdown &&
          locationBreakdown &&
          locationBreakdown.length > 0
        "
        class="rounded-2xl bg-alt-bg p-5 shadow-elev overflow-x-auto"
      >
        <p
          class="text-sm font-semibold uppercase primary tracking-[0.1em] text-muted mb-4"
        >
          By location
        </p>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-muted border-b border-border">
              <th class="pb-2 font-semibold">Location</th>
              <th class="pb-2 font-semibold text-right">Revenue</th>
              <th class="pb-2 font-semibold text-right">Bookings</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in locationBreakdown"
              :key="row.location_id"
              class="border-b border-border last:border-0"
            >
              <td class="py-2 text-heading">{{ row.location_name }}</td>
              <td class="py-2 text-right text-heading">
                {{ currencyFormatter.format(row.revenue) }}
              </td>
              <td class="py-2 text-right text-heading">
                {{ row.booking_count }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- By workspace — every admin sees this, scoped to their location
           server-side; super admin sees the current location filter (or
           top workspaces across all locations when unfiltered). -->
      <div
        v-if="workspaceBreakdown && workspaceBreakdown.length > 0"
        class="rounded-2xl bg-alt-bg p-5 shadow-elev overflow-x-auto"
      >
        <p
          class="text-sm font-semibold uppercase primary tracking-[0.1em] text-muted mb-4"
        >
          By workspace
        </p>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-muted border-b border-border">
              <th class="pb-2 font-semibold">Workspace</th>
              <th class="pb-2 font-semibold text-right">Revenue</th>
              <th class="pb-2 font-semibold text-right">Bookings</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in workspaceBreakdown"
              :key="row.workspace_id"
              class="border-b border-border last:border-0"
            >
              <td class="py-2 text-heading">
                {{ row.workspace_name }}
                <span class="text-muted font-normal">
                  · {{ row.location_name }}
                </span>
              </td>
              <td class="py-2 text-right text-heading">
                {{ currencyFormatter.format(row.revenue) }}
              </td>
              <td class="py-2 text-right text-heading">
                {{ row.booking_count }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="mt-6">
    <!-- Upcoming bookings -->
    <div
      v-if="upcomingBookings && upcomingBookings.length > 0"
      class="rounded-2xl bg-alt-bg p-5 shadow-elev"
    >
      <p
        class="text-sm font-semibold uppercase primary tracking-[0.1em] text-muted mb-4"
      >
        Upcoming bookings
      </p>
      <ul class="divide-y divide-border">
        <li
          v-for="booking in upcomingBookings"
          :key="booking.id"
          class="py-3 flex items-center justify-between gap-4"
        >
          <div>
            <p class="text-heading font-semibold">
              {{ booking.guest_name || "Guest" }}
              <span class="text-muted font-normal text-xs">
                · {{ booking.booking_code }}
              </span>
            </p>
            <p class="text-sm text-muted">
              {{ booking.workspaces?.name || "Workspace" }}
            </p>
          </div>
          <span class="text-sm font-medium text-heading whitespace-nowrap text-right">
            {{ formatBookingTimeRange(booking.start_at, booking.end_at) }}
          </span>
        </li>
      </ul>
    </div>
    <div
      v-else-if="upcomingBookings"
      class="rounded-2xl bg-alt-bg p-5 text-muted"
    >
      No upcoming bookings in the next few days.
    </div>
  </section>
</template>