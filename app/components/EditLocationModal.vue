<script setup lang="ts">
import type { Database } from "~/types/database";

type Location = {
  id: number;
  location: string;
  city: string;
  open_time: string;
  close_time: string;
  price_multiplier: number;
  slug: string;
};

const props = defineProps<{
  modelValue: boolean;
  locationSlug: string | null;
}>();
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [];
}>();

const supabase = useSupabaseClient<Database>();
const dialogRef = ref<HTMLDialogElement | null>(null);
const locationName = ref("");
const locationCity = ref("");
const priceMultiplier = ref(1);
const openingTime = ref("");
const closingTime = ref("");
const slug = ref("");
const isSaving = ref(false);
const savingError = ref<string | null>(null);
const locationSlug = computed(() => props.locationSlug ?? "");
// Tracks whether the admin has hand-edited the slug — once they have,
// stop overwriting it as they keep typing the location name.

function close() {
  if (!isSaving.value) emit("update:modelValue", false);
}

const { location, isLocationPending, locationError } =
  getLocationDetail(locationSlug);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      isSaving.value = false;
      savingError.value = null;

      dialogRef.value?.showModal();
    } else {
      dialogRef.value?.close();
    }
  },
);

watch(
  location,
  (newLocation) => {
    if (!newLocation || !props.modelValue) return;

    locationName.value = newLocation.location ?? "";
    locationCity.value = newLocation.city ?? "";
    priceMultiplier.value = newLocation.price_multiplier ?? 1;
    openingTime.value = newLocation.open_time ?? "";
    closingTime.value = newLocation.close_time ?? "";
    slug.value = newLocation.slug ?? "";
  },
  { immediate: true },
);

// async function saveLocation() {
//   if (!locationSlug || !locationName.value.trim()) return;

//   isSaving.value = true;
//   const { error } = await supabase
//     .from("locations")
//     .update({
//       location: locationName.value.trim(),
//       city: locationCity.value.trim(),
//     })
//     .eq("id", props.location.id);
//   isSaving.value = false;

//   if (error) {
//     console.error("Failed to save location", error);
//     return;
//   }

//   emit("saved");
//   close();
// }
</script>

<template>
  <dialog
    ref="dialogRef"
    class="w-full max-w-lg mx-auto my-auto rounded-2xl border border-border bg-card-bg2 shadow-xl backdrop:bg-slate-950/50"
    aria-labelledby="edit-location"
    @keydown.esc="close"
    @click.self="close"
    @close="close"
  >
    <section
      class="relative w-full max-w-lg rounded-2xl border border-border bg-alt-bg p-5 shadow-xl"
    >
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 id="edit-location-title" class="font-semibold">Edit location</h3>
          <p class="text-sm text-muted">Update this site's basic details.</p>
        </div>
        <button
          type="button"
          class="absolute top-3 right-3 rounded-sm py-1 px-2 text-xl font-bold border border-border text-primary transition-colors hover:bg-muted/10 hover:text-heading"
          aria-label="Close"
          @click="close"
        >
          x
        </button>
      </div>

      <div v-if="isLocationPending">
        <div class="flex flex-col gap-y-4">
          <div class="h-10 w-full animate-pulse rounded-lg bg-muted/10" />
          <div class="h-10 w-full animate-pulse rounded-lg bg-muted/10" />
          <div class="h-10 w-full animate-pulse rounded-lg bg-muted/10" />
          <div
            class="grid grid-cols-2 gap-4 h-10 rounded-lg"
          >
            <div class="h-10 w-full animate-pulse rounded-lg bg-muted/10" />
            <div class="h-10 w-full animate-pulse rounded-lg bg-muted/10" />
          </div>
                    <div class="h-10 w-full animate-pulse rounded-lg bg-muted/10" />

        </div>
      </div>
      <form v-else class="flex flex-col gap-y-4" @submit.prevent="">
        <label class="flex flex-col gap-y-1 text-sm">
          <span class="font-medium text-body">
            Location name
            <span class="text-destructive text-red-500" aria-hidden="true"
              >*</span
            >
          </span>
          <input
            v-model="locationName"
            type="text"
            required
            class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Soho"
            autofocus
          />
        </label>

        <label class="flex flex-col gap-y-1 text-sm">
          <span class="font-medium text-body">City</span>
          <input
            v-model="locationCity"
            type="text"
            class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="London"
          />
        </label>

        <label class="flex flex-col gap-y-1 text-sm">
          <span class="font-medium text-body">
            Slug
            <span class="font-normal text-muted">— cannot edit</span>
          </span>
          <input
            v-model="slug"
            type="text"
            required
            class="w-full rounded-xl border border-border bg-card-bg2 px-3 py-2 font-mono text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="soho"
            readonly
          />
        </label>

        <div class="grid grid-cols-2 gap-4">
          <label class="flex flex-col gap-y-1 text-sm">
            <span class="font-medium text-body">Opening time</span>
            <input
              v-model="openingTime"
              type="time"
              min="00:00"
              max="23:00"
              step="3600"
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label class="flex flex-col gap-y-1 text-sm">
            <span class="font-medium text-body">Closing time</span>
            <input
              v-model="closingTime"
              type="time"
              min="12:00"
              max="23:00"
              step="3600"
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>

        <label class="flex flex-col gap-y-1 text-sm">
          <span class="font-medium text-body">
            Price multiplier
            <span class="font-normal text-muted">— 1 = standard pricing</span>
          </span>
          <input
            v-model.number="priceMultiplier"
            type="number"
            min="0.01"
            step="0.01"
            class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <div :aria-live="savingError ? 'assertive' : 'off'" class="p-2">
          <p v-if="savingError" class="text-sm error text-destructive">
            {{ savingError }}
          </p>
        </div>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="secondary"
            :disabled="isSaving"
            @click="close"
          >
            Cancel
          </button>
          <button type="submit" class="primary" :disabled="isSaving">
            {{ isSaving ? "Saving..." : "Save location" }}
          </button>
        </div>
      </form>
    </section>
  </dialog>
</template>
