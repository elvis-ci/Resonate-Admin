<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage :key="route.fullPath"/>
    </NuxtLayout>
  </div>
</template>
<script setup lang="ts">
// app.vue or a layout
const { theme } = useTheme();
const route = useRoute()

useHead({
  htmlAttrs: {
    'data-theme': theme
  }
})

</script>

