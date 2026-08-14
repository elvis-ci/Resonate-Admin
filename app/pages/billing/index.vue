<script setup lang="ts">
definePageMeta({
  title: "Billing",
  heading: "Billing & invoices",
  subtext: "Review subscriptions, invoice status, and payment collections.",
});
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-border bg-alt-bg p-4">
        <p class="text-sm text-muted">Outstanding</p>
        <p class="mt-2 text-2xl font-bold">£4,280</p>
      </div>
      <div class="rounded-2xl border border-border bg-alt-bg p-4">
        <p class="text-sm text-muted">Paid this month</p>
        <p class="mt-2 text-2xl font-bold">£18,460</p>
      </div>
      <div class="rounded-2xl border border-border bg-alt-bg p-4">
        <p class="text-sm text-muted">Refunds</p>
        <p class="mt-2 text-2xl font-bold">£620</p>
      </div>
    </div>

    <div class="grid gap-4">
      <article class="rounded-2xl border border-border bg-alt-bg p-5">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h3 class="text-lg font-semibold">INV-1024 • Northbridge Group</h3>
            <p class="text-sm text-muted">
              Due 26 Aug 2026 • £2,840 • Paid via Stripe
            </p>
          </div>
          <div class="flex gap-2">
            <button class="secondary">Download</button>
            <button class="primary">Send reminder</button>
          </div>
        </div>
      </article>

      <article class="rounded-2xl border border-border bg-alt-bg p-5">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h3 class="text-lg font-semibold">INV-1018 • Studio Finch</h3>
            <p class="text-sm text-muted">
              Due 18 Aug 2026 • £1,120 • Awaiting payment
            </p>
          </div>
          <div class="flex gap-2">
            <button class="secondary">View</button>
            <button class="cancel">Retry charge</button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
