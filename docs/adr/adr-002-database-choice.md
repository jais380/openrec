# ADR 002: Selection of PostgreSQL Database over MongoDB

* **Status:** Accepted
* **Date:** 2026-08-23
* **Deciders:** Jude (Lead Engineer)
* **Technical Domain:** Database Management / Primary Storage Layer

---

## Context and Problem Statement

OpenRec requires a reliable primary data store to handle live event ingestion, serve low-latency recommendation reads, and support high-frequency incremental delta synchronization for offline CLI model training.

During early architecture evaluation, a common alternative considered was a document store (MongoDB). We need to explicitly evaluate the trade-offs between a relational database engine (PostgreSQL) and a NoSQL document database (MongoDB) to determine the best primary storage foundation for OpenRec.

---

## Options Considered

### Option A: PostgreSQL (Relational Database Engine) - Chosen
Utilize PostgreSQL alongside TypeORM in the NestJS ingestion server as the central source of truth for users, items, interaction primitives, and batch recommendation matrices.

* **Pros:**
  * **Inherent Relational Fit:** User interaction datasets are fundamentally relational (User $\leftrightarrow$ Item $\leftrightarrow$ Event Type $\leftrightarrow$ Weight).
  * **Efficient Delta Querying:** Excellent SQL indexing (B-Tree/BRIN) on `createdAt` timestamps enables low-overhead execution of incremental sync queries (`GET /api/sync/delta`).
  * **Strict Data Integrity:** Relational foreign keys and composite unique indexes prevent corrupt or duplicate user-item recommendation pairs during bulk sync operations.
  * **Extensibility:** Built-in `JSONB` support allows semi-structured metadata storage without sacrificing relational guarantees.
  * **Open-Source & Resource-Conscious:** Predictable memory footprint and low CPU overhead when deployed on self-hosted, resource-constrained nodes.
* **Cons:**
  * Requires explicit schema definition and database migration management.
  * Requires optimized bulk `UPSERT` queries to prevent lock contention during high-volume prediction pushes.

### Option B: MongoDB (Document-Oriented Database)
Utilize MongoDB to store user interactions and recommendation matrices as flexible JSON documents.

* **Pros:**
  * Flexible schema design allows seamless field updates without migration scripts.
  * High horizontal write throughput out-of-the-box for raw event logging.
* **Cons:**
  * **Query Complexity:** Joining user, item, and recommendation records requires application-layer lookups or heavy aggregation pipelines (`$lookup`).
  * **Resource Footprint:** Higher baseline RAM utilization per database node compared to PostgreSQL, conflicting with resource-constrained deployment goals.
  * **Orphaned Record Risk:** Lack of strict foreign key constraints increases the risk of inconsistent interaction data during batch processing.

---

## Decision Outcome

**Chosen Option:** **Option A (PostgreSQL)**.

PostgreSQL provides the optimal balance of relational data modeling, query flexibility, strict data integrity, and low resource overhead. "Resource-constrained" system design demands conscious architectural discipline rather than avoiding relational guarantees; PostgreSQL fulfills this by delivering predictable memory usage and robust SQL indexing capabilities.

---

## Consequences & Trade-offs

### Positive Consequences
1. **System Predictability:** Schema definitions enforced via TypeORM prevent bad data payloads from entering the ingestion pipeline.
2. **Bandwidth & Compute Savings:** Native SQL indexing on timestamp deltas keeps network payload generation fast and lightweight for the Python CLI.
3. **Data Integrity:** Composite unique constraints on `(userId, itemId)` ensure idempotent bulk recommendation updates.

### Negative Consequences / Risks to Mitigate
1. **Migration Management:** Requires maintainers to write and test explicit TypeORM migrations for schema evolution.
2. **Write Bottlenecks:** High-frequency event ingestion must use batched DB writes or connection pooling to handle concurrency gracefully.

---

## Compliance & Validation

This decision will be validated by:
* Successfully executing TypeORM schema migrations on server startup.
* Measuring database query performance on `GET /api/sync/delta` using indexed `createdAt` columns under simulated high-load datasets.
