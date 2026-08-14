<script setup lang="ts">
definePageMeta({
  title: "Analytics",
  heading: "Booking analytics",
  subtext: "Track occupancy, utilization, and conversion across all spaces.",
});
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl border border-border bg-alt-bg p-4">
        <p class="text-sm text-muted">Occupancy</p>
        <p class="mt-2 text-2xl font-bold">76%</p>
      </div>
      <div class="rounded-2xl border border-border bg-alt-bg p-4">
        <p class="text-sm text-muted">Bookings this month</p>
        <p class="mt-2 text-2xl font-bold">1,284</p>
      </div>
      <div class="rounded-2xl border border-border bg-alt-bg p-4">
        <p class="text-sm text-muted">Avg. booking value</p>
        <p class="mt-2 text-2xl font-bold">£149</p>
      </div>
      <div class="rounded-2xl border border-border bg-alt-bg p-4">
        <p class="text-sm text-muted">No-show rate</p>
        <p class="mt-2 text-2xl font-bold">3.4%</p>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <article class="rounded-2xl border border-border bg-alt-bg p-5">
        <h3 class="text-lg font-semibold">Utilization by location</h3>
        <ul class="mt-4 space-y-3 text-sm text-body">
          <li class="flex items-center justify-between">
            <span>Soho Studio</span><span>82%</span>
          </li>
          <li class="flex items-center justify-between">
            <span>Canary Wharf</span><span>74%</span>
          </li>
          <li class="flex items-center justify-between">
            <span>Kings Cross</span><span>69%</span>
          </li>
          <li class="flex items-center justify-between">
            <span>Shoreditch</span><span>61%</span>
          </li>
        </ul>
      </article>

      <article class="rounded-2xl border border-border bg-alt-bg p-5">
        <h3 class="text-lg font-semibold">Top booking types</h3>
        <ul class="mt-4 space-y-3 text-sm text-body">
          <li class="flex items-center justify-between">
            <span>Private offices</span><span>42%</span>
          </li>
          <li class="flex items-center justify-between">
            <span>Meeting rooms</span><span>31%</span>
          </li>
          <li class="flex items-center justify-between">
            <span>Hot desks</span><span>18%</span>
          </li>
          <li class="flex items-center justify-between">
            <span>Events</span><span>9%</span>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>
