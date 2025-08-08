# 根目录 Dockerfile
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
RUN apk update

# 设置 pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Pruner stage - 使用 turbo 进行依赖裁剪
FROM base AS pruner
WORKDIR /app
RUN pnpm config set registry https://registry.npmmirror.com && pnpm add -g turbo
COPY . .
# 为 NestJS API 裁剪依赖
RUN turbo prune --scope=api --scope=@repo/shared-types --docker

# Builder stage - 构建应用
FROM base AS builder
WORKDIR /app

# 复制裁剪后的依赖文件和lock文件
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# 安装依赖
RUN pnpm config set registry https://registry.npmmirror.com && pnpm install --frozen-lockfile

# 复制源代码
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
COPY pnpm-workspace.yaml pnpm-workspace.yaml

# 构建 shared-types 包
RUN pnpm turbo build --filter=@repo/shared-types

# 执行 prisma generate
RUN pnpm turbo prisma:generate --filter=api

# 构建应用
RUN pnpm turbo build --filter=api

# Runtime stage - 确保 Prisma 客户端正确复制
FROM base AS runner
WORKDIR /app

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# 复制构建产物
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist

# 复制整个 node_modules 以确保 Prisma 客户端可用
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared-types ./packages/shared-types

COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared-types/package.json ./packages/shared-types/package.json

# 复制 Prisma 相关文件
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./apps/api/prisma

# 创建数据目录
RUN mkdir -p /app/data && chown nestjs:nodejs /app/data

USER nestjs

EXPOSE 3088
# 启动时确保在正确的目录执行迁移
CMD ["sh", "-c", "cd /app/apps/api && npx prisma migrate deploy && node dist/main.js"]
