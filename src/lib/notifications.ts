export async function requestNotifications(): Promise<NotificationPermission | "unsupported"> {
  if (!("Notification" in window)) return "unsupported";
  return Notification.requestPermission();
}

export function notify(title: string, body: string): void {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

export async function updateBadge(count: number): Promise<"ok" | "unsupported"> {
  const nav = navigator as Navigator & { setAppBadge?: (count: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
  if (!nav.setAppBadge || !nav.clearAppBadge) return "unsupported";
  if (count <= 0) await nav.clearAppBadge();
  else await nav.setAppBadge(count);
  return "ok";
}
