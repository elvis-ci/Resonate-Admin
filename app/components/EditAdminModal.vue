<script setup lang="ts">
import type { Database } from "~/types/database";

const props = defineProps<{
  modelValue: boolean;
  admin: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: string;
    location_id: number | null;
  } | null;
  locations?: ReadonlyArray<{ id: number; location: string }>;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  updated: [];
}>();

const supabase = useSupabaseClient<Database>();
const dialogRef = ref<HTMLDialogElement | null>(null);
const fullName = ref("");
const phone = ref("");
const role = ref<"admin" | "super_admin">("admin");
const locationId = ref<number | null>(null);
const isSaving = ref(false);
const savingError = ref<string | null>(null);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.admin) {
      fullName.value = props.admin.full_name ?? "";
      phone.value = props.admin.phone ?? "";
      role.value = props.admin.role as "admin" | "super_admin";
      locationId.value = props.admin.location_id;
      savingError.value = null;
      dialogRef.value?.showModal();
    } else {
      dialogRef.value?.close();
    }
  },
);

function close() {
  if (!isSaving.value) emit("update:modelValue", false);
}

async function save() {
  if (!props.admin) return;
  if (role.value === "admin" && locationId.value == null) {
    savingError.value = "A location is required for the admin role.";
    return;
  }

  isSaving.value = true;
  savingError.value = null;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName.value.trim() || null,
      phone: phone.value.trim() || null,
      role: role.value,
      location_id: role.value === "super_admin" ? null : locationId.value,
    })
    .eq("id", props.admin.id);

  isSaving.value = false;

  if (error) {
    if (error.code === "42501") {
      savingError.value = "You don't have permission to change role or location.";
    } else {
      console.error("Failed to update admin", error);
      savingError.value = "Unable to save changes. Please try again.";
    }
    return;
  }

  emit("updated");
  emit("update:modelValue", false);
}
</script>

<template>
  <dialog
    ref="dialogRef"
    class="w-full max-w-lg mx-auto my-auto rounded-2xl bg-alt-bg2 shadow-elev backdrop:bg-slate-950/50"
    @keydown.esc="close"
    @click.self="close"
    @close="close"
  >
    <section v-if="admin" class="relative w-full max-w-lg rounded-2xl bg-alt-bg2 p-5 shadow-elev">
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 class="font-semibold text-heading">Edit admin</h3>
          <p class="text-sm text-muted">{{ admin.email }}</p>
        </div>
        <button
          type="button"
          class="absolute top-3 right-3 rounded-sm py-1 px-2 text-xl font-bold text-primary transition-colors hover:bg-muted/10"
          aria-label="Close"
          @click="close"
        >
          x
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="save">
        <label class="space-y-2 text-sm">
          <span class="font-medium text-heading">Full name</span>
          <input
            v-model="fullName"
            type="text"
            class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label class="space-y-2 text-sm">
          <span class="font-medium text-heading">Phone</span>
          <input
            v-model="phone"
            type="tel"
            class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-heading">Role</span>
            <select
              v-model="role"
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super admin</option>
            </select>
          </label>

          <label v-if="role === 'admin'" class="space-y-2 text-sm">
            <span class="font-medium text-heading">Location</span>
            <select
              v-model="locationId"
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option :value="null" disabled>Select a location</option>
              <option v-for="location in locations" :key="location.id" :value="location.id">
                {{ location.location }}
              </option>
            </select>
          </label>
        </div>

        <p v-if="savingError" class="text-sm text-error-text" role="alert">
          {{ savingError }}
        </p>

        <div class="flex justify-end gap-3">
          <button type="button" class="secondary" :disabled="isSaving" @click="close">
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