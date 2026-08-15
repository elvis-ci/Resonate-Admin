<script lang="ts" setup>
definePageMeta({
  title: "Overview",
  heading: "Dashboard overview",
  subtext:
    "A snapshot of bookings, activity, and performance across all locations.",
});
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const { data, error } = await supabase.from('workspaces').select('*').limit(1)
console.log('Supabase connected:', !error, error)
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-border bg-alt-bg p-5">
        <h3 class="text-lg font-semibold">Locations</h3>
        <p class="text-muted mt-2">4 sites</p>
      </div>
      <div class="rounded-2xl border border-border bg-alt-bg p-5">
        <h3 class="text-lg font-semibold">Workspaces</h3>
        <p class="text-muted mt-2">32 workspaces</p>
      </div>
      <div class="rounded-2xl border border-border bg-alt-bg p-5">
        <h3 class="text-lg font-semibold">Upcoming bookings</h3>
        <p class="text-muted mt-2">12 in next 7 days</p>
      </div>
      <div class="rounded-2xl border border-border bg-alt-bg p-5">
        <h3 class="text-lg font-semibold">Active users</h3>
        <p class="text-muted mt-2">54</p>
      </div>
    </div>
  </section>
</template>
