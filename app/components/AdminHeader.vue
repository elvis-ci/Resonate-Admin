<template>
  <header class="rounded-2xl border border-border bg-card-bg p-6 shadow-elev">
    <p class="text-sm uppercase tracking-[0.2em] text-primary">{{ title }}</p>
    <h1 class="main-heading mt-4">{{ heading }}</h1>
    <p class="mt-3 text-body max-w-2xl">
      {{subtext}}
    </p>
  </header>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: "Overview" },
  heading: {type: String, default: ''},
  subtext: {type: String, default: ''}
});
// presentational header for admin console
</script>

<style scoped></style>
