# ADR 006: Hybrid API Key/Secret Exchange and Short-Lived JWT Bearer Authentication for M2M API Access

* **Status:** Accepted
* **Date:** 2026-09-24
* **Deciders:** Jude (Lead Engineer)
* **Technical Domain:** Security / Authentication & Authorization / M2M Architecture

---

## Context and Problem Statement

The OpenRec system exposes machine-to-machine (M2M) endpoints for high-throughput ingestion (`POST /api/events`), bulk recommendation persistence (`POST /api/recommendations/bulk`), and real-time retrieval (`GET /api/recommendations/:userId`). These endpoints must be protected against unauthorized access.

M2M consumers include both client backend servers and the offline Python CLI engine. Standard user-facing authentication (session cookies or OAuth redirect flows) is unsuitable for CLI and automated service workflows.

Evaluating authentication strategy requires balancing two key constraints:
1. **Security:** Storing raw API secrets in the database is unacceptable. However, hashing API secrets with strong cryptographic algorithms (e.g., `bcrypt` with 10 salt rounds) requires intensive CPU computation to verify.
2. **Performance:** Executing a database lookup and `bcrypt.compare()` on every inbound event or recommendation request under high traffic causes severe CPU bottlenecks and database read exhaustion.

---

## Options Considered

### Option A: Direct API Key & Secret Verification on Every Request
Clients pass `x-api-key` and `x-api-secret` headers on every API request. The NestJS `AuthGuard` queries PostgreSQL by `apiKey` and executes `compareData(apiSecret, user.apiSecretHash)` per request.

* **Pros:** Simple for clients; no token management logic required.
* **Cons:**
  * **Severe CPU Overhead:** Running `bcrypt` password/secret verification on every HTTP request consumes massive CPU resources.
  * **Database Pressure:** Adds a database read query to every single incoming API request, degrading API throughput.

### Option B: Static Long-Lived JWTs Issued at Registration
Issue a permanent JWT upon user registration for the CLI/client to store indefinitely.

* **Pros:** $O(1)$ stateless verification in memory without database queries.
* **Cons:**
  * **Security Vulnerability:** If a static long-lived token is leaked or committed to source control, access cannot be revoked without changing the master JWT signing secret (which invalidates all clients).

### Option C: Hybrid API Key/Secret Exchange for Short-Lived JWT Bearer Tokens (Chosen)
Upon user registration, the system generates an `apiKey` and an `apiSecret`. The raw `apiSecret` is shown once to the user and never stored; only its `apiSecretHash` is persisted. Clients authenticate via `POST /auth/token` by passing `x-api-key` and `x-api-secret` in headers. The server verifies credentials against the database and returns a signed, short-lived JWT. All guarded endpoints then accept and validate this JWT statelessly via Bearer headers.

* **Pros:**
  * **Stateless Guard Execution:** Protected endpoints verify JWT signatures in-memory without database lookups or CPU-heavy `bcrypt` checks.
  * **Secure Secret Storage:** API secrets are salt-hashed in the database.
  * **Revocation & Key Rotation Support:** Key compromise can be remediated instantly using the key regeneration endpoint (`regenerateKeys`), invalidating the old `apiSecretHash`.
  * **Controlled Verification Overhead:** Heavy cryptographic checks (`bcrypt`) occur only during token exchange (`POST /auth/token`), not on core data ingestion routes.
* **Cons:**
  * Requires clients and the CLI to implement a token retrieval and refresh loop before making guarded API calls.

---

## Decision Outcome

**Chosen Option:** **Option C (Hybrid API Key/Secret Exchange for Short-Lived JWT Bearer Tokens)**.

Option C decouples credential authentication from request authorization. It provides strong M2M security defaults while preserving high API throughput by executing JWT validation statelessly in memory.

---

## Consequences & Trade-offs

### Positive Consequences
1. **High Ingestion Throughput:** In-memory JWT verification eliminates database I/O and password hashing overhead on high-frequency routes.
2. **At-Rest Security:** The raw `apiSecret` is returned strictly once during registration or key regeneration and is never saved in plaintext.
3. **Key Lifecycle Management:** Users can rotate credentials on demand via `AuthService.regenerateKeys()`.

### Negative Consequences / Risks to Mitigate
1. **Client Complexity:** The Python CLI and client applications must store tokens in memory and handle automatic re-authentication when tokens expire.

---

## Compliance & Validation

This decision is validated by:
* Implementation of `AuthService.register()` and `AuthService.regenerateKeys()` returning `apiKey` and raw `apiSecret` once while storing `apiSecretHash`.
* `AuthController.generateToken()` extracting `x-api-key` and `x-api-secret` headers to issue signed JWTs.
* Swagger OpenAPI documentation (`@ApiOperation`, `@ApiOkResponse`) covering key management and token exchange endpoints.
