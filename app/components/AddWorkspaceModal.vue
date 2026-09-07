<script setup lang="ts">
import type { Database } from "~/types/database";

const props = defineProps<{
  modelValue: boolean;
  locationId: number | null;
  selectedWorkspaceType: string | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  added: [];
}>();

const supabase = useSupabaseClient<Database>();
const dialogRef = ref<HTMLDialogElement | null>(null);const workspaceName = ref("");
const workspaceType = ref("Desk");
const workspaceCapacity = ref(1);
const successful = ref(false);
const isSaving = ref(false);
const savingError = ref<string | null>(null);

const workspaceTypeOptions = [
  "Desk",
  "Office",
  "Meeting room",
  "Private office",
  "Suite",
];

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
  workspaceType.value = "Desk";
  workspaceCapacity.value = 1;
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) resetForm();
  },
);

async function addWorkspace() {
  if (props.locationId == null || !workspaceName.value.trim()) return;

  isSaving.value = true;
  const { error } = await supabase.from("workspaces").insert({
    id: crypto.randomUUID(),
    location_id: props.locationId,
    name: workspaceName.value.trim(),
    type: workspaceType.value,
    capacity: Number(workspaceCapacity.value) || 1,
    status: "active",
    base_price: 0,
    booking_price: 0,
  });
  isSaving.value = false;

  if (error) {
    console.error("Failed to add workspace", error);
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
          <h3 id="add-workspace-title" class="font-semibold">Add New Workspace</h3>
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

        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-heading">Type</span>
            <select
              v-model="workspaceType"
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option
                v-for="type in workspaceTypeOptions"
                :key="type"
                :value="type"
              >
                {{ type }}
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
            :disabled="isSaving || !locationId"
          >
            {{ isSaving ? "Adding..." : "Add workspace" }}
          </button>
        </div>
      </form>
    </section>
  </dialog>
</template>
