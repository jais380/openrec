# ADR 003: Selection of JSONB Storage for Recommendation Predictions over a Relational Join Table

* **Status:** Accepted
* **Date:** 2026-08-29
* **Deciders:** Jude (Lead Engineer)
* **Technical Domain:** Data Persistence / Database Schema Design

---

## Context and Problem Statement

When the offline Python CLI engine completes batch collaborative filtering training, it generates pre-ranked recommendation vectors for users. The system must store these output predictions in PostgreSQL so that the NestJS API can serve them to client applications via low-latency HTTP endpoints (`GET /api/recommendations/:userId`).

We need to decide between storing predictions in a denormalized `JSONB` array within a single prediction row versus normalizing them across a relational join table (`recommendation_items`).

---

## Options Considered

### Option A: Normalized Relational Join Table (`recommendation_items`)
Create a join table where each recommended item occupies a separate row linked via foreign key to a user or prediction record (e.g., `user_id`, `item_id`, `score`, `rank`).

* **Pros:**
  * Adheres strictly to standard 3rd Normal Form (3NF) relational database design.
  * Allows standard SQL querying, filtering, and aggregation on individual recommended items.
* **Cons:**
  * **High Write Volume:** Pushing predictions for 10,000 users (with 20 recommended items each) requires inserting or updating 200,000 individual table rows during every batch write-back cycle.
  * **Database Lock Contention:** Mass row deletions and insertions cause IOPS spikes, index fragmentation, and database lock contention in PostgreSQL.
  * **Read Overhead:** Fetching top recommendations for a single user requires scanning and sorting multiple rows or executing join operations.

### Option B: Denormalized `JSONB` Document Storage (Chosen)
Store pre-ranked recommendation arrays directly within a `jsonb` column (`recommended_item_ids`) on the `recommendation_predictions` entity, indexed uniquely by `(project_id, user_id)`.

* **Pros:**
  * **$O(1)$ Single-Row Read Latency:** Serving recommendations to a client application requires fetching exactly one row by indexed keys, eliminating join and aggregation overhead.
  * **Atomic Single-Row Upserts:** Updating a user's recommendation set becomes a single atomic `UPSERT` (`INSERT ... ON CONFLICT (project_id, user_id) DO UPDATE`).
  * **Reduced Write Amplification:** Updating predictions for 10,000 users requires exactly 10,000 row updates rather than 200,000 individual row writes.
  * **Zero Orphaned Records:** Overwriting predictions completely replaces the JSON payload in place, eliminating stale or orphaned database rows.
* **Cons:**
  * Searching or aggregating across items inside the `JSONB` array requires PostgreSQL-specific JSON path operators (`jsonb_array_elements`).

---

## Decision Outcome

**Chosen Option:** **Option B (`JSONB` Document Storage)**.

`JSONB` provides $O(1)$ read performance for client requests and drastically reduces IOPS and lock contention during bulk write-backs from the training CLI. Because recommendation predictions are computed offline as read-ready artifacts, atomic array replacement outweighs the need for relational normalization on prediction items.

---

## Consequences & Trade-offs

### Positive Consequences
1. **API Speed:** Client recommendation queries execute as single-row index lookups.
2. **Bulk Upload Efficiency:** The CLI write-back loop achieves significantly higher throughput with minimal database resource consumption.
3. **Schema Flexibility:** Stores item IDs along with floating-point prediction scores without requiring schema migrations for structure changes.

### Negative Consequences / Risks to Mitigate
1. **Payload Size Validation:** NestJS DTOs and Zod validation pipes must enforce maximum bounds on array lengths to prevent storing oversized JSON blobs.

---

## Compliance & Validation

This decision is validated by:
* The `RecommendationPrediction` entity implementation using `@Column({ name: 'recommended_item_ids', type: 'jsonb' })`.
* Unique composite index enforcement on `(projectId, userId)`.