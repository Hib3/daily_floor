import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./styles.css";
import { seedIfNeeded } from "./lib/db";
import { Layout } from "./components/Layout";
import { TodayPage } from "./pages/TodayPage";
import { CheckinPage } from "./pages/CheckinPage";
import { CascadePage } from "./pages/CascadePage";
import { SimplePages } from "./pages/SimplePages";
import { ReportsPage } from "./pages/ReportsPage";
import { BackupPage } from "./pages/BackupPage";
import { SettingsPage } from "./pages/SettingsPage";

function useHashRoute(): string {
  const [route, setRoute] = useState(location.hash.replace(/^#/, "") || "/today");
  useEffect(() => {
    const listener = () => setRoute(location.hash.replace(/^#/, "") || "/today");
    addEventListener("hashchange", listener);
    return () => removeEventListener("hashchange", listener);
  }, []);
  return route;
}

function App() {
  const [ready, setReady] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const updateSW = useMemo(() => registerSW({ onNeedRefresh: () => setUpdateReady(true) }), []);
  const route = useHashRoute();

  useEffect(() => {
    seedIfNeeded().then(() => setReady(true));
  }, []);

  if (!ready) return <main className="boot">Daily Floorを準備しています</main>;

  return (
    <Layout route={route}>
      {updateReady && (
        <section className="notice">
          <span>新しいバージョンがあります</span>
          <button onClick={() => updateSW(true)}>更新する</button>
        </section>
      )}
      <Route route={route} />
    </Layout>
  );
}

function Route({ route }: { route: string }) {
  if (route.startsWith("/checkin")) return <CheckinPage />;
  if (route.startsWith("/cascade")) return <CascadePage route={route} />;
  if (route.startsWith("/reports")) return <ReportsPage />;
  if (route.startsWith("/backup")) return <BackupPage />;
  if (route.startsWith("/settings")) return <SettingsPage />;
  if (["/tasks", "/intentions", "/bundles", "/timers", "/sleep", "/night-review", "/review", "/share"].some((item) => route.startsWith(item))) {
    return <SimplePages route={route} />;
  }
  return <TodayPage />;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
