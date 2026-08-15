<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script setup lang="ts">
// app.vue or a layout
const { theme } = useTheme();

useHead({
  htmlAttrs: {
    'data-theme': theme
  }
})

</script>

