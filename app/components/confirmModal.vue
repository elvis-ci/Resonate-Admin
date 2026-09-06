<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isProcessing?: boolean;
  danger?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) dialogRef.value?.showModal();
    else dialogRef.value?.close();
  },
);

function close() {
  if (!props.isProcessing) emit("update:modelValue", false);
}

function handleConfirm() {
  emit("confirm");
}
</script>

<template>
  <dialog
    ref="dialogRef"
    class="w-full max-w-sm mx-auto my-auto rounded-2xl border border-border bg-alt-bg p-5 shadow-xl backdrop:bg-slate-950/50"
    aria-labelledby="confirm-modal-title"
    @keydown.esc="close"
    @click.self="close"
    @close="close"
  >
  <button @click="close" class=" absolute top-3 right-3 text-primary hover:text-primary-hover">
    x
  </button>
    <h3 id="confirm-modal-title" class="font-semibold text-heading ">
      {{ title }}
    </h3>
    <p class="mt-2 text-sm text-muted">
      {{ message }}
    </p>

    <div v-if="error" :aria-live="'assertive'" class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {{ error }}
    </div>

    <div class="mt-5 flex justify-end gap-3">
      <button
        type="button"
        class="secondary"
        :disabled="isProcessing"
        @click="close"
      >
        {{ cancelLabel ?? "Cancel" }}
      </button>
      <button
        type="button"
        :class="danger ? 'primary bg-red-600 hover:bg-red-700 border-red-600' : 'primary'"
        :disabled="isProcessing"
        @click="handleConfirm"
      >
        {{ isProcessing ? "Working..." : (confirmLabel ?? "Confirm") }}
      </button>
    </div>
  </dialog>
</template>