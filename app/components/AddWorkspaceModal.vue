<script setup lang="ts">
import type { Database } from "~/types/database";
import { formatWorkspaceType } from "~/utils/formatters";
const props = defineProps<{
  modelValue: boolean;
  locationId: number | null;
  locations?: ReadonlyArray<{ id: number; location: string }>;
  workspaceTypesByLocation?: Record<number, string[]>;
  allWorkspaceTypes?: string[];
  selectedWorkspaceType: string | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  added: [];
}>();

const supabase = useSupabaseClient<Database>();
const dialogRef = ref<HTMLDialogElement | null>(null);
const workspaceName = ref("");
const workspaceType = ref(props.selectedWorkspaceType || "Desk");
const selectedLocationId = ref<number | null>(props.locationId);
const workspaceCapacity = ref(1);
const workspaceBasePrice = ref(0);
const successful = ref(false);
const isSaving = ref(false);
const savingError = ref<string | null>(null);
const availableWorkspaceTypes = computed(() => {
  const scoped =
    selectedLocationId.value != null
      ? props.workspaceTypesByLocation?.[selectedLocationId.value]
      : undefined;
  return scoped?.length ? scoped : (props.allWorkspaceTypes ?? []);
});

watch(availableWorkspaceTypes, (types) => {
  if (types.length && !types.includes(workspaceType.value)) {
    workspaceType.value = types[0] ?? "";
  }
});
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      dialogRef.value?.showModal();
    } else {
      dialogRef.value?.close();
      resetForm();
    }
  },
);

function close() {
  if (!isSaving.value) emit("update:modelValue", false);
  successful.value = false;
}

function resetForm() {
  workspaceName.value = "";
  selectedLocationId.value =
    props.locationId ??
    (props.locations?.length === 1 ? (props.locations[0]?.id ?? null) : null);
  workspaceType.value =
    props.selectedWorkspaceType &&
    availableWorkspaceTypes.value.includes(props.selectedWorkspaceType)
      ? props.selectedWorkspaceType
      : (availableWorkspaceTypes.value[0] ?? "");
  workspaceCapacity.value = 1;
  workspaceBasePrice.value = 0;
  savingError.value = null;
}
watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) resetForm();
  },
);

async function addWorkspace() {
  if (selectedLocationId.value == null || !workspaceName.value.trim()) return;

  isSaving.value = true;
  savingError.value = null;
  const { error } = await supabase.from("workspaces").insert({
    id: crypto.randomUUID(),
    location_id: selectedLocationId.value,
    name: workspaceName.value.trim(),
    type: workspaceType.value,
    capacity: Number(workspaceCapacity.value) || 1,
    status: "active",
    base_price: Number(workspaceBasePrice.value) || 0,
  });
  isSaving.value = false;

  if (error) {
    console.error("Failed to add workspace", error);
    savingError.value = "Unable to add workspace. Please try again.";
    return;
  }

  emit("added");
  close();
}
</script>

<template>
  <dialog
    ref="dialogRef"
    class="w-full max-w-lg mx-auto my-auto rounded-2xl border border-border bg-card-bg2 shadow-xl backdrop:bg-slate-950/50"
    aria-labelledby="Add New Workspace"
    @keydown.esc="close"
    @click.self="close"
    @close="close"
  >
    <section
      v-if="successful"
      class="relative w-full max-w-lg rounded-2xl border border-border bg-alt-bg p-5 shadow-xl"
    >
      <div class="mb-5">
        <h3 class="mb-2 font-semibold text-center">Save Successful</h3>
        <p class="text-sm text-muted text-center">
          Workspace {{ workspaceName }} has been added successfully.
        </p>
      </div>
      <div class="flex items-center justify-center">
        <button @click="close" class="primary">Close</button>
      </div>
    </section>

    <section
      v-else
      class="relative w-full max-w-lg rounded-2xl border border-border bg-alt-bg p-5 shadow-xl"
    >
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 id="add-workspace-title" class="font-semibold">
            Add New Workspace
          </h3>
          <p class="text-sm text-muted">
            Create a new workspace for this location.
          </p>
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

      <form class="space-y-4" @submit.prevent="addWorkspace">
        <label class="space-y-2 text-sm">
          <span class="font-medium text-heading">Workspace name</span>
          <input
            v-model="workspaceName"
            type="text"
            class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Meeting Room A"
            autofocus
          />
        </label>

        <label v-if="(locations?.length ?? 0) > 1" class="space-y-2 text-sm">
          <span class="font-medium text-heading">Location</span>
          <select
            v-model="selectedLocationId"
            class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option :value="null" disabled>Select a location</option>
            <option
              v-for="location in locations"
              :key="location.id"
              :value="location.id"
            >
              {{ location.location }}
            </option>
          </select>
        </label>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-heading">Type</span>
            <select
              v-model="workspaceType"
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option
                v-for="type in availableWorkspaceTypes"
                :key="type"
                :value="type"
              >
                {{ formatWorkspaceType(type) }}
              </option>
            </select>
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-heading">Capacity</span>
            <input
              v-model.number="workspaceCapacity"
              min="1"
              type="number"
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-heading">Base price</span>
            <input
              v-model.number="workspaceBasePrice"
              min="0"
              step="0.01"
              type="number"
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="0.00"
            />
          </label>
        </div>

        <p v-if="savingError" class="text-sm text-red-700" role="alert">
          {{ savingError }}
        </p>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="secondary"
            :disabled="isSaving"
            @click="close"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="primary"
            :disabled="isSaving || !selectedLocationId"
          >
            {{ isSaving ? "Adding..." : "Add workspace" }}
          </button>
        </div>
      </form>
    </section>
  </dialog>
</template>
