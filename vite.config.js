import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "NEXUS",
        short_name: "NEXUS",
        description: "Assistive Mobility Command System",

        theme_color: "#070b12",
        background_color: "#070b12",

        display: "standalone",
        orientation: "portrait-primary",

        icons: [
          {
            src: "/nexus-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/nexus-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});