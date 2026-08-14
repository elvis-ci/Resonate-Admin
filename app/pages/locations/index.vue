<script setup lang="ts">
definePageMeta({
  title: "Locations",
  heading: "Manage locations",
  subtext: "View capacity, occupancy, and operational health across each site.",
});
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl border border-border bg-alt-bg p-4">
        <p class="text-sm text-muted">Total sites</p>
        <p class="mt-2 text-2xl font-bold">4</p>
      </div>
      <div class="rounded-2xl border border-border bg-alt-bg p-4">
        <p class="text-sm text-muted">Total seats</p>
        <p class="mt-2 text-2xl font-bold">248</p>
      </div>
      <div class="rounded-2xl border border-border bg-alt-bg p-4">
        <p class="text-sm text-muted">Avg. occupancy</p>
        <p class="mt-2 text-2xl font-bold">68%</p>
      </div>
      <div class="rounded-2xl border border-border bg-alt-bg p-4">
        <p class="text-sm text-muted">Open issues</p>
        <p class="mt-2 text-2xl font-bold">2</p>
      </div>
    </div>

    <div class="grid gap-4">
      <article class="rounded-2xl border border-border bg-alt-bg p-5">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 class="text-lg font-semibold">Soho Studio</h3>
            <p class="text-sm text-muted">12-15 Dover Street • 3 meeting rooms • 44 desks</p>
          </div>
          <div class="flex gap-2">
            <button class="secondary">View details</button>
            <button class="primary">Manage</button>
          </div>
        </div>
      </article>

      <article class="rounded-2xl border border-border bg-alt-bg p-5">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 class="text-lg font-semibold">Canary Wharf</h3>
            <p class="text-sm text-muted">22 Lime Street • 5 meeting rooms • 68 desks</p>
          </div>
          <div class="flex gap-2">
            <button class="secondary">View details</button>
            <button class="primary">Manage</button>
          </div>
        </div>
      </article>

      <article class="rounded-2xl border border-border bg-alt-bg p-5">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 class="text-lg font-semibold">Kings Cross</h3>
            <p class="text-sm text-muted">9 Pancras Square • 2 meeting rooms • 24 desks</p>
          </div>
          <div class="flex gap-2">
            <button class="secondary">View details</button>
            <button class="primary">Manage</button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
