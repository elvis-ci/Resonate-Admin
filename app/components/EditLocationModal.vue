<script setup lang="ts">
import type { Database } from "~/types/database";

type Location = { id: number; location: string; city: string };

const props = defineProps<{ modelValue: boolean; location: Location | null }>();
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [];
}>();

const supabase = useSupabaseClient<Database>();
const locationName = ref("");
const locationCity = ref("");
const isSaving = ref(false);

function close() {
  if (!isSaving.value) emit("update:modelValue", false);
}

watch(
  () => [props.modelValue, props.location] as const,
  ([isOpen, location]) => {
    if (isOpen && location) {
      locationName.value = location.location;
      locationCity.value = location.city;
    }
  },
  { immediate: true },
);

async function saveLocation() {
  if (!props.location || !locationName.value.trim()) return;

  isSaving.value = true;
  const { error } = await supabase
    .from("locations")
    .update({ location: locationName.value.trim(), city: locationCity.value.trim() })
    .eq("id", props.location.id);
  isSaving.value = false;

  if (error) {
    console.error("Failed to save location", error);
    return;
  }

  emit("saved");
  close();
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-location-title"
      @keydown.esc="close"
    >
      <button type="button" class="absolute inset-0 cursor-default bg-slate-950/50" aria-label="Close edit location dialog" @click="close"></button>
      <section class="relative w-full max-w-lg rounded-2xl border border-border bg-alt-bg p-5 shadow-xl">
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 id="edit-location-title" class="font-semibold">Edit location</h3>
            <p class="text-sm text-muted">Update this site's basic details.</p>
          </div>
          <button type="button" class="secondary" aria-label="Close" @click="close">Close</button>
        </div>

        <form class="space-y-4" @submit.prevent="saveLocation">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-heading">Location name</span>
            <input v-model="locationName" type="text" class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Soho" autofocus />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-heading">City</span>
            <input v-model="locationCity" type="text" class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="London" />
          </label>
          <div class="flex justify-end gap-3">
            <button type="button" class="secondary" :disabled="isSaving" @click="close">Cancel</button>
            <button type="submit" class="primary" :disabled="isSaving || !locationName.trim()">
              {{ isSaving ? "Saving..." : "Save location" }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>
