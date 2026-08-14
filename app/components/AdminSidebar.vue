<template>
  <aside
    class="py-4 px-2.5 h-full overflow-y-scroll flex flex-col justify-between bg-card-bg border-r border-card-border"
  >
    <nav class="space-y-2 text-sm">
      <ul class="space-y-1">
        <li>
          <NuxtLink
            to="/"
            :class="[
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isActive('/')
                ? 'text-primary-hover font-bold bg-primary/5'
                : 'hover:bg-primary/5',
            ]"
          >
            <span class="w-5 h-5 text-primary" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path
                  d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9z"
                />
              </svg>
            </span>
            <span>Overview</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/locations"
            :class="[
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isActive('/locations')
                ? 'text-primary-hover font-bold bg-primary/5'
                : 'hover:bg-primary/5',
            ]"
          >
            <span class="w-5 h-5 text-primary" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 21s8-4.5 8-10A8 8 0 104 11c0 5.5 8 10 8 10z" />
                <circle cx="12" cy="11" r="2.5" />
              </svg>
            </span>
            <span>Locations</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/workspaces"
            :class="[
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isActive('/workspaces')
                ? 'text-primary-hover font-bold bg-primary/5'
                : 'hover:bg-primary/5',
            ]"
          >
            <span class="w-5 h-5 text-primary" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="8" height="8" rx="1" />
                <rect x="13" y="3" width="8" height="8" rx="1" />
                <rect x="3" y="13" width="8" height="8" rx="1" />
                <rect x="13" y="13" width="8" height="8" rx="1" />
              </svg>
            </span>
            <span>Workspaces</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/bookings"
            :class="[
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isActive('/bookings')
                ? 'text-primary-hover font-bold bg-primary/5'
                : 'hover:bg-primary/5',
            ]"
          >
            <span class="w-5 h-5 text-primary" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </span>
            <span>Bookings</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/analytics"
            :class="[
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isActive('/analytics')
                ? 'text-primary-hover font-bold bg-primary/5'
                : 'hover:bg-primary/5',
            ]"
          >
            <span class="w-5 h-5 text-primary" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M4 18V8M10 18V4M16 18v-6M22 18V10" />
              </svg>
            </span>
            <span>Analytics</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/resources"
            :class="[
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isActive('/resources')
                ? 'text-primary-hover font-bold bg-primary/5'
                : 'hover:bg-primary/5',
            ]"
          >
            <span class="w-5 h-5 text-primary" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 2v20M2 12h20" />
                <circle cx="12" cy="12" r="7" />
              </svg>
            </span>
            <span>Resources</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/billing"
            :class="[
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isActive('/billing')
                ? 'text-primary-hover font-bold bg-primary/5'
                : 'hover:bg-primary/5',
            ]"
          >
            <span class="w-5 h-5 text-primary" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 7h18v10H3z" />
                <path d="M3 10h18" />
              </svg>
            </span>
            <span>Billing</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/users"
            :class="[
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isActive('/users')
                ? 'text-primary-hover font-bold bg-primary/5'
                : 'hover:bg-primary/5',
            ]"
          >
            <span class="w-5 h-5 text-primary" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17 21v-2a4 4 0 00-3-3.87" />
                <path d="M7 21v-2a4 4 0 013-3.87" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <span>Users</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/settings"
            :class="[
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isActive('/settings')
                ? 'text-primary-hover font-bold bg-primary/5'
                : 'hover:bg-primary/5',
            ]"
          >
            <span class="w-5 h-5 text-primary" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z" />
                <path
                  d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09c.7 0 1.27-.4 1.51-1a1.65 1.65 0 00-.33-1.82L4.3 4.7A2 2 0 017.13 1.87l.06.06c.46.46 1 .66 1.61.66h.09c.19 0 .38-.02.56-.07A1.65 1.65 0 0012 2c.58 0 1.12.2 1.61.66l.06-.06A2 2 0 0118.87 4.3l-.06.06c-.46.46-.66 1-.66 1.61v.09c0 .19.02.38.07.56.14.38.46.7.84.84.18.05.37.07.56.07H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
                />
              </svg>
            </span>
            <span>Settings</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div>
      <button class="px-3 py-2 rounded-lg bg-primary text-secondary text-sm">
        Sign out
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute();
const isActive = (path: string): boolean =>
  route.path === path || (path !== "/" && route.path.startsWith(`${path}/`));


  // Scroll to top of sidebar when navigating to a new page
onMounted(() => {
  const sidebar = document.querySelector("aside");
  if (sidebar) {
    sidebar.scrollTop = 0;
  }

  const theme : string  = "light";
});
</script>

<style scoped>
svg {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
