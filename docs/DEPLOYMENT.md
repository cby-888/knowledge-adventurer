# 部署指南 (Deployment Guide)

本项目是 Next.js 全栈应用 + PostgreSQL。推荐以下两种公网部署方式。

## 路线 A：Vercel + Neon（免费，推荐，约 10 分钟）

零服务器成本，适合个人项目与快速上线。

### 前置：先把代码推到 GitHub

1. 注册 [github.com](https://github.com) 账号。
2. 新建空仓库（**不要**勾选初始化 README）。
3. 本地推送：
   ```bash
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/knowledge-adventurer.git
   git push -u origin main
   ```

### 第 1 步：Neon 建免费 PostgreSQL

1. 注册 [neon.tech](https://neon.tech)，创建 Project。
2. 复制连接串，形如：
   `postgresql://user:pass@xxx.neon.tech/neondb?sslmode=require`
3. 把该连接串里的库名保留（如 `neondb`），后面填进 `DATABASE_URL`。

### 第 2 步：Vercel 导入部署

1. 注册 [vercel.com](https://vercel.com)（用 GitHub 登录）。
2. **Add New → Project → Import** 你的 `knowledge-adventurer` 仓库。
3. 框架自动识别为 Next.js。
4. **Build Command** 填：
   ```
   prisma migrate deploy && prisma db seed && next build
   ```
5. 配置环境变量（Settings → Environment Variables）：

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Neon 连接串（`postgresql://...?sslmode=require`） |
   | `DEEPSEEK_API_KEY` | 你的 DeepSeek Key |
   | `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` |
   | `DEEPSEEK_MODEL` | `deepseek-chat` |
   | `JWT_SECRET` | 一串随机长字符串（如 `openssl rand -hex 32` 生成） |

6. 点 **Deploy**。完成后得到 `https://xxx.vercel.app`，即你的公网地址。

### 第 3 步：绑定自己的域名（可选）

Vercel 后台 → Domains → 添加你的域名 → 按提示到域名商配置 DNS 即可。

---

## 路线 B：云服务器 VPS + Docker（需购买服务器，约 ¥30~100/月）

适合想要完全掌控、或部署多项目的场景。以阿里云/腾讯云轻量应用服务器为例：

1. 购买一台 Linux 服务器（Ubuntu 22.04，2C2G 起）。
2. 安装 Docker：
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
3. 上传项目（或 `git clone` 你的仓库）。
4. 配置环境变量：
   ```bash
   cp .env.example .env
   vi .env   # 填 DATABASE_URL、DEEPSEEK_API_KEY、JWT_SECRET
   ```
5. 一键启动：
   ```bash
   docker compose up -d --build
   ```
6. 访问 `http://服务器IP:3000`。
7. 配域名 + HTTPS（推荐 Caddy）：
   ```bash
   # Caddyfile
   your-domain.com {
     reverse_proxy localhost:3000
   }
   ```

---

## 环境变量清单

| Key | 必填 | 说明 |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL 连接串 |
| `DEEPSEEK_API_KEY` | 可选 | 不填则 AI 出题/评分/NPC 不可用，选择题等本地功能正常 |
| `JWT_SECRET` | ✅ | 随机长字符串，生产务必修改 |
| `DEEPSEEK_BASE_URL` | 可选 | 默认 `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | 可选 | 默认 `deepseek-chat` |

## 注意事项

- `.env` 已 gitignore，**切勿提交真实密钥**。
- 数据库初始化：`prisma migrate deploy`（生产）/ `prisma db push`（开发）+ `prisma db seed`。
- `next@15.1.6` 存在已知安全漏洞，正式公网前建议 `pnpm add next@^15.5` 升级。
- 限流为单实例内存实现，多实例横向扩展时需换 Redis（见 `docs/ARCHITECTURE.md`）。
