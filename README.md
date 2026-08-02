# openRec

> **An open-source, offline-first batch recommendation engine engineered for low-bandwidth and resource-constrained environments.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NestJS](https://img.shields.io/badge/Backend-NestJS-E0234E?logo=nestjs)](https://nestjs.com/)
[![Python](https://img.shields.io/badge/CLI_Engine-Python_3.10+-3776AB?logo=python)](https://python.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![SQLite](https://img.shields.io/badge/Local_Cache-SQLite3-003B57?logo=sqlite)](https://www.sqlite.org/)

---

## Overview

**openRec** is a developer-first, cloud-decoupled recommendation system engine designed to bring collaborative filtering and personalized recommendations to resource-constrained environments.

Traditional cloud recommendation services require persistent high-bandwidth connectivity, expensive continuous compute infrastructure, and direct database couplings—making them prohibitive for small-to-medium enterprises (SMEs) and independent developers operating in regions with high data costs and unstable infrastructure.

**openRec** solves this by decoupling live user interaction logging from heavy model training:
1. **Live Ingestion (Cloud):** A lightweight NestJS REST API records live user interactions to PostgreSQL with minimal latency overhead.
2. **Local Batch Training (Edge/Dev Machine):** A Python CLI fetches incremental interaction logs (Delta Sync), caches them locally in SQLite, runs batch training offline (via Scikit-Surprise), and safely pushes generated prediction matrices back to production.

---

## System Architecture

```text
+-----------------------+              +------------------------+              +-----------------------+
|  Client Applications  | --(POST)-->  |  NestJS Ingestion API  | <----------> | PostgreSQL Production |
|  (Web / Mobile Apps)  |              |   (ingestion-server)   |              |       Database        |
+-----------------------+              +------------------------+              +-----------------------+
                                                       ^
                                                       | (RESTful Delta Sync & Bulk Recommendation Push)
                                                       v
                                           +------------------------+              +-----------------------+
                                           |   Python Training CLI  | <----------> |  Local SQLite3 Cache  |
                                           |     (training-cli)     |              |  & State Checkpoint   |
                                           +------------------------+              +-----------------------+
                                                       |
                                            [ Scikit-Surprise ML ]

```

---

## Key Technical Features

* **Offline-First Delta Sync Protocol:** The CLI fetches only interaction records logged since the last successful execution timestamp, minimizing data payload sizes and bandwidth utilization over unstable connections.
* **Fault-Tolerant Checkpointing:** Built-in training state tracking inside SQLite allows long-running batch training loops to survive sudden power cuts or system interruptions, resuming seamlessly upon restart.
* **Zero Production DB Exposure:** The CLI interacts exclusively through authenticated NestJS endpoints—preventing direct production database exposure, table locking, or corruption risks during network dropouts.
* **Domain-Agnostic Schema:** Built around weighted interaction primitives (clicks, views, purchases, ratings), making it instantly compatible with e-commerce, EdTech, streaming, or publishing platforms.
* **Architectural Rigor:** System trade-offs and engineering choices are documented using formal Architecture Decision Records (ADRs).

---

## Monorepo Structure

```text
openrec/
├── docs/                     # Architectural documentation & research
│   └── adr/                  # Architecture Decision Records (ADRs)
├── ingestion-server/         # NestJS RESTful API & PostgreSQL entities
│   ├── src/
│   │   ├── recommendations/  # Interaction tracking & recommendation endpoints
│   │   └── main.ts
│   └── package.json
├── training-cli/             # Python CLI engine & ML training pipeline
│   ├── src/                  # Scripts, Surprise integration, & SQLite cache
│   └── pyproject.toml
├── LICENSE                   # MIT License
└── README.md                 # Project Overview & Whitepaper

```

---

## Tech Stack

| Subsystem | Framework / Language | Storage / Libraries | Role |
| --- | --- | --- | --- |
| **Ingestion API** | NestJS (TypeScript) | PostgreSQL, TypeORM | Live event collection, CLI sync endpoints, prediction serving |
| **Training Engine** | Python 3.10+ | Scikit-Surprise, Pandas, HTTPX, Typer | Local data ingestion, matrix factorization, batch ML training |
| **Local Cache** | SQLite3 | Native SQLite, TQDM | Local data persistence, transaction logs, crash-resilient checkpoints |

---

## Getting Started

### Prerequisites

* Node.js (v18+) & pnpm
* Python (v3.10+)
* PostgreSQL database instance

### 1. Ingestion Server Setup

```bash
cd ingestion-server
pnpm install
# Configure your database credentials in .env
pnpm run start:dev

```

### 2. Training CLI Setup

```bash
cd training-cli
python -m venv .venv
# Activate virtual environment (On Windows: .venv\Scripts\activate)
source .venv/bin/activate
pip install -r requirements.txt

```

---

## Architecture Decision Records (ADRs)

See the [`docs/adr/`](https://www.google.com/search?q=./docs/adr/) directory for detailed breakdowns of key engineering decisions:

* [ADR-001: Selection of RESTful Hybrid Architecture over Shared Database Access](https://www.google.com/search?q=./docs/adr/adr-001-architecture-choice.md)

---

## License

Distributed under the **MIT License**. See [`LICENSE`](https://www.google.com/search?q=./LICENSE) for more information.

```
