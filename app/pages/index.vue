<script lang="ts" setup>
definePageMeta({
  title: "Overview",
  heading: "Dashboard overview",
  subtext:
    "A snapshot of bookings, activity, and performance across all locations.",
});

const { profile, isProfilePending, isSuperAdmin, scopeLabel } =
  useAdminProfile();

const { selected, range } = useDateRangeFilter();
const { locations } = useLocationsInfo(); // assuming this already returns {id, location}[]

const selectedLocationId = ref<number | null>(null);

const {
  stats,
  pending,
  error,
  allZero,
  trend,
  trendPending,
  chartSeries,
  chartOptions,
  locationBreakdownPending,
  locationBreakdown,
  workspaceBreakdownPending,
  workspaceBreakdown,
  showLocationBreakdown,
  upcomingBookings,
  revenueDelta,
  bookingDelta,
  avgValueDelta,
  cancelledDelta,
  noShowDelta,
} = useDashboardData(range, selectedLocationId, isSuperAdmin);

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

const priorPeriodLabels: Record<(typeof dateRangeOptions)[number], string> = {
  yesterday: "the day before",
  today: "yesterday",
  past_week: "previous week",
  last_30_days: "the previous 30 days",
};

const priorPeriod = computed(() => priorPeriodLabels[selected.value] ?? "");
</script>

