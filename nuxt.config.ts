// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite"
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/base.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ["@nuxtjs/supabase"],
  supabase: {
    redirect: true,
    redirectOptions: {
      login: '/signin',
      callback: '/confirm',
      exclude: [], // routes to exclude from auth protection
    }
  }
});