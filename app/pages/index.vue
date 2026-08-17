<script lang="ts" setup>
import { computed } from "vue";
import type { Database } from "~/types/database";

definePageMeta({
  title: "Overview",
  heading: "Dashboard overview",
  subtext:
    "A snapshot of bookings, activity, and performance across all locations.",
});

const supabase = useSupabaseClient<Database>();
const { selected, range } = useDateRangeFilter(); // auto-imported, no manual import needed

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
    });
    if (error) throw error;
    return data?.[0] ?? null;
  },
  { watch: [range] },
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
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center gap-3">
      <button
        v-for="opt in [
          'yesterday',
          'today',
          'past_week',
          'last_30_days',
        ] as const"
        :key="opt"
        :class="[
          'px-4 py-1 rounded-lg border',
          selected === opt
            ? 'bg-primary text-white border-primary'
            : 'bg-transparent text-muted border-primary',
        ]"
        @click="selected = opt"
      >
        <span v-if="opt === 'yesterday'">Yesterday</span>
        <span v-else-if="opt === 'today'">Today</span>
        <span v-else-if="opt === 'past_week'">Past week</span>
        <span v-else>Last 30 days</span>
      </button>
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

    <template v-else-if="stats">
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Revenue -->
        <div
          class="rounded-2xl border border-border bg-alt-bg p-5 hover:border-primary/30 transition-colors shadow-elev"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p
                class="text-sm font-semibold uppercase tracking-[0.1em] text-muted"
              >
                Revenue
              </p>
              <p class="text-3xl font-bold mt-3 text-heading">
                {{ currencyFormatter.format(stats.total_revenue) }}
              </p>
            </div>
            <div
              class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
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
          class="rounded-2xl border border-border bg-alt-bg p-5 hover:border-primary/30 transition-colors shadow-elev"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p
                class="text-sm font-semibold uppercase tracking-[0.1em] text-muted"
              >
                Bookings
              </p>
              <p class="text-3xl font-bold mt-3 text-heading">
                {{ stats.booking_count }}
              </p>
            </div>
            <div
              class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
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
          class="rounded-2xl border border-border bg-alt-bg p-5 hover:border-primary/30 transition-colors shadow-elev"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p
                class="text-sm font-semibold uppercase tracking-[0.1em] text-muted"
              >
                Avg. Value
              </p>
              <p class="text-3xl font-bold mt-3 text-heading">
                {{ currencyFormatter.format(stats.avg_booking_value) }}
              </p>
            </div>
            <div
              class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
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

        <!-- Cancellations & No-shows -->
        <div
          class="rounded-2xl border border-border bg-alt-bg p-5 hover:border-primary/30 transition-colors shadow-elev"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p
                class="text-sm font-semibold uppercase tracking-[0.1em] text-muted"
              >
                Cancellations
              </p>
              <p class="text-3xl font-bold mt-3 text-heading">
                {{ stats.cancelled_count }}
              </p>
            </div>
            <div
              class="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0"
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
    </template>

    <div
      v-else
      class="rounded-2xl border border-border bg-alt-bg p-5 text-muted"
    >
      Loading dashboard overview...
    </div>

    <div v-if="!pending && !error && allZero" class="text-muted mt-3">
      No activity in this period.
    </div>
  </section>
</template>
