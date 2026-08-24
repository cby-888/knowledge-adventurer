"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "gold" | "danger";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
  const variants: Record<string, string> = {
    primary:
      "bg-neon text-ink-900 hover:bg-cyan-300 shadow-glow",
    gold: "bg-neon-gold text-ink-900 hover:bg-amber-300",
    ghost:
      "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10",
    danger: "bg-rose-500/90 text-white hover:bg-rose-500",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`panel ${className}`}>{children}</div>;
}

export function Badge({
  children,
  color = "neon",
}: {
  children: ReactNode;
  color?: "neon" | "purple" | "green" | "gold" | "gray";
}) {
  const colors: Record<string, string> = {
    neon: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30",
    purple: "bg-violet-500/15 text-violet-300 border-violet-400/30",
    green: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    gold: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    gray: "bg-white/10 text-slate-300 border-white/15",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  max = 100,
  color = "bg-neon",
}: {
  value: number;
  max?: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon border-t-transparent" />
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
      {message}
    </div>
  );
}
