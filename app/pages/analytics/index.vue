<!-- pages/analytics.vue -->
<script setup lang="ts">
import type { Database } from "~/types/database";
import { formatWorkspaceType } from "~/utils/formatters";
definePageMeta({
  title: "Analytics",
  heading: "Analytics",
  subtext: "Revenue, bookings, and performance across your locations.",
  ssr: false,
});

const { isSuperAdmin, isProfilePending, adminLocationId, scopeLabel } =
  useAdminProfile();
const { scopedLocations } = useScopedLocation();
const supabase = useSupabaseClient<Database>();

type RangePreset =
  | "today"
  | "this_week"
  | "this_month"
  | "last_30_days"
  | "custom";

const rangePreset = ref<RangePreset>("this_week");
const customStart = ref("");
const customEnd = ref("");
const selectedLocationId = ref<number | null>(null); // super admin only

function toNaiveTimestamp(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

const resolvedRange = computed(() => {
  const now = new Date();

  switch (rangePreset.value) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "this_week": {
      const day = now.getDay(); // 0 = Sunday
      const diffToMonday = day === 0 ? 6 : day - 1;
      const monday = startOfDay(new Date(now));
      monday.setDate(monday.getDate() - diffToMonday);
      return { start: monday, end: endOfDay(now) };
    }
    case "this_month": {
      const first = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      return { start: first, end: endOfDay(now) };
    }
    case "last_30_days": {
      const start = startOfDay(new Date(now));
      start.setDate(start.getDate() - 29);
      return { start, end: endOfDay(now) };
    }
    case "custom": {
      const start = customStart.value
        ? startOfDay(new Date(customStart.value))
        : startOfDay(now);
      const end = customEnd.value
        ? endOfDay(new Date(customEnd.value))
        : endOfDay(now);
      return { start, end };
    }
  }
});

const effectiveLocationId = computed(() =>
  isSuperAdmin.value ? selectedLocationId.value : adminLocationId.value,
);

const {
  data: analytics,
  pending,
  error,
  refresh,
} = useLazyAsyncData(
  "admin-analytics",
  async () => {
    const rangeStart = toNaiveTimestamp(resolvedRange.value.start);
    const rangeEnd = toNaiveTimestamp(resolvedRange.value.end);
    const locId = effectiveLocationId.value;

    const [
      overview,
      trend,
      locationBreakdown,
      workspaceBreakdown,
      statusBreakdown,
      typeBreakdown,
    ] = await Promise.all([
      supabase.rpc("dashboard_overview_stats", {
        range_start: rangeStart,
        range_end: rangeEnd,
        filter_location_id: locId ?? undefined,
      }),
      supabase.rpc("dashboard_daily_trend", {
        range_start: rangeStart,
        range_end: rangeEnd,
        filter_location_id: locId ?? undefined,
      }),
      isSuperAdmin.value
        ? supabase.rpc("dashboard_location_breakdown", {
            range_start: rangeStart,
            range_end: rangeEnd,
          })
        : Promise.resolve({ data: null, error: null }),
      supabase.rpc("dashboard_workspace_breakdown", {
        range_start: rangeStart,
        range_end: rangeEnd,
        filter_location_id: locId ?? undefined,
        result_limit: 10,
      }),
      supabase.rpc("dashboard_status_breakdown", {
        range_start: rangeStart,
        range_end: rangeEnd,
        filter_location_id: locId ?? undefined,
      }),
      supabase.rpc("dashboard_workspace_type_breakdown", {
        range_start: rangeStart,
        range_end: rangeEnd,
        filter_location_id: locId ?? undefined,
      }),
    ]);

    if (overview.error) throw overview.error;
    if (trend.error) throw trend.error;
    if (locationBreakdown.error) throw locationBreakdown.error;
    if (workspaceBreakdown.error) throw workspaceBreakdown.error;
    if (statusBreakdown.error) throw statusBreakdown.error;
    if (typeBreakdown.error) throw typeBreakdown.error;

    return {
      overview: overview.data?.[0] ?? null,
      trend: trend.data ?? [],
      locationBreakdown: locationBreakdown.data ?? [],
      workspaceBreakdown: workspaceBreakdown.data ?? [],
      statusBreakdown: statusBreakdown.data ?? [],
      typeBreakdown: typeBreakdown.data ?? [],
    };
  },
  {
    watch: [resolvedRange, effectiveLocationId, isSuperAdmin],
    immediate: !isProfilePending.value,
  },
);
watch(isProfilePending, (stillPending) => {
  if (!stillPending) refresh();
});
const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function formatDelta(current: number, prior: number) {
  if (prior === 0) return current > 0 ? { text: "New", positive: true } : null;
  const pct = ((current - prior) / prior) * 100;
  const positive = pct >= 0;
  return { text: `${positive ? "+" : ""}${pct.toFixed(1)}%`, positive };
}

