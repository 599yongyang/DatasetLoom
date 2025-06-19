# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 根据数据库类型安装构建依赖
ARG DATABASE_TYPE=sqlite
RUN if [ "$DATABASE_TYPE" = "sqlite" ]; then \
      apk add --no-cache python3 py3-pip build-base git sqlite; \
    else \
      apk add --no-cache python3 py3-pip build-base git; \
    fi

# 设置 Python 环境变量
ENV PYTHON=/usr/bin/python3
ENV NEXT_TELEMETRY_DISABLED=1

# 复制包管理文件和 Prisma 相关文件
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# 安装 pnpm
RUN npm install -g pnpm@latest

# 安装依赖
RUN pnpm fetch && \
    pnpm install -r --offline --frozen-lockfile

# 复制源码
COPY . .

# 构建 Next.js 应用
RUN pnpm run build

# 清理构建缓存
RUN rm -rf /app/.next/cache

# 运行阶段
FROM node:20-alpine

# 创建所有需要的目录并设置权限
RUN mkdir -p /app/data/local-db /app/data/uploads /data && \
    chown -R node:node /app /data

WORKDIR /app
RUN npm install -g pnpm@latest
# 根据数据库类型安装运行时依赖
ARG DATABASE_TYPE=sqlite
RUN if [ "$DATABASE_TYPE" = "sqlite" ]; then \
      apk add --no-cache sqlite && \
      mkdir -p /data && \
      touch /data/db.sqlite && \
      chown -R node:node /data && \
      chmod -R 664 /data/db.sqlite; \
    fi

# 从构建阶段拷贝必要文件
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json .
COPY --from=builder /app/pnpm-lock.yaml .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env .env

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV LOCAL_DB_PATH=/app/data/local-db
# 切换到非 root 用户
USER node

EXPOSE 2088

# 启动
CMD ["sh", "-c", "npx prisma db push && pnpm run start"]
