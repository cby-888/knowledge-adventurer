"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/client";
import { useAuth } from "@/components/AuthProvider";
import { Button, Card, ErrorBox } from "@/components/ui";

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-slate-100 outline-none transition focus:border-neon";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await refresh();
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-md">
      <Card className="!p-8">
        <h1 className="text-2xl font-bold text-white">🔑 登录</h1>
        <p className="mt-1 text-sm text-slate-400">欢迎回到知识冒险世界</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && <ErrorBox message={error} />}
          <div>
            <label className="mb-1 block text-sm text-slate-300">邮箱</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">密码</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "登录中…" : "登录"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          还没有账号？{" "}
          <Link href="/register" className="text-neon hover:underline">
            立即注册
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-slate-500">
          测试账号：demo@example.com / demo1234
        </p>
      </Card>
    </div>
  );
}
