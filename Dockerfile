# Knowledge Adventurer — Next.js 全栈应用镜像
# 构建: docker build -t knowledge-adventurer .
# 说明: 使用 npm 安装依赖(与本地 pnpm 均可), 启动时自动 db push + seed

# ---------- 依赖安装 ----------
FROM node:22-alpine AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json ./
RUN npm install --no-audit --no-fund

# ---------- 构建 ----------
FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# ---------- 运行 ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# 首次启动自动建表并写入 seed 数据, 然后启动应用
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx prisma db seed && npm run start"]
