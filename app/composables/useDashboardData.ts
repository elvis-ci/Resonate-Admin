import type { Database } from "~/types/database";

type DashboardOverviewRow =
  Database["public"]["Functions"]["dashboard_overview_stats"]["Returns"][number];
type TrendRow =
  Database["public"]["Functions"]["dashboard_daily_trend"]["Returns"][number];
type LocationBreakdownRow =
  Database["public"]["Functions"]["dashboard_location_breakdown"]["Returns"][number];
type WorkspaceBreakdownRow =
  Database["public"]["Functions"]["dashboard_workspace_breakdown"]["Returns"][number];
type UpcomingBooking = {
  id: number;
  booking_code: string;
  guest_name: string | null;
  start_at: string | null;
  end_at: string | null;
  status: string;
  workspaces: { name: string | null; location_id: number | null } | null;
};

export function useDashboardData(
  range: Ref<{ start: Date; end: Date }>,
  filterLocationId: Ref<number | null>,
  isSuperAdmin: Ref<boolean>,
) {
  const supabase = useSupabaseClient<Database>();

  const { data: stats, pending, error } = useLazyAsyncData<DashboardOverviewRow | null>(
    "dashboard-overview-stats",
    async () => {
      const { data, error } = await supabase.rpc("dashboard_overview_stats", {
        range_start: range.value.start.toISOString(),
        range_end: range.value.end.toISOString(),
        filter_location_id: filterLocationId.value ?? undefined,
      });
      if (error) throw error;
      return data?.[0] ?? null;
    },
    { watch: [range, filterLocationId] },
  );

  const { data: trend, pending: trendPending } = useLazyAsyncData<TrendRow[]>(
    "dashboard-daily-trend",
    async () => {
      const { data, error } = await supabase.rpc("dashboard_daily_trend", {
        range_start: range.value.start.toISOString(),
        range_end: range.value.end.toISOString(),
        filter_location_id: filterLocationId.value ?? undefined,
      });
      if (error) throw error;
      return data ?? [];
    },
    { watch: [range, filterLocationId] },
  );

  // Note: doesn't take filter_location_id — only meaningful when unfiltered
  // (see showLocationBreakdown below), so it isn't in the watch list either.
  const { data: locationBreakdown, pending: locationBreakdownPending } = useLazyAsyncData<LocationBreakdownRow[]>(
    "dashboard-location-breakdown",
    async () => {
      const { data, error } = await supabase.rpc("dashboard_location_breakdown", {
        range_start: range.value.start.toISOString(),
        range_end: range.value.end.toISOString(),
      });
      if (error) throw error;
      return data ?? [];
    },
    { watch: [range] },
  );

  const { data: workspaceBreakdown, pending: workspaceBreakdownPending } = useLazyAsyncData<WorkspaceBreakdownRow[]>(
    "dashboard-workspace-breakdown",
    async () => {
      const { data, error } = await supabase.rpc("dashboard_workspace_breakdown", {
        range_start: range.value.start.toISOString(),
        range_end: range.value.end.toISOString(),
        filter_location_id: filterLocationId.value ?? undefined,
      });
      if (error) throw error;
      return data ?? [];
    },
    { watch: [range, filterLocationId] },
  );

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

      if (!isSuperAdmin.value && filterLocationId.value !== null) {
        query = query.eq("location_id", filterLocationId.value);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as UpcomingBooking[];
    },
    { watch: [filterLocationId, isSuperAdmin] },
  );

  // ---- Derived state ----
  //only superAdmin sees breakdown by location because regular admin is scoped to particular location
  const showLocationBreakdown = computed(
    () => isSuperAdmin.value && filterLocationId.value === null,
  );

  const revenueDelta = computed(() =>
    stats.value ? delta(stats.value.total_revenue, stats.value.prior_total_revenue) : null,
  );
  const bookingDelta = computed(() =>
    stats.value ? delta(stats.value.booking_count, stats.value.prior_booking_count) : null,
  );
  const avgValueDelta = computed(() =>
    stats.value
      ? delta(stats.value.avg_booking_value, stats.value.prior_avg_booking_value)
      : null,
  );
  const cancelledDelta = computed(() =>
    stats.value ? delta(stats.value.cancelled_count, stats.value.prior_cancelled_count) : null,
  );
  const noShowDelta = computed(() =>
    stats.value ? delta(stats.value.no_show_count, stats.value.prior_no_show_count) : null,
  );

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

  const chartSeries = computed(() => [
    {
      name: "Revenue",
      data: (trend.value ?? []).map((r) => ({ x: new Date(r.day).getTime(), y: r.revenue })),
    },
  ]);

const chartOptions = computed(() => ({
  chart: {
    type: "line",
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    background: "transparent",
    fontFamily: "Nunito, system-ui, sans-serif",
  },

  colors: ["var(--color-primary-hover)"],

  stroke: {
    curve: "smooth",
    width: 2,
  },

  markers: {
    size: 0,
    hover: {
      size: 5,
    },
  },

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
    type: "datetime",

    labels: {
      format: "MMM d",
      style: {
        colors: "var(--color-muted)",
        fontSize: "12px",
        fontWeight: 500,
        fontFamily: "Nunito, system-ui, sans-serif",
      },
    },

    axisBorder: {
      color: "var(--color-border)",
    },

    axisTicks: {
      color: "var(--color-border)",
    },

    tooltip: {
      enabled: false,
    },
  },

  yaxis: {
    labels: {
      formatter: (val: number) => compactCurrencyFormatter.format(val),

      style: {
        colors: "var(--color-muted)",
        fontSize: "12px",
        fontWeight: 500,
        fontFamily: "Nunito, system-ui, sans-serif",
      },
    },
  },

  tooltip: {
    theme: "dark",

    x: {
      format: "MMM d yyyy",
    },

    y: {
      formatter: (val: number) => compactCurrencyFormatter.format(val),
    },
  },

  noData: {
    text: "No revenue data for this period",
    align: "center",
    verticalAlign: "middle",

    style: {
      color: "var(--color-muted)",
      fontFamily: "Nunito, system-ui, sans-serif",
      fontSize: "14px",
    },
  },
}));
  return {
    stats, pending, error, allZero,
    trend, trendPending, chartSeries, chartOptions, locationBreakdownPending,
    locationBreakdown, workspaceBreakdownPending, workspaceBreakdown, showLocationBreakdown,
    upcomingBookings,
    revenueDelta, bookingDelta, avgValueDelta, cancelledDelta, noShowDelta,
  };
}