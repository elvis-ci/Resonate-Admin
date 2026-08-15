<script setup lang="ts">
definePageMeta({
  title: "Resources",
  heading: "Workspace resources",
  subtext: "Monitor rooms, desks, equipment, and service requests in one view.",
});
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl border border-border bg-alt-bg p-4">
        <p class="text-sm text-muted">Meeting rooms</p>
        <p class="mt-2 text-2xl font-bold">18</p>
      </div>
      <div class="rounded-2xl border border-border bg-alt-bg p-4">
        <p class="text-sm text-muted">Private offices</p>
        <p class="mt-2 text-2xl font-bold">9</p>
      </div>
      <div class="rounded-2xl border border-border bg-alt-bg p-4">
        <p class="text-sm text-muted">Hot desks</p>
        <p class="mt-2 text-2xl font-bold">86</p>
      </div>
      <div class="rounded-2xl border border-border bg-alt-bg p-4">
        <p class="text-sm text-muted">Equipment alerts</p>
        <p class="mt-2 text-2xl font-bold">4</p>
      </div>
    </div>

    <div class="grid gap-4">
      <article class="rounded-2xl border border-border bg-alt-bg p-5">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h3 class="text-lg font-semibold">Meeting Room A • Soho</h3>
            <p class="text-sm text-muted">
              4 seats • Video conferencing • Projector
            </p>
          </div>
          <div class="flex gap-2">
            <button class="secondary">Checkin</button>
            <button class="primary">Maintain</button>
          </div>
        </div>
      </article>

      <article class="rounded-2xl border border-border bg-alt-bg p-5">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h3 class="text-lg font-semibold">Desk Block 2 • Canary Wharf</h3>
            <p class="text-sm text-muted">
              18 desks • 2 monitor issues • Weekly cleaning
            </p>
          </div>
          <div class="flex gap-2">
            <button class="secondary">Logs</button>
            <button class="cancel">Escalate</button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
