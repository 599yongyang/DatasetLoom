#!/bin/bash

set -e

echo "🚀 开始部署 Dataset-Loom 应用..."

# 构建并启动应用
echo "🔨 构建应用镜像..."
docker compose build --no-cache

echo "🏃 启动应用服务..."
docker compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
timeout=60
counter=0

while [ $counter -lt $timeout ]; do
    if curl -f http://localhost:2088 >/dev/null 2>&1; then
        echo "✅ 应用启动成功！"
        echo "🌐 访问地址: http://localhost:2088"
        echo "📊 查看日志: docker compose logs -f"
        exit 0
    fi

    echo "等待中... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done

echo "❌ 应用启动超时，检查日志:"
docker compose logs app
exit 1
