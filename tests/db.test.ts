// 数据库 smoke 测试 —— 需要已启动的 PostgreSQL 与 DATABASE_URL
// 未设置 DATABASE_URL 时自动跳过, 不影响其它测试。
import { test } from "node:test";
import assert from "node:assert/strict";

// tsx / node 不会自动加载 .env, 这里手动加载(存在则加载, 失败忽略)
try {
  process.loadEnvFile(".env");
} catch {
  /* 无 .env 时忽略 */
}

const hasDb = !!process.env.DATABASE_URL;

test(
  "数据库 smoke: 至少包含 4 个职业",
  { skip: !hasDb },
  async () => {
    const { prisma } = await import("../lib/prisma");
    try {
      const count = await prisma.career.count();
      assert.ok(count >= 4, `应有至少 4 个职业, 实际 ${count}`);
    } finally {
      await prisma.$disconnect();
    }
  },
);

test(
  "数据库 smoke: 任务/技能/成就均已 seed",
  { skip: !hasDb },
  async () => {
    const { prisma } = await import("../lib/prisma");
    try {
      const [tasks, skills, achievements, npcs] = await Promise.all([
        prisma.task.count(),
        prisma.skill.count(),
        prisma.achievement.count(),
        prisma.nPC.count(),
      ]);
      assert.ok(tasks >= 40, `任务应 >= 40, 实际 ${tasks}`);
      assert.ok(skills >= 20, `技能应 >= 20, 实际 ${skills}`);
      assert.ok(achievements >= 20, `成就应 >= 20, 实际 ${achievements}`);
      assert.ok(npcs >= 4, `NPC 应 >= 4, 实际 ${npcs}`);
    } finally {
      await prisma.$disconnect();
    }
  },
);
