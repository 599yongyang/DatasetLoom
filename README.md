# DatasetLoom - 多模态大模型训练数据智能构建平台

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=TypeScript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-black?logo=nextdotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F44F44?logo=pnpm&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-3578E5?logo=turborepo&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

> 🚀 一个面向 **多模态大模型训练** 的智能数据集构建与评估平台，支持图文问答、图像描述、DPO 数据集生成、AI 评分、训练语料导出等全流程。

<div align="center">
  <img src="./assets/logo.svg" alt="DatasetLoom Logo" width="80%" />
</div>

<div align="center">
  🌐 <strong>简体中文</strong> | <a href="README-en.md">English</a>
</div>

---

## 🌟 项目简介

**DatasetLoom** 是一款高质量的 **多模态训练数据集构建平台**，专为 AI 工程师、研究人员和团队设计。

基于 **Next.js + NestJS + Turborepo** 的现代化 Monorepo 架构，实现前后端解耦、高可维护性与灵活扩展。平台支持从文档解析、图像标注到模型评分、语料导出的完整数据流水线，集成 RAG 能力，让大模型“基于真实知识”生成对话数据集，**进而**构建更专业、准确、可追溯的 SFT 与 DPO 训练数据。

🎯 核心能力：
- 监督微调（SFT）语料生成
- 偏好对齐（DPO）数据集构建
- 图文问答（VQA）与图像描述生成
- 模型输出自动评分与对比
- 基于上传文档与 RAG 生成真实、专业、有依据的对话数据集
- 支持嵌入模型配置与 Qdrant 向量数据库
- 支持 GPT-4V、LLaVA、Qwen-VL 等多模型接入
- 多人协作与权限管理

---

## ✨ 核心特性

| 特性 | 说明 |
|------|------|
| **多模态数据支持** | 支持图像、PDF、Word、Markdown、TXT 等格式上传与解析 |
| **智能文档分块** | 支持按段落、标题、语义等方式自动分块 |
| **图像标注与生成** | 支持区域标注、图文问答、图像描述一键生成 |
| **AI 自动评分系统** | 集成大模型对输出质量打分，支持多模型对比 |
| **DPO/SFT 数据集构建** | 可配置策略生成偏好对或指令微调语料 |
| **RAG 增强对话生成** | 结合向量数据库，**驱动模型**基于真实文档生成专业对话数据 |
| **嵌入模型管理** | 支持 OpenAI、Hugging Face、本地部署的 Embedding 模型 |
| **向量数据库集成** | 内建 **Qdrant** 支持，高性能向量存储与相似度检索 |
| **用户与权限管理** | 支持角色控制（管理员、协作者、访客） |
| **训练语料导出** | 支持 JSON、CSV、HuggingFace Dataset 等格式导出 |
| **API 文档化** | 后端集成 Swagger，访问 `/api-docs` 即可调试 |
| **多数据库支持** | 支持 SQLite（默认）、MySQL、PostgreSQL、SQL Server |

---

## 📸 截图预览

| 登录页 | 项目列表 |
|--------|----------|
| ![登录页](./assets/screenshot/login.png) | ![项目列表](./assets/screenshot/project-list.png) |

| 文档管理 | 分块策略 |
|--------|----------|
| ![文档管理](./assets/screenshot/document-list.png) | ![分块策略](./assets/screenshot/document-chunker.png) |

| 问题生成 | 数据集导出 |
|--------|----------|
| ![问题列表](./assets/screenshot/question-list.png) | ![导出界面](./assets/screenshot/dataset-export.png) |

