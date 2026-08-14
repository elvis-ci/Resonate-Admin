<script setup lang="ts">
definePageMeta({
  title: "Booking calendar",
  heading: "Schedule overview",
  subtext:
    "Review daily capacity, conflicts, and upcoming reservations by space.",
});
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-2xl border border-border bg-alt-bg p-5">
      <h3 class="text-lg font-semibold">This week</h3>
      <div class="mt-4 grid gap-3 md:grid-cols-7">
        <div class="rounded-xl border border-border bg-card-bg p-3">
          <p class="text-xs uppercase tracking-wide text-muted">Mon</p>
          <p class="mt-2 text-xl font-bold">24</p>
          <p class="text-xs text-muted">18 bookings</p>
        </div>
        <div class="rounded-xl border border-border bg-card-bg p-3">
          <p class="text-xs uppercase tracking-wide text-muted">Tue</p>
          <p class="mt-2 text-xl font-bold">25</p>
          <p class="text-xs text-muted">14 bookings</p>
        </div>
        <div class="rounded-xl border border-border bg-card-bg p-3">
          <p class="text-xs uppercase tracking-wide text-muted">Wed</p>
          <p class="mt-2 text-xl font-bold">26</p>
          <p class="text-xs text-muted">21 bookings</p>
        </div>
        <div class="rounded-xl border border-border bg-card-bg p-3">
          <p class="text-xs uppercase tracking-wide text-muted">Thu</p>
          <p class="mt-2 text-xl font-bold">27</p>
          <p class="text-xs text-muted">16 bookings</p>
        </div>
        <div class="rounded-xl border border-border bg-card-bg p-3">
          <p class="text-xs uppercase tracking-wide text-muted">Fri</p>
          <p class="mt-2 text-xl font-bold">28</p>
          <p class="text-xs text-muted">22 bookings</p>
        </div>
        <div class="rounded-xl border border-border bg-card-bg p-3">
          <p class="text-xs uppercase tracking-wide text-muted">Sat</p>
          <p class="mt-2 text-xl font-bold">29</p>
          <p class="text-xs text-muted">8 bookings</p>
        </div>
        <div class="rounded-xl border border-border bg-card-bg p-3">
          <p class="text-xs uppercase tracking-wide text-muted">Sun</p>
          <p class="mt-2 text-xl font-bold">30</p>
          <p class="text-xs text-muted">4 bookings</p>
        </div>
      </div>
    </div>

    <div class="grid gap-4">
      <article class="rounded-2xl border border-border bg-alt-bg p-5">
        <h3 class="text-lg font-semibold">Priority conflicts</h3>
        <p class="mt-2 text-sm text-muted">
          2 rooms overlap during the 1:30 PM slot. Review before final
          confirmation.
        </p>
      </article>
    </div>
  </section>
</template>
