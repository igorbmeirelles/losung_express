# Inventory Module — Sprint 01 (Stock Movements & Inventory Control)

This document defines the **Inventory module**, responsible for **stock increases**, **returns**, **invoice-based stock entries**, and **inventory adjustments**. This module complements the Product, Sales, and Shipment modules and establishes a **reliable and auditable inventory flow**.

This document must be read together with:

* `arquitetura.md`
* `product-module-sprint-01.md`
* `sales-module-sprint-01.md`
* `shipment-module-sprint-01.md`

---

## 1. Domain Overview

### Inventory

An **Inventory** represents a **physical stock count event** executed for a specific warehouse context.

* An inventory is immutable once finalized
* It groups multiple counted SKUs
* It is used exclusively for **stock reconciliation**, not for inbound logistics

### InventoryProduct

An **InventoryProduct** represents the counted quantity of a SKU inside a warehouse during an inventory event.

Rules:

* Each InventoryProduct **must reference exactly one SKU and one Warehouse**
* The warehouse of all InventoryProducts **must belong to the same branch scope**
* InventoryProducts are immutable records

---

## 2. Core Business Rules

### BR-01 — Stock Return (Failed Delivery or Customer Return)

* When a shipment is marked as `FAILED` **or** a customer return occurs:

  * Stock **must be added back** to the warehouse
* Only authorized roles may perform this operation

#### Authorization

| Role             | Scope                       |
| ---------------- | --------------------------- |
| STOCK_ADMIN      | Only branches listed in JWT |
| STOCK_DISPATCHER | Only branches listed in JWT |

---

### BR-02 — Stock Entry via Invoice (Inbound Logistics)

* A supplier invoice represents **incoming goods**
* When an invoice is registered:

  * Each invoice item must specify:

    * SKU
    * Quantity
    * Warehouse
  * Stock is **incremented** accordingly

Rules:

* Invoice must belong to the same company
* Warehouse must belong to the same company
* Operation must be atomic

Authorization:

| Role             | Scope                       |
| ---------------- | --------------------------- |
| COMPANY_OWNER    | All branches                |
| COMPANY_ADMIN    | All branches                |
| STOCK_ADMIN      | Only branches listed in JWT |
| STOCK_DISPATCHER | Only branches listed in JWT |

---

### BR-03 — Inventory Adjustment (Manual Count)

* An inventory adjustment is executed by creating an **Inventory** with its **InventoryProducts**
* Each InventoryProduct must specify:

  * SKU
  * Warehouse
  * Counted quantity

Rules:

* All InventoryProducts **must belong to the same warehouse**
* The warehouse **must belong to a branch listed in the user JWT**
* The system must:

  1. Lock stock rows per SKU
  2. Compare counted quantity with current stock
  3. Apply the delta (positive or negative)
* Inventory adjustment **does not overwrite stock blindly**
* Negative resulting stock is forbidden

Authorization:

| Role             | Scope                       |
| ---------------- | --------------------------- |
| STOCK_ADMIN      | Only branches listed in JWT |
| STOCK_DISPATCHER | Only branches listed in JWT |
| STOCK_ADMIN | Only branches listed in JWT |
| STOCK_DISPATCHER | Only branches listed in JWT |

---

### BR-04 — Stock Consistency & Concurrency

* All inventory operations must:

  * Use database transactions
  * Lock stock rows (`SELECT ... FOR UPDATE`)
* Negative stock is forbidden

---

### BR-05 — Tenant & Branch Isolation

* All inventory operations must be isolated by `companyId`
* Branch-scoped users may operate only within branches listed in JWT

---

## 3. Exposed Routes

### 3.1 `POST /inventory/returns`

**Intent**

> As a stock operator, I want to return items to stock after a failed shipment or customer return.

---

### 3.2 `POST /inventory/invoices`

**Intent**

> As an authorized user, I want to register a supplier invoice and increase stock accordingly.

---

### 3.3 `POST /inventory/adjustments`

**Intent**

> As a stock operator, I want to adjust inventory after a manual count.

---

## 4. Sprint 01 — Tasks Breakdown

### 4.1 Implement Stock Return Flow

* [ ] Create RegisterStockReturnController
* [ ] Create RegisterStockReturnUseCase

  * Validate RBAC and branch scope
  * Validate shipment or return reference
  * Lock stock rows and increment quantity

---

### 4.2 Implement Invoice-Based Stock Entry

* [ ] Create RegisterInvoiceStockController
* [ ] Create RegisterInvoiceStockUseCase

  * Validate invoice items
  * Validate warehouse ownership
  * Increment stock per SKU

---

### 4.3 Implement Inventory Adjustment

* [ ] Create CreateInventoryController
* [ ] Create CreateInventoryUseCase

  * Validate RBAC and branch scope
  * Validate that all InventoryProducts reference the **same warehouse**
  * Validate warehouse belongs to user's allowed branches
  * Lock stock rows (`SELECT ... FOR UPDATE`)
  * Calculate stock delta per SKU
  * Apply stock changes atomically

---

## 5. Test Cases (Mandatory — Jest)

### Unit Tests

* [ ] Should reject inventory with mixed warehouses
* [ ] Should reject inventory from unauthorized branch
* [ ] Should calculate correct stock delta
* [ ] Should reject negative resulting stock
* [ ] Should reject unauthorized roles

### Integration Tests

* [ ] Should increment stock correctly per warehouse
* [ ] Should rollback on partial failure
* [ ] Should enforce branch isolation

---

## 6. Improvements and Recommendations (Tech Lead)

* Maintain an **Inventory Ledger** table for full audit history
* Prevent deletion of inventory movements
* Emit domain events:

  * StockReturned
  * StockReceived
  * InventoryAdjusted
* Prepare for future integrations (ERP, WMS)

---

This sprint establishes a **robust and auditable inventory foundation**, ensuring stock accuracy and operational trust.
