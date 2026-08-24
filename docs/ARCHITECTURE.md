# 架构设计

## 总体架构

Knowledge Adventurer 采用 **Next.js 15 全栈单应用** 架构，通过目录职责划分实现「UI / 业务逻辑 / 数据库 / AI 服务 / API」的清晰分层。

```
Browser (React 客户端组件)
        │  fetch("/api/...")
        ▼
Next.js Route Handlers (app/api/*)
        │
        ├── server/          # 业务逻辑（奖励重算、任务提交、签到、排行榜…）
        │       │
        │       ├── lib/game/       # 纯函数数值逻辑（可独立测试）
        │       ├── services/deepseek/  # AI 调用（唯一出口）
        │       └── lib/prisma.ts      # 数据库访问
        ▼
PostgreSQL (Prisma ORM)
        ▲
services/deepseek ──► DeepSeek API (仅后端, 环境变量注入 Key)
```

## 关键设计

### 1. 奖励引擎（防刷核心）

所有 XP / Gold / Level 变更只能通过 `server/rewards.ts` 的 `applyRewards()`：

- 服务端重算等级（`levelFromXp`），前端不可信。
- 每次奖励在同一数据库事务内完成：更新用户 → 写学习记录 → 检查并解锁成就 → 叠加成就奖励。
- 「首次答对」才发放任务奖励（`TaskAttempt.isFirstCorrect`），重复提交不发。

### 2. AI 服务层

`services/deepseek/` 是 DeepSeek 调用的唯一出口：

- `client.ts`：统一 `chatCompletion()`、配置读取、`extractJson()`、防提示注入 `PROMPT_GUARD`。
- `generateTask.ts` / `evaluateAnswer.ts`：AI 返回结构用 **Zod** 校验，失败即抛错由上层降级，数值服务端二次 clamp。
- `chatWithNPC.ts` / `generateHint.ts`：注入玩家等级 → 难度自适应。

### 3. 认证与安全

- JWT 写入 httpOnly Cookie（`lib/auth.ts`），`middleware.ts` 拦截受保护页面。
- 密码 bcrypt 哈希；API 内校验 `userId` 防越权；zod 校验入参；内存限流（`lib/rate-limit.ts`）。

### 4. 数据模型

见 `prisma/schema.prisma`。核心模型：`User / Career / UserCareer / Skill / UserSkill / Task / TaskAttempt / Achievement / UserAchievement / DailyCheckIn / LearningRecord / Conversation / Message / NPC / MapArea`。

## 扩展指南

- **新增职业**：在 `prisma/seed.ts` 补充职业 + 技能 + 任务即可，业务代码无需改动。
- **新增成就**：在 `prisma/seed.ts` 增加成就，`lib/game/achievements.ts` 已支持 `task_count / streak_days / level_reach / career_count / ai_task_count / bug_fix_count / chat_count / invest_profit` 等条件。
- **新增 API**：在 `app/api/` 新增 route，逻辑下沉到 `server/`。
