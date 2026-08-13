<script setup lang="ts">
definePageMeta({
  title: "Bookings",
  heading: "Manage bookings",
  subtext: "View, edit, and cancel bookings across locations.",
});
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-4">
      <article class="rounded-2xl border border-border bg-alt-bg p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold">Soho — Meeting Room A</h3>
            <p class="text-muted text-sm">
              Mon 10:00 — 12:00 • Booked by Alice
            </p>
          </div>
          <div class="flex gap-2">
            <button class="secondary">Edit</button>
            <button class="cancel">Cancel</button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
