<script setup lang="ts">
definePageMeta({
  title: "Workspaces",
  heading: "Manage workspaces",
  subtext: "Create, edit and configure workspaces per location.",
});
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-4">
      <article class="rounded-2xl border border-border bg-alt-bg p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold">Meeting Room A (Soho)</h3>
            <p class="text-muted text-sm">Seats 8 • Projector • VC</p>
          </div>
          <div class="flex gap-2">
            <button class="secondary">Edit</button>
            <button class="cancel">Delete</button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
