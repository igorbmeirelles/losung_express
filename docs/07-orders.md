# Sales / Orders Module — Sprint 01 (PDV & Sales Flow)

This document defines the **Sales (Orders) module**, responsible for handling **sales creation**, **payment method selection**, **invoice attachment**, and **shipment management**. This module is central to the **PDV (Point of Sale)** and must ensure **strong consistency**, **atomicity**, and **strict RBAC enforcement**.

This document must be read together with:

* `arquitetura.md`
* `product-module-sprint-01.md`
* `warehouse-module-sprint-01.md`
* `company-module-sprint-01.md`

---

## 1. Domain Overview

### Order

An **Order**:

* Belongs to a **Company** and a **Branch**
* Is created from a PDV or administrative flow
* Contains:

  * Order items (SKU, quantity, price snapshot)
  * Payment method
  * Totals (subtotal, discount, freight, payable amount)
  * Optional **Shipment** (for delivery orders)
  * Optional **Invoice**

Once created, an order is **mostly immutable**.

---

### Shipment

A **Shipment**:

* Exists only if the order requires delivery
* Tracks freight, discount, and shipment attempts
* Is editable after order creation

---

### Invoice

An **Invoice**:

* Represents fiscal or supplier documentation
* May be created at order time or later
* Can be attached to an existing order

---

## 2. Core Business Rules

### BR-01 — Order Creation (Sale)

* An order can be created only by an **authenticated user**
* Order creation supports:

  * **In-store sales** (no shipment)
  * **Delivery sales** (with shipment)

#### Authorization

| Role          | Scope                       |
| ------------- | --------------------------- |
| COMPANY_OWNER | Any branch                  |
| COMPANY_ADMIN | Any branch                  |
| BRANCH_OWNER  | Only branches listed in JWT |
| BRANCH_ADMIN  | Only branches listed in JWT |
| SELLER        | Only branches listed in JWT |

---

### BR-02 — Stock Reservation & Validation

* Stock must be validated **before order confirmation**
* Stock deduction must be **atomic and concurrency-safe**
* If any SKU lacks sufficient stock, the entire order creation must fail

---

### BR-03 — Payment Method

* Payment method is mandatory at order creation
* Must be one of:

  * PIX
  * DEBIT
  * CREDIT

---

### BR-04 — Invoice Handling

* An invoice may:

  * Be created together with the order
  * Be attached to an existing order later

---

### BR-05 — Order Mutability

After creation:

* ❌ Order items cannot be edited
* ❌ Totals cannot be edited
* ✅ Shipment can be edited
* ✅ Invoice can be edited or attached
* ✅ Status can be updated following allowed transitions

---

### BR-06 — Order Status Update

* Order status can be updated only by authorized roles
* Status transitions must follow a **finite state machine**

#### Authorization

| Role             | Scope                       |
| ---------------- | --------------------------- |
| COMPANY_OWNER    | All branches                |
| COMPANY_ADMIN    | All branches                |
| BRANCH_OWNER     | Only branches listed in JWT |
| BRANCH_ADMIN     | Only branches listed in JWT |
| STOCK_ADMIN      | Only branches listed in JWT |
| STOCK_DISPATCHER | Only branches listed in JWT |

---

### BR-07 — Invoice Attachment to Existing Order

* Only orders without an invoice may receive one
* Invoice must belong to the same company

#### Authorization

| Role          | Scope                       |
| ------------- | --------------------------- |
| COMPANY_OWNER | Any branch                  |
| COMPANY_ADMIN | Any branch                  |
| BRANCH_OWNER  | Only branches listed in JWT |
| BRANCH_ADMIN  | Only branches listed in JWT |

---

### BR-08 — Tenant & Branch Isolation

* Orders are always isolated by `companyId`
* Branch-scoped users may operate only within their branches

---

### BR-09 — Order Listing Visibility

Orders must be listed according to the authenticated user's role:

| Role             | Visible Orders                     |
| ---------------- | ---------------------------------- |
| COMPANY_OWNER    | All company orders                 |
| COMPANY_ADMIN    | All company orders                 |
| BRANCH_OWNER     | Orders from branches listed in JWT |
| BRANCH_ADMIN     | Orders from branches listed in JWT |
| STOCK_ADMIN      | Orders from branches listed in JWT |
| STOCK_DISPATCHER | Orders from branches listed in JWT |

Filtering **must be enforced at query level**, never in memory.

---

## 3. Exposed Routes

### 3.1 `POST /orders`

**Intent**

> As an authorized user, I want to create a sale (order) with optional shipment and invoice.

