import type { ReactNode } from "react";

const nav = [
  ["今日", "/today"],
  ["ジャーナル", "/journal"],
  ["More", "/more"]
];

export function Layout({ children, route }: { children: ReactNode; route: string }) {
  const immersive = route.startsWith("/new") || route.startsWith("/goal");
  const showFab = !immersive && !route.startsWith("/more");
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#/today">Daily Floor</a>
        <span className="privacy-pill">ローカル保存</span>
      </header>
      <main className="content">{children}</main>
      {showFab && <a className="fab" href="#/new" aria-label="新しい記録を作成"><span>＋</span><strong>記録</strong></a>}
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
