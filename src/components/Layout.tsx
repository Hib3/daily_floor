import type { ReactNode } from "react";

const nav = [
  ["今日", "/today"],
  ["ジャーナル", "/journal"],
  ["More", "/more"]
];

export function Layout({ children, route }: { children: ReactNode; route: string }) {
  const immersive = route.startsWith("/new");
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#/today">Daily Floor</a>
        <span className="privacy-pill">ローカル保存</span>
      </header>
      <main className="content">{children}</main>
      {!immersive && <a className="fab" href="#/new" aria-label="新しいログを作成">+</a>}
      {!immersive && (
        <nav className="bottom-nav" aria-label="主要ナビゲーション">
          {nav.map(([label, href]) => (
            <a key={href} href={`#${href}`} aria-current={route.startsWith(href) ? "page" : undefined}>{label}</a>
          ))}
        </nav>
      )}
    </div>
  );
}
