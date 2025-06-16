# DatasetLoom

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=TypeScript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-black?logo=nextdotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F44F44?logo=pnpm&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

> 一个面向大语言模型（LLM）的智能数据集构建与评估工具。

![DatasetLoom Logo](/public/full-logo.svg)

---

## 🧩 项目简介

**DatasetLoom** 是一款专为开发者和研究人员打造的高质量训练数据集构建平台，支持多种 LLM
场景下的数据生成任务，如监督微调（SFT）、偏好对齐（DPO）、以及多维度的回答质量评估。通过模块化设计与可视化界面，帮助用户高效完成从原始数据到结构化训练样本的全流程处理，并新增以下关键功能：

- ✅ **大模型回答质量评估功能**：支持基于评分标准或自动化指标评估模型输出的质量。
- 📄 **文档解析功能**：支持 PDF、Word、Markdown 等格式的文档上传与内容提取。
- 🔐 **用户登录与注册功能**：引入身份验证系统，保障数据安全与权限控制。
- 💾 **对话数据持久化**：将用户与模型的交互记录保存至数据库，便于后续分析与复用。
- 👥 **项目成员管理功能**：可为团队成员分配不同角色与权限，实现协作开发。

---

## ✨ 核心特性

| 功能分类           | 特性描述                                                                   |
| ------------------ | -------------------------------------------------------------------------- |
| 数据集构建         | 支持 SFT、DPO 等主流 LLM 微调数据集生成                                    |
| 模型评估           | 支持模型进行多维评估策略                                                   |
| 文档解析           | 支持 PDF、DOCX、TXT、MD 等格式文档上传、分块提取、知识抽取                 |
| 数据存储           | 所有对话记录、问题生成、数据集版本均自动保存至数据库                       |
| 权限管理           | 项目内成员可按角色分配权限（管理员、协作者、访客）                         |
| 可视化操作         | 提供图形化界面用于管理知识库、问题生成策略、数据集导出与 Hugging Face 上传 |
| 工作流引擎（Beta） | 基于 Redis 的异步任务调度系统，支持复杂流程自动化                          |
| 技术栈             | TypeScript + Next.js 15 + Tailwind CSS + Prisma ORM                        |

---

## 📸 截图展示（示例）

| 登录页                                                        | 项目列表                                                   |
| ------------------------------------------------------------- | ---------------------------------------------------------- |
| ![主页截图](/public/screenshot/login.png)                     | ![项目列表截图](/public/screenshot/project-list.png)       |
| 知识库                                                        | Chunker策略                                                |
| ![知识库截图](/public/screenshot/document-list.png)           | ![chunker策略截图](public/screenshot/document-chunker.png) |
| 分块列表                                                      | 分块合并                                                   |
| ![分块列表截图](public/screenshot/chunk-list.png)             | ![分块合并截图](public/screenshot/chunk-merge.png)         |
| 生成问题策略                                                  | 问题列表                                                   |
| ![生成问题策略截图](/public/screenshot/question-strategy.png) | ![问题列表截图](/public/screenshot/question-list.png)      |
| 生成数据集策略                                                | 数据集列表                                                 |
| ![生成数据集策略截图](public/screenshot/dataset-strategy.png) | ![数据集列表截图](public/screenshot/dataset-list.png)      |
| 数据集详情                                                    | 数据集导出                                                 |
| ![数据集详情截图](public/screenshot/dataset-info.png)         | ![数据集导出截图](public/screenshot/dataset-export.png)    |
| 项目详情                                                      | 模型配置                                                   |
| ![项目详情截图](public/screenshot/project-info.png)           | ![模型配置截图](public/screenshot/model-config.png)        |
| 项目提示词                                                    | 工作流列表                                                 |
| ![项目提示词截图](public/screenshot/project-prompt.png)       | ![工作流列表截图](public/screenshot/workflow-list.png)     |
| 工作流详情                                                    | 工作流执行                                                 |
| ![工作流详情截图](public/screenshot/workflow-info.png)        | ![工作流执行截图](public/screenshot/workflow-log.png)      |

---

## 🗂️ 数据库支持

DatasetLoom 支持以下 SQL 数据库引擎，你可以根据你的部署需求灵活选择：

| 数据库        | 描述                                                 |
| ------------- | ---------------------------------------------------- |
| ✅ SQLite     | 默认本地开发数据库，无需配置，适合快速原型开发       |
| ✅ MySQL      | 适用于中等规模部署，支持连接池、索引优化             |
| ✅ PostgreSQL | 推荐用于生产环境，支持 JSONB、全文搜索、语义向量存储 |
| ✅ SQL Server | 支持企业级部署，适合金融、医疗等高安全性场景         |

### 🛠 切换数据库方式：

只需修改 `prisma/schema.prisma` 文件中的 `provider` 字段即可切换数据库类型：

```prisma
datasource db {
  provider = "postgresql" // 可选："sqlite", "mysql", "sqlserver"
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

> ⚠️ 注意事项：
>
> - 不同数据库对字段长度、索引、JSON 类型的支持略有差异，建议参考 Prisma 官方文档进行适配。

---

## 🚀 快速开始

按照以下步骤快速启动项目：

### 1. 克隆仓库

```bash
git clone https://github.com/599yongyang/DatasetLoom.git
cd DatasetLoom
```

### 2. 创建环境变量文件

在项目根目录中复制 `.env.example` 文件并重命名为 `.env`：

```bash
cp .env.example .env
```

> ⚠️ **重要提示：**
>
> - 如果你计划使用 **工作流功能（Workflow）**，请确保已正确配置 Redis：
>
>     ```env
>     REDIS_URL=localhost
>     REDIS_PORT=6379
>     REDIS_PASSWORD=
>     ```
>
> - 工作流功能目前仍处于 **Beta 阶段**，可能存在不稳定或功能迭代，请留意最新动态。
> - 如果你不使用工作流，可以跳过 Redis 相关配置。

---

### 3. 安装依赖

本项目使用 [pnpm](https://pnpm.io/) 进行包管理，请确保你已安装 pnpm：

```bash
pnpm install
```

> 💡 如未安装 pnpm，可通过 npm 快速安装：
>
> ```bash
> npm install -g pnpm
> ```

---

### 4. 启动开发环境

#### 运行开发环境：

```bash
pnpm run dev
```

服务默认运行在：👉 [http://localhost:2088](http://localhost:2088)

#### 构建与预览生产环境：

```bash
pnpm run build
pnpm run start
```

预览地址同上：👉 [http://localhost:2088](http://localhost:2088)

---

## 📌 使用场景

| 场景                  | 描述                                                       |
| --------------------- | ---------------------------------------------------------- |
| 训练数据生成          | 快速构建指令微调、偏好对齐等训练语料                       |
| 模型性能评估          | 通过自定义测试集评估模型的语言理解与生成能力               |
| 教育科研数据整理      | 解析教材、论文、课件等内容，生成问答对、摘要、练习题等数据 |
| 医疗/法律领域知识构建 | 结合领域文档，构建垂直领域的问答数据集与对话式数据集       |
| 多人协作项目管理      | 支持权限控制，适用于团队协作的数据集构建任务               |

---

## 🤝 贡献指南

欢迎提交 PR 或提出 issue！

如果你喜欢这个项目，不妨给项目一颗 ⭐ star，或者分享给需要的人！

---

## 📜 许可证

本项目采用 [MIT License](LICENSE)，你可以自由地进行修改、分发与商用。

---