const trendChartOptions = computed(() => ({
  chart: { type: "line", toolbar: { show: false }, background: "transparent" },
  stroke: { curve: "smooth", width: [3, 2] },
  grid: {
    borderColor: "var(--color-border)",
    strokeDashArray: 4,
    xaxis: {
      lines: {
        show: false,
      },
    },
  },

  xaxis: {
    title: {
      text: "Date",
      style: {
        color: "var(--color-muted)",
      },
    },
    labels: {
      style: {
        colors: "var(--color-muted)",
      },
    },

    categories: (analytics.value?.trend ?? []).map((d) =>
      new Date(d.day).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
      }),
    ),
  },
  yaxis: [
    {
      title: {
        text: "Revenue (₦)",
        style: {
          color: "var(--color-muted)",
        },
      },
      labels: {
        formatter: (v: number) => currencyFormatter.format(v),
        style: {
          colors: "var(--color-muted)",
        },
      },
    },
    {
      opposite: true,
      title: {
        text: "Bookings",
        style: {
          color: "var(--color-muted)",
        },
      },
      labels: {
        style: {
          colors: "var(--color-muted)",
        },
      },

      forceNiceScale: true,
    },
  ],
  colors: ["var(--color-primary)", "var(--color-muted)"],
  legend: {
    position: "top",
    labels: {
      colors: "var(--color-muted)",
      useSeriesColors: false,
    },
  },
  tooltip: {
    theme: "dark",
  },
}));

const trendChartSeries = computed(() => [
  {
    name: "Revenue",

    data: (analytics.value?.trend ?? []).map((d) => Number(d.revenue)),
  },
  {
    name: "Bookings",
    data: (analytics.value?.trend ?? []).map((d) => Number(d.booking_count)),
  },
]);

const locationChartOptions = computed(() => ({
  chart: { type: "bar", toolbar: { show: false }, background: "transparent" },
  grid: {
    borderColor: "var(--color-border)",
    strokeDashArray: 4,
    xaxis: {
      lines: {
        show: false,
      },
    },
  },
  plotOptions: { bar: { horizontal: true, borderRadius: 2 } },
  xaxis: {
    title: {
      text: "Revenue (₦)",
      style: {
        color: "var(--color-muted)",
      },
    },

    categories: (analytics.value?.locationBreakdown ?? []).map(
      (l) => l.location_name,
    ),
    labels: {
      formatter: (v: string) => currencyFormatter.format(Number(v)),
      style: {
        colors: "var(--color-muted)",
      },
    },
  },
  yaxis: {
    title: {
      text: "Location",
      style: {
        color: "var(--color-muted)",
      },
    },
    labels: {
      style: {
        colors: "var(--color-muted)",
      },
    },
  },
  tooltip: {
    theme: "dark",
  },

  colors: ["#a05a00"],
  dataLabels: { enabled: false },
}));

const locationChartSeries = computed(() => [
  {
    name: "Revenue",
    data: (analytics.value?.locationBreakdown ?? []).map((l) =>
      Number(l.revenue),
    ),
  },
]);

