<template>
  <div class="min-h-screen bg-alt-bg text-body">
    <div class="mx-auto grid lg:grid-cols-[240px_1fr]">
      <div class="hidden lg:block">
        <div
          class="sticky top-0 h-screen rounded-2xl border border-border bg-card-bg"
        >
          <AdminSidebar />
        </div>
      </div>

      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        aria-hidden="true"
        @click="closeSidebar"
      />

      <div
        id="mobile-sidebar"
        class="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform bg-card-bg shadow-2xl transition-transform duration-300 ease-in-out lg:hidden"
        :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
        :aria-hidden="!isSidebarOpen"
        :inert="!isSidebarOpen"
      >
        <AdminSidebar @close="closeSidebar" />
      </div>

      <main class="space-y-6 px-4 py-6">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-border bg-card-bg px-3 py-2 text-sm font-bold text-body shadow-sm transition-colors hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 lg:hidden"
          :aria-expanded="isSidebarOpen"
          aria-controls="mobile-sidebar"
          aria-label="Toggle navigation menu"
          @click="toggleSidebar"
        >
          <svg
            class="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>Menu</span>
        </button>

        <AdminHeader
          :title="pageMeta.title"
          :heading="pageMeta.heading"
          :subtext="pageMeta.subtext"
          :headerActions = "pageMeta.headerActions"
        />

        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
type HeaderAction = { label: string; onClick: () => void };

const route = useRoute();

const isSidebarOpen = ref(false);
const pageMeta = computed(() => ({
  title: (route.meta.title as string) ?? "Overview",
  heading: (route.meta?.heading as string) || "",
  subtext: (route.meta.subtext as string) ?? "",
  headerActions: route.meta.headerActions as HeaderAction[] | undefined
}));

function closeSidebar() {
  isSidebarOpen.value = false;
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function onEscape(event: KeyboardEvent) {
  if (event.key === "Escape") closeSidebar();
}

watch(() => route.path, closeSidebar);

onMounted(() => window.addEventListener("keydown", onEscape));
onBeforeUnmount(() => window.removeEventListener("keydown", onEscape));
</script>

<style scoped></style>
