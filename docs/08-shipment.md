# Shipment Module — Sprint 01 (Delivery Flow)

This document defines the **Shipment module**, responsible for managing **delivery workflows**, **shipment attempts**, and **driver interactions**. This module is tightly integrated with the Orders module but owns its **own domain rules and lifecycle**.

This document must be read together with:

* `arquitetura.md`
* `sales-module-sprint-01.md`
* `company-module-sprint-01.md`

---

## 1. Domain Overview

### Shipment

A **Shipment**:

* Belongs to an **Order**
* Exists only for orders that require delivery
* Has its **own lifecycle**, independent from the Order lifecycle
* May have multiple **Shipment Attempts**

### Shipment Attempt

A **Shipment Attempt**:

* Represents a single delivery attempt
* Is **immutable** once created
* Stores status and timestamps

---

## 2. Core Business Rules

### BR-01 — Shipment Eligibility

* Only orders with delivery enabled may have a shipment
* Orders must be in a delivery-ready state to enter shipment flow

---

### BR-02 — Shipment Status (Finite State Machine)

Shipment statuses follow a strict finite state machine:

```
WAITING_DELIVERY → IN_ROUTE → DELIVERED
                  → FAILED
```

Rules:

* Shipment must start in `WAITING_DELIVERY`
* Only one shipment attempt may be active at a time
* `DELIVERED` is a terminal state
* `FAILED` allows registering a new attempt

---

### BR-03 — Listing Orders Waiting for Delivery

Orders with shipment status `WAITING_DELIVERY` may be listed according to role and branch scope.

#### Authorization

| Role             | Scope                       |
| ---------------- | --------------------------- |
| COMPANY_OWNER    | All branches                |
| COMPANY_ADMIN    | All branches                |
| BRANCH_OWNER     | Only branches listed in JWT |
| BRANCH_ADMIN     | Only branches listed in JWT |
| STOCK_ADMIN      | Only branches listed in JWT |
| STOCK_DISPATCHER | Only branches listed in JWT |
| DRIVER           | Only branches listed in JWT |

Filtering **must be enforced at repository/query level**, never in memory.

---

### BR-04 — Mark Shipment as Delivered or Failed

* A shipment may be marked as:

  * `DELIVERED`
  * `FAILED`

Rules:

* Shipment must exist and belong to the same company
* Status transition must be valid
* When marked as `DELIVERED`:

  * Shipment is finalized
  * Related Order status transitions to `DELIVERED`
* When marked as `FAILED`:

  * Current attempt is finalized
  * Shipment remains eligible for new attempts

#### Authorization

| Role             | Scope                       |
| ---------------- | --------------------------- |
| COMPANY_OWNER    | All branches                |
| COMPANY_ADMIN    | All branches                |
| BRANCH_OWNER     | Only branches listed in JWT |
| BRANCH_ADMIN     | Only branches listed in JWT |
| STOCK_ADMIN      | Only branches listed in JWT |
| STOCK_DISPATCHER | Only branches listed in JWT |
| DRIVER           | Only branches listed in JWT |

---

### BR-05 — Register Shipment Attempt

* A new shipment attempt may be registered only if:

  * Shipment exists
  * No active attempt is in progress
* Each attempt must:

  * Start with status `WAITING_DELIVERY`
  * Be immutable

Authorization rules are identical to shipment status updates.

---

### BR-06 — Tenant & Branch Isolation

* All shipment operations must be isolated by `companyId`
* Branch-scoped users may operate only within branches listed in JWT

---

## 3. Exposed Routes

### 3.1 `GET /shipments/waiting`

**Intent**

> As an authorized user (including Driver), I want to list orders waiting for delivery.

---

### 3.2 `PUT /shipments/:shipmentId/status`

**Intent**

> As an authorized user, I want to mark a shipment as delivered or failed.

---

### 3.3 `POST /shipments/:shipmentId/attempts`

**Intent**

> As an authorized user, I want to register a new delivery attempt.

---

## 4. Sprint 01 — Tasks Breakdown

### 4.1 Implement `GET /shipments/waiting`

* [ ] Create ListWaitingShipmentsController
* [ ] Create ListWaitingShipmentsUseCase

  * Filter by shipment status `WAITING_DELIVERY`
  * Apply RBAC and branch scope at query level

---

### 4.2 Implement `PUT /shipments/:shipmentId/status`

* [ ] Create UpdateShipmentStatusController

* [ ] Create UpdateShipmentStatusUseCase

  * Validate RBAC and branch scope
  * Validate shipment existence
  * Validate shipment state transition
  * Finalize active shipment attempt
  * Update related order status when delivered

* [ ] Implement ShipmentStatusPolicy (domain service)

---

### 4.3 Implement `POST /shipments/:shipmentId/attempts`

* [ ] Create RegisterShipmentAttemptController
* [ ] Create RegisterShipmentAttemptUseCase

  * Validate RBAC and branch scope
  * Validate shipment existence
  * Ensure no active attempt exists
  * Create new shipment attempt with status `WAITING_DELIVERY`

---

## 5. Test Cases (Mandatory — Jest)

### Unit Tests

* [ ] Should list waiting shipments for COMPANY_OWNER
* [ ] Should list only branch-scoped shipments for DRIVER
* [ ] Should mark shipment as delivered
* [ ] Should mark shipment as failed
* [ ] Should reject invalid shipment status transition
* [ ] Should prevent creating attempt when active attempt exists

### Integration Tests

* [ ] Should update order status when shipment is delivered
* [ ] Should persist shipment attempts correctly
* [ ] Should enforce branch and tenant isolation

---

## 6. Improvements and Recommendations (Tech Lead)

* Keep Shipment and Order lifecycles decoupled
* Never delete shipment attempts (audit trail)
* Consider emitting events:

  * ShipmentDelivered
  * ShipmentFailed
* Prepare for future integrations (carriers, tracking)

---

This sprint establishes the **delivery and logistics foundation**, enabling safe driver operations and shipment tracking.
