![DatasetLoom](/public/full-logo.svg)

# DatasetLoom

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=TypeScript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-black?logo=nextdotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F44F44?logo=pnpm&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

[//]: # '![Build Status](https://img.shields.io/github/actions/workflow/status/599yongyang/DatasetLoom/build.yml?branch=main )'
[//]: # '![GitHub Issues](https://img.shields.io/github/issues/599yongyang/DatasetLoom )'
[//]: # '![GitHub Stars](https://img.shields.io/github/stars/599yongyang/DatasetLoom?style=social )'
[//]: # '![Last Commit](https://img.shields.io/github/last-commit/599yongyang/DatasetLoom )'

> 一个面向大语言模型（LLM）训练数据集生成的可视化工具。

DatasetLoom 是一个基于 [Easy Dataset](https://github.com/ConardLi/easy-dataset) 的全面重构项目，采用现代前端技术栈（TypeScript、Next.js
15、shadcn/ui）重新实现，并进行了大量功能优化与架构升级。

> ⚠️ 本项目为非官方版本

---

## 🧩 项目简介

DatasetLoom 致力于帮助开发者和研究人员快速构建高质量的结构化训练数据集，适用于 LLM 微调、评估、测试等多个场景。

---

## 📸 截图（示例）

| 主页界面                                 | 项目列表                                             |
| ---------------------------------------- | ---------------------------------------------------- |
| ![主页截图](/public/screenshot/home.png) | ![项目列表截图](/public/screenshot/project-list.png) |

| 文档列表                                              | 文档chunker                                        |
| ----------------------------------------------------- | -------------------------------------------------- |
| ![文献列表截图](/public/screenshot/document-list.png) | ![文档chunker截图](/public/screenshot/chunker.png) |

| 分块列表                                           | 分块合并                                            |
| -------------------------------------------------- | --------------------------------------------------- |
| ![分块列表截图](/public/screenshot/chunk-list.png) | ![分块合并截图](/public/screenshot/chunk-merge.png) |

| 问题列表                                              | 数据集列表                                           |
| ----------------------------------------------------- | ---------------------------------------------------- |
| ![问题列表截图](/public/screenshot/question-list.png) | ![分块合并截图](/public/screenshot/dataset-list.png) |

| 数据集详情                                             | 数据集导出                                               |
| ------------------------------------------------------ | -------------------------------------------------------- |
| ![数据集详情截图](/public/screenshot/dataset-info.png) | ![数据集导出截图](/public/screenshot/dataset-export.png) |

| 工作流配置                                         | 工作流节点配置                                                |
| -------------------------------------------------- | ------------------------------------------------------------- |
| ![工作流配置截图](/public/screenshot/workflow.png) | ![工作流节点配置截图](/public/screenshot/workflow-config.png) |

| 提示词配置                                               | 模型配置                                             |
| -------------------------------------------------------- | ---------------------------------------------------- |
| ![提示词配置截图](/public/screenshot/project-prompt.png) | ![模型列表截图](/public/screenshot/model-config.png) |

---

## 🚀 快速开始

按照以下步骤快速启动项目：

### 1. 克隆仓库

```bash
git clone https://github.com/599yongyang/DatasetLoom.git
cd DatasetLoom
```

### 2. 安装依赖

本项目使用 [pnpm](https://pnpm.io/) 进行包管理，请确保你已安装 pnpm：

```bash
pnpm install
```

> 💡 如未安装 pnpm，可通过 npm 快速安装：
>
> ```bash
> npm install -g pnpm
> ```

### 3. 启动开发环境

#### 开发服务器（热重载）：

```bash
pnpm run dev
```

服务默认运行在：👉 [http://localhost:2088](http://localhost:2088)

#### 预览生产构建效果：

```bash
pnpm run preview
```

预览地址同上：👉 [http://localhost:2088](http://localhost:2088)

---

## 📜 第三方代码说明

本项目最初基于 [Easy Dataset](https://github.com/ConardLi/easy-dataset) 的 Apache License 2.0 版本进行重构与优化。

本项目目前采用 [MIT License](LICENSE)，不包含原项目 AGPL 3 的任何新版本代码。

---

## 🤝 贡献指南

欢迎提交 PR 或提出 issue！

---

## 📜 许可证

[MIT License](LICENSE)
