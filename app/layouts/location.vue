<script setup lang="ts">
type HeaderAction = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
};

const route = useRoute();
const isSidebarOpen = ref(false);

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const pageMeta = computed(() => ({
  title: (route.meta.title as string) ?? "Location",
  heading: slugToTitle(route.params.locationSlug as string),
  subtext: (route.meta.subtext as string) ?? "",
  headerActions: route.meta.headerActions as HeaderAction[] | undefined,
}));

function closeSidebar() {
  isSidebarOpen.value = false;
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

watch(() => route.path, closeSidebar);
</script>

<template>
  <div class="min-h-screen bg-alt-bg text-body">
    <div class="mx-auto grid lg:grid-cols-[240px_1fr]">
      <aside class="hidden lg:block">
        <div
          class="sticky top-0 h-screen rounded-2xl border border-border bg-card-bg"
        >
          <AdminSidebar />
        </div>
      </aside>

      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        @click="closeSidebar"
      />
      <aside
        id="mobile-sidebar"
        class="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-card-bg shadow-2xl transition-transform duration-300 lg:hidden"
        :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <AdminSidebar @close="closeSidebar" />
      </aside>

      <main class="min-w-0 space-y-6 px-4 py-6">
        <button
          type="button"
          class="secondary lg:hidden"
          :aria-expanded="isSidebarOpen"
          @click="toggleSidebar"
        >
          Menu
        </button>
        <AdminHeader
          :title="pageMeta.title"
          :heading="pageMeta.heading"
          :subtext="pageMeta.subtext"
          :header-actions="pageMeta.headerActions"
        />
        <slot />
      </main>
    </div>
  </div>
</template>
