# DatasetLoom — Intelligent Dataset Construction Platform for Multimodal Large Model Training

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=TypeScript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-black?logo=nextdotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F44F44?logo=pnpm&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-3578E5?logo=turborepo&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

> 🚀 An intelligent platform for **multimodal large model training**, supporting end-to-end workflows including visual question answering, image captioning, DPO dataset generation, AI scoring, and training corpus export.

<div align="center">
  <img src="./assets/logo.svg" alt="DatasetLoom Logo" width="80%" />
</div>

<div align="center">
  🌐 <a href="README.md"><strong>简体中文</strong></a> | <strong>English</strong>
</div>

---

## 🌟 Project Overview

**DatasetLoom** is a high-quality **multimodal dataset construction platform**, designed for AI engineers, researchers, and teams.

Built on a modern **Monorepo architecture** using **Next.js + NestJS + Turborepo**, it enables frontend-backend decoupling, high maintainability, and flexible scalability. The platform supports a complete data pipeline—from document parsing and image annotation to model scoring and corpus export—while integrating **RAG (Retrieval-Augmented Generation)** capabilities to enable large models to generate dialogue datasets **based on real-world knowledge**, thereby creating more professional, accurate, and traceable SFT and DPO training data.

🎯 Core Capabilities:
- Supervised Fine-Tuning (SFT) corpus generation
- Preference alignment (DPO) dataset construction
- Visual Question Answering (VQA) and image captioning
- Automatic model output scoring and comparison
- Generate realistic, professional, and well-grounded dialogue datasets from uploaded documents using RAG
- Support for embedding model configuration and Qdrant vector database
- Integration with multiple models (GPT-4V, LLaVA, Qwen-VL, etc.)
- Multi-user collaboration and role-based access control

---

## ✨ Key Features

| Feature | Description |
|--------|-------------|
| **Multimodal Data Support** | Supports uploading and parsing of images, PDFs, Word, Markdown, TXT, and more |
| **Smart Document Chunking** | Automatic chunking by paragraph, heading, or semantic boundaries |
| **Image Annotation & Generation** | Supports region labeling, VQA, and one-click image captioning |
| **AI Auto-Scoring System** | Leverages LLMs to score output quality with multi-model comparison |
| **DPO/SFT Dataset Construction** | Configurable strategies to generate preference pairs or instruction-tuning samples |
| **RAG-Enhanced Dialogue Generation** | Empowers models to generate expert-level dialogue data based on real documents |
| **Embedding Model Management** | Supports OpenAI, Hugging Face, and locally deployed embedding models |
| **Vector Database Integration** | Built-in **Qdrant** support for high-performance vector storage and similarity search |
| **User & Permission Management** | Role-based access (Admin, Collaborator, Guest) |
| **Training Corpus Export** | Export in JSON, CSV, HuggingFace Dataset, and other formats |
| **API Documentation** | Backend integrated with Swagger; access `/api-docs` for debugging |
| **Multi-Database Support** | SQLite (default), MySQL, PostgreSQL, SQL Server |

---

## 📸 Preview Screenshots

| Login Page | Project List |
|----------|--------------|
| ![Login Page](./assets/screenshot/login.png) | ![Project List](./assets/screenshot/project-list.png) |

| Document Management | Chunking Strategy |
|---------------------|-------------------|
| ![Document List](./assets/screenshot/document-list.png) | ![Chunker Settings](./assets/screenshot/document-chunker.png) |

| Question Generation | Dataset Export |
|---------------------|----------------|
| ![Question List](./assets/screenshot/question-list.png) | ![Export Interface](./assets/screenshot/dataset-export.png) |

