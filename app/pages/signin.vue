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

async function login() {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
  if (error) console.error(error)
  else await navigateTo('/')
}
const rememberMe = ref(true);
</script>

<template>
  <div class="min-h-screen bg-alt-bg text-body">
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
                class="w-full rounded-xl bg-primary px-4 py-3 text-base font-bold text-white transition-colors duration-200 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/30"
                @click="login"
              >
                Sign in
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
