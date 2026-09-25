// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        {
          name: "robots",
          content: "noindex, nofollow",
        },
        {
          name: "description",
          content:
            "Admin dashboard for Resonate, a coworking and workspace booking platform across Lagos (Victoria Island, Ikoyi, Lekki Phase 1, Yaba, Ikeja, Surulere).",
        },

        // Open Graph
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:title",
          content: "Resonate Admin",
        },
        {
          property: "og:description",
          content:
            "Admin dashboard for managing Resonate coworking locations, bookings, and workspaces across Lagos.",
        },
        {
          property: "og:url",
          content: "https://resonate-admin.vercel.app",
        },
        {
          property: "og:image",
          content: "https://resonate-admin.vercel.app/social-preview.png",
        },
        {
          property: "og:image:width",
          content: "1200",
        },
        {
          property: "og:image:height",
          content: "630",
        },

        // Twitter / X
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content: "Resonate Admin",
        },
        {
          name: "twitter:description",
          content:
            "Admin dashboard for managing Resonate coworking locations, bookings, and workspaces across Lagos.",
        },
        {
          name: "twitter:image",
          content: "https://resonate-admin.vercel.app/social-preview.png",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
      ],
    },
  },
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
      login: "/signin",
      callback: "/confirm",
      exclude: [], // routes to exclude from auth protection
    },
  },
});