> 🔍 **API Documentation**: [http://localhost:3088/api-docs](http://localhost:3088/api-docs)

---

## 🛠 Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | Next.js App Router + React 18 + Tailwind CSS |
| Backend | NestJS + TypeScript + RESTful API + Swagger |
| ORM | Prisma |
| Vector Database | Qdrant |
| Build Tool | Turborepo + pnpm |
| Database | SQLite / MySQL / PostgreSQL / SQL Server |
| Deployment | Docker + Docker Compose |

### 📦 Why pnpm?

> Fast, disk space efficient package manager
> - ⚡ **Fast**: Up to 2x faster than npm
> - 💾 **Efficient**: Files in `node_modules` are hard-linked or cloned from a single content-addressable store
> - 🧩 **Monorepo Ready**: Built-in support for multi-package repositories
> - 🔒 **Strict**: Non-flat `node_modules` by default, preventing undeclared dependencies

Learn more: [https://pnpm.io](https://pnpm.io)

---

## 🚀 Quick Start (Development)

### 1. Clone the Repository

```bash
git clone https://github.com/599yongyang/DatasetLoom.git
cd DatasetLoom
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

> Modify `DATABASE_URL` in `.env` to match your database (see "Database Support" below).

### 3. Install pnpm (Package Manager)

This project uses [pnpm](https://pnpm.io). If not installed:

```bash
# Install via npm (recommended)
npm install -g pnpm

# Or use corepack (Node.js 16.13+)
corepack enable
corepack prepare pnpm@latest --activate
```

> 💡 Verify with `pnpm --version`.

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

Full Docker support for easy deployment to servers or cloud environments.

### 1. Prepare Environment File

```bash
cp .env.example .env
```

> Edit `.env` as needed (e.g., database and vector DB settings).

### 2. Build and Start Services

```bash
docker compose up -d --build
```

Services launched:
- `web`: Next.js frontend
- `api`: NestJS backend
- `qdrant`: Vector database for RAG retrieval

### 3. Access Services

- 🌐 Frontend: [http://localhost:2088](http://localhost:2088)
- 🔌 Backend API: [http://localhost:3088](http://localhost:3088)
- 📄 API Docs: [http://localhost:3088/api-docs](http://localhost:3088/api-docs)
- 🧠 Qdrant UI: [http://localhost:6333/dashboard](http://localhost:6333/dashboard)

---

## 🗄️ Database Support

DatasetLoom supports multiple SQL databases via Prisma.

| Database | Recommended Use Case |
|--------|------------------------|
| ✅ SQLite | Local development, zero config |
| ✅ MySQL | Small to medium deployments, mature ecosystem |
| ✅ PostgreSQL | **Recommended for production**, supports JSONB, full-text search, and future vector extensions |
| ✅ SQL Server | Enterprise-grade security and compliance |

### How to Switch

Update the `provider` in `apps/api/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Options: "mysql", "sqlite", "sqlserver"
  url      = env("DATABASE_URL")
}
```

Set corresponding connection string in `.env`:

```env
# PostgreSQL (recommended)
DATABASE_URL="postgresql://user:password@db:5432/datasetloom?schema=public"

# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/datasetloom"

# SQLite (default for dev)
DATABASE_URL="file:./dev.sqlite"
```

---

## 🧠 Typical Use Cases

| Scenario | Description |
|--------|-------------|
| **AI Training Data Generation** | Rapidly build SFT/DPO datasets for fine-tuning LLMs or multimodal models |
| **Academic & Research Data Curation** | Parse papers, textbooks to generate Q&A pairs, summaries, exercises |
| **Domain-Specific Knowledge Bases** | Structure documents in healthcare, law, finance for Q&A generation |
| **Model Evaluation & Comparison** | Compare outputs from GPT-4V, LLaVA, Qwen-VL, etc. |
| **Team Collaboration & Annotation** | Support multi-user workflows with clear permission controls |
| **Multimodal Content Understanding** | Joint image + text processing to generate aligned multimodal data |
| **RAG-Driven Dialogue Data Generation** | Generate professional, accurate, and source-traceable SFT/DPO dialogue datasets from real documents |

---

## 🤝 Contribution Guide

We welcome Issues and Pull Requests!

### Contribution Steps:
1. Fork the project
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit and push your changes
4. Submit a PR

💡 Before submitting, run:
```bash
pnpm run format
pnpm run typecheck
```

---

## 📜 License

This project is licensed under the [MIT License](LICENSE), permitting free use, modification, and commercial applications.

---

## 🌟 Support the Project

If you find DatasetLoom helpful, please give it a ⭐ **Star**!  
Your support motivates us to keep improving and maintaining the project 💙

> GitHub: [https://github.com/599yongyang/DatasetLoom](https://github.com/599yongyang/DatasetLoom)
