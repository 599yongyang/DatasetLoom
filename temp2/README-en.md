# DatasetLoom

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=TypeScript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-black?logo=nextdotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F44F44?logo=pnpm&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

> **An intelligent dataset building and evaluation platform for multimodal large model training**, supporting tasks such as visual question answering (VQA), image captioning, DPO dataset generation, model scoring, and training corpus export.

![DatasetLoom Logo](/public/full-logo.svg)

---

[[简体中文](README.md) | [English](./README-en.md)]

## 🧩 Project Overview

**DatasetLoom** is a high-quality dataset building platform tailored for AI engineers, researchers, and teams working with **multimodal large models**.

It supports a wide range of training tasks, including:

- Supervised Fine-tuning (SFT)
- Direct Preference Optimization (DPO)
- Image Captioning
- Visual Question Answering (VQA)
- Model output scoring (AI-based evaluation)
- Multi-model comparison (e.g., GPT-4V, LLaVA, CLIP)

With a modular architecture, visual interface, and unified data structure, DatasetLoom streamlines the entire workflow — from raw data to structured training samples.

---

## ✨ Core Features

| Feature Category                | Description                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| **Multimodal Dataset Building** | Supports training data generation for image, text, VQA, and more                     |
| **Model Evaluation & Scoring**  | AI-powered scoring, multi-model comparison, quality assessment                       |
| **Document Parsing**            | Upload and parse PDF, Word, Markdown, TXT, and more                                  |
| **Image Annotation & Chunking** | Supports image region labeling, VQA generation, and image captioning                 |
| **User & Role Management**      | Login, registration, and role-based access control (Admin, Collaborator, Guest)      |
| **Data Persistence**            | All dialog records, question generation, and dataset versions are stored in database |
| **Training Corpus Export**      | Export datasets in JSON, CSV, HuggingFace Dataset, and more formats                  |
| **Workflow Engine (Beta)**      | Asynchronous task scheduling system based on Redis for complex workflows             |
| **Tech Stack**                  | TypeScript + Next.js 15 + Tailwind CSS + Prisma ORM + Redis (optional)               |

---

## 📸 Screenshots

| Login Page                                                                | Project List                                                            |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| ![Login Screenshot](/public/screenshot/login.png)                         | ![Project List Screenshot](/public/screenshot/project-list.png)         |
| Knowledge Base                                                            | Chunking Strategy                                                       |
| ![Knowledge Base Screenshot](/public/screenshot/document-list.png)        | ![Chunker Strategy Screenshot](/public/screenshot/document-chunker.png) |
| Chunk List                                                                | Chunk Merging                                                           |
| ![Chunk List Screenshot](/public/screenshot/chunk-list.png)               | ![Chunk Merge Screenshot](/public/screenshot/chunk-merge.png)           |
| Question Generation Strategy                                              | Question List                                                           |
| ![Question Strategy Screenshot](/public/screenshot/question-strategy.png) | ![Question List Screenshot](/public/screenshot/question-list.png)       |
| Dataset Generation Strategy                                               | Dataset List                                                            |
| ![Dataset Strategy Screenshot](/public/screenshot/dataset-strategy.png)   | ![Dataset List Screenshot](/public/screenshot/dataset-list.png)         |
| Dataset Details                                                           | Dataset Export                                                          |
| ![Dataset Info Screenshot](/public/screenshot/dataset-info.png)           | ![Dataset Export Screenshot](/public/screenshot/dataset-export.png)     |
| Project Details                                                           | Model Configuration                                                     |
| ![Project Info Screenshot](/public/screenshot/project-info.png)           | ![Model Config Screenshot](/public/screenshot/model-config.png)         |
| Project Prompt                                                            | Workflow List                                                           |
| ![Project Prompt Screenshot](/public/screenshot/project-prompt.png)       | ![Workflow List Screenshot](/public/screenshot/workflow-list.png)       |
| Workflow Details                                                          | Workflow Execution                                                      |
| ![Workflow Info Screenshot](/public/screenshot/workflow-info.png)         | ![Workflow Log Screenshot](/public/screenshot/workflow-log.png)         |

---

## 📦 Database Support

DatasetLoom supports the following SQL database engines. You can choose based on your deployment needs:

| Database      | Description                                                                                |
| ------------- | ------------------------------------------------------------------------------------------ |
| ✅ SQLite     | Default local dev database, no setup required, ideal for prototyping                       |
| ✅ MySQL      | Suitable for mid-scale deployments, supports connection pooling and index optimization     |
| ✅ PostgreSQL | Recommended for production, supports JSONB, full-text search, and vector storage           |
| ✅ SQL Server | Enterprise-grade deployments, ideal for high-security scenarios like finance or healthcare |

### 🛠 Switching Database

To switch database, simply update the `provider` field in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite" // Options: "postgresql", "mysql", "sqlserver"
  url      = env("DATABASE_URL")
}
```

### 🔁 Example DATABASE_URL Configurations (`.env`)

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

> ⚠️ Notes:
>
> - There are slight differences in field length, index, and JSON type support across databases. Please refer to the Prisma official docs for compatibility.

---

## 🚀 Quick Start

Follow these steps to get started quickly:

### 1. Clone the repository

```bash
git clone https://github.com/599yongyang/DatasetLoom.git
cd DatasetLoom
```

### 2. Create the environment file

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

> ⚠️ **Important:**
>
> - If you're using the **Workflow feature**, make sure Redis is configured:
>     ```env
>     REDIS_URL=localhost
>     REDIS_PORT=6379
>     REDIS_PASSWORD=
>     ```
> - The Workflow feature is currently in **Beta**, so there may be instability or updates. Please follow the latest developments.
> - If you don’t need Workflow, you can skip Redis configuration.

---

### 3. Install dependencies

The project uses [pnpm](https://pnpm.io/) for package management. Make sure pnpm is installed:

```bash
pnpm install
```

> 💡 If pnpm is not installed yet:
>
> ```bash
> npm install -g pnpm
> ```

---

### 4. Run the development server

#### Start in development mode:

```bash
pnpm run dev
```

The service runs by default at: 👉 [http://localhost:2088](http://localhost:2088)

#### Build and preview in production mode:

```bash
pnpm run build
pnpm run db:deploy
pnpm run start
```

Preview URL: 👉 [http://localhost:2088](http://localhost:2088)

---

## 🧠 Use Cases

| Use Case                             | Description                                                                             |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| Training Data Generation             | Build instruction tuning and preference alignment datasets                              |
| Model Performance Evaluation         | Evaluate model understanding and generation capabilities                                |
| Educational & Research Data Curation | Parse textbooks, papers, and course materials into Q&A, summaries, and exercises        |
| Domain-Specific Knowledge Building   | Build domain-specific Q&A and dialogue datasets for legal, medical, and other verticals |
| Team Collaboration                   | Role-based access control for team-based dataset building                               |
| Multimodal Training                  | Generate training data for images, audio, video (future)                                |

---

## 🤝 Contribution Guide

Contributions are welcome!  
Feel free to submit PRs or open issues.

If you like this project, please give it a ⭐ and share it with others!

---

## 📜 License

This project is licensed under the [MIT License](LICENSE), allowing free modification, redistribution, and commercial use.
