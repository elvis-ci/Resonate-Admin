<template>
  <div class="min-h-screen bg-alt-bg text-body">
    <div class="mx-auto grid lg:grid-cols-[240px_1fr]">
      <div class="hidden lg:block h-full">
        <div
          class="rounded-2xl border border-border bg-card-bg h-screen sticky top-0"
        >
          <AdminSidebar />
        </div>
      </div>

      <main class="px-4 space-y-6">
        <AdminHeader
          :title="pageMeta.title"
          :heading="pageMeta.heading"
          :subtext="pageMeta.subtext"
        />

        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
const route = useRoute();
const pageMeta = computed(() => ({
  title: (route.meta.title as string) ?? "Overview",
  heading: (route.meta.heading as string) ?? "",
  subtext: (route.meta.subtext as string) ?? "",
}));
</script>

<style scoped></style>
