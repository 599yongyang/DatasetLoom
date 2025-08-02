#!/bin/bash
# deploy.sh - 部署 Dataset-Loom 应用（支持国内镜像加速）

set -euo pipefail  # 更严格的错误处理

# 颜色定义（美化输出）
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}" >&2
}

info() {
    echo -e "🚀 $1"
}

# -------------------------------
# 用户可配置参数
# -------------------------------
DATABASE_TYPE="${DATABASE_TYPE:-sqlite}"
USE_MIRROR="${USE_MIRROR:-true}"  # 默认启用国内镜像（适合国内用户）
REBUILD="${REBUILD:-false}"       # 是否强制重新构建
HOST_PORT="${HOST_PORT:-2088}"
CONTAINER_PORT=2088

# -------------------------------
# 启动部署
# -------------------------------
info "开始部署 Dataset-Loom 应用..."

echo "🔧 配置详情:"
echo "   - 数据库类型: $DATABASE_TYPE"
echo "   - 使用国内镜像加速: $USE_MIRROR"
echo "   - 主机端口: $HOST_PORT"
echo "   - 强制重建: $REBUILD"

# 构建镜像
if [ "$REBUILD" = "true" ] || ! docker image inspect dataset-loom:latest >/dev/null 2>&1; then
    log "正在构建应用镜像..."

    # 传递构建参数给 Docker
    docker compose build \
        --build-arg DATABASE_TYPE="$DATABASE_TYPE" \
        --build-arg USE_MIRROR="$USE_MIRROR" \
        ${REBUILD:+--no-cache}

    log "镜像构建完成"
else
    warn "使用已有镜像 dataset-loom:latest（如需重建，请设置 REBUILD=true）"
fi

# 启动服务
log "启动应用服务..."
docker compose up -d

# -------------------------------
# 等待服务就绪
# -------------------------------
log "等待应用启动（最长 60 秒）..."
timeout=60
counter=0
started=false

while [ $counter -lt $timeout ]; do
    # 检查容器是否运行
    if ! docker compose ps -q app | xargs docker inspect -f '{{.State.Running}}' 2>/dev/null | grep -q true; then
        sleep 2
        counter=$((counter + 2))
        continue
    fi

    # 尝试访问健康端点（可改为 /api/health 如果你有）
    if curl -f http://localhost:$HOST_PORT >/dev/null 2>&1; then
        started=true
        break
    fi

    printf "等待中... (%d/%d)\r" "$counter" "$timeout"
    sleep 2
    counter=$((counter + 2))
done

echo

if [ "$started" = true ]; then
    log "应用启动成功！"
    echo
    echo -e "${GREEN}🌐 访问地址: http://localhost:$HOST_PORT${NC}"
    echo -e "${GREEN}📁 本地数据库路径: ./local-db${NC}"
    echo -e "${GREEN}📊 查看日志: docker compose logs -f app${NC}"
    echo -e "${GREEN}⏹️  停止服务: docker compose down${NC}"
    echo
else
    error "应用启动超时，请检查日志:"
    echo
    docker compose logs app
    exit 1
fi

exit 0
