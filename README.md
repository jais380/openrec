# openRec 🚀

> **An open-source, offline-first batch recommendation engine engineered for low-bandwidth and resource-constrained environments.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NestJS](https://img.shields.io/badge/Backend-NestJS-E0234E?logo=nestjs)](https://nestjs.com/)
[![Python](https://img.shields.io/badge/CLI Engine-Python_3.10+-3776AB?logo=python)](https://python.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![SQLite](https://img.shields.io/badge/Local_Cache-SQLite3-003B57?logo=sqlite)](https://www.sqlite.org/)

---

## 📌 Overview

**openRec** is a developer-first, cloud-decoupled recommendation system engine designed to bring collaborative filtering and personalized recommendations to resource-constrained environments.

Traditional cloud recommendation services (e.g., AWS Personalize) require persistent high-bandwidth connectivity, expensive continuous compute infrastructure, and direct database couplings—making them prohibitive for small-to-medium enterprises (SMEs) and independent developers operating in regions with high data costs and unstable infrastructure.

**openRec** solves this by decoupling live user interaction logging from heavy model training:
1. **Live Ingestion (Cloud):** A lightweight NestJS REST API records live user interactions to PostgreSQL with zero latency overhead.
2. **Local Batch Training (Edge/Dev Machine):** A Python CLI fetches incremental interaction logs (Delta Sync), caches them locally in SQLite, runs batch training offline (via `Scikit-Surprise`), and safely pushes generated prediction matrices back to production.

---

## 🏗️ System Architecture

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
