# ADR 005: Hybrid Time-Bound Cursor-Based Delta Synchronization Protocol

* **Status:** Accepted
* **Date:** 2026-09-15
* **Deciders:** Jude (Lead Engineer)
* **Technical Domain:** Sync Protocol / Data Pipeline Architecture

---

## Context and Problem Statement

The Python CLI training engine requires incremental synchronization of user interaction events from the NestJS PostgreSQL ingestion API to its local SQLite cache before running matrix factorization models.

In high-throughput ingestion environments, fetching all unsynced data in a single HTTP payload introduces database memory spikes, execution timeouts, and network transfer failures. Conversely, applying traditional offset-based pagination (`.skip((page - 1) * limit)`) leads to severe $O(N)$ database query degradation on deep offsets and causes missed or duplicate records when concurrent writes occur during pagination.

We need to define a performant, deterministic synchronization protocol that bounds memory usage on the NestJS backend while enabling the Python CLI to reliably fetch all delta updates over HTTP.

---

## Options Considered

### Option A: Unbounded Timestamp Delta Sync
Execute a single query fetching all events where `modifiedAt > lastSyncTime`.

* **Pros:** Simple, single-request synchronization loop on the client.
* **Cons:**
  * **Memory Exhaustion:** High interaction volume can cause Out-Of-Memory (OOM) crashes on the NestJS ingestion server.
  * **Network Reliability:** Large payload transfers over flaky, low-bandwidth connections are prone to dropouts, forcing full sync restarts.

### Option B: Traditional Offset-Based Pagination (`skip` / `take`)
Paginate delta data using page numbers and offsets (`.skip((page - 1) * limit).take(limit)`).

* **Pros:** Standard approach widely used for user-facing UI data grids.
* **Cons:**
  * **$O(N)$ Read Overhead:** PostgreSQL must scan and discard $N$ rows before returning the requested page, severely degrading response times as offsets grow.
  * **Page-Drift Instability:** New events inserted during an active multi-page sync cycle shift the offset index, leading to duplicated or skipped records in local storage.

### Option C: Hybrid Time-Bound Cursor Pagination (Chosen)
Combine incremental timestamp filtering (`modifiedAt > :modifiedSince`) with strict page limits (`.take(limit)` defaulting to 5,000) and deterministic multi-column sorting (`orderBy('event.modifiedAt', 'ASC').addOrderBy('event.id', 'ASC')`). The backend includes soft-deleted records via `.withDeleted()` and returns a `nextCursor` value representing the timestamp of the last item in the page[cite: 1]. The Python CLI loops through batch requests until `items.length` is zero or less than the limit.

* **Pros:**
  * **Bounded Backend Overhead:** Bounding batch sizes to a default limit guarantees predictable RAM and CPU consumption per request.
  * **$O(1)$ Index Utilization:** Leveraging index seek constraints (`WHERE modifiedAt > cursor`) eliminates offset scan penalties regardless of database depth.
  * **Deterministic Page Ordering:** Tie-breaking duplicate timestamps with `event.id ASC` prevents record skips or loops when multiple events occur within the same millisecond.
  * **Tombstone Syncing:** Including `.withDeleted()` ensures soft-deleted interactions propagate cleanly to the offline training cache.
* **Cons:**
  * Requires the Python CLI client to implement an iterative looping mechanism that buffers pages before initializing model training.

---

## Decision Outcome

**Chosen Option:** **Option C (Hybrid Time-Bound Cursor Pagination)**.

Option C provides the optimal trade-off: it protects the NestJS ingestion server from high-memory payload spikes while delivering an $O(1)$ indexed sync mechanism that remains deterministic and crash-resilient over flaky network connections.

---

## Consequences & Trade-offs

### Positive Consequences
1. **Predictable Resource Footprint:** Memory usage on NestJS remains capped regardless of total un-synced data volume.
2. **Network Resilience:** Smaller, chunked payloads reduce the likelihood of HTTP connection dropouts over unstable internet connections.
3. **Data Completeness:** Bounded cursor iteration ensures zero page-drift and captures soft-deleted tombstones.

### Negative Consequences / Risks to Mitigate
1. **Client Looping Overhead:** The Python CLI must manage state across iterative batch fetches before starting model execution.
2. **Timestamp Collisions:** Addressed by chaining `.addOrderBy('event.id', 'ASC')` to ensure strict, unambiguous cursor progression across records sharing identical `modifiedAt` timestamps.

---

## Compliance & Validation

This decision is validated by:
* Implementation of `DeltaSyncService` utilizing `createQueryBuilder` with `.where('event.modifiedAt > :modifiedSince')`, `.orderBy('event.modifiedAt', 'ASC')`, `.addOrderBy('event.id', 'ASC')`, and `.take(limit)`.
* Integration tests verifying that `nextCursor` accurately reflects the latest item's timestamp and returns null when no further delta records exist.
