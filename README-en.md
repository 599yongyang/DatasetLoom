# DatasetLoom — Intelligent Dataset Platform for Multimodal Large Model Training

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=TypeScript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-black?logo=nextdotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F44F44?logo=pnpm&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-3578E5?logo=turborepo&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

> 🚀 An intelligent platform for building and evaluating **multimodal training datasets**, supporting image-text QA, image captioning, DPO datasets, AI scoring, and training corpus export.

<div align="center">
  <img src="./assets/logo.svg" alt="DatasetLoom Logo" width="80%" />
</div>

<div align="center">
  🌐 <a href="README.md">简体中文</a> | <strong>English</strong>
</div>

---

## 🌟 Project Overview

**DatasetLoom** is a high-quality **dataset construction platform for multimodal AI training**, designed for AI engineers, researchers, and teams.

Built on a modern **Monorepo architecture** with **Next.js + NestJS + Turborepo**, it enables clean separation between frontend and backend, with high maintainability and extensibility. The platform supports a full pipeline from document parsing and image annotation to model evaluation and corpus export, empowering efficient creation of training data for SFT, DPO, VQA, Image Captioning, and more.

🎯 Key Capabilities:
- Supervised Fine-Tuning (SFT) corpus generation
- Preference alignment (DPO) dataset construction
- Visual Question Answering (VQA) and image captioning
- AI-powered output scoring and model comparison
- Support for GPT-4V, LLaVA, Qwen-VL, and other multimodal models
- Multi-user collaboration with role-based access control

---

## ✨ Core Features

| Feature | Description |
|--------|-------------|
| **Multimodal Data Support** | Upload and parse images, PDF, Word, Markdown, TXT, and more |
| **Smart Document Chunking** | Auto-split documents by paragraph, heading, or semantic boundaries |
| **Image Annotation & Generation** | Region labeling, image captioning, and VQA generation |
| **AI Scoring System** | Automatically score model outputs using LLMs, with multi-model comparison |
| **DPO/SFT Dataset Builder** | Configurable strategies to generate preference pairs or instruction-tuning data |
| **User & Permission Management** | Role-based access (Admin, Collaborator, Guest) |
| **Training Corpus Export** | Export datasets in JSON, CSV, or HuggingFace Dataset format |
| **API Documentation** | Fully documented REST APIs via Swagger at `/api-docs` |
| **Multi-Database Support** | SQLite (default), MySQL, PostgreSQL, SQL Server |

---

## 📸 Preview Screenshots

| Login Page | Project List |
|----------|--------------|
| ![Login](./assets/screenshot/login.png) | ![Project List](./assets/screenshot/project-list.png) |

| Document Management | Chunking Strategy |
|---------------------|-------------------|
| ![Document List](./assets/screenshot/document-list.png) | ![Chunker](./assets/screenshot/document-chunker.png) |

| Question List | Dataset Export |
|--------------|----------------|
| ![Questions](./assets/screenshot/question-list.png) | ![Export](./assets/screenshot/dataset-export.png) |

> 🔍 **API Docs**: [http://localhost:3088/api-docs](http://localhost:3088/api-docs)

---

## 🛠 Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | Next.js App Router + React 18 + Tailwind CSS |
| Backend | NestJS + TypeScript + RESTful API + Swagger |
| ORM | Prisma |
| Build Tool | Turborepo + pnpm |
| Database | SQLite / MySQL / PostgreSQL / SQL Server |
| Deployment | Docker + Docker Compose |

---

## 🚀 Quick Start (Development)

### 1. Clone the Repository

```bash
git clone https://github.com/599yongyang/DatasetLoom.git
cd DatasetLoom
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

> Edit `.env` to configure your `DATABASE_URL` (see "Database Support" below).

### 3. Install pnpm (Package Manager)

This project uses [pnpm](https://pnpm.io/) — a **fast, disk-efficient package manager** with built-in monorepo support.

Install it via npm:
```bash
npm install -g pnpm
```

Or enable via corepack (Node.js 16.13+):
```bash
corepack enable
corepack prepare pnpm@latest --activate
```

> 💡 Verify with `pnpm --version`

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Initialize Database

```bash
pnpm --filter=api prisma:migrate
```

### 6. Start Development Server

```bash
# Recommended: Start both frontend and backend
pnpm run dev

# Or start separately
pnpm --filter=web dev
pnpm --filter=api dev
```

- 🌐 Frontend: [http://localhost:2088](http://localhost:2088)
- 🔌 Backend API: [http://localhost:3088](http://localhost:3088)
- 📄 API Docs: [http://localhost:3088/api-docs](http://localhost:3088/api-docs)

---

## 🐳 Docker Deployment (Recommended for Production)

Full Docker support is provided for easy deployment.

### 1. Prepare Environment File

```bash
cp .env.example .env
```

> Optionally edit `.env` (e.g., database connection).

### 2. Build and Start

```bash
docker compose up -d --build
```

### 3. Access Services

- 🌐 Frontend: [http://localhost:2088](http://localhost:2088)
- 🔌 Backend API: [http://localhost:3088](http://localhost:3088)
- 📄 API Docs: [http://localhost:3088/api-docs](http://localhost:3088/api-docs)

---

## 🗄️ Database Support

DatasetLoom supports multiple SQL databases via Prisma.

| Database | Recommended Use |
|---------|-----------------|
| ✅ SQLite | Local development, no setup required |
| ✅ MySQL | Mid-scale deployments, mature ecosystem |
| ✅ PostgreSQL | **Recommended for production**, supports JSONB, full-text search, vectors |
| ✅ SQL Server | Enterprise-grade security and compliance |

### How to Switch

Edit `apps/api/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Options: "mysql", "sqlite", "sqlserver"
  url      = env("DATABASE_URL")
}
```

Set connection string in `.env`:

```env
# PostgreSQL (Recommended)
DATABASE_URL="postgresql://user:password@db:5432/datasetloom?schema=public"

# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/datasetloom"

# SQLite (Default)
DATABASE_URL="file:./dev.sqlite"
```

---

## 🧠 Typical Use Cases

| Scenario | Description |
|--------|-------------|
| **AI Training Data Generation** | Rapidly build SFT/DPO datasets for fine-tuning LLMs or multimodal models |
| **Academic & Research Data Curation** | Parse papers, textbooks, and generate Q&A pairs, summaries, exercises |
| **Domain-Specific Knowledge Bases** | Structured Q&A for healthcare, legal, finance, and other verticals |
| **Model Evaluation & Benchmarking** | Compare outputs from GPT-4V, LLaVA, Qwen-VL, etc. |
| **Team Collaboration** | Multi-user annotation with role-based permissions |
| **Multimodal Understanding** | Joint image-text processing for aligned training data |

---

## 🤝 Contributing

Issues and PRs are welcome!

### Contribution Steps:
1. Fork the project
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit and push your changes
4. Open a Pull Request

💡 Before submitting:
```bash
pnpm run format
pnpm run typecheck
```

---

## 📜 License

This project is licensed under the [MIT License](LICENSE), free for use, modification, and commercial purposes.

---

## 🌟 Support the Project

If you find DatasetLoom helpful, please give it a ⭐ **Star**!  
Your support helps keep the project maintained and evolving. 💙

> GitHub: [https://github.com/599yongyang/DatasetLoom](https://github.com/599yongyang/DatasetLoom)

---
