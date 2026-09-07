<script setup lang="ts">
import requirePermission from "~/middleware/require-permission";
import type { LocationSummary } from "~/composables/useLocations";

definePageMeta({
  title: "Locations",
  heading: "Manage locations",
  subtext: "View capacity, occupancy, and operational health across each site.",
  ssr: false,
  middleware: requirePermission,
  requiredPermission: "manage_locations",
});

const {
  pending: locationPending,
  locationSummary,
  locationsError,
  refresh,
} = useLocations(); //
const isEditLocationModalOpen = ref(false);

const locationSlug = ref("");

function editLocation(slug: string) {
  isEditLocationModalOpen.value = true;
  locationSlug.value = slug;
}

const locationDataCards = computed(() => [
  {
    title: "Total sites",
    info: locationSummary?.value?.length ?? 0,
  },
  {
    title: "Total seats",
    info: 92,
  },
  {
    title: "Avg. occupancy",
    info: "75%",
  },
  {
    title: "Open issues",
    info: 0,
  },
]);

const isAddLocationModalOpen = ref(false);
const route = useRoute();

//add header button
route.meta.headerActions = [
  {
    label: "Add Location",
    onClick: () => {
      isAddLocationModalOpen.value = true;
    },
    variant: "primary",
  },
];

// const locationDetails = computed
</script>

<template>
  <section class="space-y-6">
    <div
      v-if="locationPending"
      class="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
    >
      <div
        v-for="n in 4"
        :key="n"
        class="rounded-2xl bg-card-bg p-5 shadow-elev animate-pulse"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 space-y-3">
            <div class="h-3 w-20 rounded bg-muted/20"></div>
            <div class="h-8 w-28 rounded bg-muted/20"></div>
          </div>

          <div class="h-12 w-12 rounded-lg bg-primary/10"></div>
        </div>
      </div>
    </div>
    <div v-else class="grid gap-4 grid-cols-2 xl:grid-cols-4">
      <div
        v-for="card in locationDataCards"
        key="index"
        class="rounded-2xl bg-card-bg p-5 hover:border-primary/30 transition-colors shadow-elev"
      >
        <div class="flex flex-col h-full justify-between ">
          <p class="text-sm text-muted">{{ card.title }}</p>
          <p class="mt-2 lg:text-2xl font-bold">{{ card.info }}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="grid gap-4 pb-4">
    <article
      v-for="location in locationSummary"
      :key="location.id"
      class="rounded-2xl border border-border bg-alt-bg px-5 py-2"
    >
      <div
        class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h3 class="font-semibold">{{ location.location }}</h3>
          <p class="text-sm text-muted">
            WorkspaceTypes: {{ location.types }} • Total Units:
            {{ location.totalUnits }}
          </p>
        </div>
        <div class="w-full  flex items-end gap-2">
          <NuxtLink :to="`/locations/${location.slug}`" class="secondary"
            >View details</NuxtLink
          >
          <button type="button" class="primary" @click="editLocation(location.slug)">
            Manage
          </button>
        </div>
      </div>
    </article>
  </section>

  <EditLocationModal
    v-model="isEditLocationModalOpen"
    :locationSlug="locationSlug"
    @saved="refresh"
  />
  <AddLocationModal v-model="isAddLocationModalOpen" @saved="refresh" />
</template>
