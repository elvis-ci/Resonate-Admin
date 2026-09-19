import type { Database } from "~/types/database";

type WorkspaceRecord = Database["public"]["Tables"]["workspaces"]["Row"];
type ScopedWorkspace = Pick<
  WorkspaceRecord,
  | "id"
  | "type"
  | "name"
  | "capacity"
  | "base_price"
  | "booking_price"
  | "location_id"
  | "status"
>;

type ScopedLocation = {
  id: number;
  location: string;
  workspaces: ScopedWorkspace[];
};

export type WorkspaceRow = Pick<
  WorkspaceRecord,
  | "id"
  | "name"
  | "type"
  | "capacity"
  | "base_price"
  | "booking_price"
  | "status"
> & {
  locationId: number;
  locationName: string;
};

export function useWorkspaces(
  scopedLocations: Ref<ScopedLocation[] | null | undefined>,
) {
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

  const workspaceRows = computed<WorkspaceRow[]>(() =>
    (scopedLocations.value ?? []).flatMap((location) =>
      (location.workspaces ?? []).map((workspace) => ({
        id: workspace.id,
        name: workspace.name,
        type: workspace.type,
        capacity: workspace.capacity,
        base_price: workspace.base_price,
        booking_price: workspace.booking_price,
        status: workspace.status,
        locationId: location.id,
        locationName: location.location,
      })),
    ),
  );

  const workspaceTypes = computed(() =>
    [...new Set(workspaceRows.value.map((workspace) => workspace.type))].sort(),
  );

  const workspaceTypesByLocation = computed(() => {
    const map: Record<number, string[]> = {};
    for (const location of scopedLocations.value ?? []) {
      const types = [
        ...new Set(
          (location.workspaces ?? []).map((workspace) => workspace.type),
        ),
      ].sort();
      if (types.length) map[location.id] = types;
    }
    return map;
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

  const filteredWorkspaces = computed(() => {
    const search = searchQuery.value.trim().toLowerCase();

    return workspaceRows.value.filter((workspace) => {
      const status = workspace.status ?? "active";
      const availability = bookedWorkspaceIdSet.value.has(workspace.id)
        ? "booked"
        : "available";

      return (
        (!search || (workspace.name ?? "").toLowerCase().includes(search)) &&
        (!selectedLocation.value ||
          String(workspace.locationId) === selectedLocation.value) &&
        (!selectedWorkspaceType.value ||
          workspace.type === selectedWorkspaceType.value) &&
        (!selectedStatus.value || status === selectedStatus.value) &&
        (!selectedAvailability.value ||
          availability === selectedAvailability.value)
      );
    });
  });

  function formatNextAvailableTime(workspaceId: string) {
    const nextAvailableAt = nextAvailableTimeByWorkspace.value.get(workspaceId);
    if (
      !nextAvailableAt ||
      nextAvailableAt <= availabilityCheckedAt.getTime()
    ) {
      return "Available now";
    }

    return new Intl.DateTimeFormat("en-NG", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(nextAvailableAt));
  }

  return {
    searchQuery,
    selectedLocation,
    selectedWorkspaceType,
    selectedStatus,
    selectedAvailability,
    availabilityPending,
    workspaceRows,
    workspaceTypes,
    workspaceTypesByLocation,
    bookedWorkspaceIdSet,
    filteredWorkspaces,
    formatNextAvailableTime,
  };
}
