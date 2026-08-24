import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "知识冒险家 Knowledge Adventurer",
  description:
    "AI 驱动的游戏化学习平台：在 RPG 世界中学投资、AI、编程与英语。",
};

export const viewport: Viewport = {
  themeColor: "#0a0e1a",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6">
            {children}
          </main>
          <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
            ⚠️ 本站所有投资内容均为虚拟模拟，不构成任何真实投资建议。
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