const statusColors: Record<string, string> = {
  confirmed: "#059669",
  completed: "#2563eb",
  pending: "#f59e0b",
  cancelled: "#94a3b8",
  no_show: "#dc2626",
};

const statusChartOptions = computed(() => ({
  chart: { type: "pie", background: "transparent" },
  labels: (analytics.value?.statusBreakdown ?? []).map((s) =>
    s.status.replace("_", " ").replace(/^./, (c) => c.toUpperCase()),
  ),
  colors: (analytics.value?.statusBreakdown ?? []).map(
    (s) => statusColors[s.status] ?? "#94a3b8",
  ),
  legend: {
    position: "bottom",
    labels: { colors: "var(--color-muted)" },
  },
  dataLabels: {
    style: { colors: ["#fff"] },
  },
  stroke: { show: false },
  tooltip: { theme: "dark" },
}));

const statusChartSeries = computed(() =>
  (analytics.value?.statusBreakdown ?? []).map((s) => Number(s.booking_count)),
);

const typeChartOptions = computed(() => ({
  chart: { type: "donut", background: "transparent" },
  labels: (analytics.value?.typeBreakdown ?? []).map((t) =>
    formatWorkspaceType(t.workspace_type),
  ),
  colors: ["#a05a00", "#e67e00", "#2563eb", "#059669", "#94a3b8", "#dc2626"],
  legend: {
    position: "bottom",
    labels: { colors: "var(--color-muted)" },
  },
  dataLabels: {
    style: { colors: ["#fff"] },
  },
  stroke: { show: false },
  tooltip: {
    theme: "dark",
    y: { formatter: (v: number) => currencyFormatter.format(v) },
  },
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          total: {
            show: true,
            label: "Total revenue",
            color: "var(--color-muted)",
            formatter: (w: any) =>
              currencyFormatter.format(
                w.globals.seriesTotals.reduce(
                  (a: number, b: number) => a + b,
                  0,
                ),
              ),
          },
        },
      },
    },
  },
}));

const typeChartSeries = computed(() =>
  (analytics.value?.typeBreakdown ?? []).map((t) => Number(t.revenue)),
);
</script>

