import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const base = process.env.VITE_BASE_PATH ?? "/daily_floor/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icons/icon.svg"],
      manifest: {
        name: "Daily Floor",
        short_name: "Floor",
        description: "日記、気分、写真、添付、休養ログを時系列で残すローカルファーストPWA",
        start_url: `${base}#/today`,
        scope: base,
        display: "standalone",
        orientation: "portrait",
        background_color: "#f7f5ef",
        theme_color: "#40685a",
        icons: [
          { src: "icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }
        ],
        shortcuts: [
          { name: "今日", short_name: "今日", url: `${base}#/today`, icons: [{ src: "icons/icon.svg", sizes: "any" }] },
          { name: "ジャーナル", short_name: "記録", url: `${base}#/journal`, icons: [{ src: "icons/icon.svg", sizes: "any" }] },
          { name: "新規ログ", short_name: "新規", url: `${base}#/new`, icons: [{ src: "icons/icon.svg", sizes: "any" }] },
          { name: "カレンダー", short_name: "暦", url: `${base}#/journal?view=calendar`, icons: [{ src: "icons/icon.svg", sizes: "any" }] },
          { name: "ガイド", short_name: "案内", url: `${base}#/more`, icons: [{ src: "icons/icon.svg", sizes: "any" }] },
          { name: "バックアップ", short_name: "保存", url: `${base}#/backup`, icons: [{ src: "icons/icon.svg", sizes: "any" }] }
        ],
        share_target: {
          action: `${base}#/share`,
          method: "GET",
          params: { title: "title", text: "text", url: "url" }
        }
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,json,webmanifest}"],
        navigateFallback: "index.html",
        runtimeCaching: []
      }
    })
  ],
  test: {
    environment: "jsdom",
    globals: true
  }
});
