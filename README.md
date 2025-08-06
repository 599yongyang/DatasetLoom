# DatasetLoom

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=TypeScript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-black?logo=nextdotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F44F44?logo=pnpm&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-3578E5?logo=turborepo&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

> 一个面向**多模态大模型**训练的智能数据集构建与评估平台，采用 **Next.js + NestJS** 架构，支持图文问答、图像描述、DPO 数据集、模型评分、训练语料导出等全流程。

![DatasetLoom Logo](/assets/logo.svg)

---

[[简体中文](README.md) | [English](README-en.md)]

---

## 🧩 项目简介

**DatasetLoom** 是一款专为 AI 工程师、研究人员和团队打造的**高质量多模态训练数据集构建平台**。

基于 **Turborepo + pnpm** 的现代化 Monorepo 架构，将前端（Next.js）与后端（NestJS）解耦实现


平台支持多种 LLM 与多模态模型训练任务，如：
- 监督微调（SFT）
- 偏好对齐（DPO）
- 图像描述生成（Image Captioning）
- 图文问答生成（VQA）
- 模型输出评分（AI 评估）
- 多模型对比（GPT-4V、LLaVA、CLIP 等）


---

## ✨ 核心特性

| 功能分类 | 特性描述 |
|----------|----------|
| **前后端分离** | 前端（Next.js）、后端（NestJS）独立开发、部署，API 清晰可文档化 |
| **多模态数据集构建** | 支持图像、文本、图文问答等多模态训练数据生成 |
| **模型评估与评分** | 支持 AI 自动评分、多模型对比、质量评估 |
| **文档解析** | 支持 PDF、Word、Markdown、TXT 等格式上传、分块提取、知识抽取 |
| **图像标注与分块** | 支持图像区域标注、图文问答生成、图像描述生成 |
| **用户与权限管理** | 支持登录、注册、项目成员角色分配（管理员、协作者、访客） |
| **数据持久化** | 所有数据自动保存至数据库 |
| **训练语料导出** | 支持导出为 JSON、CSV、HuggingFace Dataset 等格式 |
| **API 文档** | 后端集成 Swagger，访问 `/api-docs` 即可查看和测试所有接口 |

---

## 📸 截图展示

| 登录页 | 项目列表 |
|--------|----------|
| ![主页截图](/assets/screenshot/login.png) | ![项目列表截图](/assets/screenshot/project-list.png) |
| 知识库 | Chunker策略 |
| ![知识库截图](/assets/screenshot/document-list.png) | ![chunker策略截图](/assets/screenshot/document-chunker.png) |
| 分块列表 | 分块合并 |
| ![分块列表截图](/assets/screenshot/chunk-list.png) | ![分块合并截图](/assets/screenshot/chunk-merge.png) |
| 生成问题策略 | 问题列表 |
| ![生成问题策略截图](/assets/screenshot/question-strategy.png) | ![问题列表截图](/assets/screenshot/question-list.png) |
| 生成数据集策略 | 数据集列表 |
| ![生成数据集策略截图](/assets/screenshot/dataset-strategy.png) | ![数据集列表截图](/assets/screenshot/dataset-list.png) |
| 数据集详情 | 数据集导出 |
| ![数据集详情截图](/assets/screenshot/dataset-info.png) | ![数据集导出截图](/assets/screenshot/dataset-export.png) |

> 🔍 **API 文档预览**：  
> 后端服务启动后，访问 [http://localhost:3088/api-docs](http://localhost:3088/api-docs) 查看自动生成的 Swagger 文档。

---

## 📦 数据库支持

DatasetLoom 支持以下 SQL 数据库引擎，你可以根据你的部署需求灵活选择：

| 数据库 | 描述 |
|--------|------|
| ✅ SQLite | 默认本地开发数据库，无需配置，适合快速原型开发 |
| ✅ MySQL | 适用于中等规模部署，支持连接池、索引优化 |
| ✅ PostgreSQL | 推荐用于生产环境，支持 JSONB、全文搜索、语义向量存储 |
| ✅ SQL Server | 支持企业级部署，适合金融、医疗等高安全性场景 |

### 🛠 切换数据库方式：

只需修改 `prisma/schema.prisma` 文件中的 `provider` 字段：

```prisma
datasource db {
  provider = "sqlite" // 可选："postgresql", "mysql", "sqlserver"
  url      = env("DATABASE_URL")
}
```

### 🔁 示例 DATABASE_URL 配置（`.env` 文件）：

```env
# SQLite（默认）
DATABASE_URL="file:./dev.db"

# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/dbname"

# PostgreSQL（推荐生产使用）
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

# SQL Server
DATABASE_URL="sqlserver://localhost:1433;database=db_practice;user=admin;password=pass;encrypt=true"
```

> ⚠️ 不同数据库对字段长度、索引、JSON 类型的支持略有差异，建议参考 Prisma 官方文档进行适配。

---

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/599yongyang/DatasetLoom.git
cd DatasetLoom
```

### 2. 创建环境变量文件

```bash
cp .env.example .env
```

---

### 3. 安装依赖

```bash
pnpm install
```

---

### 4. 启动开发环境

```bash
# 同时启动前端和后端（推荐）
pnpm run dev

# 或分别启动
pnpm --filter=web dev
pnpm --filter=api dev
```

- 前端服务：👉 [http://localhost:2088](http://localhost:2088)
- 后端 API：👉 [http://localhost:3088](http://localhost:3088)
- API 文档：👉 [http://localhost:3088/api-docs](http://localhost:3088/api-docs)

#### 构建与预览生产环境：

```bash
pnpm run build
pnpm run db:deploy
pnpm run start
```

---

## 🧠 使用场景

| 场景 | 描述 |
|------|------|
| 训练数据生成 | 快速构建指令微调、偏好对齐等训练语料 |
| 模型性能评估 | 通过自定义测试集评估模型的语言理解与生成能力 |
| 教育科研数据整理 | 解析教材、论文、课件等内容，生成问答对、摘要、练习题等数据 |
| 医疗/法律领域知识构建 | 结合领域文档，构建垂直领域的问答数据集与对话式数据集 |
| 多人协作项目管理 | 支持权限控制，适用于团队协作的数据集构建任务 |
| 多模态训练数据生成 | 支持图像、音频、视频等多模态内容理解与训练数据生成 |

---

## 🤝 贡献指南

欢迎提交 PR 或提出 issue！

如果你喜欢这个项目，不妨给项目一颗 ⭐ star，或者分享给需要的人！

---

## 📜 许可证

本项目采用 [MIT License](LICENSE)，你可以自由地进行修改、分发与商用。
