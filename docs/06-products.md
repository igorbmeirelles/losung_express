# Product Module — Sprint 01 (Products, SKUs, Stock & Pricing)

This document defines the **Product module**, including **products**, **SKUs**, **prices**, **stocks**, and **attribute assignments**. This module is one of the most critical parts of the ERP and must strictly enforce **domain consistency**, **RBAC**, and **multi-tenant isolation**.

This document must be read together with:

* `arquitetura.md`
* `category-module-sprint-01.md`
* `attribute-module-sprint-01.md`
* `warehouse-module-sprint-01.md`

---

## 1. Domain Overview

### Product

A **Product**:

* Belongs to a **Company**
* Belongs to exactly one **Category**
* Is an abstract catalog item
* Does **not** carry price, stock, or variation data directly

### SKU

A **SKU**:

* Belongs to a Product
* Represents a concrete sellable unit
* Has:

  * A **unique code** (globally unique)
  * One **current price** (historical prices are preserved)
  * Stock quantities per **Warehouse**
  * Assigned **Attributes** via Options

### Attribute Assignment

* Each SKU may have multiple attributes
* Attributes are classified as:

  * `VARIATION` — affects product variation
  * `TECHNICAL` — descriptive only

---

## 2. Core Business Rules

### BR-01 — Product Creation

* A product **must be created with at least one SKU**
* Product creation is atomic:

  * If any SKU fails validation, the entire operation fails

#### Authorization

| Role             | Scope                |
| ---------------- | -------------------- |
| COMPANY_OWNER    | Any branch           |
| COMPANY_ADMIN    | Any branch           |
| BRANCH_OWNER     | Only branches in JWT |
| BRANCH_ADMIN     | Only branches in JWT |
| STOCK_ADMIN      | Only branches in JWT |
| STOCK_DISPATCHER | Only branches in JWT |

---

### BR-02 — SKU Validation

Each SKU must:

* Have a **globally unique code**
* Have **at least one image**
* Have exactly **one active price** at creation
* Define stocks **only for warehouses the user is authorized for**

---

### BR-03 — Variation Completeness

When a product has **variation attributes**:

* All possible combinations **must exist as SKUs**
* Variations may be marked as disabled, but **must exist**

Example:

Attributes:

* Color: Red, Black
* Size: M, G

Required SKUs:

* Red + M
* Red + G
* Black + M
* Black + G

Failure to provide all combinations results in a **validation failure**.

---

### BR-04 — Attribute Assignment

* SKU attributes must reference valid **Options**
* Attribute type (`VARIATION` or `TECHNICAL`) must match definition
* Duplicate attribute assignments per SKU are forbidden

---

### BR-05 — Stock Management

* Stock is always managed **per SKU per Warehouse**
* A user may:

  * View all stocks for visible products
  * Modify stock **only for warehouses in their branch scope**

---

### BR-06 — Price Management

* Prices are immutable
* Updating a price:

  * Invalidates the previous price
  * Creates a new price record
* Exactly **one active price per SKU** is allowed

---

### BR-07 — Product Visibility

| Role             | Visible Products                  |
| ---------------- | --------------------------------- |
| COMPANY_OWNER    | All company products              |
| COMPANY_ADMIN    | All company products              |
| BRANCH_OWNER     | Products linked to their branches |
| BRANCH_ADMIN     | Products linked to their branches |
| STOCK_ADMIN      | Products linked to their branches |
| STOCK_DISPATCHER | Products linked to their branches |
| SELLER           | Products linked to their branches |

---

### BR-08 — Tenant Isolation

* Products, SKUs, prices, and stocks are always isolated by `companyId`
* Cross-company access is strictly forbidden

---

## 3. Exposed Routes

### 3.1 `POST /products`

**Intent**

> As an authorized user, I want to create a product with all its SKUs.

---

### 3.2 `PUT /products/:productId`

**Intent**

> As an authorized user, I want to edit product properties.

---

### 3.3 `POST /products/:productId/stocks`

**Intent**

> As an authorized user, I want to add stock to a product SKU.

---

### 3.4 `PUT /products/:productId/stocks`

**Intent**

> As an authorized user, I want to update stock quantities.

---

### 3.5 `POST /products/:productId/prices`

**Intent**

> As an authorized user, I want to change a SKU price.

---

### 3.6 `GET /products`

**Intent**

> As a user, I want to list products available to me.

---

### 3.7 `GET /products/:productId`

**Intent**

> As a user, I want to retrieve a product with its SKUs.

---

## 4. Sprint 01 — Tasks Breakdown

### 4.1 Implement `POST /products`

* [ ] Create CreateProductController

  * Validate input with Zod
  * Validate SKU combinations

* [ ] Create CreateProductUseCase

  * Validate RBAC and branch scope
  * Validate variation completeness
  * Create product, SKUs, prices, stocks, attributes atomically

---

### 4.2 Implement Product Editing

* [ ] UpdateProductUseCase
* [ ] Validate branch scope

---

### 4.3 Implement Stock Management

* [ ] AddStockUseCase
* [ ] UpdateStockUseCase

  * Enforce warehouse authorization

---

### 4.4 Implement Price Management

* [ ] UpdatePriceUseCase

  * Invalidate previous price
  * Create new price record

---

### 4.5 Listing and Retrieval

* [ ] ListProductsUseCase
* [ ] GetProductByIdUseCase

---

## 5. Test Cases (Mandatory — Jest)

### Unit Tests

* [ ] Should reject missing SKU combinations
* [ ] Should reject duplicate SKU codes
* [ ] Should reject stock creation for unauthorized warehouse
* [ ] Should enforce single active price
* [ ] Should reject invalid attribute-option assignments

### Integration Tests

* [ ] Should create product with SKUs atomically
* [ ] Should rollback on SKU validation failure
* [ ] Should update stock correctly
* [ ] Should update price and invalidate previous
* [ ] Should respect RBAC and branch scope

---

## 6. Improvements and Recommendations (Tech Lead)

* Pre-calculate variation matrices to validate combinations
* Keep SKU creation deterministic and idempotent
* Avoid hard deletes for prices and stocks
* Consider future support for SKU-level images and barcodes
* Emit domain events on product creation and price change

---

This sprint establishes the **core product foundation**, enabling stock control, pricing, and PDV flows.
