<script setup lang="ts">
import type { Database } from "~/types/database";
import { formatWorkspaceType } from "~/utils/formatters";

type Workspace = Pick<
  Database["public"]["Tables"]["workspaces"]["Row"],
  "id" | "name" | "type" | "capacity" | "base_price" | "booking_price"
>;

const props = defineProps<{
  modelValue: boolean;
  workspace: Workspace | null;
  workspaceTypes: string[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [];
}>();

const supabase = useSupabaseClient<Database>();
const dialogRef = ref<HTMLDialogElement | null>(null);
const workspaceName = ref("");
const workspaceType = ref("");
const workspaceCapacity = ref(1);
const workspaceBasePrice = ref(0);
const workspaceBookingPrice = ref(0);
const isSaving = ref(false);
const savingError = ref<string | null>(null);

function populateForm(workspace: Workspace | null) {
  workspaceName.value = workspace?.name ?? "";
  workspaceType.value = workspace?.type ?? "";
  workspaceCapacity.value = workspace?.capacity ?? 1;
  workspaceBasePrice.value = workspace?.base_price ?? 0;
  workspaceBookingPrice.value = workspace?.booking_price ?? 0;
  savingError.value = null;
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      populateForm(props.workspace);
      dialogRef.value?.showModal();
    } else {
      dialogRef.value?.close();
    }
  },
);

watch(
  () => props.workspace,
  (workspace) => {
    if (props.modelValue) populateForm(workspace);
  },
);

function close() {
  if (!isSaving.value) emit("update:modelValue", false);
}

async function saveWorkspace() {
  if (!props.workspace || !workspaceName.value.trim() || !workspaceType.value)
    return;

  isSaving.value = true;
  savingError.value = null;
  const { error } = await supabase
    .from("workspaces")
    .update({
      name: workspaceName.value.trim(),
      type: workspaceType.value,
      capacity: Number(workspaceCapacity.value) || 1,
      base_price: Number(workspaceBasePrice.value) || 0,
      booking_price: Number(workspaceBookingPrice.value) || 0,
    })
    .eq("id", props.workspace.id);
  isSaving.value = false;

  if (error) {
    console.error("Failed to update workspace", error);
    savingError.value = "Unable to update workspace. Please try again.";
    return;
  }

  emit("saved");
  close();
}
</script>

<template>
  <dialog
    ref="dialogRef"
    class="mx-auto my-auto w-full max-w-lg rounded-2xl border border-border bg-card-bg2 shadow-xl backdrop:bg-slate-950/50"
    aria-labelledby="edit-workspace-title"
    @keydown.esc="close"
    @click.self="close"
    @close="close"
  >
    <section
      class="relative rounded-2xl border border-border bg-alt-bg p-5 shadow-xl"
    >
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 id="edit-workspace-title" class="font-semibold">
            Edit workspace
          </h3>
          <p class="text-sm text-muted">
            Update this workspace's details and pricing.
          </p>
        </div>
        <button
          type="button"
          class="absolute right-3 top-3 rounded-sm border border-border px-2 py-1 text-xl font-bold text-primary transition-colors hover:bg-muted/10 hover:text-heading"
          aria-label="Close"
          @click="close"
        >
          x
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="saveWorkspace">
        <label class="space-y-2 text-sm">
          <span class="font-medium text-heading">Workspace name</span>
          <input
            v-model="workspaceName"
            type="text"
            required
            class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-heading">Type</span>
            <select
              v-model="workspaceType"
              required
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option v-for="type in workspaceTypes" :key="type" :value="type">
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
              required
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
              required
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <label class="space-y-2 text-sm">
            <span class="font-medium text-heading">Booking price</span>
            <input
              v-model.number="workspaceBookingPrice"
              min="0"
              step="0.01"
              type="number"
              required
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
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
          <button type="submit" class="primary" :disabled="isSaving">
            {{ isSaving ? "Saving..." : "Save changes" }}
          </button>
        </div>
      </form>
    </section>
  </dialog>
</template>
