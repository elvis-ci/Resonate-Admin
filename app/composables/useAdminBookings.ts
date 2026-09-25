// composables/useAdminBookings.ts
import type { Database } from "~/types/database";

type BookingRow = {
  id: number;
  booking_code: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  start_at: string | null;
  end_at: string | null;
  status: string;
  price_at_booking: number;
  amount_paid: number;
  currency: string;
  notes: string | null;
  location_id: number;
  workspace_id: string;
  workspaces: { id: string; name: string | null; type: string } | null;
  locations: { id: number; location: string } | null;
};

export type BookingTimeStatus = "upcoming" | "ongoing" | "past";

function formatDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Postgres returns naive "timestamp without time zone" values for start_at/end_at
// (e.g. "2026-09-19T14:00:00"). JS parses a Z-less ISO string as browser-local time,
// which matches Lagos wall-clock as long as admins are viewing from Lagos —
// same convention the workspaces page already relies on for availability.
function classifyBooking(
  startAt: string | null,
  endAt: string | null,
  now: Date,
): BookingTimeStatus {
  if (!startAt || !endAt) return "upcoming";
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const nowMs = now.getTime();
  if (end <= nowMs) return "past";
  if (start <= nowMs) return "ongoing";
  return "upcoming";
}

export function useAdminBookings(options: { isSuperAdmin: Ref<boolean> }) {
  const supabase = useSupabaseClient<Database>();

  const dateFilterMode = ref<
    "yesterday" | "today" | "tomorrow" | "custom" | "all"
  >("today");
  const customDate = ref("");
  const selectedLocationId = ref<number | null>(null);
  const statusTab = ref<"all" | "upcoming" | "ongoing" | "past">("all");
  const searchQuery = ref("");
  const page = ref(1);
  const pageSize = 20;
  const now = ref(new Date());

  let clockTimer: ReturnType<typeof setInterval> | undefined;
  onMounted(() => {
    clockTimer = setInterval(() => {
      now.value = new Date();
    }, 30_000);
  });
  onUnmounted(() => {
    if (clockTimer) clearInterval(clockTimer);
  });

  const resolvedDate = computed(() => {
    const today = new Date();
    if (dateFilterMode.value === "all") return null;
    if (dateFilterMode.value === "today") return formatDateInput(today);
    if (dateFilterMode.value === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return formatDateInput(yesterday);
    }
    if (dateFilterMode.value === "tomorrow") {
      const t = new Date(today);
      t.setDate(t.getDate() + 1);
      return formatDateInput(t);
    }
    return customDate.value || formatDateInput(today);
  });

  const effectiveLocationId = computed(() => selectedLocationId.value);
  const {
    data: bookingsRaw,
    pending,
    error,
    refresh,
  } = useLazyAsyncData<BookingRow[]>(
    "admin-bookings",
    async () => {
      let query = supabase.from("workspace_bookings").select(
        `
          id, booking_code, guest_name, guest_email, guest_phone,
          booking_date, start_time, end_time, start_at, end_at,
          status, price_at_booking, amount_paid, currency, notes,
          location_id, workspace_id,
          workspaces ( id, name, type ),
          locations ( id, location )
        `,
      );

      if (resolvedDate.value) {
        query = query.eq("booking_date", resolvedDate.value);
      }

      query = query
        .order("booking_date", { ascending: dateFilterMode.value !== "all" })
        .order("start_time", { ascending: true });

      if (effectiveLocationId.value != null) {
        query = query.eq("location_id", effectiveLocationId.value);
      }

      const search = searchQuery.value.trim();
      if (search) {
        query = query.or(
          `guest_name.ilike.%${search}%,booking_code.ilike.%${search}%`,
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as BookingRow[];
    },
    {
      watch: [resolvedDate, effectiveLocationId, searchQuery],
    },
  );

  const classifiedBookings = computed(() =>
    (bookingsRaw.value ?? []).map((b) => ({
      ...b,
      timeStatus: classifyBooking(b.start_at, b.end_at, now.value),
    })),
  );

  const tabFilteredBookings = computed(() => {
    if (statusTab.value === "all") return classifiedBookings.value;
    return classifiedBookings.value.filter(
      (b) => b.timeStatus === statusTab.value,
    );
  });

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(tabFilteredBookings.value.length / pageSize)),
  );

  const paginatedBookings = computed(() => {
    const start = (page.value - 1) * pageSize;
    return tabFilteredBookings.value.slice(start, start + pageSize);
  });

  watch([resolvedDate, effectiveLocationId, searchQuery, statusTab], () => {
    page.value = 1;
  });

  function canEditBooking(booking: { timeStatus: BookingTimeStatus }) {
    if (booking.timeStatus === "past") return options.isSuperAdmin.value;
    return true;
  }

  return {
    dateFilterMode,
    customDate,
    selectedLocationId,
    statusTab,
    searchQuery,
    page,
    pageSize,
    totalPages,
    pending,
    error,
    refresh,
    paginatedBookings,
    totalFiltered: computed(() => tabFilteredBookings.value.length),
    canEditBooking,
  };
}
