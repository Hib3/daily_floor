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
        description: "接触・床・休養ログを大切にするローカルファーストPWA",
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
          { name: "今日の床", short_name: "今日", url: `${base}#/today`, icons: [{ src: "icons/icon.svg", sizes: "any" }] },
          { name: "チェックイン", short_name: "記録", url: `${base}#/checkin`, icons: [{ src: "icons/icon.svg", sizes: "any" }] },
          { name: "カスケード開始", short_name: "開始", url: `${base}#/cascade`, icons: [{ src: "icons/icon.svg", sizes: "any" }] },
          { name: "夜レビュー", short_name: "夜", url: `${base}#/night-review`, icons: [{ src: "icons/icon.svg", sizes: "any" }] },
          { name: "レポート", short_name: "報告", url: `${base}#/reports`, icons: [{ src: "icons/icon.svg", sizes: "any" }] },
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