> 🔍 **API 文档地址**：[http://localhost:3088/api-docs](http://localhost:3088/api-docs)

---

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js App Router + React 18 + Tailwind CSS |
| 后端 | NestJS + TypeScript + RESTful API + Swagger |
| ORM | Prisma |
| 向量数据库 | Qdrant |
| 构建工具 | Turborepo + pnpm |
| 数据库 | SQLite / MySQL / PostgreSQL / SQL Server |
| 部署 | Docker + Docker Compose |

---

## 🚀 快速开始（开发环境）

### 1. 克隆项目

```bash
git clone https://github.com/599yongyang/DatasetLoom.git
cd DatasetLoom
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

> 修改 `.env` 中的 `DATABASE_URL` 以匹配你的数据库类型（见下文“数据库支持”）。

### 3. 安装 pnpm（包管理工具）

本项目使用 [pnpm](https://pnpm.io/) 作为包管理工具。如果尚未安装，请运行：

```bash
# 使用 npm 安装 pnpm（推荐）
npm install -g pnpm

# 或使用 corepack（Node.js 16.13+ 内置）
corepack enable
corepack prepare pnpm@latest --activate
```

> 💡 安装完成后，可通过 `pnpm --version` 验证是否成功。

### 4. 安装依赖

```bash
pnpm install
```

### 5. 初始化数据库

```bash
pnpm --filter=api prisma:migrate
```

### 6. 启动开发服务

```bash
# 推荐：同时启动前后端
pnpm run dev

# 或分别启动
pnpm --filter=web dev
pnpm --filter=api dev
```

- 🌐 前端：[http://localhost:2088](http://localhost:2088)
- 🔌 后端 API：[http://localhost:3088](http://localhost:3088)
- 📄 API 文档：[http://localhost:3088/api-docs](http://localhost:3088/api-docs)

---

## 🐳 Docker 部署（生产推荐）

本项目提供完整的 Docker 支持，便于一键部署至服务器或云环境。

### 1. 准备环境变量文件

```bash
cp .env.example .env
```

> 根据需要可编辑 `.env` 文件，例如修改数据库连接地址和向量数据库配置。

### 2. 构建并启动服务

```bash
docker compose up -d --build
```
启动服务包括：
- `web`：Next.js 前端
- `api`：NestJS 后端
- `qdrant`：向量数据库（用于 RAG 检索）

### 3. 访问服务

- 🌐 前端：[http://localhost:2088](http://localhost:2088)
- 🔌 后端 API：[http://localhost:3088](http://localhost:3088)
- 📄 API 文档：[http://localhost:3088/api-docs](http://localhost:3088/api-docs)
- 🧠 Qdrant UI：[http://localhost:6333/dashboard](http://localhost:6333/dashboard)

---

## 🗄️ 数据库支持

DatasetLoom 支持多种 SQL 数据库，通过 Prisma 实现无缝切换。

| 数据库 | 推荐场景 |
|--------|----------|
| ✅ SQLite | 本地开发，无需配置 |
| ✅ MySQL | 中小型部署，成熟生态 |
| ✅ PostgreSQL | **生产推荐**，支持 JSONB、全文搜索、向量 |
| ✅ SQL Server | 企业级安全与合规场景 |

### 切换方法

修改 `apps/api/prisma/schema.prisma` 中的 `provider`：

```prisma
datasource db {
  provider = "postgresql"  // 可选: "mysql", "sqlite", "sqlserver"
  url      = env("DATABASE_URL")
}
```

并在 `.env` 中设置对应连接字符串：

```env
# PostgreSQL（生产推荐）
DATABASE_URL="postgresql://user:password@db:5432/datasetloom?schema=public"

# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/datasetloom"

# SQLite（开发默认）
DATABASE_URL="file:./dev.sqlite"
```

---

## 🧠 典型使用场景

| 场景 | 描述 |
|------|------|
| **AI 训练数据生成** | 快速构建 SFT/DPO 数据集，用于微调 LLM 或多模态模型 |
| **教育科研数据整理** | 解析论文、教材，生成问答对、摘要、练习题 |
| **垂直领域知识库构建** | 医疗、法律、金融等领域文档结构化与问答生成 |
| **模型评估与对比** | 对比 GPT-4V、LLaVA、Qwen-VL 等模型输出质量 |
| **团队协作标注** | 支持多用户协作，权限控制清晰 |
| **多模态内容理解** | 图像 + 文本联合处理，生成图文对齐语料 |
| **RAG 驱动的对话数据生成** | 基于真实文档生成专业、准确、可追溯的 SFT/DPO 对话数据集 |
---

## 🤝 贡献指南

欢迎提交 Issue 或 Pull Request！

### 贡献流程：
1. Fork 项目
2. 创建功能分支：`git checkout -b feat/your-feature`
3. 提交更改并推送
4. 提交 PR

💡 提交前请运行：
```bash
pnpm run format
pnpm run typecheck
```

---

## 📜 许可证

本项目采用 [MIT License](LICENSE)，允许自由使用、修改与商用。

---

## 🌟 支持项目

如果你觉得 DatasetLoom 有帮助，请给项目一颗 ⭐ **Star**！  
感谢支持，将持续维护和优化本项目 💙

> GitHub: [https://github.com/599yongyang/DatasetLoom](https://github.com/599yongyang/DatasetLoom)

---