<template>
  <section class="space-y-6 pb-4 max-w-screen">
    <!-- Filters -->
    <article class="rounded-2xl bg-alt-bg2 p-5 shadow-elev">
      <div class="flex flex-wrap items-end gap-4">
        <label class="space-y-2 text-sm">
          <span class="font-medium text-body">Date range</span>
          <select
            v-model="rangePreset"
            class="w-full px-3 py-2 rounded-lg text-sm font-semibold bg-alt-bg2 text-body border border-primary focus:outline-priimary focus:ring-2 focus:ring-primary/30"
          >
            <option value="today">Today</option>
            <option value="this_week">This week</option>
            <option value="this_month">This month</option>
            <option value="last_30_days">Last 30 days</option>
            <option value="custom">Custom range</option>
          </select>
        </label>

        <template v-if="rangePreset === 'custom'">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-heading">From</span>
            <input
              v-model="customStart"
              type="date"
              class="w-full rounded-lg border border-primary bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-heading">To</span>
            <input
              v-model="customEnd"
              type="date"
              class="w-full rounded-lg border border-primary bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
        </template>

        <label v-if="isSuperAdmin" class="space-y-2 text-sm">
          <span class="font-medium text-body">Location</span>
          <select
            v-model="selectedLocationId"
            class="w-full px-3 py-2 rounded-lg text-sm font-semibold bg-alt-bg2 text-body border border-primary focus:outline-priimary focus:ring-2 focus:ring-primary/30"
          >
            <option :value="null">All locations</option>
            <option
              v-for="location in scopedLocations"
              :key="location.id"
              :value="location.id"
            >
              {{ location.location }}
            </option>
          </select>
        </label>
        <label v-else-if="scopeLabel" class="space-y-2 text-sm">
          <span class="font-medium text-heading">Location</span>
          <input
            :value="scopeLabel"
            disabled
            class="w-full rounded-lg border border-primary bg-transparent px-3 py-2 text-body opacity-70"
          />
        </label>
      </div>
    </article>

    <p
      v-if="error"
      class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30"
    >
      Unable to load analytics: {{ error.message }}
    </p>

    <!-- KPI row -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <template v-if="pending">
        <div
          v-for="i in 5"
          :key="i"
          class="rounded-2xl bg-alt-bg2 p-5 shadow-elev"
        >
          <div class="h-4 w-24 animate-pulse rounded bg-muted/20"></div>
          <div class="mt-3 h-7 w-32 animate-pulse rounded bg-muted/20"></div>
        </div>
      </template>

      <template v-else-if="analytics?.overview">
        <div class="rounded-2xl bg-alt-bg2 p-5 shadow-elev">
          <p class="text-sm primary text-muted">Total revenue</p>
          <p class="mt-1 text-2xl font-semibold text-body">
            {{ currencyFormatter.format(analytics.overview.total_revenue) }}
          </p>
          <div
            v-if="
              formatDelta(
                analytics.overview.total_revenue,
                analytics.overview.prior_total_revenue,
              )
            "
            class="mt-1 text-xs"
            :class="
              formatDelta(
                analytics.overview.total_revenue,
                analytics.overview.prior_total_revenue,
              )!.positive
                ? 'text-emerald-600'
                : 'text-red-600'
            "
          >
            {{
              formatDelta(
                analytics.overview.total_revenue,
                analytics.overview.prior_total_revenue,
              )!.text
            }}
            vs prior period
          </div>
        </div>

        <div class="rounded-2xl bg-alt-bg2 p-5 shadow-elev">
          <p class="text-sm primary text-muted">Bookings</p>
          <p class="mt-1 text-2xl font-semibold text-body">
            {{ analytics.overview.booking_count }}
          </p>
          <div
            v-if="
              formatDelta(
                analytics.overview.booking_count,
                analytics.overview.prior_booking_count,
              )
            "
            class="mt-1 text-xs"
            :class="
              formatDelta(
                analytics.overview.booking_count,
                analytics.overview.prior_booking_count,
              )!.positive
                ? 'text-emerald-600'
                : 'text-red-600'
            "
          >
            {{
              formatDelta(
                analytics.overview.booking_count,
                analytics.overview.prior_booking_count,
              )!.text
            }}
            vs prior period
          </div>
        </div>

        <div class="rounded-2xl bg-alt-bg2 p-5 shadow-elev">
          <p class="text-sm primary text-muted">Avg. booking value</p>
          <p class="mt-1 text-2xl font-semibold text-body">
            {{ currencyFormatter.format(analytics.overview.avg_booking_value) }}
          </p>
        </div>

        <div class="rounded-2xl bg-alt-bg2 p-5 shadow-elev">
          <p class="text-sm primary text-muted">Cancelled / No-show</p>
          <p class="mt-1 text-2xl font-semibold text-body">
            {{ analytics.overview.cancelled_count }} /
            {{ analytics.overview.no_show_count }}
          </p>
        </div>
      </template>
    </div>

    <!-- Trend chart -->
    <article class="rounded-2xl bg-alt-bg2 p-5 shadow-elev">
      <h3 class="mb-4 font-semibold primary text-primary">
        Revenue &amp; bookings trend
      </h3>
      <div
        v-if="pending"
        class="h-64 animate-pulse rounded-xl bg-muted/10"
      ></div>
      <ClientOnly v-else>
        <apexchart
          type="line"
          height="280"
          :options="trendChartOptions"
          :series="trendChartSeries"
        />
      </ClientOnly>
    </article>
    <div class="grid gap-4 lg:grid-cols-2">
      <!-- Booking status breakdown -->
      <article class="rounded-2xl bg-alt-bg2 p-5 shadow-elev">
        <h3 class="mb-4 primary font-semibold text-heading">
          Booking status breakdown
        </h3>
        <div
          v-if="pending"
          class="h-64 animate-pulse rounded-xl bg-muted/10"
        ></div>
        <ClientOnly v-else-if="analytics?.statusBreakdown?.length">
          <apexchart
            type="pie"
            height="280"
            :options="statusChartOptions"
            :series="statusChartSeries"
          />
        </ClientOnly>
        <p v-else class="p-5 text-center text-sm text-muted">
          No data for this period.
        </p>
      </article>

      <!-- Revenue by workspace type -->
      <article class="rounded-2xl bg-alt-bg2 p-5 shadow-elev">
        <h3 class="mb-4 primary font-semibold text-heading">
          Revenue by workspace type
        </h3>
        <div
          v-if="pending"
          class="h-64 animate-pulse rounded-xl bg-muted/10"
        ></div>
        <ClientOnly v-else-if="analytics?.typeBreakdown?.length">
          <apexchart
            type="donut"
            height="280"
            :options="typeChartOptions"
            :series="typeChartSeries"
          />
        </ClientOnly>
        <p v-else class="p-5 text-center text-sm text-muted">
          No data for this period.
        </p>
      </article>
    </div>
    <!-- Location breakdown (super admin only) -->
    <article v-if="isSuperAdmin" class="rounded-2xl bg-alt-bg2 p-5 shadow-elev">
      <h3 class="mb-4 font-semibold primary">Revenue by location</h3>
      <div
        v-if="pending"
        class="h-48 animate-pulse rounded-xl bg-muted/10"
      ></div>
      <ClientOnly v-else-if="analytics?.locationBreakdown?.length">
        <apexchart
          type="bar"
          height="240"
          :options="locationChartOptions"
          :series="locationChartSeries"
        />
      </ClientOnly>
      <p v-else class="p-5 text-center text-sm text-muted">
        No data for this period.
      </p>
    </article>

    <!-- Top workspaces -->
    <article class="rounded-2xl bg-alt-bg2 p-5 shadow-elev">
      <h3 class="mb-4 font-semibold primary">Top workspaces</h3>
      <div class="overflow-x-auto">
        <table class="w-full min-w-180 text-left text-sm">
          <thead
            class="sticky top-0 z-10 border-b border-border bg-border text-xs uppercase tracking-wider text-muted"
          >
            <tr>
              <th class="px-3 py-2 font-semibold">Workspace</th>
              <th class="px-3 py-2 font-semibold">Location</th>
              <th class="px-3 py-2 font-semibold">Type</th>
              <th class="px-3 py-2 font-semibold">Bookings</th>
              <th class="px-3 py-2 font-semibold">Revenue</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
          <tr v-if="pending" v-for="i in 5" :key="i">
            <td v-for="c in 5" :key="c" class="px-3 py-3">
              <div class="h-4 animate-pulse rounded bg-muted/20"></div>
            </td>
          </tr>
          <tr
            v-else-if="analytics?.workspaceBreakdown.length"
            v-for="ws in analytics.workspaceBreakdown"
            :key="ws.workspace_id"
            class="hover:bg-card-bg2/60 odd:bg-card-bg even:bg-card-bg2/40"
          >
            <td class="px-3 py-3 font-medium text-body">
              {{ ws.workspace_name }}
            </td>
            <td class="px-3 py-3 text-body">{{ ws.location_name }}</td>
            <td class="px-3 py-3 text-body">{{ ws.workspace_type }}</td>
            <td class="px-3 py-3 text-body">{{ ws.booking_count }}</td>
            <td class="px-3 py-3 text-body">
              {{ currencyFormatter.format(ws.revenue) }}
            </td>
          </tr>
          <tr v-else>
            <td colspan="5" class="p-10 text-center text-sm text-muted">
              No data for this period.
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>
