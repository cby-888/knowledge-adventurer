import Link from "next/link";

const features = [
  { emoji: "📈", title: "投资分析师", desc: "股票、ETF、财报、估值与风险管理" },
  { emoji: "🤖", title: "AI 工程师", desc: "LLM、Prompt、RAG、Agent 开发" },
  { emoji: "💻", title: "编程大师", desc: "前端、后端、数据结构与算法" },
  { emoji: "🇬🇧", title: "英语冒险家", desc: "AI 对话场景练听说读写" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="animate-float-slow text-7xl">🗺️</div>
      <h1 className="mt-6 text-4xl font-black text-white sm:text-5xl">
        知识冒险家
        <span className="block bg-gradient-to-r from-neon to-neon-purple bg-clip-text text-transparent">
          Knowledge Adventurer
        </span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-300">
        不是刷题，而是在 RPG 世界中通过学习、完成任务、挑战 AI NPC
        获得经验、升级、解锁技能与职业。
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/register"
          className="rounded-xl bg-neon px-6 py-3 font-semibold text-ink-900 shadow-glow hover:bg-cyan-300"
        >
          创建角色，开始冒险 →
        </Link>
        <Link
          href="/map"
          className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-slate-200 hover:bg-white/10"
        >
          查看世界地图
        </Link>
      </div>

      <div className="mt-14 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <Link
            key={f.title}
            href="/careers"
            className="panel hover:-translate-y-1 hover:shadow-glow transition"
          >
            <div className="text-4xl">{f.emoji}</div>
            <div className="mt-2 font-bold text-white">{f.title}</div>
            <div className="mt-1 text-sm text-slate-400">{f.desc}</div>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-xs text-slate-500">
        ⚠️ 本站所有投资内容均为虚拟模拟，不构成任何真实投资建议。
      </p>
    </div>
  );
}
