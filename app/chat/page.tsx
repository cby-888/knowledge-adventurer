"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client";
import { Button, Card, Spinner, ErrorBox } from "@/components/ui";

interface Npc {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  title: string;
  greeting: string;
  career: { slug: string; name: string; emoji: string } | null;
}

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [npcs, setNpcs] = useState<Npc[] | null>(null);
  const [npcId, setNpcId] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<Npc[]>("/api/npcs")
      .then((list) => {
        setNpcs(list);
        if (list.length > 0) {
          const active = list.find((n) => n.career?.slug);
          const npc = active ?? list[0];
          setNpcId(npc.id);
          setMessages([
            { role: "assistant", content: `${npc.emoji} ${npc.greeting}` },
          ]);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function switchNpc(npc: Npc) {
    setNpcId(npc.id);
    setConversationId("");
    setMessages([{ role: "assistant", content: `${npc.emoji} ${npc.greeting}` }]);
  }

  async function send() {
    const content = input.trim();
    if (!content || sending) return;
    setInput("");
    setSending(true);
    setError("");
    setMessages((m) => [...m, { role: "user", content }]);
    try {
      const r = await api<{ conversationId: string; reply: string }>(
        "/api/ai/chat",
        {
          method: "POST",
          body: JSON.stringify({ npcId, message: content, conversationId: conversationId || undefined }),
        },
      );
      setConversationId(r.conversationId);
      setMessages((m) => [...m, { role: "assistant", content: r.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "发送失败");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "⚠️ 暂时无法回复，请确认已在 .env 配置 DEEPSEEK_API_KEY。",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  if (error && !npcs) return <ErrorBox message={error} />;
  if (!npcs) return <Spinner />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-black text-white">🧙 AI 导师塔</h1>
        <p className="mt-2 text-slate-400">与你的 AI 导师对话、提问、学习</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {npcs.map((n) => (
          <button
            key={n.id}
            onClick={() => switchNpc(n)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
              npcId === n.id
                ? "border-neon bg-neon/15 text-neon"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <span className="text-xl">{n.emoji}</span>
            <span>
              {n.name} · {n.title}
            </span>
          </button>
        ))}
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-neon text-ink-900"
                    : "bg-white/10 text-slate-100"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white/10 px-4 py-2.5 text-sm text-slate-300">
                {npcs.find((n) => n.id === npcId)?.emoji} 思考中…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <ErrorBox message={error} />}

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="输入你的问题或对话…"
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-slate-100 outline-none focus:border-neon"
          />
          <Button onClick={send} disabled={sending}>
            发送
          </Button>
        </div>
      </Card>
    </div>
  );
}
