# 🗺️ 知识冒险家 Knowledge Adventurer

> AI 驱动的游戏化学习平台 —— 不是刷题，而是在 RPG 世界里通过学习、完成任务、挑战 AI NPC，获得经验、升级、解锁技能与职业。

玩家打开网站 → 创建角色 → 选择职业 → 进入知识冒险世界 → 接受 AI 任务 → 学习知识 → 完成挑战 → 获得 XP → 升级 → 解锁技能 → 解锁地图 → 与 AI NPC 对话 → 形成自己的成长路线。

> ⚠️ **免责声明**：项目中的投资内容均为**虚拟模拟教学**，不构成任何真实投资建议。

---

## 🚀 在线体验

**🌐 立即体验：[https://knowledge-adventurer.vercel.app](https://knowledge-adventurer.vercel.app)**

- 测试账号：`demo@example.com` / `demo1234`
- AI 功能：注册后在「设置」页填入你自己的 DeepSeek Key 即可使用（每人自带 Key，互不干扰）

---

## 📸 截图

截图存放于 [`docs/screenshots/`](./docs/screenshots/)。启动项目后可截图放入该目录：

- 职业选择页 `/careers`
- 世界地图 `/map`
- 任务中心 `/tasks`
- 技能树 `/skills`
- AI 导师对话 `/chat`

---

## ✨ 核心功能

- **4 大职业**：📈 投资分析师 · 🤖 AI 工程师 · 💻 编程大师 · 🇬🇧 英语冒险家
- **玩家系统**：用户名 / Avatar / Level / XP / 金币 / HP / 连续学习天数 / 学习时长 / 任务数
- **任务系统**：选择题 / 简答题 / 情景题 / 找 Bug / AI 对话，含难度、知识点、奖励
- **AI 动态出题**：`POST /api/ai/generate-task`，DeepSeek 返回结构化 JSON，后端 zod 校验
- **AI 自动评分**：主观题由 DeepSeek 评分（正确性 / 完整性 / 表达），选择题本地精确判定
- **AI NPC 导师**：林博士 · Nova · Code · Emma，对话 / 教学 / 出题 / 提示，根据玩家等级调整难度
- **技能树**：每职业 7 层独立技能树，含等级要求、前置技能、可视化节点
- **成就系统**：20+ 成就，自动解锁并发放奖励
- **每日签到**：连续 3/7/14/30/100 天里程碑奖励
- **排行榜**：全球 / 周 / 月榜
- **RPG 世界地图**：9 大区域，等级解锁
- **安全防刷**：JWT 认证、bcrypt 密码哈希、服务端重算奖励、首次答对才发放、限流、防提示注入

---

## 🧱 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS |
| 后端 | Next.js Route Handlers（全栈单应用） |
| 数据库 | PostgreSQL · Prisma ORM |
| 认证 | JWT (jose) · bcryptjs · httpOnly Cookie |
| 校验 | Zod |
| AI | DeepSeek API（OpenAI 兼容） |
| 测试 | Node 内置 test runner + tsx |
| 部署 | Docker · docker-compose |

---

## 🏗️ 项目架构

采用 **Next.js 全栈单应用**，通过目录清晰分层 UI / 业务逻辑 / 数据库 / AI 服务 / API：

```
knowledge-adventurer/
├── app/                    # 页面 + API Route Handlers
│   ├── (auth)/             # login / register
│   ├── dashboard/ careers/ career/[id]/ map/ skills/
│   ├── tasks/ task/[id]/ chat/ achievements/ leaderboard/
│   ├── profile/ settings/
│   └── api/                # 全部后端 API
├── components/             # UI 组件（Navbar/HUD/WorldMap/SkillTree/TaskCard…）
├── lib/                    # 共享层
│   ├── game/               # 纯函数游戏逻辑（XP/奖励/签到/成就/判分）
│   ├── prisma.ts auth.ts api.ts rate-limit.ts client.ts serialize.ts
├── server/                 # 业务逻辑（rewards/tasks/skills/checkin/leaderboard/achievements）
├── services/deepseek/      # DeepSeek 服务（client/generateTask/evaluateAnswer/chatWithNPC/…）
├── prisma/                 # schema.prisma + seed.ts
├── tests/                  # 可运行测试（game/deepseek/db）
├── public/  docs/
├── Dockerfile  docker-compose.yml
├── .env.example  README.md  LICENSE  CONTRIBUTING.md  CODE_OF_CONDUCT.md
```

详细架构见 [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)。

---

## 🚀 快速开始

### 方式一：Docker 一键启动（推荐）

```bash
# 1. 复制环境变量
cp .env.example .env
# 2. (可选) 在 .env 中填入 DEEPSEEK_API_KEY，不填也能体验题库任务
# 3. 启动
docker compose up --build
```

打开 <http://localhost:3000>。首次启动会自动建表并写入 seed 数据（4 职业 / 28 技能 / 40 任务 / 20 成就 / 4 NPC / 9 地图区 / 测试用户）。

### 方式二：本地手动启动

要求：Node.js ≥ 18.18、pnpm、PostgreSQL（本机或 Docker）。

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env
#    编辑 .env，填入 DATABASE_URL 和 DEEPSEEK_API_KEY

# 3. 初始化数据库（建表 + seed）
pnpm prisma:generate
pnpm prisma:push
pnpm prisma:seed

# 4. 启动开发服务器
pnpm dev
```

打开 <http://localhost:3000>，可用测试账号登录：`demo@example.com` / `demo1234`。

---

## 🔑 环境变量

见 [`.env.example`](./.env.example)。关键项：

| 变量 | 说明 |
|---|---|
| `DATABASE_URL` | PostgreSQL 连接串 |
| `DEEPSEEK_API_KEY` | DeepSeek API Key（**仅后端使用，绝不放前端**） |
| `DEEPSEEK_BASE_URL` | 默认 `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | 默认 `deepseek-chat` |
| `JWT_SECRET` | JWT 签名密钥，请改成随机长字符串 |

---

## 🗄️ 数据库初始化

使用 Prisma：

```bash
pnpm prisma:generate   # 生成 Prisma Client
pnpm prisma:push       # 依据 schema.prisma 建表（无需手写 migration）
pnpm prisma:seed       # 写入 seed 数据
pnpm prisma:studio     # 可视化查看数据（可选）
```

生产环境如需迁移历史，可用 `pnpm prisma:migrate`（`prisma migrate dev`）生成 migration 文件。

---

## 🤖 DeepSeek API 配置

1. 到 [DeepSeek 开放平台](https://platform.deepseek.com) 创建 API Key。
2. 在 `.env` 中设置 `DEEPSEEK_API_KEY=sk-...`。
3. 重启服务。

**未配置 Key 时**：选择题任务可正常作答（本地判定）；AI 动态出题、主观题评分、AI NPC 对话会返回 503 提示。所有 AI 调用统一收敛在 `services/deepseek/`，见 `docs/ARCHITECTURE.md`。

---

## 🧪 测试

```bash
pnpm test           # 运行全部测试
pnpm test:logic     # 只运行纯逻辑测试（XP/奖励/签到/成就/判分）
pnpm typecheck      # TypeScript 类型检查
```

- `tests/game/`：纯函数逻辑测试（无需数据库，无需网络）
- `tests/deepseek.test.ts`：AI 服务测试（mock fetch）
- `tests/db.test.ts`：数据库 smoke 测试（无 `DATABASE_URL` 时自动跳过）

---

## 🛠️ 开发指南

常用脚本见 `package.json`。新增职业时只需在 `prisma/seed.ts` 中补充职业/技能/任务数据即可，无需改动业务代码。新增 API 时在 `app/api/` 下新增 route，业务逻辑放 `server/`。

安全红线：

1. API Key 只存后端 `.env`。
2. 密码 bcrypt 哈希存储。
3. 所有 API 校验 `userId`，防越权。
4. 所有入参 zod 校验。
5. AI 输出只当数据处理，前端纯文本渲染，防提示注入与 XSS。
6. AI 接口限流，提交防刷。
7. XP/Gold/Level 一律服务端重算（`server/rewards.ts`）。

---

## 🤝 贡献指南

欢迎贡献！请先阅读 [`CONTRIBUTING.md`](./CONTRIBUTING.md) 和 [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)。

---

## 🗺️ 未来规划

- 投资模拟组合（虚拟买卖、盈亏曲线，用于「投资盈利」成就）
- 更多职业与课程内容
- 组队 / 公会 / PvP 挑战竞技场
- 排行榜周期化与赛季奖励
- Redis 限流（多实例部署）
- 单元测试覆盖率提升与 CI

---

## 📄 License

[MIT](./LICENSE) © Knowledge Adventurer contributors
