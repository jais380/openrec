# ADR 001: Selection of RESTful Hybrid Architecture over Shared Database Access

* **Status:** Accepted
* **Date:** 2026-18-02
* **Deciders:** Jude (Lead Engineer)
* **Technical Domain:** System Architecture / Synchronization Protocols

---

## Context and Problem Statement

OpenRec is designed to serve as a developer-first recommendation engine capable of operating in resource-constrained environments (e.g., emerging markets with high data costs, frequent power outages, and erratic network connectivity).

To achieve this, the system must separate live user event ingestion (high concurrency, low latency) from machine learning model training (compute-heavy, long-running). We need to determine the optimal communication pattern between the live cloud ingestion service (NestJS/PostgreSQL) and the local training engine (Python CLI/SQLite3).

---

## Options Considered

### Option A: Direct Live Database Access (Shared Database Model)
The Python CLI connects directly to the production PostgreSQL database over the public internet, executes batch queries to pull raw interaction data, runs training locally, and writes predictions directly back into PostgreSQL.

* **Pros:** Simple to implement; eliminates the need to build intermediate synchronization endpoints.
* **Cons:**
  * High vulnerability to network drops and sudden power loss, which can leave open connections, locked database tables, or partially committed transaction states in production.
  * Direct exposure of production database credentials to client environment variables.
  * Inefficient network usage due to unoptimized queries across remote connections.

### Option B: RESTful Hybrid Event-Sourcing & Delta Sync (Chosen)
The Python CLI never communicates with the production database directly. Instead, the NestJS API exposes authenticated REST endpoints for incremental data retrieval (`GET /api/sync/delta`) and bulk recommendation upload (`POST /api/recommendations/bulk`). The CLI pulls only data updated since its last recorded timestamp, processes it locally in SQLite3, and pushes completed predictions back over HTTP.

* **Pros:**
  * Complete isolation of the production PostgreSQL database from client-side execution environments.
  * Fault-tolerant by design: network interruptions during sync roll back cleanly on the client side without affecting production data integrity.
  * Minimizes network payload sizes by transferring only incremental data deltas.
  * Enforces API-level validation and rate-limiting on incoming push payloads.
* **Cons:**
  * Requires building and maintaining dedicated sync and bulk-upload endpoints on the NestJS backend.
  * Data must be serialized and deserialized (JSON) across HTTP boundaries.

### Option C: File-Based Object Storage Exchange (Decoupled Blob Storage)
NestJS periodically exports interaction logs as compressed CSV or Parquet files to object storage (e.g., Cloudflare R2 / AWS S3). The CLI downloads raw files, trains offline, and uploads output prediction files back to storage for asynchronous database ingestion.

* **Pros:** Fully decoupled; scalable for ultra-large datasets.
* **Cons:**
  * Introduces cloud storage costs, violating the project goal of minimizing infrastructure overhead.
  * Adds high latency between model training completion and live recommendation availability.
  * Unnecessary complexity for small-to-medium datasets.

---

## Decision Outcome

**Chosen Option:** **Option B (RESTful Hybrid Event-Sourcing & Delta Sync)**.

Option B delivers the highest degree of system resilience and architectural rigor. It protects production database integrity under unstable infrastructural conditions while enforcing clean boundary separation between microservices.

---

## Consequences & Trade-offs

### Positive Consequences
1. **Security:** Production DB credentials remain isolated within the cloud environment.
2. **Resilience:** Power failures during training cycles only affect local SQLite transaction states, leaving production unaffected.
3. **Efficiency:** Incremental delta queries conserve bandwidth in low-connectivity settings.

### Negative Consequences / Risks to Mitigate
1. **Serialization Overhead:** Large payloads transferred over REST must be paginated to prevent memory pressure on the NestJS server.
2. **Implementation Effort:** Requires building authentication (Bearer tokens) and payload validation specifically for machine-to-machine sync.

---

## Compliance & Validation

This decision will be validated by:
* Testing CLI sync behavior under simulated network disconnects to verify data rollback safety.
* Implementing integration tests in NestJS for the `GET /api/sync/delta` and `POST /api/recommendations/bulk` routes.
