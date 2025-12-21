# Warehouse Module — Sprint 01 (Warehouse Foundation)

This document defines the **Warehouse module**, its **business rules**, **access control**, and the **Sprint 01 backlog**. Warehouses represent physical or logical stock locations and are scoped to a company and optionally associated with branches.

This document must be read together with:

* `arquitetura.md`
* `user-module-sprint-01.md`
* `company-module-sprint-01.md`

---

## 1. Domain Overview

A **Warehouse**:

* Belongs to a **Company**
* Can be associated with one or more **Branches** via `BranchWarehouse`
* Holds stock (`Stock` entities)

Warehouses are **company-level resources**, while access to them is **branch-scoped**.

---

## 2. Core Business Rules

### BR-01 — Warehouse Creation

* A warehouse can be created only by an **authenticated user**
* Only the following roles may create warehouses:

  * COMPANY_OWNER
  * COMPANY_ADMIN

---

### BR-02 — Warehouse–Branch Association

* A warehouse may be associated with one or more branches
* Association is performed via `BranchWarehouse`

#### Authorization Rules

| Role          | Association Scope                              |
| ------------- | ---------------------------------------------- |
| COMPANY_OWNER | Any warehouse to any branch                    |
| COMPANY_ADMIN | Any warehouse to any branch                    |
| BRANCH_OWNER  | Only warehouses associated with their branches |
| BRANCH_ADMIN  | Only warehouses associated with their branches |

Branch scope **must be validated using branchIds from the JWT**.

---

### BR-03 — Warehouse Visibility (Listing)

A user may list warehouses according to their role:

| Role             | Visible Warehouses                        |
| ---------------- | ----------------------------------------- |
| COMPANY_OWNER    | All company warehouses                    |
| COMPANY_ADMIN    | All company warehouses                    |
| BRANCH_OWNER     | Warehouses associated with their branches |
| BRANCH_ADMIN     | Warehouses associated with their branches |
| STOCK_ADMIN      | Warehouses associated with their branches |
| STOCK_DISPATCHER | Warehouses associated with their branches |

---

### BR-04 — Tenant Isolation

* Warehouses are always isolated by `companyId`
* Cross-company access is strictly forbidden

---

## 3. Exposed Routes

### 3.1 `POST /warehouses`

**Intent**

> As an authorized user, I want to create a warehouse so that stock can be managed.

---

### 3.2 `POST /warehouses/:warehouseId/branches`

**Intent**

> As an authorized user, I want to associate a warehouse with a branch.

---

### 3.3 `GET /warehouses`

**Intent**

> As a user, I want to list the warehouses I have access to.

---

## 4. Sprint 01 — Tasks Breakdown

### 4.1 Implement `POST /warehouses`

#### Description

Create a warehouse scoped to the authenticated user's company.

#### Subtasks

* [ ] Create CreateWarehouseController

  * Validate input with Zod
  * Extract user context from JWT

* [ ] Create CreateWarehouseUseCase

  * Validate role (COMPANY_OWNER, COMPANY_ADMIN)
  * Create warehouse entity

* [ ] Implement WarehouseRepository (Prisma)

---

### 4.2 Implement `POST /warehouses/:warehouseId/branches`

#### Description

Associate an existing warehouse with a branch.

#### Subtasks

* [ ] Create AssociateWarehouseBranchController

* [ ] Create AssociateWarehouseBranchUseCase

  * Validate role
  * Validate branch scope via JWT
  * Prevent duplicate associations

* [ ] Implement BranchWarehouseRepository (Prisma)

---

### 4.3 Implement `GET /warehouses`

#### Description

List warehouses visible to the authenticated user.

#### Subtasks

* [ ] Create ListWarehousesController
* [ ] Create ListWarehousesUseCase

  * Resolve access scope from roles and branchIds

---

## 5. Test Cases (Mandatory — Jest)

### 5.1 `POST /warehouses`

#### Unit Tests — CreateWarehouseUseCase

* [ ] Should allow COMPANY_OWNER to create warehouse
* [ ] Should allow COMPANY_ADMIN to create warehouse
* [ ] Should reject unauthorized roles
* [ ] Should scope warehouse to companyId

#### Integration Tests

* [ ] Should return HTTP 201 on success
* [ ] Should persist warehouse correctly

---

### 5.2 `POST /warehouses/:warehouseId/branches`

#### Unit Tests — AssociateWarehouseBranchUseCase

* [ ] Should allow COMPANY_OWNER to associate any warehouse
* [ ] Should allow COMPANY_ADMIN to associate any warehouse
* [ ] Should restrict BRANCH_OWNER to own branches
* [ ] Should restrict BRANCH_ADMIN to own branches
* [ ] Should reject invalid branch scope
* [ ] Should prevent duplicate associations

#### Integration Tests

* [ ] Should return HTTP 200 on success
* [ ] Should persist branch-warehouse relation

---

### 5.3 `GET /warehouses`

#### Unit Tests — ListWarehousesUseCase

* [ ] Should list all warehouses for COMPANY_OWNER
* [ ] Should list all warehouses for COMPANY_ADMIN
* [ ] Should list branch-scoped warehouses for BRANCH_OWNER
* [ ] Should list branch-scoped warehouses for BRANCH_ADMIN
* [ ] Should list branch-scoped warehouses for STOCK_ADMIN
* [ ] Should list branch-scoped warehouses for STOCK_DISPATCHER

#### Integration Tests

* [ ] Should return HTTP 200 with correct warehouse list
* [ ] Should not expose warehouses from other companies

---

## 6. Improvements and Recommendations (Tech Lead)

* Prefer authorization via JWT context instead of database lookups
* Enforce unique `(warehouseId, branchId)` constraint
* Keep warehouse–branch association idempotent
* Consider emitting domain events on warehouse creation

---

This sprint establishes the **warehouse foundation** required for stock control, PDV flows, and logistics.