<template>
  <section class="space-y-6 max-w-screen">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <!-- Scope control loading placeholder: profile hasn't resolved yet -->
      <div
        v-if="isProfilePending"
        class="h-7 w-32 rounded-full bg-alt-bg2 animate-pulse"
      />

      <!-- Super admin: interactive location filter -->
      <select
        v-else-if="isSuperAdmin"
        v-model="selectedLocationId"
        class="px-3 py-2 rounded-lg text-sm font-semibold bg-alt-bg2 text-body border border-border focus:outline-priimary focus:ring-2 focus:ring-primary/30"
      >
        <option :value="null">All locations</option>
        <option v-for="loc in locations" :key="loc.id" :value="loc.id">
          {{ loc.location }}
        </option>
      </select>

      <!-- Scoped admin: static, non-interactive badge -->
      <span
        v-else-if="scopeLabel"
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-alt-bg2 text-heading"
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
        class="rounded-2xl bg-card-bg2 p-5 shadow-elev animate-pulse"
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

    <div v-else-if="stats" class="grid gap-6 grid-cols-2 lg:grid-cols-4">
      <!-- Revenue -->
      <div
        class="rounded-2xl bg-alt-bg2 p-5 hover:border-primary/30 transition-colors shadow-elev"
      >
        <div class="flex justify-between items-center">
          <p
            class="text-sm font-semibold uppercase tracking-[0.1em] primary text-muted"
          >
            Revenue
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-5 h-5 lg:w-7 lg:h-7 text-primary rounded-lg bg-primary/10"
          >
            <path
              d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
            />
          </svg>
        </div>
        <div class="">
          <p class="text-base lg:text-2xl font-bold mt-3">
            {{ currencyFormatter.format(stats.total_revenue) }}
          </p>
          <p
            v-if="revenueDelta !== null"
            :class="['text-xs font-semibold mt-1', deltaColor(revenueDelta)]"
          >
            {{ formatDelta(revenueDelta) }} from {{ priorPeriod }}
          </p>
        </div>
      </div>

      <!-- Bookings -->
      <div
        class="rounded-2xl bg-alt-bg2 p-5 hover:border-primary/30 transition-colors shadow-elev"
      >
        <div class="flex justify-between items-center">
          <p
            class="text-sm font-semibold uppercase tracking-[0.1em] primary text-muted"
          >
            Bookings
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-5 h-5 lg:w-7 lg:h-7 text-primary rounded-lg bg-primary/10"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </div>
        <div class="">
          <p class="text-base lg:text-2xl font-bold mt-3">
            {{ stats.booking_count }}
          </p>
          <p
            v-if="revenueDelta !== null"
            :class="['text-xs font-semibold mt-1', deltaColor(bookingDelta)]"
          >
            {{ formatDelta(bookingDelta) }} from {{ priorPeriod }}
          </p>
        </div>
      </div>

      <!-- Avg. Booking Value -->
      <div
        class="rounded-2xl bg-alt-bg2 p-5 hover:border-primary/30 transition-colors shadow-elev"
      >
        <div class="flex justify-between items-center">
          <p
            class="text-sm font-semibold uppercase tracking-[0.1em] primary text-muted"
          >
            Avg. Value
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-5 h-5 lg:w-7 lg:h-7 text-primary rounded-lg bg-primary/10"
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
        <div class="">
          <p class="text-base lg:text-2xl font-bold mt-3">
            {{ currencyFormatter.format(stats.avg_booking_value) }}
          </p>
          <p
            v-if="revenueDelta !== null"
            :class="['text-xs font-semibold mt-1', deltaColor(avgValueDelta)]"
          >
            {{ formatDelta(avgValueDelta) }} from {{ priorPeriod }}
          </p>
        </div>
      </div>

      <!-- Cancellations -->
      <div
        class="rounded-2xl bg-alt-bg2 p-5 hover:border-primary/30 transition-colors shadow-elev"
      >
        <div class="flex justify-between items-center">
          <p
            class="text-sm font-semibold uppercase tracking-[0.1em] primary text-muted"
          >
            Avg. Value
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-5 h-5 lg:w-7 lg:h-7 text-warning"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8M12 8v8" />
          </svg>
        </div>
        <div class="">
          <p class="text-base lg:text-2xl font-bold mt-3">
            {{ stats.cancelled_count }}
          </p>
          <p
            v-if="revenueDelta !== null"
            :class="[
              'text-xs font-semibold mt-1',
              deltaColor(cancelledDelta, true),
            ]"
          >
            {{ formatDelta(cancelledDelta) }} from {{ priorPeriod }}
          </p>
        </div>
      </div>
    </div>

    <div v-else class="rounded-2xl bg-alt-bg2 p-5 text-muted">
      Loading dashboard overview...
    </div>
  </section>

  <section class="mt-6 max-w-screen">
    <!-- Revenue trend -->
    <div class="rounded-2xl bg-alt-bg2 p-5 shadow-elev">
      <p
        class="text-sm font-semibold uppercase primary tracking-[0.1em] text-muted mb-4"
      >
        Revenue trend
      </p>
      <div
        v-if="trendPending"
        class="h-[200px] rounded bg-muted/10 animate-pulse"
      />
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
        v-if="showLocationBreakdown"
        class="rounded-2xl bg-alt-bg2 p-5 shadow-elev overflow-x-auto"
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
              v-if="locationBreakdownPending"
              v-for="index in 5"
              :key="index"
              class=""
            >
              <td v-for="index in 3" :key="index" class="h-15 px-2">
                <div class="h-[50%] bg-muted/20 animate-pulse rounded-sm"></div>
              </td>
            </tr>

            <tr
              v-else
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
      <div class="rounded-2xl bg-alt-bg2 p-5 shadow-elev overflow-x-auto">
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
              v-if="workspaceBreakdownPending"
              v-for="index in 5"
              :key="index"
              class=""
            >
              <td v-for="index in 3" :key="index" class="h-15 px-2">
                <div class="h-[50%] bg-muted/20 animate-pulse rounded-sm"></div>
              </td>
            </tr>

            <tr
              v-else
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
      class="rounded-2xl bg-alt-bg2 p-5 shadow-elev"
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
          <span
            class="text-sm font-medium text-heading whitespace-nowrap text-right"
          >
            {{ formatBookingTimeRange(booking.start_at, booking.end_at) }}
          </span>
        </li>
      </ul>
    </div>
    <div
      v-else-if="upcomingBookings"
      class="rounded-2xl bg-alt-bg2 p-5 text-muted"
    >
      No upcoming bookings in the next few days.
    </div>
  </section>
</template>
