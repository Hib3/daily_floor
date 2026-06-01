import type { ReactNode } from "react";

const nav = [
  ["今日", "/today"],
  ["記録", "/checkin"],
  ["カスケード", "/cascade"],
  ["ガイド", "/guide"],
  ["レポート", "/reports"],
  ["設定", "/settings"]
];

export function Layout({ children, route }: { children: ReactNode; route: string }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#/today">Daily Floor</a>
        <span className="privacy-pill">ローカル保存</span>
      </header>
      <main className="content">{children}</main>
      <nav className="bottom-nav" aria-label="主要ナビゲーション">
        {nav.map(([label, href]) => (
          <a key={href} href={`#${href}`} aria-current={route.startsWith(href) ? "page" : undefined}>{label}</a>
        ))}
      </nav>
    </div>
  );
}
