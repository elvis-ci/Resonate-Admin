<script setup lang="ts">
import type { Database } from "~/types/database";
import { normalizeSupabaseError } from "~/utils/errors.ts";

const props = defineProps<{ modelValue: boolean }>();
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

// Tracks whether the admin has hand-edited the slug — once they have,
// stop overwriting it as they keep typing the location name.
const slugManuallyEdited = ref(false);

//takes the location name and creates a hyphenated  url-friendly slug
function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

//watches for change in location name value and generated a new slug with the new value
watch(locationName, (value) => {
  if (!slugManuallyEdited.value) {
    slug.value = slugify(value);
  }
});

//stops auto generation of slug and allows manual editing of slug value.
// This is useful for when the auto generated slug already exists for a different loocation
function onSlugInput() {
  slugManuallyEdited.value = true;
}

//watches for change in modelValue prop and opens or closes the modal accordingly
//Also resets the form values when the modal is opened or closed
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      isSaving.value = false;
      savingError.value = null;
      locationName.value = "";
      locationCity.value = "";
      priceMultiplier.value = 1;
      openingTime.value = "";
      closingTime.value = "";
      slug.value = "";
      slugManuallyEdited.value = false;
      dialogRef.value?.showModal();
    } else {
      dialogRef.value?.close();
    }
  },
  { immediate: true },
);

function close() {
  if (!isSaving.value) emit("update:modelValue", false);
}

//listens for click on the dialog backdrop and closes the modal if the click is on the backdrop
//this can also be done with a simple @close on the dialog
function onBackDropClick(event: MouseEvent) {
  if (event.target === dialogRef.value) {
    close();
  }
}


async function saveLocation() {
  savingError.value = null;

  if (!locationName.value.trim()) {
    savingError.value = "Location name is required.";
    return;
  }
  if (!slug.value.trim()) {
    savingError.value = "Slug is required.";
    return;
  }
  if (priceMultiplier.value <= 0) {
    savingError.value = "Price multiplier must be greater than 0.";
    return;
  }
  if (
    openingTime.value &&
    closingTime.value &&
    openingTime.value >= closingTime.value
  ) {
    savingError.value = "Closing time must be after opening time.";
    return;
  }

  isSaving.value = true;

  try {
    const { error } = await supabase.from("locations").insert({
      location: locationName.value.trim(),
      city: locationCity.value.trim(),
      slug: slug.value.trim(),
      price_multiplier: priceMultiplier.value,
      open_time: openingTime.value || null,
      close_time: closingTime.value || null,
    });

    if (error) {
      throw error
      return;
    }

    emit("saved");
    close();
  } catch (err) {
   savingError.value = normalizeSupabaseError(err).message;
  } finally {
    isSaving.value = false;
  }
}</script>

<template>
  <dialog
    ref="dialogRef"
    class="w-full max-w-lg mx-auto my-auto rounded-2xl border border-border bg-card-bg2 shadow-xl backdrop:bg-slate-950/50"
    aria-labelledby="add-location-title"
    @click="onBackDropClick"
    @close="close"
  >
    <section
      class="relative w-full max-w-lg rounded-2xl border border-border bg-alt-bg p-5 shadow-xl"
    >
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 id="add-location-title" class="font-semibold">Add location</h3>
          <p class="text-sm text-muted">Create a new location for bookings.</p>
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

      <form class="flex flex-col gap-y-4" @submit.prevent="saveLocation">
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
            <span class="text-destructive text-red-500" aria-hidden="true"
              >*</span
            >
            <span class="font-normal text-muted"
              >— auto-generated from the location name</span
            >
          </span>
          <input
            v-model="slug"
            type="text"
            required
            class="w-full rounded-xl border border-border bg-bg px-3 py-2 font-mono text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="soho"
            @input="onSlugInput"
          />
        </label>

        <div class="grid grid-cols-2 gap-4">
          <label class="flex flex-col gap-y-1 text-sm">
            <span class="font-medium text-body">Opening time</span>
            <input
              v-model="openingTime"
              type="time"
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label class="flex flex-col gap-y-1 text-sm">
            <span class="font-medium text-body">Closing time</span>
            <input
              v-model="closingTime"
              type="time"
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
