# ADR 004: Ingestion Endpoint Architecture — Polymorphic Batch Ingestion over Single-Event Processing

* **Status:** Accepted
* **Date:** 2026-08-31
* **Deciders:** Jude (Lead Engineer)
* **Technical Domain:** API Design / Ingestion Pipeline / Data Validation

---

## Context and Problem Statement

Client applications (e.g., mobile apps, web stores) continually generate user interaction events (`click`, `view`, `purchase`, `rating`). Transmitting every event as an isolated HTTP request produces excessive network overhead, high connection pool stress on NestJS, and CPU/IOPS thrashing on PostgreSQL.

We need to define the validation and route architecture for the `POST /api/events` endpoint to support high-throughput event collection while protecting system stability in resource-constrained deployment environments.

---

## Options Considered

### Option A: Single-Event Ingestion Only
Expose an API route that accepts exactly one interaction event per HTTP request body.

* **Pros:** Simple controller logic and straightforward DTO validation.
* **Cons:**
  * Extreme network RTT (Round Trip Time) overhead on low-bandwidth or unstable cellular connections.
  * High database connection pool utilization due to high-frequency single-row SQL `INSERT` statements.

### Option B: Polymorphic Single/Batch Union Ingestion with Zod Validation (Chosen)
Expose a single unified endpoint (`POST /api/events`) that accepts either a single event object or a batched array of events (up to a capped maximum of 500 items per batch). Validate incoming payloads using a runtime `ZodValidationPipe`.

* **Pros:**
  * **Bandwidth & RTT Efficiency:** Clients buffer events locally and flush them in a single HTTP request, conserving network usage.
  * **Database Efficiency:** NestJS executes batched TypeORM insertions (`repo.save(events)`), converting payload arrays into optimized multi-row SQL `INSERT` queries.
  * **Flexible Client Integration:** Supports low-latency immediate delivery (single event) and buffered queue flushing (batch) on the same route.
  * **Strict Runtime Safety:** Zod union validation guarantees schema correctness for both single objects and arrays before entering the service layer.
* **Cons:**
  * Requires custom pipe handling (`ZodValidationPipe`) and batch array caps to prevent memory exhaustion.

### Option C: Asynchronous Message Queue Broker (Kafka / RabbitMQ)
Direct client events to an intermediate message broker before persisting them to PostgreSQL.

* **Pros:** Maximum write decoupling and resilience against backend outages.
* **Cons:**
  * Introduces complex infrastructure dependencies, conflicting with OpenRec's goal of running efficiently in low-resource environments.

---

## Decision Outcome

**Chosen Option:** **Option B (Polymorphic Single/Batch Union Ingestion)**.

Supporting batching via a Zod-validated union schema optimizes network transport and database insert performance without adding external infrastructure dependencies like message queues.

---

## Consequences & Trade-offs

### Positive Consequences
1. **Network Conservation:** Reduces HTTP handshake overhead over mobile data networks.
2. **Database Performance:** Enables multi-row SQL `INSERT` operations in TypeORM.
3. **Type Safety:** Zod validation enforces strict field constraints (UUID project IDs, finite numerical interaction values, enum types) before database execution.

### Negative Consequences / Risks to Mitigate
1. **Memory Protection:** Batches are strictly capped at 500 items in `createInteractionEventBatchSchema` to block memory exhaustion attacks.

---

## Compliance & Validation

This decision is validated by:
* Jest unit tests covering single payload parsing, valid array batch parsing, empty array rejections, and oversized batch (>500 item) rejections in `CreateInteractionEventBatchSchema`.
* `ZodValidationPipe` throwing `BadRequestException` on malformed inputs.
* Integration tests verifying batched record persistence in `InteractionEventService`.