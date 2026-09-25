<!-- components/EditBookingModal.vue -->
<script setup lang="ts">
import type { Database } from "~/types/database";

const props = defineProps<{
  modelValue: boolean;
  booking: {
    id: number;
    booking_code: string;
    guest_name: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    workspaces: { name: string | null } | null;
    locations: { location: string } | null;
  } | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  updated: [];
}>();

const supabase = useSupabaseClient<Database>();
const dialogRef = ref<HTMLDialogElement | null>(null);
const bookingDate = ref("");
const startTime = ref("");
const endTime = ref("");
const isSaving = ref(false);
const savingError = ref<string | null>(null);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      bookingDate.value = props.booking?.booking_date ?? "";
      startTime.value = props.booking?.start_time?.slice(0, 5) ?? "";
      endTime.value = props.booking?.end_time?.slice(0, 5) ?? "";
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

function minutesBetween(start: string, end: string) {
  const [sh = 0, sm = 0] = start.split(":").map(Number);
  const [eh = 0, em = 0] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

async function saveReschedule() {
  if (!props.booking) return;

  const duration = minutesBetween(startTime.value, endTime.value);
  if (duration <= 0) {
    savingError.value = "End time must be after start time.";
    return;
  }

  isSaving.value = true;
  savingError.value = null;

  const { error } = await supabase
    .from("workspace_bookings")
    .update({
      booking_date: bookingDate.value,
      start_time: `${startTime.value}:00`,
      end_time: `${endTime.value}:00`,
      duration_minutes: duration,
    })
    .eq("id", props.booking.id);

  isSaving.value = false;

  if (error) {
    if (error.code === "23P01") {
      savingError.value =
        "This time overlaps with another booking for this workspace.";
    } else if (error.code === "42501") {
      savingError.value =
        "Only a super admin can reschedule a booking that has already ended.";
    } else {
      console.error("Failed to reschedule booking", error);
      savingError.value = "Unable to reschedule. Please try again.";
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
    class="w-full max-w-lg mx-auto my-auto rounded-2xl border border-border bg-card-bg2 shadow-xl backdrop:bg-slate-950/50"
    @keydown.esc="close"
    @click.self="close"
    @close="close"
  >
    <section
      v-if="booking"
      class="relative w-full max-w-lg rounded-2xl border border-border bg-alt-bg p-5 shadow-xl"
    >
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 class="font-semibold">Reschedule booking</h3>
          <p class="text-sm text-muted">
            {{ booking.guest_name }} &middot; {{ booking.workspaces?.name }} &middot;
            {{ booking.locations?.location }}
          </p>
          <p class="text-xs text-muted">Ref: {{ booking.booking_code }}</p>
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

      <form class="space-y-4" @submit.prevent="saveReschedule">
        <label class="space-y-2 text-sm">
          <span class="font-medium text-heading">Booking date</span>
          <input
            v-model="bookingDate"
            type="date"
            class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-heading">Start time</span>
            <input
              v-model="startTime"
              type="time"
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-heading">End time</span>
            <input
              v-model="endTime"
              type="time"
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>

        <p v-if="savingError" class="text-sm text-red-700" role="alert">
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