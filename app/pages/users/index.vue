<script setup lang="ts">
definePageMeta({
  title: "Users",
  heading: "Manage users",
  subtext: "Invite, remove, and manage user access and roles.",
});
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-4">
      <article class="rounded-2xl border border-border bg-alt-bg p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold">Alice • alice@company.com</h3>
            <p class="text-muted text-sm">Admin</p>
          </div>
          <div class="flex gap-2">
            <button class="secondary">Edit</button>
            <button class="cancel">Remove</button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
