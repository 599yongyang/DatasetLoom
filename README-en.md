# DatasetLoom

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=TypeScript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-black?logo=nextdotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F44F44?logo=pnpm&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-3578E5?logo=turborepo&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

> An intelligent dataset construction and evaluation platform for **multimodal large model training**, built with **Next.js + NestJS**, supporting end-to-end workflows including image-text Q&A, image captioning, DPO datasets, model scoring, and training corpus export.

![DatasetLoom Logo](/assets/logo.svg)

---

[[简体中文](README.md) | [English](README-en.md)]

---

## 🧩 Project Overview

**DatasetLoom** is a **high-quality multimodal training dataset construction platform** designed for AI engineers, researchers, and teams.

Built on a modern **Turborepo + pnpm** monorepo architecture, it decouples the frontend (Next.js) and backend (NestJS) for independent development and deployment.

The platform supports various LLM and multimodal model training tasks, including:
- Supervised Fine-Tuning (SFT)
- Preference Alignment (DPO)
- Image Captioning
- Visual Question Answering (VQA)
- Model Output Scoring (AI Evaluation)
- Multi-model Comparison (GPT-4V, LLaVA, CLIP, etc.)

---

## ✨ Core Features

| Category | Description |
|--------|-------------|
| **Frontend-Backend Separation** | Independent frontend (Next.js) and backend (NestJS) development with clean, documented APIs |
| **Multimodal Dataset Creation** | Support for generating multimodal training data including images, text, and image-text Q&A |
| **Model Evaluation & Scoring** | AI-powered scoring, multi-model comparison, and quality assessment |
| **Document Parsing** | Upload and process PDF, Word, Markdown, TXT files; extract chunks and knowledge |
| **Image Annotation & Chunking** | Region-based image labeling, image captioning, and VQA generation |
| **User & Permission Management** | Login, registration, role-based access control (Admin, Collaborator, Viewer) |
| **Data Persistence** | All data automatically saved to the database |
| **Training Corpus Export** | Export datasets in JSON, CSV, or HuggingFace Dataset formats |
| **API Documentation** | Backend integrates Swagger; visit `/api-docs` to view and test all APIs |

---

## 📸 Screenshots

| Login Page | Project List |
|-----------|--------------|
| ![Login Screenshot](/assets/screenshot/login.png) | ![Project List Screenshot](/assets/screenshot/project-list.png) |
| Knowledge Base | Chunking Strategy |
| ![Knowledge Base Screenshot](/assets/screenshot/document-list.png) | ![Chunking Strategy Screenshot](/assets/screenshot/document-chunker.png) |
| Chunk List | Chunk Merge |
| ![Chunk List Screenshot](/assets/screenshot/chunk-list.png) | ![Chunk Merge Screenshot](/assets/screenshot/chunk-merge.png) |
| Question Generation Strategy | Question List |
| ![Question Strategy Screenshot](/assets/screenshot/question-strategy.png) | ![Question List Screenshot](/assets/screenshot/question-list.png) |
| Dataset Generation Strategy | Dataset List |
| ![Dataset Strategy Screenshot](/assets/screenshot/dataset-strategy.png) | ![Dataset List Screenshot](/assets/screenshot/dataset-list.png) |
| Dataset Details | Dataset Export |
| ![Dataset Details Screenshot](/assets/screenshot/dataset-info.png) | ![Dataset Export Screenshot](/assets/screenshot/dataset-export.png) |

> 🔍 **API Documentation Preview**:  
> After launching the backend service, visit [http://localhost:3088/api-docs](http://localhost:3088/api-docs) to access the auto-generated Swagger documentation.

---

## 📦 Database Support

DatasetLoom supports the following SQL database engines, allowing flexible selection based on your deployment needs:

| Database | Description |
|---------|-------------|
| ✅ SQLite | Default local development database; no setup required, ideal for rapid prototyping |
| ✅ MySQL | Suitable for medium-scale deployments with connection pooling and index optimization |
| ✅ PostgreSQL | Recommended for production; supports JSONB, full-text search, and semantic vector storage |
| ✅ SQL Server | Enterprise-grade deployment support, ideal for high-security environments (e.g., finance, healthcare) |

### 🛠 How to Switch Databases

Modify the `provider` field in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite" // Options: "postgresql", "mysql", "sqlserver"
  url      = env("DATABASE_URL")
}
```

### 🔁 Example DATABASE_URL Configurations (`.env` file):

```env
# SQLite (default)
DATABASE_URL="file:./dev.db"

# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/dbname"

# PostgreSQL (recommended for production)
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

# SQL Server
DATABASE_URL="sqlserver://localhost:1433;database=db_practice;user=admin;password=pass;encrypt=true"
```

> ⚠️ Different databases have slight variations in field length limits, indexing, and JSON type support. Please refer to the Prisma documentation for compatibility details.

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/599yongyang/DatasetLoom.git
cd DatasetLoom
```

### 2. Create Environment File

```bash
cp .env.example .env
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Start Development Server

```bash
# Start both frontend and backend (recommended)
pnpm run dev

# Or start separately
pnpm --filter=web dev
pnpm --filter=api dev
```

- Frontend: 👉 [http://localhost:2088](http://localhost:2088)
- Backend API: 👉 [http://localhost:3088](http://localhost:3088)
- API Docs: 👉 [http://localhost:3088/api-docs](http://localhost:3088/api-docs)

#### Build and Preview Production Environment:

```bash
pnpm run build
pnpm run db:deploy
pnpm run start
```

---

## 🧠 Use Cases

| Scenario | Description |
|--------|-------------|
| Training Data Generation | Rapidly build instruction-tuning and preference-alignment corpora |
| Model Performance Evaluation | Evaluate model understanding and generation using custom test sets |
| Educational & Research Data Curation | Parse textbooks, papers, slides to generate Q&A pairs, summaries, exercises |
| Domain-Specific Knowledge (Medical/Legal) | Build vertical-domain Q&A and conversational datasets from specialized documents |
| Team Collaboration & Project Management | Role-based permissions for collaborative dataset creation |
| Multimodal Training Data | Generate training data from images, audio, video for multimodal understanding |

---

## 🤝 Contributing

Pull requests and issue reports are welcome!

If you like this project, please give it a ⭐ star and share it with others who might benefit!

---

## 📜 License

This project is licensed under the [MIT License](LICENSE). You are free to modify, distribute, and use it commercially.
