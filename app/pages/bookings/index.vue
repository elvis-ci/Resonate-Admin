<!-- pages/bookings.vue -->
<script setup lang="ts">
import { formatWorkspaceType } from "~/utils/formatters";

definePageMeta({
  title: "Bookings",
  heading: "Manage bookings",
  subtext: "Browse and manage bookings across your locations.",
  ssr: true,
});

const { isSuperAdmin, adminLocationId, scopeLabel } = useAdminProfile();
const { scopedLocations } = useScopedLocation();

const {
  dateFilterMode,
  customDate,
  selectedLocationId,
  statusTab,
  searchQuery,
  page,
  totalPages,
  pending,
  error,
  refresh,
  paginatedBookings,
  totalFiltered,
  canEditBooking,
} = useAdminBookings({ isSuperAdmin });
const isEditModalOpen = ref(false);
const editingBooking = ref<(typeof paginatedBookings.value)[number] | null>(
  null,
);

function openEdit(booking: (typeof paginatedBookings.value)[number]) {
  if (!canEditBooking(booking)) return;
  editingBooking.value = booking;
  isEditModalOpen.value = true;
}

const statusBadgeClass: Record<string, string> = {
  upcoming: "bg-sky-100 text-sky-700",
  ongoing: "bg-emerald-100 text-emerald-700",
  past: "bg-slate-200 text-slate-700",
};

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});
</script>

<template>
  <section class="space-y-6 pb-4 max-w-screen">
    <article
      class="max-h-screen py-4 overflow-hidden rounded-2xl border border-border bg-alt-bg"
    >
      <div class="border border-border bg-alt-bg p-5 space-y-4">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <label class="block w-full max-w-md">
            <span class="mb-2 block text-sm font-medium text-heading"
              >Search guest or reference</span
            >
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Guest name or booking code..."
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <div
            class="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:max-w-3xl"
          >
            <label class="space-y-2 text-sm">
              <span class="font-medium text-heading">Date</span>
              <select
                v-model="dateFilterMode"
                class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All time</option>
                <option value="yesterday">Yesterday</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="custom">Custom date</option>
              </select>
            </label>

            <label v-if="dateFilterMode === 'custom'" class="space-y-2 text-sm">
              <span class="font-medium text-heading">Choose date</span>
              <input
                v-model="customDate"
                type="date"
                class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label v-if="isSuperAdmin" class="space-y-2 text-sm">
              <span class="font-medium text-heading">Location</span>
              <select
                v-model="selectedLocationId"
                class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body opacity-70"
              />
            </label>

            <label class="space-y-2 text-sm">
              <span class="font-medium text-heading">Status</span>
              <select
                v-model="statusTab"
                class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="past">Past</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <p v-if="error" class="p-5 text-sm text-red-700">
        Unable to load bookings: {{ error.message }}
      </p>

      <div class="sticky top-0 max-h-[80vh] overflow-auto pb-4">
        <table class="w-full min-w-[1000px] text-left text-sm">
          <thead
            class="border-b border-border sticky top-0 z-10 bg-border text-xs uppercase tracking-wider text-muted"
          >
            <tr>
              <th scope="col" class="px-5 py-3 font-semibold">Guest</th>
              <th scope="col" class="px-5 py-3 font-semibold">Location</th>
              <th scope="col" class="px-5 py-3 font-semibold">Workspace</th>
              <th scope="col" class="px-5 py-3 font-semibold">Date / time</th>
              <th scope="col" class="px-5 py-3 font-semibold">Status</th>
              <th scope="col" class="px-5 py-3 font-semibold">Timing</th>
              <th scope="col" class="px-5 py-3 font-semibold">Price</th>
              <th scope="col" class="px-5 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-if="pending" v-for="index in 6" :key="index">
              <td v-for="cell in 8" :key="cell" class="h-15 px-2">
                <div class="h-[50%] bg-muted/20 animate-pulse rounded-sm"></div>
              </td>
            </tr>

            <tr
              v-else-if="paginatedBookings.length"
              v-for="booking in paginatedBookings"
              :key="booking.id"
              class="hover:bg-card-bg2/60 odd:bg-card-bg even:bg-card-bg2/40"
            >
              <td class="px-5 py-4">
                <div class="font-semibold text-heading">
                  {{ booking.guest_name }}
                </div>
                <div class="text-xs text-muted">{{ booking.booking_code }}</div>
              </td>
              <td class="px-5 py-4 text-body">
                {{ booking.locations?.location }}
              </td>
              <td class="px-5 py-4 text-body">
                {{ booking.workspaces?.name }}
                <span class="block text-xs text-muted">
                  {{ formatWorkspaceType(booking.workspaces?.type ?? "") }}
                </span>
              </td>
              <td class="px-5 py-4 text-body">
                {{ booking.booking_date }}
                <span class="block text-xs text-muted">
                  {{ booking.start_time.slice(0, 5) }} -
                  {{ booking.end_time.slice(0, 5) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2 py-1 text-xs font-semibold capitalize"
                  :class="statusBadgeClass[booking.timeStatus]"
                >
                  {{ booking.timeStatus }}
                </span>
              </td>
              <td class="px-5 py-4 text-body capitalize">
                {{ booking.status }}
              </td>
              <td class="px-5 py-4 text-body">
                {{ currencyFormatter.format(booking.price_at_booking) }}
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  v-if="canEditBooking(booking)"
                  type="button"
                  class="border rounded-lg p-2 hover:bg-muted/10"
                  @click="openEdit(booking)"
                >
                  Reschedule
                </button>
                <span v-else class="text-xs text-muted">Ended</span>
              </td>
            </tr>

            <tr v-else>
              <td class="h-15 px-2" colspan="8">
                <div class="p-10 text-center text-sm text-muted">
                  No bookings match the current filters.
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="flex items-center justify-between px-5 pt-4 text-sm text-muted"
      >
        <span>{{ totalFiltered }} bookings</span>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="secondary"
            :disabled="page === 1"
            @click="page = Math.max(1, page - 1)"
          >
            Previous
          </button>
          <span>Page {{ page }} of {{ totalPages }}</span>
          <button
            type="button"
            class="secondary"
            :disabled="page === totalPages"
            @click="page = Math.min(totalPages, page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </article>

    <EditBookingModal
      v-model="isEditModalOpen"
      :booking="editingBooking"
      @updated="refresh"
    />
  </section>
</template>
