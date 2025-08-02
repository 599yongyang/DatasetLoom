# ==============================
# 构建阶段
# ==============================
FROM node:20-alpine AS builder

WORKDIR /app

# 构建参数
ARG DATABASE_TYPE=sqlite
ARG USE_MIRROR=true

# 替换 Alpine 国内源（加速 apk）
RUN if [ "$USE_MIRROR" = "true" ]; then \
    sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories; \
  fi

# 安装构建依赖（精简：仅需 python3 sqlite）
RUN apk add --no-cache python3 && \
  if [ "$DATABASE_TYPE" = "sqlite" ]; then \
    apk add --no-cache sqlite; \
  fi

# 设置 npm 镜像源（淘宝）
RUN if [ "$USE_MIRROR" = "true" ]; then \
    npm config set registry https://registry.npmmirror.com; \
  fi && \
  npm install -g pnpm@latest

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
COPY ../prisma ./prisma

# 安装所有依赖（包括 devDependencies）
RUN pnpm install --no-frozen-lockfile

# 复制源码
COPY .. .

# 构建前：生成 Prisma Client
RUN npx prisma generate --no-hints

# 构建应用
RUN pnpm run build

# 清理缓存
RUN rm -rf /app/.next/cache


# ==============================
# 运行阶段
# ==============================
FROM node:20-alpine

# 创建数据目录
RUN mkdir -p /app/data/local-db /app/data/uploads /data && \
    chown -R node:node /app /data

WORKDIR /app

# 安装运行时依赖
ARG DATABASE_TYPE=sqlite

RUN npm install -g pnpm@latest && \
    if [ "$DATABASE_TYPE" = "sqlite" ]; then \
      apk add --no-cache sqlite && \
      touch /data/db.sqlite && \
      chown -R node:node /data && \
      chmod 664 /data/db.sqlite; \
    fi

# 复制构建产物
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json .
COPY --from=builder /app/pnpm-lock.yaml .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env .env

RUN chown -R node:node ./node_modules

# 环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV LOCAL_DB_PATH=/app/data/local-db

# 切换到非 root 用户
USER node

EXPOSE 2088

# 启动命令：先 deploy 迁移，再启动应用
CMD ["sh", "-c", "npx prisma migrate deploy && pnpm run start"]
