# Supplier Module — Sprint 01 (Suppliers Management)

This document defines the **Supplier module**, responsible for managing **suppliers (vendors)** that provide products to the company. Suppliers are primarily used in **invoice entry**, **inventory inbound flows**, and **financial tracking**.

This document must be read together with:

* `arquitetura.md`
* `inventory-module-sprint-01.md`
* `product-module-sprint-01.md`
* `company-module-sprint-01.md`

---

## 1. Domain Overview

### Supplier

A **Supplier**:

* Belongs to a **Company**
* Can be associated with multiple invoices
* Is a core entity for inbound logistics and inventory control

Suppliers:

* Are shared across all branches of a company
* Are **not branch-scoped entities**
* Must be isolated by `companyId`

---

## 2. Core Business Rules

### BR-01 — Supplier Creation

* A supplier can be created only by an **authenticated user**
* The supplier must belong to the same company as the authenticated user
* Supplier names must be **unique per company**

Authorization:

| Role          | Scope                       |
| ------------- | --------------------------- |
| COMPANY_OWNER | All branches (company-wide) |
| COMPANY_ADMIN | All branches (company-wide) |
| BRANCH_OWNER  | Branches listed in JWT      |
| BRANCH_ADMIN  | Branches listed in JWT      |

Rules:

* Branch-scoped roles may create suppliers only if they are associated with at least one branch
* Supplier creation is always **company-scoped**, never branch-scoped

---

### BR-02 — Supplier Listing

* Suppliers can be listed by authorized users
* Listing must be **filtered by companyId**

Authorization:

| Role          | Visible Suppliers     |
| ------------- | --------------------- |
| COMPANY_OWNER | All company suppliers |
| COMPANY_ADMIN | All company suppliers |
| BRANCH_OWNER  | Branches listed in JWT  |
| BRANCH_ADMIN  | Branches listed in JWT  |
| STOCK_ADMIN   | Branches listed in JWT  |

---

### BR-03 — Tenant Isolation

* A user must never access suppliers from another company
* `companyId` filtering must be applied at repository level

---

## 3. Exposed Routes

### 3.1 `POST /suppliers`

**Intent**

> As an authorized user, I want to register a new supplier for my company.

---

### 3.2 `GET /suppliers`

**Intent**

> As an authorized user, I want to list suppliers of my company.

---

## 4. Sprint 01 — Tasks Breakdown

### 4.1 Implement `POST /suppliers`

* [ ] Create CreateSupplierController
* [ ] Create CreateSupplierUseCase

  * Validate RBAC
  * Validate company context
  * Enforce supplier name uniqueness per company
  * Persist supplier

---

### 4.2 Implement `GET /suppliers`

* [ ] Create ListSuppliersController
* [ ] Create ListSuppliersUseCase

  * Apply companyId filtering at repository level
  * Support pagination

---

## 5. Test Cases (Mandatory — Jest)

### Unit Tests

* [ ] Should create supplier successfully
* [ ] Should reject duplicate supplier name in same company
* [ ] Should reject unauthorized role
* [ ] Should reject creation without company context

### Integration Tests

* [ ] Should persist supplier correctly
* [ ] Should enforce company isolation
* [ ] Should list only suppliers of the authenticated company

---

## 6. Improvements and Recommendations (Tech Lead)

* Consider adding supplier metadata in the future:

  * Tax ID
  * Contact email
  * Phone
* Prepare for supplier deactivation instead of deletion
* Emit domain events:

  * SupplierCreated

---

This sprint establishes a **clean and company-isolated supplier foundation**, supporting inventory and invoice flows reliably.
