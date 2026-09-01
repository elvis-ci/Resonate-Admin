<template>
  <header
    class="flex justify-between rounded-2xl border border-border bg-card-bg p-4 shadow-elev"
  >
    <div>
      <p class="text-sm uppercase tracking-[0.2em] primary text-primary">
        {{ title }}
      </p>
      <h1 class="main-heading mt-2">{{ heading }}</h1>
      <p class="mt-2 text-body max-w-2xl">
        {{ subtext }}
      </p>
    </div>
    <div v-if="headerActions" class="flex items-center gap-4">
      <button v-for="headerAction in headerActions" :key="headerAction.label" :class="headerAction.variant == 'secondary' ? 'secondary' : 'primary'" @click="headerAction.onClick">
        {{ headerAction.label }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
type HeaderAction = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
};

defineProps<{
  title: string;
  heading: string;
  subtext: string;
  headerActions?: HeaderAction[]
}>();
</script>

<style scoped></style>
