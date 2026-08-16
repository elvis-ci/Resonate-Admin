<script setup lang="ts">
definePageMeta({
  layout: "auth",
  title: "Sign in",
  heading: "Welcome back",
  subtext: "Access your workspace dashboard and manage operations securely.",
});
const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const isSigningIn = ref(false)
const authError = ref('')
const { theme, toggle } = useTheme()

function onToggleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggle()
  }
}

async function login() {
  if (isSigningIn.value) return

  authError.value = ''

  if (!email.value.trim() || !password.value.trim()) {
    authError.value = 'Please enter both your email and password.'
    return
  }

  isSigningIn.value = true

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    })

    if (error) {
      authError.value = error.message || 'Unable to sign in. Please try again.'
      return
    }

    await navigateTo('/')
  } catch (err) {
    authError.value = err instanceof Error ? err.message : 'Unable to sign in. Please try again.'
  } finally {
    isSigningIn.value = false
  }
}
const rememberMe = ref(true);
</script>

<template>
  <div class="min-h-screen bg-alt-bg text-body">
    <button
      type="button"
      class="fixed top-4 right-4 z-50 theme-toggle-btn-signin"
      :class="{ 'is-dark': theme === 'dark' }"
      @click="toggle"
      @keydown="onToggleKeydown"
      role="switch"
      :aria-checked="theme === 'dark'"
      aria-label="Toggle dark mode"
    >
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
        Dark Mode

      <span class="pill" aria-hidden="true">
        <span
          class="slider"
          :class="{ 'slider-right': theme === 'dark' }"
        ></span>
      </span>
    </button>

    <div class="mx-auto grid min-h-screen lg:grid-cols-2">
      <div class="hidden lg:flex lg:items-center lg:justify-center lg:bg-card-bg lg:p-12">
        <div class="w-full max-w-md space-y-8">
          <div class="flex items-center gap-3">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white shadow-lg shadow-primary/20"
            >
              R
            </div>
            <div>
              <p class="text-sm uppercase tracking-[0.2em] text-muted">Resonate</p>
              <h1 class="text-2xl font-bold text-heading">Admin Console</h1>
            </div>
          </div>

          <div class="space-y-4 rounded-3xl border border-border bg-alt-bg p-8 shadow-elev">
            <span class="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-text">
              Secure access
            </span>
            <h2 class="text-3xl font-bold text-heading">Manage bookings, users, and spaces.</h2>
            <p class="text-base text-muted">
              Keep track of your locations, events, and operational health in one place.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <div class="rounded-2xl border border-border bg-card-bg p-4">
              <p class="text-2xl font-bold text-heading">32</p>
              <p class="mt-1 text-sm text-muted">Workspaces</p>
            </div>
            <div class="rounded-2xl border border-border bg-card-bg p-4">
              <p class="text-2xl font-bold text-heading">12</p>
              <p class="mt-1 text-sm text-muted">Bookings</p>
            </div>
            <div class="rounded-2xl border border-border bg-card-bg p-4">
              <p class="text-2xl font-bold text-heading">99.9%</p>
              <p class="mt-1 text-sm text-muted">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center p-6 sm:p-10">
        <div class="w-full max-w-md">
          <div class="rounded-[28px] border border-border bg-card-bg p-6 shadow-elev sm:p-8">
            <div class="mb-8">
              <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary-text">Welcome back</p>
              <h2 class="mt-3 text-3xl font-bold text-heading">Sign in</h2>
              <p class="mt-2 text-sm text-muted">Use your administrator credentials to continue.</p>
            </div>

            <form class="space-y-5" >
              <div v-if="authError" class="rounded-xl text-center border border-error-text/30 bg-error-bg px-3 py-2 text-sm text-error-text" aria-live="polite">
                {{ authError }}
              </div>

              <div class="space-y-2">
                <label for="email" class="block text-sm font-semibold text-heading">Email</label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  placeholder="admin@resonate.com"
                  class="w-full rounded-xl border border-border bg-alt-bg px-4 py-3 text-body placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <label for="password" class="block text-sm font-semibold text-heading">Password</label>
                  <a href="#" class="text-sm font-semibold text-primary hover:text-primary-hover">Forgot password?</a>
                </div>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  autocomplete="current-password"
                  placeholder="Enter your password"
                  class="w-full rounded-xl border border-border bg-alt-bg px-4 py-3 text-body placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <label class="flex items-center gap-3 text-sm text-body">
                <input v-model="rememberMe" type="checkbox" class="h-4 w-4 accent-primary rounded border-border text-primary focus:ring-primary" />
                <span>Keep me signed in</span>
              </label>

              <button
                type="submit"
                class="w-full rounded-xl bg-primary px-4 py-3 text-base font-bold text-white transition-colors duration-200 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-70"
                :disabled="isSigningIn"
                @click.prevent="login"
              >
                {{ isSigningIn ? 'Signing in...' : 'Sign in' }}
              </button>
            </form>

            <div class="mt-6 border-t border-border pt-5 text-center text-sm text-muted">
              Need access?
              <a href="#" class="ml-1 font-semibold text-primary hover:text-primary-hover">Contact support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-toggle-btn-signin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.875rem;
  background: rgba(160, 90, 0, 0.04);
  color: var(--color-body);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle-btn-signin:hover {
  border-color: var(--color-primary);
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

.theme-toggle-btn-signin.is-dark .pill {
  background: rgba(224, 124, 11, 0.2);
  border-color: rgba(224, 124, 11, 0.5);
}

.theme-toggle-btn-signin.is-dark .slider {
  transform: translateX(1.36rem);
  background: var(--color-primary);
}
</style>
