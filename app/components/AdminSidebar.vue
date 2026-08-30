<script setup lang="ts">
const emit = defineEmits<{ close: [] }>();
const route = useRoute();
const isActive = (path: string): boolean =>
  route.path === path || (path !== "/" && route.path.startsWith(`${path}/`));

const { theme, toggle } = useTheme();
const isSigningOut = ref(false);
const signOutError = ref("");

const { profile, pending: isProfilePending, isSuperAdmin } = useAdminProfile();

// Supabase client for auth actions
const supabase = useSupabaseClient();

onMounted(() => {
  const sidebar = document.querySelector<HTMLElement>("aside");
  if (sidebar) {
    sidebar.scrollTop = 0;
  }
});

function onToggleKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggle();
  }
}

async function signOut() {
  if (isSigningOut.value) return;

  signOutError.value = "";
  isSigningOut.value = true;

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      signOutError.value =
        error.message || "Unable to sign out. Please try again.";
      return;
    }

    await navigateTo("/signin");
  } catch (err) {
    signOutError.value =
      err instanceof Error
        ? err.message
        : "Unable to sign out. Please try again.";
  } finally {
    isSigningOut.value = false;
  }
}

function onSignOutKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    void signOut();
  }
}
</script>

<template>
  <aside
    class="flex h-full flex-col justify-between border-r border-card-border bg-card-bg px-2.5 py-4"
  >
    <div class="flex flex-col justify-between space-y-4">
      <!-- Logo -->
      <div class="px-4 py-2.5 flex items-center text-3xl">
        <NuxtLink to="/" class="white font-bold">Reboot</NuxtLink>
      </div>

      <nav class="space-y-2" @click="emit('close')">
        <ul class="space-y-2">
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

          <li v-if="isSuperAdmin">
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
    </div>

    <div class="space-y-4">
      <p
        v-if="signOutError"
        class="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
        aria-live="polite"
      >
        {{ signOutError }}
      </p>

      <button
        type="button"
        class="theme-toggle-btn"
        :class="{ 'is-dark': theme === 'dark' }"
        @click="toggle"
        @keydown="onToggleKeydown"
        role="switch"
        :aria-checked="theme === 'dark'"
        aria-label="Toggle dark mode"
      >
        <span class="toggle-label-wrap">
          <span class="theme-icon" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path
                d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
              />
            </svg>
          </span>
          <span class="theme-text">Dark mode</span>
        </span>

        <span class="pill" aria-hidden="true">
          <span
            class="slider"
            :class="{ 'slider-right': theme === 'dark' }"
          ></span>
        </span>
      </button>

      <button
        type="button"
        class="flex px-3 py-2 cursor-pointer rounded-lg text-body font-bold gap-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
        :disabled="isSigningOut"
        @click="signOut"
        @keydown="onSignOutKeydown"
      >
        <span class="theme-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </span>

        {{ isSigningOut ? "Signing out..." : "Sign out" }}
      </button>
    </div>
  </aside>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background-color: var(--color-scrollbar-track);
  transition: background-color 2.5s ease;
}
::-webkit-scrollbar-thumb {
  background-color: var(--color-scrollbar-thumb);
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-scrollbar-thumb-hover);
}
::-webkit-scrollbar-corner {
  background-color: var(--color-scrollbar-track);
}

/* Reset all buttons to zero first */
::-webkit-scrollbar-button {
  display: block;
  width: 10px;
  height: 10px;
  background-color: transparent;
}

/* Up arrow — only this exact combination */
::-webkit-scrollbar-button:single-button:vertical:decrement {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 5px solid var(--color-scrollbar-thumb);
}

/* Down arrow — only this exact combination */
::-webkit-scrollbar-button:single-button:vertical:increment {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid var(--color-scrollbar-thumb);
}

/* Explicitly hide the "double" button variants that cause duplicates */
::-webkit-scrollbar-button:double-button:vertical:decrement,
::-webkit-scrollbar-button:double-button:vertical:increment {
  display: none;
  width: 0;
  height: 0;
}

svg {
  width: 1.25rem;
  height: 1.25rem;
}

.theme-toggle-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.875rem;
  background: rgba(160, 90, 0, 0.04);
  color: var(--color-body);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle-btn:hover {
  border-color: var(--color-primary);
}

.toggle-label-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  flex: 1;
  min-width: 0;
}

.theme-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-primary);
}

.theme-icon svg {
  width: 1.1rem;
  height: 1.1rem;
}

.theme-text {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-text);
}

.pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 3.1rem;
  height: 1.7rem;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.35);
  border: 1px solid rgba(148, 163, 184, 0.5);
  flex-shrink: 0;
}

.slider {
  position: absolute;
  left: 0.18rem;
  top: 0.18rem;
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 9999px;
  background: var(--color-secondary);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.18);
  transform: translateX(0);
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
}

.theme-toggle-btn.is-dark .pill {
  background: rgba(224, 124, 11, 0.2);
  border-color: rgba(224, 124, 11, 0.5);
}

.theme-toggle-btn.is-dark .slider {
  transform: translateX(1.36rem);
  background: var(--color-primary);
}
</style>