---

### 3.2 `POST /orders/:orderId/invoice`

**Intent**

> As an authorized user, I want to attach an invoice to an existing order.

---

### 3.3 `PUT /orders/:orderId/shipment`

**Intent**

> As an authorized user, I want to update shipment information.

---

### 3.4 `PUT /orders/:orderId/status`

**Intent**

> As an authorized user, I want to update the status of an order.

---

### 3.5 `GET /orders`

**Intent**

> As an authorized user, I want to list orders according to my role and branch scope.

---

**Intent**

> As an authorized user, I want to update the status of an order.

---

### 3.2 `POST /orders/:orderId/invoice`

**Intent**

> As an authorized user, I want to attach an invoice to an existing order.

---

### 3.3 `PUT /orders/:orderId/shipment`

**Intent**

> As an authorized user, I want to update shipment information.

---

## 4. Sprint 01 — Tasks Breakdown

### 4.1 Implement `POST /orders`

#### Subtasks

* [ ] Create CreateOrderController

  * Validate input with Zod
  * Validate payment method

* [ ] Create CreateOrderUseCase

  * Validate RBAC and branch scope
  * Validate stock availability
  * Reserve/deduct stock atomically
  * Create order items with price snapshot
  * Create shipment if required
  * Create invoice if provided

---

### 4.2 Implement `POST /orders/:orderId/invoice`

* [ ] Create AttachInvoiceController
* [ ] Create AttachInvoiceUseCase

  * Validate order existence
  * Validate order has no invoice
  * Validate company ownership

---

### 4.3 Implement `PUT /orders/:orderId/shipment`

* [ ] Create UpdateShipmentController
* [ ] Create UpdateShipmentUseCase

  * Validate shipment existence
  * Validate editable state

---

### 4.4 Implement `PUT /orders/:orderId/status`

#### Description

Update the status of an existing order following valid state transitions.

#### Subtasks

* [ ] Create UpdateOrderStatusController

  * Validate input status
  * Extract user context from JWT

* [ ] Create UpdateOrderStatusUseCase

  * Validate RBAC and branch scope
  * Validate current order status
  * Validate allowed state transition (finite state machine)
  * Persist new status

* [ ] Implement OrderStatusPolicy (domain service)

  * Centralize allowed transitions

---

### 4.5 Implement `GET /orders`

#### Description

List orders visible to the authenticated user.

#### Subtasks

* [ ] Create ListOrdersController
* [ ] Create ListOrdersUseCase

  * Resolve visibility scope from role and branchIds
  * Apply companyId and branch filters at repository level
  * Support pagination and basic filtering (status, date range)

---

## 5. Test Cases (Mandatory — Jest)

### Unit Tests

* [ ] Should create in-store order without shipment
* [ ] Should create delivery order with shipment
* [ ] Should fail when stock is insufficient
* [ ] Should prevent order item mutation
* [ ] Should allow invoice attachment
* [ ] Should reject invoice attachment if already exists

#### Order Status — Unit Tests

* [ ] Should allow valid status transitions
* [ ] Should reject invalid status transitions
* [ ] Should reject status update for unauthorized role
* [ ] Should reject status update for unauthorized branch

### Integration Tests

* [ ] Should persist order, items, stock deduction atomically
* [ ] Should rollback on stock failure
* [ ] Should enforce branch scope
* [ ] Should update order status successfully
* [ ] Should not allow cross-branch status updates

--- (Mandatory — Jest)

### Unit Tests

* [ ] Should create in-store order without shipment
* [ ] Should create delivery order with shipment
* [ ] Should fail when stock is insufficient
* [ ] Should prevent order item mutation
* [ ] Should allow invoice attachment
* [ ] Should reject invoice attachment if already exists

### Integration Tests

* [ ] Should persist order, items, stock deduction atomically
* [ ] Should rollback on stock failure
* [ ] Should enforce branch scope

---

## 6. Improvements and Recommendations (Tech Lead)

### 6.1 Atomicity & Consistency

* Use database transactions for:

  * Stock deduction
  * Order creation
  * Invoice creation

---

### 6.2 Order Lifecycle

Recommended future statuses:

* PENDING
* APPROVED
* COMPLETED
* CANCELLED

---

### 6.3 Concurrency Control

* Use row-level locks on stock rows
* Prevent race conditions on PDV

---

### 6.4 Event Emission (Future)

Emit domain events for:

* OrderCreated
* StockDeducted
* InvoiceAttached

---

This sprint establishes the **sales foundation**, enabling reliable PDV operations and delivery workflows.
