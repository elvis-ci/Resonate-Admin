<script setup lang="ts">
definePageMeta({
  title: "Settings",
  heading: "Workspace settings",
  subtext: "Configure general preferences, team access, and booking policies.",
});
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-4 md:grid-cols-2">
      <article class="rounded-2xl border border-border bg-alt-bg p-5">
        <h3 class="text-lg font-semibold">Booking rules</h3>
        <ul class="mt-3 space-y-2 text-sm text-body">
          <li>• 30-minute minimum booking length</li>
          <li>• 2-hour cancellation window</li>
          <li>• Automatic confirmations enabled</li>
        </ul>
      </article>

      <article class="rounded-2xl border border-border bg-alt-bg p-5">
        <h3 class="text-lg font-semibold">Access control</h3>
        <ul class="mt-3 space-y-2 text-sm text-body">
          <li>• 3 admin roles active</li>
          <li>• 12 staff members with restricted access</li>
          <li>• SSO required for external guests</li>
        </ul>
      </article>
    </div>

    <article class="rounded-2xl border border-border bg-alt-bg p-5">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-semibold">Workspace defaults</h3>
          <p class="mt-2 text-sm text-muted">
            Default pricing, booking capacity, and email notifications.
          </p>
        </div>
        <button class="primary">Update defaults</button>
      </div>
    </article>
  </section>
</template>
