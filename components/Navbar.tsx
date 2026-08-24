"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

const links = [
  { href: "/map", label: "🗺️ 地图" },
  { href: "/tasks", label: "📜 任务" },
  { href: "/skills", label: "🌳 技能" },
  { href: "/chat", label: "🧙 AI 导师" },
  { href: "/achievements", label: "🏅 成就" },
  { href: "/leaderboard", label: "🏆 排行" },
];

export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-900/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="shrink-0 text-lg font-bold text-neon">
          🗺️ 知识冒险家
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                isActive(l.href)
                  ? "bg-white/10 text-neon"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-300 sm:inline">
                Lv.{user.level} · {user.username}
              </span>
              <span className="text-sm text-neon-gold">🪙{user.gold}</span>
              <Link
                href="/dashboard"
                className="rounded-lg bg-neon px-3 py-1.5 text-sm font-semibold text-ink-900"
              >
                大厅
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm text-slate-200 hover:bg-white/5"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-neon px-3 py-1.5 text-sm font-semibold text-ink-900"
              >
                注册
              </Link>
            </>
          )}
          <button
            className="rounded-lg p-2 text-slate-300 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="菜单"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-4 py-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm ${
                isActive(l.href) ? "bg-white/10 text-neon" : "text-slate-300"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
