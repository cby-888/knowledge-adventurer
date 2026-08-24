"use client";

import Link from "next/link";

export interface MapArea {
  slug: string;
  name: string;
  emoji: string;
  description: string;
  minLevel: number;
  order: number;
  locked: boolean;
  unlocked: boolean;
}

const AREA_LINKS: Record<string, string> = {
  village: "/dashboard",
  library: "/tasks",
  "invest-city": "/career/investing",
  "ai-lab": "/career/ai",
  "code-forest": "/career/programming",
  "english-town": "/career/english",
  arena: "/leaderboard",
  "ai-tower": "/chat",
  future: "/map",
};

export function WorldMap({ areas }: { areas: MapArea[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {areas.map((a) => {
        const content = (
          <div
            className={`panel flex h-full flex-col items-center justify-center text-center transition ${
              a.unlocked
                ? "hover:-translate-y-1 hover:shadow-glow"
                : "opacity-50 grayscale"
            }`}
          >
            <div className="text-5xl">{a.unlocked ? a.emoji : "🔒"}</div>
            <div className="mt-2 font-bold text-white">{a.name}</div>
            <div className="mt-1 text-xs text-slate-400">{a.description}</div>
            <div className="mt-2 text-xs">
              {a.unlocked ? (
                <span className="text-neon">已解锁</span>
              ) : (
                <span className="text-slate-500">需 Lv.{a.minLevel}</span>
              )}
            </div>
          </div>
        );

        const href = AREA_LINKS[a.slug] ?? "/map";
        return a.unlocked ? (
          <Link key={a.slug} href={href}>
            {content}
          </Link>
        ) : (
          <div key={a.slug}>{content}</div>
        );
      })}
    </div>
  );
}
